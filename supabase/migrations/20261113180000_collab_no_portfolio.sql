-- Fólium: trabalho em collab aparece também no portfólio dos colegas (13/11/2026).
--
-- Quem publica um trabalho marca colegas que têm portfólio no Fólium. Cada colega marcado recebe
-- um convite no editor ("Ana marcou você em 'Artigo'"), escreve o que fez no projeto e aceita.
-- Só depois do aceite o trabalho entra no portfólio do colega, com a parte dele. O colega pode
-- recusar ou tirar depois; quem publicou pode desmarcar. Nada aparece sem o aceite da pessoa.
--
-- 1. trabalhos com id fixo: salvar_trabalhos agora atualiza os que já existem (pelo id), cria os
--    novos e apaga os que saíram da lista, numa transação só. Antes apagava tudo e recriava, e os
--    convites de collab se perderiam a cada "Salvar portfólio".
-- 2. collab_participacoes: um registro por (trabalho, colega marcado), com situação e a parte dele.
-- 3. Funções: meus_convites_collab, responder_collab e collabs_do_perfil (leitura para o portfólio).
--
-- Precisa do SQL 20261113120000_formacao_collab.sql rodado antes.
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).

-- 2. Participações -----------------------------------------------------------------------------

create table if not exists public.collab_participacoes (
  trabalho_id uuid not null references public.trabalhos (id) on delete cascade,
  -- Aponta para a conta, não para perfis: com perfis o Supabase veria dois caminhos entre perfis e
  -- trabalhos e a lista de portfólios quebraria (ver 20261113200000_conserta_lista_portfolios.sql).
  coautor_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'recusado')),
  papel text not null default '' check (char_length(papel) <= 200),
  criado_em timestamptz not null default now(),
  respondido_em timestamptz,
  primary key (trabalho_id, coautor_id)
);
create index if not exists collab_participacoes_coautor on public.collab_participacoes (coautor_id, status);

-- Ninguém lê nem grava direto: só pelas funções abaixo.
alter table public.collab_participacoes enable row level security;
revoke all on public.collab_participacoes from anon, authenticated;

-- 1. Salvar trabalhos mantendo o id ------------------------------------------------------------

drop function if exists public.salvar_trabalhos(jsonb);

create function public.salvar_trabalhos(p_trabalhos jsonb)
returns uuid[]
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_item jsonb;
  v_n bigint;
  v_tid uuid;
  v_ids uuid[] := '{}';
  v_ordem int := 0;
begin
  if v_id is null then
    raise exception 'Entre na sua conta para salvar' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_trabalhos, '[]'::jsonb)) <> 'array' then
    raise exception 'Lista de trabalhos inválida' using errcode = '22023';
  end if;

  -- Apaga os que saíram da lista (o convite de collab deles vai junto).
  delete from public.trabalhos t
   where t.perfil_id = v_id
     and t.id::text not in (
       select coalesce(e->>'id', '') from jsonb_array_elements(coalesce(p_trabalhos, '[]'::jsonb)) e
     );

  for v_item, v_n in
    select e.item, e.n from jsonb_array_elements(coalesce(p_trabalhos, '[]'::jsonb)) with ordinality as e(item, n)
     where trim(coalesce(e.item->>'titulo', '')) <> ''
     order by e.n
  loop
    v_tid := null;
    if coalesce(v_item->>'id', '') ~ '^[0-9a-f-]{36}$' then
      update public.trabalhos set
        titulo = v_item->>'titulo',
        tipo = coalesce(v_item->>'tipo', ''),
        descricao = coalesce(v_item->>'descricao', ''),
        imagem_url = nullif(v_item->>'imagem_url', ''),
        ordem = v_ordem,
        cliente = coalesce(v_item->>'cliente', ''),
        ano = coalesce(v_item->>'ano', ''),
        link = coalesce(v_item->>'link', ''),
        papel = coalesce(v_item->>'papel', ''),
        galeria = coalesce(array(select jsonb_array_elements_text(
          case when jsonb_typeof(v_item->'galeria') = 'array' then v_item->'galeria' else '[]'::jsonb end)), '{}'),
        coautores = case when jsonb_typeof(v_item->'coautores') = 'array' then v_item->'coautores' else '[]'::jsonb end
      where id = (v_item->>'id')::uuid and perfil_id = v_id
      returning id into v_tid;
    end if;
    if v_tid is null then
      insert into public.trabalhos (perfil_id, titulo, tipo, descricao, imagem_url, ordem, cliente, ano, link, papel, galeria, coautores)
      values (
        v_id, v_item->>'titulo', coalesce(v_item->>'tipo', ''), coalesce(v_item->>'descricao', ''),
        nullif(v_item->>'imagem_url', ''), v_ordem, coalesce(v_item->>'cliente', ''), coalesce(v_item->>'ano', ''),
        coalesce(v_item->>'link', ''), coalesce(v_item->>'papel', ''),
        coalesce(array(select jsonb_array_elements_text(
          case when jsonb_typeof(v_item->'galeria') = 'array' then v_item->'galeria' else '[]'::jsonb end)), '{}'),
        case when jsonb_typeof(v_item->'coautores') = 'array' then v_item->'coautores' else '[]'::jsonb end
      )
      returning id into v_tid;
    end if;

    -- Convites: um por colega marcado que tem portfólio (nunca a própria pessoa).
    insert into public.collab_participacoes (trabalho_id, coautor_id)
    select v_tid, p.id
      from jsonb_array_elements(coalesce((select coautores from public.trabalhos where id = v_tid), '[]'::jsonb)) c
      join public.perfis p on p.slug = c->>'slug'
     where p.id <> v_id
    on conflict do nothing;
    -- Colega desmarcado: sai o convite (e o trabalho some do portfólio dele).
    delete from public.collab_participacoes cp
     where cp.trabalho_id = v_tid
       and cp.coautor_id not in (
         select p.id from jsonb_array_elements(coalesce((select coautores from public.trabalhos where id = v_tid), '[]'::jsonb)) c
           join public.perfis p on p.slug = c->>'slug'
       );

    v_ids := v_ids || v_tid;
    v_ordem := v_ordem + 1;
  end loop;

  return v_ids;
end;
$$;

revoke all on function public.salvar_trabalhos(jsonb) from public, anon;
grant execute on function public.salvar_trabalhos(jsonb) to authenticated;

-- A tabela de participações é fechada; a função acima roda como quem chamou, então ela precisa
-- poder gravar ali. Só no que é dela: trabalho do próprio perfil.
grant select, insert, delete on public.collab_participacoes to authenticated;
drop policy if exists "dono do trabalho gerencia convites" on public.collab_participacoes;
create policy "dono do trabalho gerencia convites" on public.collab_participacoes
  for all to authenticated
  using (exists (select 1 from public.trabalhos t where t.id = trabalho_id and t.perfil_id = auth.uid()))
  with check (exists (select 1 from public.trabalhos t where t.id = trabalho_id and t.perfil_id = auth.uid()));

-- 3. Funções do colega -------------------------------------------------------------------------

-- Convites recebidos (pendentes e aceitos), com o trabalho e quem marcou.
create or replace function public.meus_convites_collab()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'trabalho_id', t.id, 'titulo', t.titulo, 'tipo', t.tipo, 'imagem_url', t.imagem_url,
    'status', cp.status, 'papel', cp.papel, 'dono_nome', d.nome, 'dono_slug', d.slug
  ) order by cp.criado_em desc), '[]'::jsonb)
  from public.collab_participacoes cp
  join public.trabalhos t on t.id = cp.trabalho_id
  join public.perfis d on d.id = t.perfil_id
  where cp.coautor_id = auth.uid() and cp.status <> 'recusado';
$$;
revoke all on function public.meus_convites_collab() from public, anon;
grant execute on function public.meus_convites_collab() to authenticated;

-- Aceitar (com a parte da pessoa), editar a parte, recusar ou tirar do portfólio.
create or replace function public.responder_collab(p_trabalho uuid, p_aceitar boolean, p_papel text default '')
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta' using errcode = '42501';
  end if;
  update public.collab_participacoes
     set status = case when p_aceitar then 'aceito' else 'recusado' end,
         papel = left(trim(coalesce(p_papel, '')), 200),
         respondido_em = now()
   where trabalho_id = p_trabalho and coautor_id = auth.uid();
  if not found then
    raise exception 'Esse convite de collab não existe mais' using errcode = 'P0002';
  end if;
end;
$$;
revoke all on function public.responder_collab(uuid, boolean, text) from public, anon;
grant execute on function public.responder_collab(uuid, boolean, text) to authenticated;

-- Trabalhos em collab aceitos que aparecem no portfólio de alguém.
-- Logado: os dois portfólios precisam estar publicados. Sem login (link público): os dois
-- portfólios precisam ter o link público ligado, para nada do outro aluno vazar sem ele querer.
create or replace function public.collabs_do_perfil(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'titulo', t.titulo, 'tipo', t.tipo, 'descricao', t.descricao, 'imagem_url', t.imagem_url,
    'galeria', t.galeria, 'cliente', t.cliente, 'ano', t.ano, 'link', t.link,
    'coautores', t.coautores, 'papel', cp.papel, 'dono_nome', d.nome, 'dono_slug', d.slug
  ) order by cp.respondido_em desc), '[]'::jsonb)
  from public.perfis p
  join public.collab_participacoes cp on cp.coautor_id = p.id and cp.status = 'aceito'
  join public.trabalhos t on t.id = cp.trabalho_id
  join public.perfis d on d.id = t.perfil_id
  where p.slug = p_slug and p.publicado and d.publicado
    and (auth.uid() is not null or (p.link_publico and d.link_publico));
$$;
revoke all on function public.collabs_do_perfil(text) from public;
grant execute on function public.collabs_do_perfil(text) to anon, authenticated;
