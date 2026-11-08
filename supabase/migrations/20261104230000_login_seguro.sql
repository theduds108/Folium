-- Fólium: login por nome de usuário sem expor o e-mail de ninguém.
--
-- Antes, email_para_login(usuario) devolvia o e-mail de qualquer nome de usuário.
-- Agora a função só devolve o e-mail se a senha estiver certa (conferida aqui no banco,
-- contra o hash bcrypt que o Supabase Auth guarda) e bloqueia o nome por 15 minutos
-- depois de 5 tentativas erradas. A senha nunca é gravada em tabela nossa.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase, depois de 20261104220000_nome_usuario.sql.

create extension if not exists pgcrypto with schema extensions;

-- Tentativas erradas de login por nome de usuário. Ninguém de fora lê nem grava aqui.
create table if not exists public.tentativas_login (
  id bigint generated always as identity primary key,
  nome text not null,
  em timestamptz not null default now()
);
create index if not exists tentativas_login_nome_em on public.tentativas_login (nome, em);
alter table public.tentativas_login enable row level security;
revoke all on public.tentativas_login from anon, authenticated;

-- Versão antiga, que entregava o e-mail só com o nome de usuário.
drop function if exists public.email_para_login(text);

create or replace function public.email_para_login(p_usuario text, p_senha text)
returns text
language plpgsql
volatile
security definer
set search_path = public, auth, extensions
as $$
declare
  v_nome text := lower(trim(p_usuario));
  v_email text;
  v_hash text;
begin
  if v_nome = '' or coalesce(p_senha, '') = '' then
    return null;
  end if;

  if (select count(*) from public.tentativas_login
      where nome = v_nome and em > now() - interval '15 minutes') >= 5 then
    raise exception 'muitas_tentativas' using errcode = 'P0001';
  end if;

  select u.email::text, u.encrypted_password
    into v_email, v_hash
  from public.nomes_usuario n
  join auth.users u on u.id = n.id
  where n.nome = v_nome
  limit 1;

  if v_hash is not null and v_hash <> '' and v_hash = extensions.crypt(p_senha, v_hash) then
    delete from public.tentativas_login where nome = v_nome;
    return v_email;
  end if;

  -- Nome inexistente ou senha errada: mesma resposta, para não revelar quem existe.
  insert into public.tentativas_login (nome) values (v_nome);
  delete from public.tentativas_login where em < now() - interval '1 day';
  return null;
end;
$$;

revoke all on function public.email_para_login(text, text) from public;
grant execute on function public.email_para_login(text, text) to anon, authenticated;
