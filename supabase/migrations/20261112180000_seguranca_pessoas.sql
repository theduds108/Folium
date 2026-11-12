-- Fólium: segurança das pessoas (12/11/2026).
--
--  Fase 1. Termos e código de conduta com aceite registrado (data e versão) e "ocorrências":
--          denúncia ligada a um combinado, nos dois sentidos (aluno denuncia contratante e
--          contratante denuncia aluno), com prints, sigilo, direito de defesa e decisão da equipe
--          em degraus (arquivar, advertência, suspensão, banimento, má-fé de quem denunciou).
--          Todo passo fica registrado em ocorrencias_historico.
--  Fase 2. Botão "Preciso de ajuda" do aluno no combinado em andamento: ocorrência urgente
--          (prazo de 24h para a equipe), opção de avisar a faculdade e de pausar o combinado
--          sem penalidade. Avisa a equipe por e-mail se o Resend já estiver configurado.
--  Fase 3. Avaliação por critérios e às cegas: a nota só aparece quando os dois avaliaram
--          ou 14 dias depois da primeira; só logados aprovados veem; direito de resposta.
--
-- Prazos: ajuda = 24 horas; denúncia comum = 5 dias úteis.
-- Depende das migrações de 11/11 (combinados) e de 12/11 (auditoria: contas.aprovada_em).
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).

-- 0. Contas: termos aceitos e suspensão ---------------------------------------------------------

alter table public.contas add column if not exists termos_aceitos_em timestamptz;
alter table public.contas add column if not exists termos_versao text;
-- Suspensa até essa data ('infinity' = banida). Só a equipe muda, pela decisão de uma ocorrência.
alter table public.contas add column if not exists suspensa_ate timestamptz;

-- Ninguém se libera de uma suspensão nem finge que aceitou os termos editando a própria conta.
-- O aceite só muda pela função aceitar_termos (que liga a marca "folium.aceitando_termos").
create or replace function public.proteger_conta()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.tipo := old.tipo;
    if coalesce(current_setting('folium.aceitando_termos', true), '') <> 'sim' then
      new.termos_aceitos_em := old.termos_aceitos_em;
      new.termos_versao := old.termos_versao;
    end if;
    if not (public.eh_equipe() and old.id <> auth.uid()) then
      new.plano := old.plano;
      new.plano_ate := old.plano_ate;
      new.aprovada_em := old.aprovada_em;
      new.suspensa_ate := old.suspensa_ate;
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

create or replace function public.proteger_conta_nova()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.aprovada_em := null;
    new.suspensa_ate := null;
    new.termos_aceitos_em := null;
    new.termos_versao := null;
  end if;
  return new;
end;
$$;

-- Aceite dos termos e do código de conduta. A versão vem do site (data da última mudança).
create or replace function public.aceitar_termos(p_versao text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta' using errcode = '42501'; end if;
  if length(coalesce(p_versao, '')) not between 4 and 20 then raise exception 'Versão inválida'; end if;
  perform set_config('folium.aceitando_termos', 'sim', true);
  update public.contas set termos_aceitos_em = now(), termos_versao = p_versao where id = auth.uid();
  perform set_config('folium.aceitando_termos', '', true);
end;
$$;
revoke all on function public.aceitar_termos(text) from public, anon;
grant execute on function public.aceitar_termos(text) to authenticated;

create or replace function public.conta_suspensa(p_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.contas c where c.id = p_id and c.suspensa_ate is not null and c.suspensa_ate > now());
$$;
revoke all on function public.conta_suspensa(uuid) from public, anon;
grant execute on function public.conta_suspensa(uuid) to authenticated;

-- Conta suspensa não publica vaga, não convida, não propõe combinado e não marca interesse.
create or replace function public.barrar_suspensa()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated' and public.conta_suspensa(auth.uid()) then
    raise exception 'Conta suspensa pela equipe do Fólium' using errcode = '42501';
  end if;
  return new;
end;
$$;
do $$
declare t text;
begin
  foreach t in array array['oportunidades', 'convites', 'combinados', 'interesses'] loop
    execute format('drop trigger if exists barrar_suspensa on public.%I', t);
    execute format('create trigger barrar_suspensa before insert on public.%I for each row execute function public.barrar_suspensa()', t);
  end loop;
end $$;

-- 1. Combinado pausado ------------------------------------------------------------------------------

alter table public.combinados drop constraint if exists combinados_status_check;
alter table public.combinados add constraint combinados_status_check
  check (status in ('proposto', 'aceito', 'pausado', 'recusado', 'concluido', 'cancelado'));
alter table public.combinados add column if not exists pausado_em timestamptz;

-- Mudanças de etapa, sempre pela função:
--   aluno: aceitar | recusar (proposto); pausar (aceito); retomar (pausado)
--   contratante: cancelar (proposto) | concluir (aceito)
--   A equipe pode encerrar (cancelar) um combinado aceito ou pausado depois de uma ocorrência.
-- Aceitar exige os termos aceitos; conta suspensa não aceita.
create or replace function public.mudar_combinado(p_id uuid, p_acao text)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare
  c public.combinados;
  v_novo text;
begin
  select * into c from public.combinados where id = p_id for update;
  if not found or (auth.uid() not in (c.perfil_id, c.contratante_id) and not public.eh_equipe()) then
    raise exception 'Combinado não encontrado' using errcode = 'P0002';
  end if;
  v_novo := case
    when p_acao = 'aceitar'   and c.status = 'proposto' and auth.uid() = c.perfil_id      then 'aceito'
    when p_acao = 'recusar'   and c.status = 'proposto' and auth.uid() = c.perfil_id      then 'recusado'
    when p_acao = 'cancelar'  and c.status = 'proposto' and auth.uid() = c.contratante_id then 'cancelado'
    when p_acao = 'concluir'  and c.status = 'aceito'   and auth.uid() = c.contratante_id then 'concluido'
    when p_acao = 'pausar'    and c.status = 'aceito'   and auth.uid() = c.perfil_id      then 'pausado'
    when p_acao = 'retomar'   and c.status = 'pausado'  and auth.uid() = c.perfil_id      then 'aceito'
    when p_acao = 'encerrar'  and c.status in ('aceito', 'pausado') and public.eh_equipe() then 'cancelado'
  end;
  if v_novo is null then
    raise exception 'Essa mudança não é possível agora' using errcode = 'P0001';
  end if;
  if p_acao = 'aceitar' then
    if public.conta_suspensa(auth.uid()) then
      raise exception 'Conta suspensa pela equipe do Fólium' using errcode = '42501';
    end if;
    if not exists (select 1 from public.contas where id = auth.uid() and termos_aceitos_em is not null) then
      raise exception 'Aceite os termos de uso e o código de conduta antes de fechar um combinado' using errcode = 'P0001';
    end if;
  end if;
  update public.combinados
     set status = v_novo,
         aceito_em = case when p_acao = 'aceitar' then now() else aceito_em end,
         concluido_em = case when v_novo = 'concluido' then now() else concluido_em end,
         pausado_em = case when v_novo = 'pausado' then now() when p_acao = 'retomar' then null else pausado_em end
   where id = p_id;
  return v_novo;
end;
$$;
revoke all on function public.mudar_combinado(uuid, text) from public, anon;
grant execute on function public.mudar_combinado(uuid, text) to authenticated;

-- Contratante só propõe combinado depois de aceitar os termos.
create or replace function public.exigir_termos()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
     and not exists (select 1 from public.contas where id = auth.uid() and termos_aceitos_em is not null) then
    raise exception 'Aceite os termos de uso e o código de conduta antes de continuar' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists exigir_termos on public.combinados;
create trigger exigir_termos before insert on public.combinados
  for each row execute function public.exigir_termos();

-- 2. Ocorrências (denúncias de combinado e pedidos de ajuda) ---------------------------------------

-- Soma dias úteis (segunda a sexta; feriados não entram na conta).
create or replace function public.mais_dias_uteis(p_inicio timestamptz, p_dias int)
returns timestamptz language plpgsql stable as $$
declare
  v timestamptz := p_inicio;
  n int := 0;
begin
  while n < p_dias loop
    v := v + interval '1 day';
    if extract(isodow from v at time zone 'America/Sao_Paulo') < 6 then n := n + 1; end if;
  end loop;
  return v;
end;
$$;

create table if not exists public.ocorrencias (
  id uuid primary key default gen_random_uuid(),
  -- 'ajuda' = botão Preciso de ajuda (só aluno, urgente); 'denuncia' = qualquer lado.
  tipo text not null check (tipo in ('ajuda', 'denuncia')),
  combinado_id uuid references public.combinados (id) on delete set null,
  -- Ficam mesmo se alguém excluir a conta: o registro protege as duas partes e o Fólium.
  autor_id uuid references auth.users (id) on delete set null default auth.uid(),
  alvo_id uuid references auth.users (id) on delete set null,
  autor_lado text not null default '' check (autor_lado in ('', 'aluno', 'contratante')),
  categoria text not null check (length(categoria) between 3 and 60),
  relato text not null default '' check (length(relato) <= 3000),
  -- Caminhos no bucket privado "provas" (pasta do autor).
  provas text[] not null default '{}' check (cardinality(provas) <= 6),
  -- Sigilo: a outra parte nunca vê o relato nem as provas, só o resumo que a equipe escrever.
  sigilo boolean not null default true,
  avisar_faculdade boolean not null default false,
  pausou_combinado boolean not null default false,
  urgente boolean not null default false,
  status text not null default 'aberta'
    check (status in ('aberta', 'em_analise', 'aguardando_defesa', 'resolvida', 'arquivada')),
  prazo_em timestamptz,
  resumo_defesa text not null default '' check (length(resumo_defesa) <= 1500),
  defesa text not null default '' check (length(defesa) <= 3000),
  defesa_em timestamptz,
  decisao text check (decisao in ('arquivada', 'advertencia', 'suspensao', 'banimento', 'ma_fe')),
  decisao_texto text not null default '' check (length(decisao_texto) <= 1500),
  decidida_em timestamptz,
  decidida_por uuid references auth.users (id) on delete set null,
  criada_em timestamptz not null default now()
);
create index if not exists ocorrencias_status on public.ocorrencias (status, urgente desc, prazo_em);
create index if not exists ocorrencias_autor on public.ocorrencias (autor_id, criada_em desc);
create index if not exists ocorrencias_alvo on public.ocorrencias (alvo_id);
alter table public.ocorrencias enable row level security;
revoke all on public.ocorrencias from anon;
revoke update, delete on public.ocorrencias from authenticated;
grant select, insert on public.ocorrencias to authenticated;

drop policy if exists "autor ve as proprias ocorrencias" on public.ocorrencias;
create policy "autor ve as proprias ocorrencias" on public.ocorrencias
  for select to authenticated using (autor_id = auth.uid() or public.eh_equipe());

-- Só quem é parte do combinado registra, e só sobre a outra parte (preenchida pelo gatilho).
drop policy if exists "parte do combinado registra ocorrencia" on public.ocorrencias;
create policy "parte do combinado registra ocorrencia" on public.ocorrencias
  for insert to authenticated with check (
    autor_id = auth.uid()
    and exists (
      select 1 from public.combinados c
      where c.id = combinado_id
        and auth.uid() in (c.perfil_id, c.contratante_id)
        and (
          (tipo = 'ajuda' and auth.uid() = c.perfil_id and c.status in ('aceito', 'pausado'))
          or (tipo = 'denuncia' and c.status in ('aceito', 'pausado', 'concluido', 'cancelado'))
        )
    )
  );

-- Preenche o que o site não decide: alvo, lado, prazo, urgência, status. Pausa o combinado se pedido.
create or replace function public.preencher_ocorrencia()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  c public.combinados;
begin
  select * into c from public.combinados where id = new.combinado_id;
  new.autor_lado := case when new.autor_id = c.perfil_id then 'aluno' else 'contratante' end;
  new.alvo_id := case when new.autor_id = c.perfil_id then c.contratante_id else c.perfil_id end;
  new.urgente := new.tipo = 'ajuda';
  new.status := 'aberta';
  new.criada_em := now();
  new.prazo_em := case when new.tipo = 'ajuda' then now() + interval '24 hours' else public.mais_dias_uteis(now(), 5) end;
  new.resumo_defesa := ''; new.defesa := ''; new.defesa_em := null;
  new.decisao := null; new.decisao_texto := ''; new.decidida_em := null; new.decidida_por := null;
  if new.tipo <> 'ajuda' then new.avisar_faculdade := false; new.pausou_combinado := false; end if;
  -- Provas só da pasta de quem denuncia.
  if exists (select 1 from unnest(new.provas) p where split_part(p, '/', 1) <> new.autor_id::text) then
    raise exception 'Prova inválida';
  end if;
  if (select count(*) from public.ocorrencias
      where autor_id = new.autor_id and criada_em > now() - interval '24 hours') >= 10 then
    raise exception 'Muitas ocorrencias seguidas';
  end if;
  if new.tipo = 'ajuda' and new.pausou_combinado and c.status = 'aceito' then
    update public.combinados set status = 'pausado', pausado_em = now() where id = c.id;
  end if;
  return new;
end;
$$;
drop trigger if exists preencher_ocorrencia on public.ocorrencias;
create trigger preencher_ocorrencia before insert on public.ocorrencias
  for each row execute function public.preencher_ocorrencia();

-- Histórico: tudo o que acontece com uma ocorrência (quem, o quê, quando). Ninguém apaga.
create table if not exists public.ocorrencias_historico (
  id bigint generated always as identity primary key,
  ocorrencia_id uuid not null references public.ocorrencias (id) on delete cascade,
  quem uuid references auth.users (id) on delete set null,
  acao text not null,
  texto text not null default '',
  em timestamptz not null default now()
);
create index if not exists ocorrencias_historico_oc on public.ocorrencias_historico (ocorrencia_id, em);
alter table public.ocorrencias_historico enable row level security;
revoke all on public.ocorrencias_historico from anon, authenticated;
grant select on public.ocorrencias_historico to authenticated;
drop policy if exists "equipe le historico" on public.ocorrencias_historico;
create policy "equipe le historico" on public.ocorrencias_historico
  for select to authenticated using (public.eh_equipe());

create or replace function public.registrar_ocorrencia_criada()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.ocorrencias_historico (ocorrencia_id, quem, acao, texto)
  values (new.id, new.autor_id, case when new.tipo = 'ajuda' then 'pediu ajuda' else 'denunciou' end,
          new.categoria || case when new.pausou_combinado then ' (pausou o combinado)' else '' end);
  return new;
end;
$$;
drop trigger if exists registrar_ocorrencia_criada on public.ocorrencias;
create trigger registrar_ocorrencia_criada after insert on public.ocorrencias
  for each row execute function public.registrar_ocorrencia_criada();

-- Aviso por e-mail para a equipe (usa os mesmos segredos do feedback por e-mail, se existirem).
-- O e-mail não leva o relato: só o tipo e o prazo. O resto se lê no painel, com login.
create or replace function public.avisar_ocorrencia_por_email()
returns trigger
language plpgsql security definer set search_path = public, extensions, vault
as $$
declare
  v_chave text;
  v_destino text;
begin
  select decrypted_secret into v_chave from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select decrypted_secret into v_destino from vault.decrypted_secrets where name = 'feedback_email_destino' limit 1;
  if coalesce(v_chave, '') = '' or coalesce(v_destino, '') = '' then return new; end if;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_chave, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Fólium <onboarding@resend.dev>',
      'to', jsonb_build_array(v_destino),
      'subject', case when new.tipo = 'ajuda' then 'URGENTE: pedido de ajuda no Fólium' else 'Nova denúncia no Fólium' end,
      'text',
        case when new.tipo = 'ajuda' then 'Um aluno apertou "Preciso de ajuda" em um combinado.' else 'Chegou uma denúncia ligada a um combinado.' end
        || E'\n\nCategoria: ' || new.categoria
        || E'\nResponder até: ' || to_char(new.prazo_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
        || case when new.avisar_faculdade then E'\nO aluno pediu para avisar a faculdade.' else '' end
        || E'\n\nAbra o Painel da equipe > Segurança para ler o relato.'
    )
  );
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.avisar_ocorrencia_por_email() from public, anon, authenticated;
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_net') then
    execute 'drop trigger if exists avisar_ocorrencia_por_email on public.ocorrencias';
    execute 'create trigger avisar_ocorrencia_por_email after insert on public.ocorrencias for each row execute function public.avisar_ocorrencia_por_email()';
  end if;
end $$;

-- A outra parte (alvo) vê só o pedido de defesa: categoria, resumo da equipe e prazo. Nunca o relato.
create or replace function public.meus_pedidos_de_defesa()
returns table (id uuid, categoria text, resumo_defesa text, titulo_combinado text, defesa text, defesa_em timestamptz, status text)
language sql stable security definer set search_path = public
as $$
  select o.id, o.categoria, o.resumo_defesa, coalesce(c.titulo, 'Combinado'), o.defesa, o.defesa_em, o.status
    from public.ocorrencias o left join public.combinados c on c.id = o.combinado_id
   where o.alvo_id = auth.uid() and o.tipo = 'denuncia' and o.resumo_defesa <> ''
   order by o.criada_em desc;
$$;
revoke all on function public.meus_pedidos_de_defesa() from public, anon;
grant execute on function public.meus_pedidos_de_defesa() to authenticated;

create or replace function public.enviar_defesa(p_id uuid, p_texto text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if length(trim(coalesce(p_texto, ''))) not between 10 and 3000 then
    raise exception 'Escreva sua versão (de 10 a 3000 caracteres)' using errcode = 'P0001';
  end if;
  update public.ocorrencias set defesa = trim(p_texto), defesa_em = now(), status = 'em_analise'
   where id = p_id and alvo_id = auth.uid() and status = 'aguardando_defesa';
  if not found then raise exception 'Esse pedido de defesa não está aberto' using errcode = 'P0002'; end if;
  insert into public.ocorrencias_historico (ocorrencia_id, quem, acao) values (p_id, auth.uid(), 'enviou a defesa');
end;
$$;
revoke all on function public.enviar_defesa(uuid, text) from public, anon;
grant execute on function public.enviar_defesa(uuid, text) to authenticated;

-- Equipe: andar com a ocorrência. Ações:
--   analisar            -> em_analise
--   pedir_defesa        -> aguardando_defesa (p_texto = resumo que a outra parte vai ler)
--   decidir             -> resolvida/arquivada, com p_decisao e p_texto (motivo)
-- Efeitos da decisão sobre a conta denunciada (ou sobre quem denunciou, em caso de má-fé):
--   advertencia: só registro; suspensao: 30 dias; banimento: para sempre e portfólio sai da busca.
create or replace function public.equipe_ocorrencia(p_id uuid, p_acao text, p_decisao text default null, p_texto text default '')
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  o public.ocorrencias;
  v_conta uuid;
begin
  if not public.eh_equipe() then raise exception 'Só para a equipe' using errcode = '42501'; end if;
  select * into o from public.ocorrencias where id = p_id for update;
  if not found then raise exception 'Ocorrência não encontrada' using errcode = 'P0002'; end if;
  p_texto := trim(coalesce(p_texto, ''));

  if p_acao = 'analisar' then
    update public.ocorrencias set status = 'em_analise' where id = p_id;
  elsif p_acao = 'pedir_defesa' then
    if length(p_texto) < 10 then raise exception 'Escreva o resumo que a outra parte vai ler' using errcode = 'P0001'; end if;
    if o.tipo <> 'denuncia' or o.alvo_id is null then raise exception 'Essa ocorrência não tem defesa' using errcode = 'P0001'; end if;
    update public.ocorrencias set status = 'aguardando_defesa', resumo_defesa = p_texto where id = p_id;
  elsif p_acao = 'decidir' then
    if p_decisao is null or p_decisao not in ('arquivada', 'advertencia', 'suspensao', 'banimento', 'ma_fe') then
      raise exception 'Escolha a decisão' using errcode = 'P0001';
    end if;
    update public.ocorrencias
       set status = case when p_decisao = 'arquivada' then 'arquivada' else 'resolvida' end,
           decisao = p_decisao, decisao_texto = p_texto, decidida_em = now(), decidida_por = auth.uid()
     where id = p_id;
    v_conta := case when p_decisao = 'ma_fe' then o.autor_id else o.alvo_id end;
    if v_conta is not null and p_decisao in ('suspensao', 'banimento') then
      update public.contas
         set suspensa_ate = case when p_decisao = 'banimento' then 'infinity'::timestamptz else now() + interval '30 days' end
       where id = v_conta;
      update public.perfis set publicado = false where id = v_conta and p_decisao = 'banimento';
    end if;
    -- Denúncia procedente contra o contratante: a nota que ele deu ao aluno nesse combinado não vale.
    if p_decisao in ('advertencia', 'suspensao', 'banimento') and o.autor_lado = 'aluno' and o.combinado_id is not null then
      update public.avaliacoes set oculta = true where combinado_id = o.combinado_id and autor_id = o.alvo_id;
    end if;
  else
    raise exception 'Ação desconhecida' using errcode = 'P0001';
  end if;

  insert into public.ocorrencias_historico (ocorrencia_id, quem, acao, texto)
  values (p_id, auth.uid(), p_acao || coalesce(': ' || p_decisao, ''), p_texto);
end;
$$;
revoke all on function public.equipe_ocorrencia(uuid, text, text, text) from public, anon;
grant execute on function public.equipe_ocorrencia(uuid, text, text, text) to authenticated;

-- Bucket privado para prints: cada um envia na própria pasta; só o autor e a equipe abrem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provas', 'provas', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "envia prova na propria pasta" on storage.objects;
create policy "envia prova na propria pasta" on storage.objects
  for insert to authenticated with check (bucket_id = 'provas' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "autor e equipe veem provas" on storage.objects;
create policy "autor e equipe veem provas" on storage.objects
  for select to authenticated using (bucket_id = 'provas' and ((storage.foldername(name))[1] = auth.uid()::text or public.eh_equipe()));

-- 3. Avaliações por critério, às cegas ------------------------------------------------------------

alter table public.avaliacoes add column if not exists criterios jsonb not null default '{}'::jsonb;
alter table public.avaliacoes add column if not exists oculta boolean not null default false;
alter table public.avaliacoes add column if not exists resposta text not null default '' check (length(resposta) <= 500);
alter table public.avaliacoes add column if not exists resposta_em timestamptz;

-- Critérios aceitos (de 1 a 5). A "nota" passa a ser a média deles, arredondada.
create or replace function public.preencher_avaliacao()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_chaves text[];
  k text;
  v int;
  soma int := 0;
  n int := 0;
begin
  new.autor_nome := coalesce(
    (select nullif(c.empresa, '') from public.contas c where c.id = new.autor_id),
    (select p.nome from public.perfis p where p.id = new.autor_id),
    (select nullif(c.nome, '') from public.contas c where c.id = new.autor_id),
    'Usuário do Fólium');
  -- Retaliação: quem já foi punido por denúncia da outra parte nesse combinado não pesa na nota dela.
  new.oculta := exists (
    select 1 from public.ocorrencias o
     where o.combinado_id = new.combinado_id and o.autor_id = new.alvo_id and o.alvo_id = new.autor_id
       and o.decisao in ('advertencia', 'suspensao', 'banimento'));
  new.resposta := '';
  new.resposta_em := null;
  if new.criterios is not null and new.criterios <> '{}'::jsonb then
    -- Quem avalia o aluno é o contratante, e vice-versa.
    v_chaves := case when exists (select 1 from public.combinados c where c.id = new.combinado_id and c.perfil_id = new.alvo_id)
      then array['pontualidade', 'qualidade', 'comunicacao', 'respeito']
      else array['respeito', 'pagamento', 'clareza', 'ambiente'] end;
    for k in select jsonb_object_keys(new.criterios) loop
      if not (k = any(v_chaves)) then raise exception 'Critério inválido: %', k; end if;
      v := (new.criterios ->> k)::int;
      if v not between 1 and 5 then raise exception 'Nota inválida'; end if;
      soma := soma + v; n := n + 1;
    end loop;
    if n <> cardinality(v_chaves) then raise exception 'Dê nota a todos os critérios'; end if;
    new.nota := round(soma::numeric / n);
  end if;
  return new;
end;
$$;

-- Avaliação às cegas: aparece quando as duas partes já avaliaram o combinado ou 14 dias depois.
create or replace function public.avaliacao_revelada(p_combinado uuid, p_criado timestamptz)
returns boolean
language sql stable security definer set search_path = public
as $$
  select p_combinado is null
      or p_criado < now() - interval '14 days'
      or (select count(*) from public.avaliacoes a where a.combinado_id = p_combinado) >= 2;
$$;
revoke all on function public.avaliacao_revelada(uuid, timestamptz) from public, anon;
grant execute on function public.avaliacao_revelada(uuid, timestamptz) to authenticated;

-- Quem vê: a equipe sempre; o autor vê a própria; os outros só se forem aluno ou contratante
-- aprovado, e só depois de revelada e se a equipe não a anulou.
drop policy if exists "logados veem avaliacoes" on public.avaliacoes;
drop policy if exists "aprovados veem avaliacoes reveladas" on public.avaliacoes;
create policy "aprovados veem avaliacoes reveladas" on public.avaliacoes
  for select to authenticated using (
    public.eh_equipe()
    or autor_id = auth.uid()
    or (not oculta and public.pode_ver_contatos() and public.avaliacao_revelada(combinado_id, criado_em))
  );

-- Direito de resposta: quem recebeu responde uma vez, depois que a avaliação aparece.
create or replace function public.responder_avaliacao(p_id uuid, p_texto text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if length(trim(coalesce(p_texto, ''))) not between 3 and 500 then
    raise exception 'A resposta precisa ter de 3 a 500 caracteres' using errcode = 'P0001';
  end if;
  update public.avaliacoes set resposta = trim(p_texto), resposta_em = now()
   where id = p_id and alvo_id = auth.uid() and resposta = '' and not oculta
     and public.avaliacao_revelada(combinado_id, criado_em);
  if not found then raise exception 'Não dá para responder essa avaliação' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.responder_avaliacao(uuid, text) from public, anon;
grant execute on function public.responder_avaliacao(uuid, text) to authenticated;

-- A equipe pode anular uma avaliação (ofensiva, retaliação) sem apagar o registro.
drop policy if exists "equipe anula avaliacao" on public.avaliacoes;
create policy "equipe anula avaliacao" on public.avaliacoes
  for update to authenticated using (public.eh_equipe()) with check (public.eh_equipe());
grant update (oculta) on public.avaliacoes to authenticated;

-- Equipe: contas com termos e suspensão (mesma lista de antes, com as colunas novas).
drop function if exists public.equipe_contas();
create function public.equipe_contas()
returns table (id uuid, email text, tipo text, plano text, plano_ate date, plano_pedido text,
               nome text, empresa text, criada_em timestamptz, aprovada_em timestamptz,
               termos_aceitos_em timestamptz, suspensa_ate timestamptz)
language plpgsql stable security definer set search_path = public, auth
as $$
begin
  if not public.eh_equipe() then
    raise exception 'Só para a equipe' using errcode = '42501';
  end if;
  return query
    select c.id, u.email::text, c.tipo, c.plano, c.plano_ate, c.plano_pedido, c.nome, c.empresa, c.criada_em,
           c.aprovada_em, c.termos_aceitos_em, c.suspensa_ate
      from public.contas c join auth.users u on u.id = c.id
     order by (c.tipo = 'contratante' and c.aprovada_em is null) desc,
              (c.plano_pedido is not null and c.plano = 'gratis') desc, c.criada_em desc
     limit 300;
end;
$$;
revoke all on function public.equipe_contas() from public, anon;
grant execute on function public.equipe_contas() to authenticated;

-- Equipe tira a suspensão antes da hora (por exemplo, depois de um recurso).
create or replace function public.equipe_tirar_suspensao(p_id uuid)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.eh_equipe() then raise exception 'Só para a equipe' using errcode = '42501'; end if;
  update public.contas set suspensa_ate = null where id = p_id;
end;
$$;
revoke all on function public.equipe_tirar_suspensao(uuid) from public, anon;
grant execute on function public.equipe_tirar_suspensao(uuid) to authenticated;
