-- Fólium: segunda rodada de melhorias (11/11/2026).
--
--  1. Link público do portfólio (opcional): o aluno liga e qualquer pessoa com o link vê os
--     trabalhos e o "sobre", SEM WhatsApp, e-mail, currículo nem certificados.
--  2. Estatísticas do perfil: visitas por dia (sem guardar quem visitou para o aluno ver).
--  3. Aviso de vaga nova: data em que a vaga foi aprovada e última vez que a pessoa olhou o mural.
--  4. Convites: o contratante convida um aluno para uma vaga dele.
--  5. Combinados: proposta por escrito (escopo, prazo, valor, sinal) que o aluno aceita.
--  6. Avaliações: depois de um combinado concluído, cada lado avalia o outro uma vez.
--  7. Equipe: painel /equipe para aprovar vagas, ver denúncias e feedbacks e liberar Premium.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).
-- Depois, coloque você na equipe (troque o e-mail):
--   insert into public.equipe (id) select id from auth.users where email = 'SEU-EMAIL-AQUI' on conflict do nothing;

-- 0. Equipe -------------------------------------------------------------------------------------

create table if not exists public.equipe (
  id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.equipe enable row level security;
revoke all on public.equipe from anon, authenticated;

create or replace function public.eh_equipe()
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and exists (select 1 from public.equipe e where e.id = auth.uid());
$$;
revoke all on function public.eh_equipe() from public, anon;
grant execute on function public.eh_equipe() to authenticated;

-- 1. Link público -------------------------------------------------------------------------------

alter table public.perfis add column if not exists link_publico boolean not null default false;

-- Portfólio para quem abriu o link sem conta. Só devolve o que é seguro mostrar.
create or replace function public.portfolio_publico(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id, 'slug', p.slug, 'nome', p.nome, 'curso', p.curso, 'semestre', p.semestre,
    'cidade', p.cidade, 'bio', p.bio, 'titulo', p.titulo, 'sobre_longo', p.sobre_longo,
    'conclusao', p.conclusao, 'servicos', p.servicos, 'habilidades', p.habilidades,
    'valor_referencia', p.valor_referencia, 'modalidades', p.modalidades, 'tipos_vaga', p.tipos_vaga,
    'foto_url', p.foto_url, 'disponivel', p.disponivel, 'idiomas', p.idiomas,
    'trabalhos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'titulo', t.titulo, 'tipo', t.tipo, 'descricao', t.descricao, 'imagem_url', t.imagem_url,
        'ordem', t.ordem, 'cliente', t.cliente, 'ano', t.ano, 'link', t.link, 'papel', t.papel,
        'galeria', t.galeria) order by t.ordem)
      from public.trabalhos t where t.perfil_id = p.id), '[]'::jsonb)
  )
  from public.perfis p
  where p.slug = p_slug and p.publicado and p.link_publico;
$$;
revoke all on function public.portfolio_publico(text) from public;
grant execute on function public.portfolio_publico(text) to anon, authenticated;

-- No link público, sem conta, abrem só as imagens que aparecem no portfólio (foto e obras).
-- Certificados em imagem e fotos antigas ficam na mesma pasta e continuam fechados.
create or replace function public.foto_do_link_publico(p_nome text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.perfis p
    where p.id::text = split_part(p_nome, '/', 1) and p.publicado and p.link_publico
      and (
        p.foto_url like '%/fotos/' || p_nome
        or exists (
          select 1 from public.trabalhos t
          where t.perfil_id = p.id
            and (t.imagem_url like '%/fotos/' || p_nome
                 or exists (select 1 from unnest(t.galeria) g where g like '%/fotos/' || p_nome))
        )
      )
  );
$$;
revoke all on function public.foto_do_link_publico(text) from public;
grant execute on function public.foto_do_link_publico(text) to anon, authenticated;

drop policy if exists "visitante ve fotos de link publico" on storage.objects;
create policy "visitante ve fotos de link publico" on storage.objects
  for select to anon using (bucket_id = 'fotos' and public.foto_do_link_publico(name));

-- 2. Estatísticas --------------------------------------------------------------------------------

-- Uma linha por visitante por dia. O aluno só vê os totais (minhas_estatisticas), nunca quem visitou.
create table if not exists public.visitas_perfil (
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  dia date not null default current_date,
  visitante text not null check (length(visitante) between 1 and 64),
  tipo_visitante text not null default 'visitante' check (tipo_visitante in ('visitante', 'colaborador', 'contratante')),
  primary key (perfil_id, dia, visitante)
);
alter table public.visitas_perfil enable row level security;
revoke all on public.visitas_perfil from anon, authenticated;

-- p_visitante: id anônimo do navegador, usado só quando não há login (link público).
create or replace function public.registrar_visita(p_slug text, p_visitante text default null)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_perfil uuid;
  v_quem text := coalesce(auth.uid()::text, left(nullif(trim(p_visitante), ''), 64));
begin
  if v_quem is null then return; end if;
  select id into v_perfil from public.perfis
   where slug = p_slug and publicado and (auth.uid() is not null or link_publico);
  if v_perfil is null or v_perfil = auth.uid() then return; end if;
  insert into public.visitas_perfil (perfil_id, visitante, tipo_visitante)
  values (v_perfil, v_quem, coalesce(public.tipo_de(auth.uid()), 'visitante'))
  on conflict do nothing;
end;
$$;
revoke all on function public.registrar_visita(text, text) from public;
grant execute on function public.registrar_visita(text, text) to anon, authenticated;

-- 3. Vagas novas -----------------------------------------------------------------------------------

alter table public.oportunidades add column if not exists aprovada_em timestamptz;
update public.oportunidades set aprovada_em = criada_em where status = 'aprovada' and aprovada_em is null;

create or replace function public.marcar_aprovada_em()
returns trigger language plpgsql as $$
begin
  if new.status = 'aprovada' and (tg_op = 'INSERT' or old.status is distinct from 'aprovada') then
    new.aprovada_em := now();
  end if;
  return new;
end;
$$;
drop trigger if exists marcar_aprovada_em on public.oportunidades;
create trigger marcar_aprovada_em before insert or update on public.oportunidades
  for each row execute function public.marcar_aprovada_em();
create index if not exists oportunidades_aprovada_em on public.oportunidades (aprovada_em desc);

alter table public.contas add column if not exists vagas_vistas_em timestamptz;

-- 4. Convites --------------------------------------------------------------------------------------

create table if not exists public.convites (
  id uuid primary key default gen_random_uuid(),
  oportunidade_id uuid not null references public.oportunidades (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  contratante_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mensagem text not null default '' check (length(mensagem) <= 400),
  status text not null default 'enviado' check (status in ('enviado', 'aceito', 'recusado')),
  criado_em timestamptz not null default now(),
  respondido_em timestamptz,
  unique (oportunidade_id, perfil_id)
);
create index if not exists convites_perfil on public.convites (perfil_id, criado_em desc);
alter table public.convites enable row level security;
revoke all on public.convites from anon;

drop policy if exists "partes veem o convite" on public.convites;
create policy "partes veem o convite" on public.convites
  for select to authenticated using (perfil_id = auth.uid() or contratante_id = auth.uid());

drop policy if exists "contratante convida para a propria vaga" on public.convites;
create policy "contratante convida para a propria vaga" on public.convites
  for insert to authenticated with check (
    contratante_id = auth.uid()
    and status = 'enviado'
    and public.tipo_de(auth.uid()) = 'contratante'
    and exists (select 1 from public.oportunidades o
                where o.id = oportunidade_id and o.autor_id = auth.uid() and o.status = 'aprovada')
    and exists (select 1 from public.perfis p where p.id = perfil_id and p.publicado)
  );

drop policy if exists "contratante desfaz convite" on public.convites;
create policy "contratante desfaz convite" on public.convites
  for delete to authenticated using (contratante_id = auth.uid() and status = 'enviado');

-- Aluno responde: aceitar marca interesse na vaga; recusar só registra.
create or replace function public.responder_convite(p_id uuid, p_aceitar boolean)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  c public.convites;
begin
  select * into c from public.convites where id = p_id and perfil_id = auth.uid() for update;
  if not found then raise exception 'Convite não encontrado' using errcode = 'P0002'; end if;
  update public.convites
     set status = case when p_aceitar then 'aceito' else 'recusado' end, respondido_em = now()
   where id = p_id;
  if p_aceitar then
    insert into public.interesses (oportunidade_id, perfil_id) values (c.oportunidade_id, c.perfil_id)
    on conflict do nothing;
  end if;
end;
$$;
revoke all on function public.responder_convite(uuid, boolean) from public, anon;
grant execute on function public.responder_convite(uuid, boolean) to authenticated;

-- Limite contra spam: 30 convites por contratante a cada 24 horas.
create or replace function public.limitar_convites()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.convites
      where contratante_id = new.contratante_id and criado_em > now() - interval '24 hours') >= 30 then
    raise exception 'Muitos convites seguidos';
  end if;
  return new;
end;
$$;
drop trigger if exists limitar_convites on public.convites;
create trigger limitar_convites before insert on public.convites
  for each row execute function public.limitar_convites();

-- 5. Combinados ------------------------------------------------------------------------------------

create table if not exists public.combinados (
  id uuid primary key default gen_random_uuid(),
  contratante_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  oportunidade_id uuid references public.oportunidades (id) on delete set null,
  contratante_nome text not null default '' check (length(contratante_nome) <= 80),
  titulo text not null check (length(titulo) between 3 and 100),
  escopo text not null check (length(escopo) between 10 and 1500),
  prazo date,
  valor text not null check (length(valor) between 1 and 40),
  sinal text not null default '' check (length(sinal) <= 40),
  pagamento text not null default '' check (length(pagamento) <= 200),
  ajustes text not null default '' check (length(ajustes) <= 200),
  status text not null default 'proposto' check (status in ('proposto', 'aceito', 'recusado', 'concluido', 'cancelado')),
  criado_em timestamptz not null default now(),
  aceito_em timestamptz,
  concluido_em timestamptz
);
create index if not exists combinados_perfil on public.combinados (perfil_id, criado_em desc);
create index if not exists combinados_contratante on public.combinados (contratante_id, criado_em desc);
alter table public.combinados enable row level security;
revoke all on public.combinados from anon;
revoke update, delete on public.combinados from authenticated;

drop policy if exists "partes veem o combinado" on public.combinados;
create policy "partes veem o combinado" on public.combinados
  for select to authenticated using (perfil_id = auth.uid() or contratante_id = auth.uid());

drop policy if exists "contratante propoe combinado" on public.combinados;
create policy "contratante propoe combinado" on public.combinados
  for insert to authenticated with check (
    contratante_id = auth.uid()
    and status = 'proposto'
    and public.tipo_de(auth.uid()) = 'contratante'
    and exists (select 1 from public.perfis p where p.id = perfil_id and p.publicado)
    and (oportunidade_id is null or exists (
      select 1 from public.oportunidades o where o.id = oportunidade_id and o.autor_id = auth.uid()))
  );

-- O nome de quem contrata vem da conta (não do que o site mandar).
create or replace function public.preencher_combinado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select coalesce(nullif(c.empresa, ''), nullif(c.nome, ''), 'Contratante')
    into new.contratante_nome from public.contas c where c.id = new.contratante_id;
  new.contratante_nome := coalesce(new.contratante_nome, 'Contratante');
  if (select count(*) from public.combinados
      where contratante_id = new.contratante_id and criado_em > now() - interval '24 hours') >= 20 then
    raise exception 'Muitos combinados seguidos';
  end if;
  return new;
end;
$$;
drop trigger if exists preencher_combinado on public.combinados;
create trigger preencher_combinado before insert on public.combinados
  for each row execute function public.preencher_combinado();

-- Mudanças de etapa, sempre pela função (ninguém edita o texto depois de proposto):
--   aluno: aceitar | recusar (quando proposto)
--   contratante: cancelar (quando proposto) | concluir (quando aceito)
create or replace function public.mudar_combinado(p_id uuid, p_acao text)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare
  c public.combinados;
  v_novo text;
begin
  select * into c from public.combinados where id = p_id for update;
  if not found or auth.uid() not in (c.perfil_id, c.contratante_id) then
    raise exception 'Combinado não encontrado' using errcode = 'P0002';
  end if;
  v_novo := case
    when p_acao = 'aceitar'   and c.status = 'proposto' and auth.uid() = c.perfil_id      then 'aceito'
    when p_acao = 'recusar'   and c.status = 'proposto' and auth.uid() = c.perfil_id      then 'recusado'
    when p_acao = 'cancelar'  and c.status = 'proposto' and auth.uid() = c.contratante_id then 'cancelado'
    when p_acao = 'concluir'  and c.status = 'aceito'   and auth.uid() = c.contratante_id then 'concluido'
  end;
  if v_novo is null then
    raise exception 'Essa mudança não é possível agora' using errcode = 'P0001';
  end if;
  update public.combinados
     set status = v_novo,
         aceito_em = case when v_novo = 'aceito' then now() else aceito_em end,
         concluido_em = case when v_novo = 'concluido' then now() else concluido_em end
   where id = p_id;
  return v_novo;
end;
$$;
revoke all on function public.mudar_combinado(uuid, text) from public, anon;
grant execute on function public.mudar_combinado(uuid, text) to authenticated;

-- 6. Avaliações ------------------------------------------------------------------------------------

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  -- Se o combinado sumir (a outra parte excluiu a conta), a avaliação fica no perfil de quem a recebeu.
  combinado_id uuid references public.combinados (id) on delete set null,
  autor_id uuid references auth.users (id) on delete set null default auth.uid(),
  alvo_id uuid not null references auth.users (id) on delete cascade,
  autor_nome text not null default '' check (length(autor_nome) <= 80),
  nota smallint not null check (nota between 1 and 5),
  texto text not null default '' check (length(texto) <= 500),
  criado_em timestamptz not null default now(),
  unique (combinado_id, autor_id)
);
create index if not exists avaliacoes_alvo on public.avaliacoes (alvo_id, criado_em desc);
alter table public.avaliacoes enable row level security;
revoke all on public.avaliacoes from anon;
revoke update, delete on public.avaliacoes from authenticated;

drop policy if exists "logados veem avaliacoes" on public.avaliacoes;
create policy "logados veem avaliacoes" on public.avaliacoes
  for select to authenticated using (true);

-- Só quem participou de um combinado concluído avalia, uma vez, e sempre a outra parte.
drop policy if exists "participante avalia combinado concluido" on public.avaliacoes;
create policy "participante avalia combinado concluido" on public.avaliacoes
  for insert to authenticated with check (
    autor_id = auth.uid()
    and exists (
      select 1 from public.combinados c
      where c.id = combinado_id and c.status = 'concluido'
        and ((c.contratante_id = auth.uid() and alvo_id = c.perfil_id)
          or (c.perfil_id = auth.uid() and alvo_id = c.contratante_id))
    )
  );

create or replace function public.preencher_avaliacao()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.autor_nome := coalesce(
    (select nullif(c.empresa, '') from public.contas c where c.id = new.autor_id),
    (select p.nome from public.perfis p where p.id = new.autor_id),
    (select nullif(c.nome, '') from public.contas c where c.id = new.autor_id),
    'Usuário do Fólium');
  return new;
end;
$$;
drop trigger if exists preencher_avaliacao on public.avaliacoes;
create trigger preencher_avaliacao before insert on public.avaliacoes
  for each row execute function public.preencher_avaliacao();

-- 7. Painel da equipe ------------------------------------------------------------------------------

drop policy if exists "equipe ve todas as vagas" on public.oportunidades;
create policy "equipe ve todas as vagas" on public.oportunidades
  for select to authenticated using (public.eh_equipe());
drop policy if exists "equipe muda status das vagas" on public.oportunidades;
create policy "equipe muda status das vagas" on public.oportunidades
  for update to authenticated using (public.eh_equipe()) with check (public.eh_equipe());

drop policy if exists "equipe le denuncias" on public.denuncias;
create policy "equipe le denuncias" on public.denuncias
  for select to authenticated using (public.eh_equipe());
alter table public.denuncias add column if not exists resolvida boolean not null default false;
drop policy if exists "equipe resolve denuncias" on public.denuncias;
create policy "equipe resolve denuncias" on public.denuncias
  for update to authenticated using (public.eh_equipe()) with check (public.eh_equipe());
grant select, update on public.denuncias to authenticated;

grant select on public.feedbacks to authenticated;
drop policy if exists "equipe le feedbacks" on public.feedbacks;
create policy "equipe le feedbacks" on public.feedbacks
  for select to authenticated using (public.eh_equipe());

drop policy if exists "equipe ve contas" on public.contas;
create policy "equipe ve contas" on public.contas
  for select to authenticated using (public.eh_equipe());
drop policy if exists "equipe muda plano" on public.contas;
create policy "equipe muda plano" on public.contas
  for update to authenticated using (public.eh_equipe()) with check (public.eh_equipe());

drop policy if exists "equipe tira perfil do ar" on public.perfis;
create policy "equipe tira perfil do ar" on public.perfis
  for update to authenticated using (public.eh_equipe()) with check (public.eh_equipe());
drop policy if exists "equipe ve todos os perfis" on public.perfis;
create policy "equipe ve todos os perfis" on public.perfis
  for select to authenticated using (public.eh_equipe());

-- Pelo site, ninguém troca o próprio tipo nem se dá Premium. A equipe pode mudar o plano de outra pessoa.
create or replace function public.proteger_conta()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.tipo := old.tipo;
    if not (public.eh_equipe() and old.id <> auth.uid()) then
      new.plano := old.plano;
      new.plano_ate := old.plano_ate;
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

-- Lista de contas para a equipe, com e-mail (que fica em auth.users).
create or replace function public.equipe_contas()
returns table (id uuid, email text, tipo text, plano text, plano_ate date, plano_pedido text,
               nome text, empresa text, criada_em timestamptz)
language plpgsql stable security definer set search_path = public, auth
as $$
begin
  if not public.eh_equipe() then
    raise exception 'Só para a equipe' using errcode = '42501';
  end if;
  return query
    select c.id, u.email::text, c.tipo, c.plano, c.plano_ate, c.plano_pedido, c.nome, c.empresa, c.criada_em
      from public.contas c join auth.users u on u.id = c.id
     order by (c.plano_pedido is not null and c.plano = 'gratis') desc, c.criada_em desc
     limit 300;
end;
$$;
revoke all on function public.equipe_contas() from public, anon;
grant execute on function public.equipe_contas() to authenticated;

-- 8. Estatísticas (depois de convites, que ela também conta) --------------------------------------

-- Totais do próprio portfólio. O detalhe (por semana e por tipo de visitante) é do Premium.
create or replace function public.minhas_estatisticas()
returns jsonb
language sql stable security definer set search_path = public
as $$
  with v as (select * from public.visitas_perfil where perfil_id = auth.uid()),
       p as (select slug from public.perfis where id = auth.uid())
  select jsonb_build_object(
    'premium', public.plano_de(auth.uid()) = 'premium',
    'visitas_30', (select count(*) from v where dia > current_date - 30),
    'visitas_7', case when public.plano_de(auth.uid()) = 'premium' then (select count(*) from v where dia > current_date - 7) end,
    'visitas_contratantes_30', case when public.plano_de(auth.uid()) = 'premium' then (select count(*) from v where dia > current_date - 30 and tipo_visitante = 'contratante') end,
    'visitas_total', case when public.plano_de(auth.uid()) = 'premium' then (select count(*) from v) end,
    'salvos', case when public.plano_de(auth.uid()) = 'premium' then (select count(*) from public.salvos s, p where s.perfil_slug = p.slug) end,
    'interesses', (select count(*) from public.interesses i where i.perfil_id = auth.uid()),
    'convites', (select count(*) from public.convites c where c.perfil_id = auth.uid())
  )
  where auth.uid() is not null;
$$;

-- Funções novas: só para quem tem conta, salvo as do link público.
revoke all on function public.minhas_estatisticas() from public, anon;
grant execute on function public.minhas_estatisticas() to authenticated;
