-- Fólium: portfólio mais completo.
-- Rode este arquivo uma vez no SQL Editor do Supabase, depois do inicial.

alter table public.perfis
  add column if not exists titulo text not null default '' check (length(titulo) <= 80),
  add column if not exists sobre_longo text not null default '' check (length(sobre_longo) <= 1500),
  add column if not exists conclusao text not null default '' check (length(conclusao) <= 20),
  add column if not exists modalidades text[] not null default '{}',
  add column if not exists tipos_vaga text[] not null default '{}',
  add column if not exists links jsonb not null default '{}'::jsonb,
  add column if not exists experiencias jsonb not null default '[]'::jsonb,
  add column if not exists certificados jsonb not null default '[]'::jsonb,
  add column if not exists idiomas jsonb not null default '[]'::jsonb,
  add column if not exists curriculo_url text;

alter table public.perfis
  add constraint perfis_listas_validas check (
    jsonb_typeof(links) = 'object'
    and jsonb_typeof(experiencias) = 'array' and jsonb_array_length(experiencias) <= 10
    and jsonb_typeof(certificados) = 'array' and jsonb_array_length(certificados) <= 15
    and jsonb_typeof(idiomas) = 'array' and jsonb_array_length(idiomas) <= 8
  );

alter table public.trabalhos
  add column if not exists cliente text not null default '' check (length(cliente) <= 80),
  add column if not exists ano text not null default '' check (length(ano) <= 10),
  add column if not exists link text not null default '' check (length(link) <= 300),
  add column if not exists papel text not null default '' check (length(papel) <= 120),
  add column if not exists galeria text[] not null default '{}' check (cardinality(galeria) <= 4);

-- Currículos em PDF. Ficam públicos porque o aluno escolhe mostrar no portfólio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('curriculos', 'curriculos', true, 3145728, array['application/pdf'])
on conflict (id) do nothing;

create policy "todos veem curriculos" on storage.objects
  for select using (bucket_id = 'curriculos');
create policy "aluno envia curriculo na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aluno troca curriculo da propria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aluno apaga curriculo da propria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);
