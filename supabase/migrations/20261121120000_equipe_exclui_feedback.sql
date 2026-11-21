-- Equipe exclui feedback pelo painel (21/11/2026).
--
-- Até aqui ninguém conseguia apagar feedback pelo site (só pelo Table Editor do Supabase).
-- Agora quem está na tabela "equipe" pode excluir um feedback na aba Feedbacks do painel /equipe.
-- Para qualquer outra conta o banco continua barrando: a regra abaixo só vale quando eh_equipe() é verdadeiro.
--
-- Rodar no SQL Editor do Supabase (sem texto selecionado). Pode rodar de novo.

grant delete on public.feedbacks to authenticated;

drop policy if exists "equipe exclui feedbacks" on public.feedbacks;
create policy "equipe exclui feedbacks" on public.feedbacks
  for delete to authenticated using (public.eh_equipe());
