-- Vitrine aberta (temporária, pedida para o pitch de 27/11/2026)
--
-- Quem entra no site sem conta passa a ver a busca de talentos e os portfólios publicados,
-- SÓ com as informações públicas (as mesmas do link público): nome, curso, bio, serviços,
-- trabalhos e foto. WhatsApp, e-mail, currículo, certificados, experiências e redes NÃO saem
-- do banco para quem não tem conta. Convites, propostas e interesse continuam exigindo conta.
--
-- Liga e desliga por uma chave no banco, sem novo deploy:
--   Desligar:  update public.config_site set valor = false where chave = 'vitrine_aberta';
--   Ligar:     update public.config_site set valor = true  where chave = 'vitrine_aberta';
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).

-- 1. Chave ------------------------------------------------------------------------------------

create table if not exists public.config_site (
  chave text primary key,
  valor boolean not null default false
);
alter table public.config_site enable row level security;
revoke all on public.config_site from anon, authenticated;

insert into public.config_site (chave, valor) values ('vitrine_aberta', true)
on conflict (chave) do update set valor = excluded.valor;

create or replace function public.vitrine_aberta()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select valor from public.config_site where chave = 'vitrine_aberta'), false);
$$;
revoke all on function public.vitrine_aberta() from public;
grant execute on function public.vitrine_aberta() to anon, authenticated;

-- 2. Lista de portfólios para quem não tem conta -----------------------------------------------
-- Devolve null quando a vitrine está fechada (o site mostra o convite para entrar).

create or replace function public.vitrine_publica()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case when not public.vitrine_aberta() then null else coalesce((
    select jsonb_agg(x.item order by x.atualizado_em desc)
    from (
      select p.atualizado_em, jsonb_build_object(
        'id', p.id, 'slug', p.slug, 'nome', p.nome, 'curso', p.curso, 'semestre', p.semestre,
        'cidade', p.cidade, 'bio', p.bio, 'titulo', p.titulo, 'sobre_longo', p.sobre_longo,
        'conclusao', p.conclusao, 'formacao', p.formacao, 'servicos', p.servicos, 'habilidades', p.habilidades,
        'valor_referencia', p.valor_referencia, 'modalidades', p.modalidades, 'tipos_vaga', p.tipos_vaga,
        'foto_url', p.foto_url, 'disponivel', p.disponivel, 'idiomas', p.idiomas,
        'trabalhos', coalesce((
          select jsonb_agg(jsonb_build_object(
            'titulo', t.titulo, 'tipo', t.tipo, 'descricao', t.descricao, 'imagem_url', t.imagem_url,
            'ordem', t.ordem, 'cliente', t.cliente, 'ano', t.ano, 'link', t.link, 'papel', t.papel,
            'galeria', t.galeria, 'coautores', t.coautores) order by t.ordem)
          from public.trabalhos t where t.perfil_id = p.id), '[]'::jsonb)
      ) as item
      from public.perfis p
      where p.publicado
      order by p.atualizado_em desc
      limit 200
    ) x
  ), '[]'::jsonb) end;
$$;
revoke all on function public.vitrine_publica() from public;
grant execute on function public.vitrine_publica() to anon, authenticated;

-- 3. Portfólio sem conta: link público OU vitrine aberta ------------------------------------------

create or replace function public.portfolio_publico(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id, 'slug', p.slug, 'nome', p.nome, 'curso', p.curso, 'semestre', p.semestre,
    'cidade', p.cidade, 'bio', p.bio, 'titulo', p.titulo, 'sobre_longo', p.sobre_longo,
    'conclusao', p.conclusao, 'formacao', p.formacao, 'servicos', p.servicos, 'habilidades', p.habilidades,
    'valor_referencia', p.valor_referencia, 'modalidades', p.modalidades, 'tipos_vaga', p.tipos_vaga,
    'foto_url', p.foto_url, 'disponivel', p.disponivel, 'idiomas', p.idiomas,
    'trabalhos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'titulo', t.titulo, 'tipo', t.tipo, 'descricao', t.descricao, 'imagem_url', t.imagem_url,
        'ordem', t.ordem, 'cliente', t.cliente, 'ano', t.ano, 'link', t.link, 'papel', t.papel,
        'galeria', t.galeria, 'coautores', t.coautores) order by t.ordem)
      from public.trabalhos t where t.perfil_id = p.id), '[]'::jsonb)
  )
  from public.perfis p
  where p.slug = p_slug and p.publicado and (p.link_publico or public.vitrine_aberta());
$$;
revoke all on function public.portfolio_publico(text) from public;
grant execute on function public.portfolio_publico(text) to anon, authenticated;

-- 4. Fotos: só as que aparecem no portfólio (foto e obras), nunca certificados -------------------

create or replace function public.foto_do_link_publico(p_nome text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.perfis p
    where p.id::text = split_part(p_nome, '/', 1) and p.publicado and (p.link_publico or public.vitrine_aberta())
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

-- 5. Collabs no portfólio sem conta (os dois portfólios publicados) -------------------------------

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
    and (auth.uid() is not null or public.vitrine_aberta() or (p.link_publico and d.link_publico));
$$;
revoke all on function public.collabs_do_perfil(text) from public;
grant execute on function public.collabs_do_perfil(text) to anon, authenticated;
