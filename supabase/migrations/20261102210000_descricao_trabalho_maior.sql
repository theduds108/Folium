-- Fólium: descrição do trabalho passa de 200 para 1000 caracteres.
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase.

alter table public.trabalhos drop constraint if exists trabalhos_descricao_check;
alter table public.trabalhos add constraint trabalhos_descricao_check check (length(descricao) <= 1000);
