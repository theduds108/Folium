-- Fólium: catálogo de empresas para o campo de experiência (busca igual ao LinkedIn).

-- Rode este arquivo uma vez no SQL Editor do Supabase.
-- O catálogo cresce sozinho: quando um aluno salva uma experiência numa empresa nova, ela entra aqui.

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(nome) between 2 and 80),
  chave text generated always as (lower(regexp_replace(trim(nome), '\s+', ' ', 'g'))) stored,
  cidade text not null default '',
  site text not null default '',
  criada_em timestamptz not null default now()
);
create unique index if not exists empresas_chave on public.empresas (chave);
create index if not exists empresas_busca on public.empresas using gin (chave extensions.gin_trgm_ops);

alter table public.empresas enable row level security;

create policy "todos buscam empresas" on public.empresas
  for select using (true);
create policy "aluno institucional cadastra empresa" on public.empresas
  for insert to authenticated with check (public.eh_aluno_institucional());

-- Empresas e instituições conhecidas da região para começar.
insert into public.empresas (nome, cidade, site) values
  ('UNISAGRADO', 'Bauru, SP', 'unisagrado.edu.br'),
  ('Agência Júnior UNISAGRADO', 'Bauru, SP', ''),
  ('Prefeitura Municipal de Bauru', 'Bauru, SP', 'bauru.sp.gov.br'),
  ('Jornal da Cidade', 'Bauru, SP', 'jcnet.com.br'),
  ('TV TEM', 'Bauru, SP', ''),
  ('Tilibra', 'Bauru, SP', 'tilibra.com.br'),
  ('Paschoalotto', 'Bauru, SP', 'paschoalotto.com.br'),
  ('Supermercados Confiança', 'Bauru, SP', 'confianca.com.br'),
  ('UNESP Bauru', 'Bauru, SP', 'unesp.br'),
  ('USP Bauru', 'Bauru, SP', 'usp.br'),
  ('Hospital Estadual de Bauru', 'Bauru, SP', ''),
  ('SENAC Bauru', 'Bauru, SP', 'sp.senac.br'),
  ('SEBRAE', 'Bauru, SP', 'sebrae.com.br'),
  ('CIEE', '', 'ciee.org.br'),
  ('Autônomo / freelancer', '', '')
on conflict (chave) do nothing;
