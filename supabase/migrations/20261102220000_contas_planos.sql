-- Fólium: tipos de conta (colaborador x contratante), planos (grátis x premium),
-- vagas ligadas a quem publicou, talentos salvos e matérias do Jornal do Fólium.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase, depois das migrações anteriores.
--
-- Como liberar o Premium de alguém (enquanto não há pagamento no site):
--   Table Editor > contas > linha da pessoa > plano = premium (e, se quiser, plano_ate = data final).
--   Quem pediu aparece com plano_pedido = premium.

-- 1. Contas -----------------------------------------------------------------

create table if not exists public.contas (
  id uuid primary key references auth.users (id) on delete cascade,
  -- colaborador = aluno com portfólio; contratante = empresa ou pessoa que contrata.
  tipo text not null check (tipo in ('colaborador', 'contratante')),
  plano text not null default 'gratis' check (plano in ('gratis', 'premium')),
  -- Até quando o Premium vale. Vazio = sem data para acabar.
  plano_ate date,
  -- Preenchido quando a pessoa clica em "Quero o Premium"; a equipe confere e libera.
  plano_pedido text check (plano_pedido in ('premium')),
  nome text not null default '' check (length(nome) <= 80),
  empresa text not null default '' check (length(empresa) <= 80),
  whatsapp text not null default '' check (length(whatsapp) <= 30),
  cidade text not null default 'Bauru, SP' check (length(cidade) <= 60),
  criada_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.contas enable row level security;

drop policy if exists "cada um ve a propria conta" on public.contas;
create policy "cada um ve a propria conta" on public.contas
  for select using (auth.uid() = id);

-- Colaborador só com e-mail institucional. Toda conta nasce no plano grátis.
drop policy if exists "cada um cria a propria conta" on public.contas;
create policy "cada um cria a propria conta" on public.contas
  for insert to authenticated with check (
    auth.uid() = id
    and plano = 'gratis'
    and plano_ate is null
    and (tipo = 'contratante' or public.eh_aluno_institucional())
  );

drop policy if exists "cada um edita a propria conta" on public.contas;
create policy "cada um edita a propria conta" on public.contas
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Pelo site, ninguém troca o próprio tipo nem se dá Premium.
-- No SQL Editor e no Table Editor (sem login de usuário) a equipe pode mudar tudo.
create or replace function public.proteger_conta()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.tipo := old.tipo;
    new.plano := old.plano;
    new.plano_ate := old.plano_ate;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;
drop trigger if exists proteger_conta on public.contas;
create trigger proteger_conta before update on public.contas
  for each row execute function public.proteger_conta();

-- Alunos que já tinham portfólio viram colaboradores.
insert into public.contas (id, tipo, nome)
select p.id, 'colaborador', p.nome from public.perfis p
on conflict (id) do nothing;

-- Plano em vigor de uma conta ('gratis' se não houver conta ou se o Premium venceu).
create or replace function public.plano_de(uid uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select c.plano from public.contas c
      where c.id = uid and (c.plano_ate is null or c.plano_ate >= current_date)),
    'gratis'
  );
$$;

create or replace function public.tipo_de(uid uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select c.tipo from public.contas c where c.id = uid;
$$;

-- 2. Portfólio: só colaborador; Premium tem trabalhos ilimitados ------------

drop policy if exists "aluno institucional cria o proprio perfil" on public.perfis;
create policy "aluno institucional cria o proprio perfil" on public.perfis
  for insert with check (
    auth.uid() = id
    and public.eh_aluno_institucional()
    and coalesce(public.tipo_de(auth.uid()), 'colaborador') = 'colaborador'
  );

create or replace function public.limitar_trabalhos()
returns trigger language plpgsql as $$
begin
  if public.plano_de(new.perfil_id) = 'premium' then
    return new;
  end if;
  if (select count(*) from public.trabalhos where perfil_id = new.perfil_id) >= 6 then
    raise exception 'Limite de 6 trabalhos no plano grátis';
  end if;
  return new;
end;
$$;

-- 3. Vagas: publicadas por contratantes logados ----------------------------

alter table public.oportunidades add column if not exists autor_id uuid references auth.users (id) on delete set null default auth.uid();
alter table public.oportunidades add column if not exists destaque boolean not null default false;
create index if not exists oportunidades_autor on public.oportunidades (autor_id, criada_em desc);

drop policy if exists "todos veem oportunidades aprovadas" on public.oportunidades;
create policy "todos veem oportunidades aprovadas" on public.oportunidades
  for select using (status = 'aprovada' or autor_id = auth.uid());

drop policy if exists "qualquer pessoa envia oportunidade para analise" on public.oportunidades;
drop policy if exists "contratante envia oportunidade para analise" on public.oportunidades;
create policy "contratante envia oportunidade para analise" on public.oportunidades
  for insert to authenticated with check (
    status = 'pendente'
    and autor_id = auth.uid()
    and public.tipo_de(auth.uid()) = 'contratante'
    -- Destaque no mural é do Premium.
    and (not destaque or public.plano_de(auth.uid()) = 'premium')
  );

-- Plano grátis: 1 vaga a cada 30 dias. Premium: sem limite.
create or replace function public.limitar_vagas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.autor_id is null or public.plano_de(new.autor_id) = 'premium' then
    return new;
  end if;
  if (select count(*) from public.oportunidades
      where autor_id = new.autor_id and criada_em > now() - interval '30 days') >= 1 then
    raise exception 'Limite de 1 vaga por mes no plano gratis';
  end if;
  return new;
end;
$$;
drop trigger if exists limitar_vagas on public.oportunidades;
create trigger limitar_vagas before insert on public.oportunidades
  for each row execute function public.limitar_vagas();

-- Quem publicou vê quantos alunos marcaram interesse nas próprias vagas.
drop policy if exists "contratante ve interesses nas proprias vagas" on public.interesses;
create policy "contratante ve interesses nas proprias vagas" on public.interesses
  for select using (
    exists (select 1 from public.oportunidades o where o.id = oportunidade_id and o.autor_id = auth.uid())
  );

-- Interesse em vaga é coisa de colaborador.
drop policy if exists "aluno marca interesse" on public.interesses;
create policy "aluno marca interesse" on public.interesses
  for insert with check (perfil_id = auth.uid() and coalesce(public.tipo_de(auth.uid()), 'colaborador') = 'colaborador');

-- 4. Talentos salvos (contratante Premium) ----------------------------------

create table if not exists public.salvos (
  contratante_id uuid not null references auth.users (id) on delete cascade,
  -- Endereço do portfólio (slug). Funciona também com os perfis de exemplo.
  perfil_slug text not null check (length(perfil_slug) between 1 and 60),
  nota text not null default '' check (length(nota) <= 200),
  criado_em timestamptz not null default now(),
  primary key (contratante_id, perfil_slug)
);

alter table public.salvos enable row level security;

drop policy if exists "contratante ve os proprios salvos" on public.salvos;
create policy "contratante ve os proprios salvos" on public.salvos
  for select using (contratante_id = auth.uid());
drop policy if exists "contratante premium salva talentos" on public.salvos;
create policy "contratante premium salva talentos" on public.salvos
  for insert to authenticated with check (
    contratante_id = auth.uid()
    and public.tipo_de(auth.uid()) = 'contratante'
    and public.plano_de(auth.uid()) = 'premium'
  );
drop policy if exists "contratante tira dos salvos" on public.salvos;
create policy "contratante tira dos salvos" on public.salvos
  for delete using (contratante_id = auth.uid());

-- 5. Jornal do Fólium: matérias escritas pela equipe ------------------------
-- A equipe escreve pelo Table Editor. Só assinantes Premium leem o texto completo.

create table if not exists public.jornal_materias (
  id uuid primary key default gen_random_uuid(),
  -- Para quem é a matéria: todos, só colaboradores ou só contratantes.
  publico text not null default 'todos' check (publico in ('todos', 'colaborador', 'contratante')),
  editoria text not null default 'Reportagem' check (length(editoria) <= 40),
  titulo text not null check (length(titulo) between 3 and 140),
  linha_fina text not null default '' check (length(linha_fina) <= 280),
  texto text not null check (length(texto) <= 8000),
  autor text not null default 'Redação Fólium' check (length(autor) <= 80),
  imagem_url text,
  publicada boolean not null default false,
  publicada_em timestamptz not null default now()
);
create index if not exists jornal_materias_data on public.jornal_materias (publicada_em desc);

alter table public.jornal_materias enable row level security;

drop policy if exists "assinante premium le materias" on public.jornal_materias;
create policy "assinante premium le materias" on public.jornal_materias
  for select using (
    publicada
    and public.plano_de(auth.uid()) = 'premium'
    and (publico = 'todos' or publico = public.tipo_de(auth.uid()))
  );
