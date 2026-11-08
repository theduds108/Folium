-- Fólium: aba de feedback e vagas liberadas para contratantes.
--
-- 1. Tabela "feedbacks": quem tem conta manda sugestões, elogios e problemas pela página /feedback.
--    Só dá para ENVIAR. Ninguém lê pelo site, nem quem mandou: a equipe lê no Table Editor do Supabase.
-- 2. Limite de vagas: por enquanto o contratante do plano grátis publica quantas vagas quiser.
--    Fica só uma trava contra spam (no máximo 20 vagas em 24 horas por conta).
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase, depois das migrações anteriores.

-- 1. Feedback ------------------------------------------------------------------

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references auth.users (id) on delete set null default auth.uid(),
  tipo text not null check (tipo in ('sugestao', 'problema', 'elogio', 'outro')),
  mensagem text not null check (length(mensagem) between 5 and 1500),
  pagina text not null default '' check (length(pagina) <= 120),
  nota smallint check (nota between 1 and 5),
  criado_em timestamptz not null default now()
);

alter table public.feedbacks enable row level security;

drop policy if exists "logados mandam feedback" on public.feedbacks;
create policy "logados mandam feedback" on public.feedbacks
  for insert to authenticated with check (autor_id = auth.uid());

-- Sem política de leitura: só a equipe vê (Table Editor usa a chave de serviço).
revoke select, update, delete on public.feedbacks from anon, authenticated;
revoke insert on public.feedbacks from anon;
grant insert on public.feedbacks to authenticated;

-- Trava contra spam: no máximo 10 feedbacks por conta em 1 hora.
create or replace function public.limitar_feedbacks()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.feedbacks
      where autor_id = new.autor_id and criado_em > now() - interval '1 hour') >= 10 then
    raise exception 'Muitos feedbacks seguidos';
  end if;
  return new;
end;
$$;
drop trigger if exists limitar_feedbacks on public.feedbacks;
create trigger limitar_feedbacks before insert on public.feedbacks
  for each row execute function public.limitar_feedbacks();

-- 2. Vagas liberadas -----------------------------------------------------------
-- Antes: plano grátis = 1 vaga a cada 30 dias. Agora: sem limite de plano, só a trava contra spam.
-- Para voltar ao limite de 1 por mês, rode de novo a função limitar_vagas de 20261102220000_contas_planos.sql
-- e troque VAGAS_LIBERADAS para false em lib/config.ts.

create or replace function public.limitar_vagas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.autor_id is null then
    return new;
  end if;
  if (select count(*) from public.oportunidades
      where autor_id = new.autor_id and criada_em > now() - interval '24 hours') >= 20 then
    raise exception 'Muitas vagas em 24 horas';
  end if;
  return new;
end;
$$;
drop trigger if exists limitar_vagas on public.oportunidades;
create trigger limitar_vagas before insert on public.oportunidades
  for each row execute function public.limitar_vagas();
