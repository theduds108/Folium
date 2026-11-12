-- Fólium: ajustes de segurança da auditoria de 2026-11-12.
--
-- 1. Funções auxiliares (plano_de, tipo_de, eh_aluno_institucional) deixam de ser chamáveis por
--    quem está sem login. Antes, qualquer pessoa com a chave pública podia perguntar ao banco
--    "qual o plano / tipo de conta deste id?". Quem tem conta continua podendo (as regras de
--    acesso dependem delas).
-- 2. "Aluno UNISAGRADO" passa a exigir e-mail CONFIRMADO, conferido no próprio banco. Assim,
--    mesmo que alguém desligue sem querer o "Confirm email" do Supabase, ninguém vira colaborador
--    só digitando um e-mail @unisagrado.edu.br que não é dele.
-- 3. Fotos, currículos e certificados: quem tem conta só abre os arquivos de portfólios
--    PUBLICADOS (além dos próprios). Antes, qualquer conta (inclusive contratante criada com
--    qualquer e-mail) abria e listava os arquivos de todo mundo, até de quem tirou o perfil do ar.
--    A equipe continua vendo tudo.
--
-- 4. Contratante novo fica em análise até a equipe aprovar; só então vê WhatsApp, e-mail,
--    currículo e certificados dos alunos e pode mandar convites e propostas.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado), depois das migrações anteriores.

-- 1. Funções auxiliares só para quem tem conta -------------------------------------------------

do $$
declare
  f text;
begin
  foreach f in array array['public.plano_de(uuid)', 'public.tipo_de(uuid)', 'public.eh_aluno_institucional()']
  loop
    if to_regprocedure(f) is not null then
      execute format('revoke all on function %s from public, anon', f);
      execute format('grant execute on function %s to authenticated', f);
    end if;
  end loop;
end $$;

-- 2. Aluno institucional = e-mail da instituição E confirmado -----------------------------------

create or replace function public.eh_aluno_institucional()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    join public.dominios_institucionais d
      on lower(split_part(u.email, '@', 2)) = d.dominio
      or lower(split_part(u.email, '@', 2)) like '%.' || d.dominio
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.eh_aluno_institucional() from public, anon;
grant execute on function public.eh_aluno_institucional() to authenticated;

-- 3. Arquivos só de portfólios publicados ---------------------------------------------------------

-- Verdadeiro quando o arquivo está na pasta de um portfólio publicado, na pasta de quem pediu
-- ou quando quem pediu é da equipe. A pasta é o id da pessoa: fotos/<id>/arquivo.jpg
create or replace function public.pode_ver_arquivo(p_nome text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and (
    split_part(p_nome, '/', 1) = auth.uid()::text
    or public.eh_equipe()
    or exists (select 1 from public.perfis p where p.id::text = split_part(p_nome, '/', 1) and p.publicado)
  );
$$;
revoke all on function public.pode_ver_arquivo(text) from public, anon;
grant execute on function public.pode_ver_arquivo(text) to authenticated;

drop policy if exists "logados veem fotos e curriculos" on storage.objects;
drop policy if exists "logados veem arquivos de portfolios publicados" on storage.objects;
create policy "logados veem arquivos de portfolios publicados" on storage.objects
  for select to authenticated
  using (bucket_id in ('fotos', 'curriculos') and public.pode_ver_arquivo(name));

-- 4. Contratante aprovado pela equipe antes de ver contatos ------------------------------------
-- Decisão da Duda (12/11/2026): contratante novo fica "em análise". Enquanto isso ele vê os
-- portfólios (trabalhos, sobre, serviços), mas NÃO vê WhatsApp, e-mail, currículo nem
-- certificados, e não manda convites nem propostas. A equipe aprova em /equipe > Contratantes.
-- Contratantes que já existiam também começam em análise: aprove-os no painel.

alter table public.contas add column if not exists aprovada_em timestamptz;

-- Quem pode ver contatos: a equipe, alunos (colaboradores) e contratantes aprovados.
create or replace function public.pode_ver_contatos()
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and (
    public.eh_equipe()
    or exists (select 1 from public.contas c
               where c.id = auth.uid() and (c.tipo = 'colaborador' or c.aprovada_em is not null))
    or (not exists (select 1 from public.contas c where c.id = auth.uid()) and public.eh_aluno_institucional())
  );
$$;
revoke all on function public.pode_ver_contatos() from public, anon;
grant execute on function public.pode_ver_contatos() to authenticated;

-- Ninguém se aprova sozinho: na criação e na edição pelo site, aprovada_em fica como estava.
create or replace function public.proteger_conta_nova()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.aprovada_em := null;
  end if;
  return new;
end;
$$;
drop trigger if exists proteger_conta_nova on public.contas;
create trigger proteger_conta_nova before insert on public.contas
  for each row execute function public.proteger_conta_nova();

create or replace function public.proteger_conta()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.tipo := old.tipo;
    if not (public.eh_equipe() and old.id <> auth.uid()) then
      new.plano := old.plano;
      new.plano_ate := old.plano_ate;
      new.aprovada_em := old.aprovada_em;
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

-- Contatos saem da leitura direta da tabela perfis: só pela função abaixo.
revoke select on public.perfis from authenticated;
grant select (id, slug, nome, curso, semestre, cidade, bio, servicos, habilidades, valor_referencia,
              foto_url, disponivel, publicado, criado_em, atualizado_em, titulo, sobre_longo, conclusao,
              modalidades, tipos_vaga, links, experiencias, idiomas, link_publico)
  on public.perfis to authenticated;

-- WhatsApp, e-mail, currículo e certificados de vários portfólios de uma vez.
-- O dono sempre vê os próprios; os outros só se pode_ver_contatos().
create or replace function public.contatos_perfis(p_ids uuid[])
returns table (id uuid, whatsapp text, email_contato text, curriculo_url text, certificados jsonb)
language sql stable security definer set search_path = public
as $$
  select p.id, p.whatsapp, p.email_contato, p.curriculo_url, p.certificados
    from public.perfis p
   where p.id = any(p_ids)
     and auth.uid() is not null
     and (p.id = auth.uid() or (p.publicado and public.pode_ver_contatos()) or public.eh_equipe());
$$;
revoke all on function public.contatos_perfis(uuid[]) from public, anon;
grant execute on function public.contatos_perfis(uuid[]) to authenticated;

-- Currículos (bucket "curriculos") seguem a mesma regra dos contatos. As fotos continuam
-- abertas para quem tem conta, porque mostram os trabalhos do portfólio.
drop policy if exists "logados veem arquivos de portfolios publicados" on storage.objects;
create policy "logados veem arquivos de portfolios publicados" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('fotos', 'curriculos') and public.pode_ver_arquivo(name)
    and (bucket_id = 'fotos' or split_part(name, '/', 1) = auth.uid()::text or public.pode_ver_contatos())
  );

-- Convites e propostas (combinados) só de contratante aprovado.
drop policy if exists "contratante convida para a propria vaga" on public.convites;
create policy "contratante convida para a propria vaga" on public.convites
  for insert to authenticated with check (
    contratante_id = auth.uid()
    and status = 'enviado'
    and public.tipo_de(auth.uid()) = 'contratante'
    and public.pode_ver_contatos()
    and exists (select 1 from public.oportunidades o
                where o.id = oportunidade_id and o.autor_id = auth.uid() and o.status = 'aprovada')
    and exists (select 1 from public.perfis p where p.id = perfil_id and p.publicado)
  );

drop policy if exists "contratante propoe combinado" on public.combinados;
create policy "contratante propoe combinado" on public.combinados
  for insert to authenticated with check (
    contratante_id = auth.uid()
    and status = 'proposto'
    and public.tipo_de(auth.uid()) = 'contratante'
    and public.pode_ver_contatos()
    and exists (select 1 from public.perfis p where p.id = perfil_id and p.publicado)
    and (oportunidade_id is null or exists (
      select 1 from public.oportunidades o where o.id = oportunidade_id and o.autor_id = auth.uid()))
  );

-- Lista da equipe ganha a data de aprovação (o tipo de retorno mudou, então recria).
drop function if exists public.equipe_contas();
create function public.equipe_contas()
returns table (id uuid, email text, tipo text, plano text, plano_ate date, plano_pedido text,
               nome text, empresa text, criada_em timestamptz, aprovada_em timestamptz)
language plpgsql stable security definer set search_path = public, auth
as $$
begin
  if not public.eh_equipe() then
    raise exception 'Só para a equipe' using errcode = '42501';
  end if;
  return query
    select c.id, u.email::text, c.tipo, c.plano, c.plano_ate, c.plano_pedido, c.nome, c.empresa, c.criada_em, c.aprovada_em
      from public.contas c join auth.users u on u.id = c.id
     order by (c.tipo = 'contratante' and c.aprovada_em is null) desc,
              (c.plano_pedido is not null and c.plano = 'gratis') desc, c.criada_em desc
     limit 300;
end;
$$;
revoke all on function public.equipe_contas() from public, anon;
grant execute on function public.equipe_contas() to authenticated;
