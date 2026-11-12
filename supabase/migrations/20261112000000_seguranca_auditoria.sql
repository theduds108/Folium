-- Fólium: ajustes de segurança da auditoria de 2026-11-12.
--
-- 1. Funções auxiliares (plano_de, tipo_de, eh_aluno_institucional) deixam de ser chamáveis por
--    quem está sem login. Antes, qualquer pessoa com a chave pública podia perguntar ao banco
--    "qual o plano / tipo de conta deste id?". Quem tem conta continua podendo (as regras de
--    acesso dependem delas).
-- 2. "Aluno UNISAGRADO" passa a exigir e-mail CONFIRMADO, conferido no próprio banco. Assim,
--    mesmo que alguém desligue sem querer o "Confirm email" do Supabase, ninguém vira colaborador
--    só digitando um e-mail @unisagrado.edu.br que não é dele.
-- 3. Fotos, currículos e certificados: quem tem conta só abre os arquivos de portfólios
--    PUBLICADOS (além dos próprios). Antes, qualquer conta (inclusive contratante criada com
--    qualquer e-mail) abria e listava os arquivos de todo mundo, até de quem tirou o perfil do ar.
--    A equipe continua vendo tudo.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado), depois das migrações anteriores.

-- 1. Funções auxiliares só para quem tem conta -------------------------------------------------

do $$
declare
  f text;
begin
  foreach f in array array['public.plano_de(uuid)', 'public.tipo_de(uuid)', 'public.eh_aluno_institucional()']
  loop
    if to_regprocedure(f) is not null then
      execute format('revoke all on function %s from public, anon', f);
      execute format('grant execute on function %s to authenticated', f);
    end if;
  end loop;
end $$;

-- 2. Aluno institucional = e-mail da instituição E confirmado -----------------------------------

create or replace function public.eh_aluno_institucional()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    join public.dominios_institucionais d
      on lower(split_part(u.email, '@', 2)) = d.dominio
      or lower(split_part(u.email, '@', 2)) like '%.' || d.dominio
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.eh_aluno_institucional() from public, anon;
grant execute on function public.eh_aluno_institucional() to authenticated;

-- 3. Arquivos só de portfólios publicados ---------------------------------------------------------

-- Verdadeiro quando o arquivo está na pasta de um portfólio publicado, na pasta de quem pediu
-- ou quando quem pediu é da equipe. A pasta é o id da pessoa: fotos/<id>/arquivo.jpg
create or replace function public.pode_ver_arquivo(p_nome text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and (
    split_part(p_nome, '/', 1) = auth.uid()::text
    or public.eh_equipe()
    or exists (select 1 from public.perfis p where p.id::text = split_part(p_nome, '/', 1) and p.publicado)
  );
$$;
revoke all on function public.pode_ver_arquivo(text) from public, anon;
grant execute on function public.pode_ver_arquivo(text) to authenticated;

drop policy if exists "logados veem fotos e curriculos" on storage.objects;
drop policy if exists "logados veem arquivos de portfolios publicados" on storage.objects;
create policy "logados veem arquivos de portfolios publicados" on storage.objects
  for select to authenticated
  using (bucket_id in ('fotos', 'curriculos') and public.pode_ver_arquivo(name));
