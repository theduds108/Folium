-- Fólium: formação no portfólio e trabalhos em collab (13/11/2026).
--
-- 1. perfis.formacao: detalhes da graduação que o aluno preenche na ficha "Formação" do editor
--    (grau, situação do curso, turno, mês de ingresso) e outras formações (técnico, outra
--    graduação, pós). O curso, o semestre e a previsão de formatura continuam nas colunas que já
--    existiam. Aparece no portfólio como as outras informações públicas (sem contatos).
-- 2. trabalhos.coautores: colegas que fizeram o trabalho junto, ex.: [{"nome": "Gi Lima",
--    "slug": "gi-lima"}]. O slug é opcional e, quando existe, vira link para o portfólio do colega.
-- 3. salvar_trabalhos passa a gravar os coautores; portfolio_publico passa a devolver a formação.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).

-- 1. Formação ----------------------------------------------------------------------------------

alter table public.perfis add column if not exists formacao jsonb not null default '{}'::jsonb;

alter table public.perfis drop constraint if exists perfis_formacao_valida;
alter table public.perfis add constraint perfis_formacao_valida check (
  jsonb_typeof(formacao) = 'object'
  and pg_column_size(formacao) <= 8000
  and (formacao->'outras' is null or (jsonb_typeof(formacao->'outras') = 'array' and jsonb_array_length(formacao->'outras') <= 6))
);

-- Leitura por coluna (migração 20261112000000): a formação é pública como curso e semestre.
grant select (formacao) on public.perfis to authenticated;

-- 2. Coautores ---------------------------------------------------------------------------------

alter table public.trabalhos add column if not exists coautores jsonb not null default '[]'::jsonb;

alter table public.trabalhos drop constraint if exists trabalhos_coautores_validos;
alter table public.trabalhos add constraint trabalhos_coautores_validos check (
  jsonb_typeof(coautores) = 'array'
  and jsonb_array_length(coautores) <= 6
  and pg_column_size(coautores) <= 2000
);

-- 3. Funções -----------------------------------------------------------------------------------

create or replace function public.salvar_trabalhos(p_trabalhos jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
begin
  if v_id is null then
    raise exception 'Entre na sua conta para salvar' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_trabalhos, '[]'::jsonb)) <> 'array' then
    raise exception 'Lista de trabalhos inválida' using errcode = '22023';
  end if;

  delete from public.trabalhos where perfil_id = v_id;

  insert into public.trabalhos (perfil_id, titulo, tipo, descricao, imagem_url, ordem, cliente, ano, link, papel, galeria, coautores)
  select
    v_id,
    e.item->>'titulo',
    coalesce(e.item->>'tipo', ''),
    coalesce(e.item->>'descricao', ''),
    nullif(e.item->>'imagem_url', ''),
    (row_number() over (order by e.n) - 1)::int,
    coalesce(e.item->>'cliente', ''),
    coalesce(e.item->>'ano', ''),
    coalesce(e.item->>'link', ''),
    coalesce(e.item->>'papel', ''),
    coalesce(array(select jsonb_array_elements_text(
      case when jsonb_typeof(e.item->'galeria') = 'array' then e.item->'galeria' else '[]'::jsonb end
    )), '{}'),
    case when jsonb_typeof(e.item->'coautores') = 'array' then e.item->'coautores' else '[]'::jsonb end
  from jsonb_array_elements(coalesce(p_trabalhos, '[]'::jsonb)) with ordinality as e(item, n)
  where trim(coalesce(e.item->>'titulo', '')) <> ''
  order by e.n;
end;
$$;

revoke all on function public.salvar_trabalhos(jsonb) from public, anon;
grant execute on function public.salvar_trabalhos(jsonb) to authenticated;

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
  where p.slug = p_slug and p.publicado and p.link_publico;
$$;
revoke all on function public.portfolio_publico(text) from public;
grant execute on function public.portfolio_publico(text) to anon, authenticated;
