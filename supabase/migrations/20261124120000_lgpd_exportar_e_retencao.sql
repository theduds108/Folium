-- LGPD: cópia dos dados (direito de acesso e portabilidade) e retenção.
-- Rodar no SQL Editor do Supabase depois do merge. Pode rodar mais de uma vez.
--
-- 1) exportar_meus_dados(): devolve num JSON tudo o que o Fólium guarda sobre quem chamou.
--    Só lê linhas da própria pessoa (auth.uid()). Avaliações que ainda estão "cegas" e relatos
--    de denúncias feitas CONTRA a pessoa ficam de fora, para não quebrar a proteção de quem denunciou.
-- 2) limpar_dados_antigos(): apaga o que não precisa mais ser guardado (tentativas de login antigas).
--    Agendada todo dia às 3h (horário de Brasília) se a extensão Cron (pg_cron) estiver ligada.

create or replace function public.exportar_meus_dados()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v jsonb;
begin
  if v_uid is null then
    raise exception 'Entre na sua conta para baixar seus dados.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'gerado_em', now(),
    'explicacao', 'Cópia dos dados que o Fólium guarda sobre você (LGPD, art. 18). Fotos, currículo e certificados ficam no seu portfólio e podem ser baixados por lá.',
    'login', (select jsonb_build_object('email', u.email, 'criado_em', u.created_at, 'ultimo_acesso', u.last_sign_in_at)
                from auth.users u where u.id = v_uid),
    'nome_de_usuario', (select n.nome from public.nomes_usuario n where n.id = v_uid),
    'conta', (select to_jsonb(c) from public.contas c where c.id = v_uid),
    'portfolio', (select to_jsonb(p) from public.perfis p where p.id = v_uid),
    'trabalhos', coalesce((select jsonb_agg(to_jsonb(t) order by t.ordem) from public.trabalhos t where t.perfil_id = v_uid), '[]'::jsonb),
    'trabalhos_em_collab', coalesce((select jsonb_agg(to_jsonb(cp)) from public.collab_participacoes cp where cp.coautor_id = v_uid), '[]'::jsonb),
    'interesses_em_vagas', coalesce((select jsonb_agg(to_jsonb(i)) from public.interesses i where i.perfil_id = v_uid), '[]'::jsonb),
    'vagas_publicadas', coalesce((select jsonb_agg(to_jsonb(o)) from public.oportunidades o where o.autor_id = v_uid), '[]'::jsonb),
    'talentos_salvos', coalesce((select jsonb_agg(to_jsonb(s)) from public.salvos s where s.contratante_id = v_uid), '[]'::jsonb),
    'convites', coalesce((select jsonb_agg(to_jsonb(cv)) from public.convites cv where cv.perfil_id = v_uid or cv.contratante_id = v_uid), '[]'::jsonb),
    'combinados', coalesce((select jsonb_agg(to_jsonb(cb)) from public.combinados cb where cb.perfil_id = v_uid or cb.contratante_id = v_uid), '[]'::jsonb),
    'avaliacoes_que_escrevi', coalesce((select jsonb_agg(to_jsonb(a)) from public.avaliacoes a where a.autor_id = v_uid), '[]'::jsonb),
    'avaliacoes_que_recebi', coalesce((select jsonb_agg(to_jsonb(a) - 'autor_id') from public.avaliacoes a
                                        where a.alvo_id = v_uid and not a.oculta
                                          and public.avaliacao_revelada(a.combinado_id, a.criado_em)), '[]'::jsonb),
    'denuncias_e_pedidos_de_ajuda_que_enviei', coalesce((select jsonb_agg(to_jsonb(oc) - 'alvo_id') from public.ocorrencias oc where oc.autor_id = v_uid), '[]'::jsonb),
    'feedbacks', coalesce((select jsonb_agg(to_jsonb(f)) from public.feedbacks f where f.autor_id = v_uid), '[]'::jsonb),
    'visitas_ao_portfolio', jsonb_build_object(
      'total', (select count(*) from public.visitas_perfil vp where vp.perfil_id = v_uid),
      'observacao', 'Guardamos só a contagem por dia. Ninguém vê quem visitou.')
  ) into v;

  return v;
end;
$$;

revoke all on function public.exportar_meus_dados() from public, anon;
grant execute on function public.exportar_meus_dados() to authenticated;

-- Retenção: tentativas de login só servem para barrar quem tenta adivinhar senha (janela de 15 min).
-- Guardamos 30 dias para investigar ataque e depois apagamos.
create or replace function public.limpar_dados_antigos()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.tentativas_login where em < now() - interval '30 days';
$$;

revoke all on function public.limpar_dados_antigos() from public, anon, authenticated;

-- Agenda a limpeza diária só se a extensão Cron já estiver ligada (Database > Extensions > pg_cron).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'folium_limpar_dados_antigos';
    perform cron.schedule('folium_limpar_dados_antigos', '0 6 * * *', 'select public.limpar_dados_antigos()');
  else
    raise notice 'pg_cron desligado: ligue a extensão e rode este arquivo de novo para agendar a limpeza.';
  end if;
end $$;
