-- Fólium: ajustes de segurança depois da revisão de 2026-11-08.
--
-- 1. Login por nome de usuário:
--    a) usuário que não existe agora gasta o mesmo tempo de quem errou a senha, para ninguém
--       descobrir quais nomes existem medindo a resposta;
--    b) o bloqueio passa de 5 para 10 erros em 15 minutos, para ficar mais difícil alguém travar
--       o login de outra pessoa de propósito (continua barrando tentativa de adivinhar senha).
-- 2. Denúncias: no máximo 10 por conta em 1 hora (antes não havia limite) e guarda quem denunciou.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado).

-- 1. Login ------------------------------------------------------------------------------------

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
      where nome = v_nome and em > now() - interval '15 minutes') >= 10 then
    raise exception 'muitas_tentativas' using errcode = 'P0001';
  end if;

  select u.email::text, u.encrypted_password
    into v_email, v_hash
  from public.nomes_usuario n
  join auth.users u on u.id = n.id
  where n.nome = v_nome
  limit 1;

  if v_hash is null or v_hash = '' then
    -- Nome inexistente: faz uma conta de senha de mentira (mesmo custo do bcrypt do Supabase).
    perform extensions.crypt(p_senha, extensions.gen_salt('bf', 10));
  elsif v_hash = extensions.crypt(p_senha, v_hash) then
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

-- 2. Denúncias --------------------------------------------------------------------------------

alter table public.denuncias
  add column if not exists autor_id uuid references auth.users (id) on delete set null default auth.uid();
create index if not exists denuncias_autor_criada on public.denuncias (autor_id, criada_em desc);

create or replace function public.limitar_denuncias()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.autor_id is not null and (select count(*) from public.denuncias
      where autor_id = new.autor_id and criada_em > now() - interval '1 hour') >= 10 then
    raise exception 'Muitas denuncias seguidas';
  end if;
  return new;
end;
$$;
drop trigger if exists limitar_denuncias on public.denuncias;
create trigger limitar_denuncias before insert on public.denuncias
  for each row execute function public.limitar_denuncias();
