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

drop policy if exists "todos buscam empresas" on public.empresas;
drop policy if exists "logados buscam empresas" on public.empresas;
create policy "logados buscam empresas" on public.empresas
  for select to authenticated using (true);

-- 3. Denúncias: só quem tem conta (evita spam anônimo) ------------------------

drop policy if exists "qualquer pessoa denuncia" on public.denuncias;
drop policy if exists "logados denunciam" on public.denuncias;
create policy "logados denunciam" on public.denuncias
  for insert to authenticated with check (true);

-- 4. Visitante sem login não lê nenhuma tabela com dados de pessoas ----------
-- (as políticas acima já bloqueiam; isto é uma segunda trava.)

revoke select, insert, update, delete on
  public.perfis, public.trabalhos, public.oportunidades, public.interesses, public.denuncias,
  public.empresas, public.contas, public.salvos, public.jornal_materias, public.nomes_usuario
from anon;

revoke execute on function public.nome_usuario_livre(text) from anon;

-- 5. Fotos, currículos e certificados em buckets privados ---------------------

update storage.buckets set public = false where id in ('fotos', 'curriculos');

drop policy if exists "todos veem fotos" on storage.objects;
drop policy if exists "todos veem curriculos" on storage.objects;
drop policy if exists "logados veem fotos e curriculos" on storage.objects;
create policy "logados veem fotos e curriculos" on storage.objects
  for select to authenticated using (bucket_id in ('fotos', 'curriculos'));
