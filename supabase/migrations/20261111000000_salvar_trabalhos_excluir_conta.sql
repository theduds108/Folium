-- Fólium: melhorias de 2026-11-11.
--
-- 1. salvar_trabalhos: grava a lista de trabalhos do portfólio de uma vez só (tudo ou nada).
--    Antes o site apagava os antigos e depois gravava os novos em duas etapas; se a internet
--    caísse no meio, o navegador precisava devolver os antigos. Agora o banco faz as duas coisas
--    numa transação: ou troca tudo, ou não troca nada.
--    Roda com as permissões de quem chamou (security invoker), então as regras de acesso (RLS)
--    e o limite de 6 trabalhos do plano grátis continuam valendo.
-- 2. excluir_minha_conta: a pessoa logada apaga a própria conta (LGPD). O banco apaga o perfil,
--    os trabalhos, a conta, o nome de usuário, os talentos salvos e os interesses; vagas,
--    denúncias e feedbacks que ela escreveu ficam, mas sem o nome de quem escreveu.
--    As fotos e PDFs são apagados pelo site antes de chamar esta função.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).

-- 1. Trabalhos em uma transação só -------------------------------------------------------------

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

  insert into public.trabalhos (perfil_id, titulo, tipo, descricao, imagem_url, ordem, cliente, ano, link, papel, galeria)
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
    )), '{}')
  from jsonb_array_elements(coalesce(p_trabalhos, '[]'::jsonb)) with ordinality as e(item, n)
  where trim(coalesce(e.item->>'titulo', '')) <> ''
  order by e.n;
end;
$$;

revoke all on function public.salvar_trabalhos(jsonb) from public, anon;
grant execute on function public.salvar_trabalhos(jsonb) to authenticated;

-- 2. Excluir a própria conta --------------------------------------------------------------------

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_id uuid := auth.uid();
begin
  if v_id is null then
    raise exception 'Entre na sua conta para excluir' using errcode = '42501';
  end if;
  -- Tudo o que é da pessoa sai em cascata (perfis, trabalhos, contas, nomes_usuario, salvos,
  -- interesses); o que ela escreveu para outros fica sem autor (on delete set null).
  delete from auth.users where id = v_id;
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
