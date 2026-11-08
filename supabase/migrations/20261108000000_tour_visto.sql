-- Fólium: o tour guiado aparece só uma vez por conta.
--
-- Guarda na conta quando a pessoa viu o tour, para ele não voltar em outro celular,
-- computador ou navegador. Cada um só altera a própria linha (política "cada um edita a
-- própria conta" já existente). Pode rodar mais de uma vez sem problema.
-- Rode no SQL Editor do Supabase (sem texto selecionado).

alter table public.contas add column if not exists tour_visto_em timestamptz;

comment on column public.contas.tour_visto_em is
  'Quando a pessoa viu o tour guiado pela primeira vez. Vazio = ainda não viu (o tour abre sozinho uma vez).';
