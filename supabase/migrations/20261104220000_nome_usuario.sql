-- Fólium: nome de usuário para entrar com usuário + senha.
--
-- O primeiro acesso continua sendo pelo e-mail (link), para garantir que é aluno UNISAGRADO.
-- Depois a pessoa cria um nome de usuário e uma senha em /senha e passa a entrar com eles.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase, depois das migrações anteriores.

create table if not exists public.nomes_usuario (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Só letras minúsculas, números, ponto e sublinhado; de 3 a 30 caracteres.
  nome text not null unique check (nome ~ '^[a-z0-9._]{3,30}$'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.nomes_usuario enable row level security;

drop policy if exists "nome_usuario_ler_o_seu" on public.nomes_usuario;
create policy "nome_usuario_ler_o_seu" on public.nomes_usuario
  for select using (auth.uid() = id);

drop policy if exists "nome_usuario_criar_o_seu" on public.nomes_usuario;
create policy "nome_usuario_criar_o_seu" on public.nomes_usuario
  for insert with check (auth.uid() = id);

drop policy if exists "nome_usuario_trocar_o_seu" on public.nomes_usuario;
create policy "nome_usuario_trocar_o_seu" on public.nomes_usuario
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Na tela de entrar: troca o nome de usuário pelo e-mail da conta, para o login com senha.
-- Devolve null se o nome não existir. A senha continua sendo conferida pelo Supabase Auth.
create or replace function public.email_para_login(p_usuario text)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.email::text
  from public.nomes_usuario n
  join auth.users u on u.id = n.id
  where n.nome = lower(trim(p_usuario))
  limit 1;
$$;

revoke all on function public.email_para_login(text) from public;
grant execute on function public.email_para_login(text) to anon, authenticated;

-- Na tela de criar o login: diz se o nome já está em uso por outra pessoa.
create or replace function public.nome_usuario_livre(p_nome text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.nomes_usuario
    where nome = lower(trim(p_nome)) and id is distinct from auth.uid()
  );
$$;

revoke all on function public.nome_usuario_livre(text) from public;
grant execute on function public.nome_usuario_livre(text) to anon, authenticated;
