-- Fólium: dados só para quem tem conta.
--
-- Antes, qualquer pessoa (mesmo sem login) conseguia ler pelo banco os portfólios publicados,
-- os trabalhos, as vagas, a lista de empresas e abrir fotos, currículos e certificados pelo link.
-- Agora tudo isso exige login (papel "authenticated"), e os arquivos ficam em buckets privados:
-- o site pede um link assinado, que expira em 6 horas, para mostrar cada arquivo.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase, depois das migrações anteriores.

-- 1. Portfólios e trabalhos ---------------------------------------------------

drop policy if exists "todos veem perfis publicados" on public.perfis;
drop policy if exists "logados veem perfis publicados" on public.perfis;
create policy "logados veem perfis publicados" on public.perfis
  for select to authenticated using (publicado or auth.uid() = id);

drop policy if exists "todos veem trabalhos de perfis publicados" on public.trabalhos;
drop policy if exists "logados veem trabalhos de perfis publicados" on public.trabalhos;
create policy "logados veem trabalhos de perfis publicados" on public.trabalhos
  for select to authenticated using (
    exists (select 1 from public.perfis p where p.id = perfil_id and (p.publicado or p.id = auth.uid()))
  );

-- 2. Vagas e empresas ---------------------------------------------------------

drop policy if exists "todos veem oportunidades aprovadas" on public.oportunidades;
drop policy if exists "logados veem oportunidades aprovadas" on public.oportunidades;
create policy "logados veem oportunidades aprovadas" on public.oportunidades
  for select to authenticated using (status = 'aprovada' or autor_id = auth.uid());

-- A tabela empresas vem de 20261102180000_empresas.sql; se ela ainda não existir, pula.
do $$
begin
  if to_regclass('public.empresas') is not null then
    drop policy if exists "todos buscam empresas" on public.empresas;
    drop policy if exists "logados buscam empresas" on public.empresas;
    create policy "logados buscam empresas" on public.empresas
      for select to authenticated using (true);
  end if;
end $$;

-- 3. Denúncias: só quem tem conta (evita spam anônimo) ------------------------

drop policy if exists "qualquer pessoa denuncia" on public.denuncias;
drop policy if exists "logados denunciam" on public.denuncias;
create policy "logados denunciam" on public.denuncias
  for insert to authenticated with check (true);

-- 4. Visitante sem login não lê nenhuma tabela com dados de pessoas ----------
-- (as políticas acima já bloqueiam; isto é uma segunda trava.)

-- Só nas tabelas que existem no seu banco (pula as de migrações que ainda não rodaram).
do $$
declare
  t text;
begin
  foreach t in array array['perfis', 'trabalhos', 'oportunidades', 'interesses', 'denuncias',
                           'empresas', 'contas', 'salvos', 'jornal_materias', 'nomes_usuario',
                           'tentativas_login']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke select, insert, update, delete on public.%I from anon', t);
    end if;
  end loop;
  if to_regprocedure('public.nome_usuario_livre(text)') is not null then
    revoke execute on function public.nome_usuario_livre(text) from anon;
  end if;
end $$;

-- 5. Fotos, currículos e certificados em buckets privados ---------------------

update storage.buckets set public = false where id in ('fotos', 'curriculos');

drop policy if exists "todos veem fotos" on storage.objects;
drop policy if exists "todos veem curriculos" on storage.objects;
drop policy if exists "logados veem fotos e curriculos" on storage.objects;
create policy "logados veem fotos e curriculos" on storage.objects
  for select to authenticated using (bucket_id in ('fotos', 'curriculos'));
