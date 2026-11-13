-- Conserto 2 (13/11/2026): garante que o site pode ler a coluna "formacao" e recarrega o Supabase.
-- Seguro: só libera a leitura da formação (pública, como curso e semestre). Pode rodar mais de uma vez.
grant select (formacao) on public.perfis to authenticated;
notify pgrst, 'reload schema';
