-- Visitas reais no "Seu portfólio em números" (13/11/2026).
--
-- Antes: a visita sem login era contada pelo id que o próprio navegador mandava. Quem chamasse
-- a função com ids inventados podia inflar o número de qualquer portfólio com link público.
--
-- Agora, para quem visita sem login:
--   * o id do navegador precisa ter o formato que o site gera (uuid);
--   * cada conexão (endereço IP) soma no máximo 3 visitantes anônimos diferentes por portfólio
--     por dia (uma casa ou uma sala com 3 pessoas ainda conta certo; um robô trocando de id não);
--   * o IP nunca é guardado: fica só um resumo (hash) misturado com um segredo que muda todo dia
--     e é apagado no dia seguinte, então não dá para descobrir o IP nem ligar um dia ao outro.
-- Quem está logado continua contando uma vez por dia por conta; o dono nunca conta.

alter table public.visitas_perfil add column if not exists origem text;

-- Segredo do dia. Ninguém do site lê esta tabela, só a função abaixo.
create table if not exists public.visitas_segredo (
  dia date primary key,
  sal text not null
);
alter table public.visitas_segredo enable row level security;
revoke all on public.visitas_segredo from anon, authenticated;

create or replace function public.registrar_visita(p_slug text, p_visitante text default null)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_perfil uuid;
  v_quem text;
  v_ip text;
  v_sal text;
  v_origem text;
begin
  select id into v_perfil from public.perfis
   where slug = p_slug and publicado and (auth.uid() is not null or link_publico);
  if v_perfil is null or v_perfil = auth.uid() then return; end if;

  if auth.uid() is not null then
    insert into public.visitas_perfil (perfil_id, visitante, tipo_visitante)
    values (v_perfil, auth.uid()::text, coalesce(public.tipo_de(auth.uid()), 'visitante'))
    on conflict do nothing;
    return;
  end if;

  -- Sem login: só o id que o próprio site gera.
  v_quem := lower(trim(coalesce(p_visitante, '')));
  if v_quem !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return; end if;

  -- IP da conexão (o primeiro da lista é o de quem acessou).
  begin
    v_ip := nullif(trim(split_part(
      coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  if v_ip is not null then
    insert into public.visitas_segredo (dia, sal)
    values (current_date, md5(random()::text || clock_timestamp()::text || random()::text))
    on conflict (dia) do nothing;
    delete from public.visitas_segredo where dia < current_date;
    select sal into v_sal from public.visitas_segredo where dia = current_date;
    v_origem := md5(v_sal || v_ip);

    -- Mesmo visitante de novo hoje: nada a fazer.
    if exists (select 1 from public.visitas_perfil
                where perfil_id = v_perfil and dia = current_date and visitante = v_quem) then
      return;
    end if;
    -- Muitos "visitantes" diferentes saindo da mesma conexão no mesmo dia: não soma mais.
    if (select count(*) from public.visitas_perfil
         where perfil_id = v_perfil and dia = current_date and origem = v_origem) >= 3 then
      return;
    end if;
  end if;

  insert into public.visitas_perfil (perfil_id, visitante, tipo_visitante, origem)
  values (v_perfil, v_quem, 'visitante', v_origem)
  on conflict do nothing;

  -- O resumo da conexão só serve no próprio dia.
  update public.visitas_perfil set origem = null
   where perfil_id = v_perfil and dia < current_date and origem is not null;
end;
$$;
revoke all on function public.registrar_visita(text, text) from public;
grant execute on function public.registrar_visita(text, text) to anon, authenticated;
