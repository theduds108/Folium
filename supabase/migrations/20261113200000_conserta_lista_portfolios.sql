-- CORREÇÃO URGENTE (13/11/2026): portfólios sumiram do site depois do SQL de collab.
--
-- Causa: a tabela collab_participacoes ligava trabalhos a perfis (coautor_id → perfis). Com isso
-- o Supabase passou a enxergar DOIS caminhos entre perfis e trabalhos (o direto e o pelo collab)
-- e recusou a leitura "perfis com seus trabalhos" que o site usa em todas as listas.
--
-- Conserto: o coautor passa a apontar para a conta (auth.users), que tem o mesmo id do perfil.
-- Continua sendo apagado junto se a conta for excluída. Nenhum dado é perdido.
--
-- Pode rodar mais de uma vez. Rode no SQL Editor do Supabase (sem texto selecionado).

do $$
begin
  if to_regclass('public.collab_participacoes') is not null then
    alter table public.collab_participacoes drop constraint if exists collab_participacoes_coautor_id_fkey;
    alter table public.collab_participacoes
      add constraint collab_participacoes_coautor_id_fkey
      foreign key (coautor_id) references auth.users (id) on delete cascade;
  end if;
end $$;

-- Faz o Supabase reler a estrutura agora (senão pode levar alguns minutos).
notify pgrst, 'reload schema';
