-- Denúncia antes do combinado (14/11/2026).
--
-- Até aqui, a denúncia completa (relato, prints, prazo de 5 dias úteis, defesa da outra parte) só
-- existia dentro de um combinado. Mas o assédio ou o golpe muitas vezes acontece no primeiro contato.
-- Agora a denúncia também nasce de:
--   convite: aluno ou contratante de um convite denuncia a outra parte;
--   vaga:    aluno denuncia quem publicou uma vaga aprovada;
--   perfil:  contratante aprovado denuncia o aluno de um portfólio publicado.
-- O pedido de ajuda (botão "Preciso de ajuda") continua só dentro de combinado.
--
-- Rodar no SQL Editor do Supabase depois de 20261112180000_seguranca_pessoas.sql. Pode rodar de novo.

alter table public.ocorrencias add column if not exists convite_id uuid references public.convites (id) on delete set null;
alter table public.ocorrencias add column if not exists oportunidade_id uuid references public.oportunidades (id) on delete set null;
alter table public.ocorrencias add column if not exists origem text not null default 'combinado';
-- Frase curta para a equipe e para a defesa, ex.: "Convite para a vaga Logo para padaria".
alter table public.ocorrencias add column if not exists contexto text not null default '';

alter table public.ocorrencias drop constraint if exists ocorrencias_origem_check;
alter table public.ocorrencias add constraint ocorrencias_origem_check
  check (origem in ('combinado', 'convite', 'vaga', 'perfil'));

-- Quem pode registrar. A ligação com a outra parte é conferida pelo gatilho abaixo (que roda antes).
drop policy if exists "parte do combinado registra ocorrencia" on public.ocorrencias;
drop policy if exists "parte registra ocorrencia" on public.ocorrencias;
create policy "parte registra ocorrencia" on public.ocorrencias
  for insert to authenticated with check (
    autor_id = auth.uid()
    and (
      (
        origem = 'combinado'
        and exists (
          select 1 from public.combinados c
          where c.id = combinado_id
            and auth.uid() in (c.perfil_id, c.contratante_id)
            and (
              (tipo = 'ajuda' and auth.uid() = c.perfil_id and c.status in ('aceito', 'pausado'))
              or (tipo = 'denuncia' and c.status in ('aceito', 'pausado', 'concluido', 'cancelado'))
            )
        )
      )
      or (
        origem in ('convite', 'vaga', 'perfil')
        and tipo = 'denuncia'
        and combinado_id is null
        and alvo_id is not null
        and alvo_id <> auth.uid()
      )
    )
  );

-- Preenche o que o site não decide: origem, alvo, lado, contexto, prazo, urgência, status.
create or replace function public.preencher_ocorrencia()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  c public.combinados;
  v public.convites;
  o public.oportunidades;
  v_titulo text;
  v_nome text;
begin
  if new.combinado_id is not null then
    select * into c from public.combinados where id = new.combinado_id;
    if not found then raise exception 'Combinado não encontrado' using errcode = 'P0002'; end if;
    new.origem := 'combinado';
    new.convite_id := null;
    new.oportunidade_id := null;
    new.autor_lado := case when new.autor_id = c.perfil_id then 'aluno' else 'contratante' end;
    new.alvo_id := case when new.autor_id = c.perfil_id then c.contratante_id else c.perfil_id end;
    new.contexto := left('Combinado “' || coalesce(c.titulo, '') || '”', 200);

  elsif new.tipo <> 'denuncia' then
    raise exception 'O pedido de ajuda é feito dentro de um combinado' using errcode = 'P0001';

  elsif new.convite_id is not null then
    select * into v from public.convites where id = new.convite_id;
    if not found or new.autor_id not in (v.perfil_id, v.contratante_id) then
      raise exception 'Convite não encontrado' using errcode = 'P0002';
    end if;
    select titulo into v_titulo from public.oportunidades where id = v.oportunidade_id;
    new.origem := 'convite';
    new.oportunidade_id := v.oportunidade_id;
    new.autor_lado := case when new.autor_id = v.perfil_id then 'aluno' else 'contratante' end;
    new.alvo_id := case when new.autor_id = v.perfil_id then v.contratante_id else v.perfil_id end;
    new.contexto := left('Convite para a vaga “' || coalesce(v_titulo, 'removida') || '”', 200);

  elsif new.oportunidade_id is not null then
    select * into o from public.oportunidades where id = new.oportunidade_id;
    if not found or o.status <> 'aprovada' or o.autor_id is null then
      raise exception 'Vaga não encontrada' using errcode = 'P0002';
    end if;
    if public.tipo_de(new.autor_id) is distinct from 'colaborador' then
      raise exception 'Só alunos denunciam quem publicou a vaga por aqui' using errcode = '42501';
    end if;
    new.origem := 'vaga';
    new.autor_lado := 'aluno';
    new.alvo_id := o.autor_id;
    new.contexto := left('Vaga “' || o.titulo || '” (' || o.empresa || ')', 200);

  else
    -- Perfil: o site manda o id do aluno em alvo_id.
    if public.tipo_de(new.autor_id) is distinct from 'contratante' or not public.pode_ver_contatos() then
      raise exception 'Só contratantes aprovados denunciam um aluno por aqui' using errcode = '42501';
    end if;
    select nome into v_nome from public.perfis where id = new.alvo_id and publicado;
    if not found then raise exception 'Portfólio não encontrado' using errcode = 'P0002'; end if;
    new.origem := 'perfil';
    new.autor_lado := 'contratante';
    new.contexto := left('Portfólio de ' || coalesce(v_nome, 'aluno'), 200);
  end if;

  if new.alvo_id is null or new.alvo_id = new.autor_id then
    raise exception 'Não deu para identificar quem está sendo denunciado' using errcode = 'P0001';
  end if;

  new.urgente := new.tipo = 'ajuda';
  new.status := 'aberta';
  new.criada_em := now();
  new.prazo_em := case when new.tipo = 'ajuda' then now() + interval '24 hours' else public.mais_dias_uteis(now(), 5) end;
  new.resumo_defesa := ''; new.defesa := ''; new.defesa_em := null;
  new.decisao := null; new.decisao_texto := ''; new.decidida_em := null; new.decidida_por := null;
  if new.tipo <> 'ajuda' then new.avisar_faculdade := false; new.pausou_combinado := false; end if;
  -- Provas só da pasta de quem denuncia.
  if exists (select 1 from unnest(new.provas) p where split_part(p, '/', 1) <> new.autor_id::text) then
    raise exception 'Prova inválida';
  end if;
  if (select count(*) from public.ocorrencias
      where autor_id = new.autor_id and criada_em > now() - interval '24 hours') >= 10 then
    raise exception 'Muitas ocorrencias seguidas';
  end if;
  -- A mesma pessoa não denuncia o mesmo alvo duas vezes enquanto a primeira está aberta.
  if new.tipo = 'denuncia' and exists (
      select 1 from public.ocorrencias x
       where x.autor_id = new.autor_id and x.alvo_id = new.alvo_id and x.tipo = 'denuncia'
         and x.status in ('aberta', 'em_analise', 'aguardando_defesa')) then
    raise exception 'Denuncia repetida';
  end if;
  if new.tipo = 'ajuda' and new.pausou_combinado and c.status = 'aceito' then
    update public.combinados set status = 'pausado', pausado_em = now() where id = c.id;
  end if;
  return new;
end;
$$;

-- E-mail para a equipe: diz de onde veio a denúncia (sem o relato).
create or replace function public.avisar_ocorrencia_por_email()
returns trigger
language plpgsql security definer set search_path = public, extensions, vault
as $$
declare
  v_chave text;
  v_destino text;
begin
  select decrypted_secret into v_chave from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select decrypted_secret into v_destino from vault.decrypted_secrets where name = 'feedback_email_destino' limit 1;
  if coalesce(v_chave, '') = '' or coalesce(v_destino, '') = '' then return new; end if;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_chave, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Fólium <onboarding@resend.dev>',
      'to', jsonb_build_array(v_destino),
      'subject', case when new.tipo = 'ajuda' then 'URGENTE: pedido de ajuda no Fólium' else 'Nova denúncia no Fólium' end,
      'text',
        case
          when new.tipo = 'ajuda' then 'Um aluno apertou "Preciso de ajuda" em um combinado.'
          when new.origem = 'combinado' then 'Chegou uma denúncia ligada a um combinado.'
          when new.origem = 'convite' then 'Chegou uma denúncia ligada a um convite (antes do combinado).'
          when new.origem = 'vaga' then 'Um aluno denunciou quem publicou uma vaga.'
          else 'Um contratante denunciou um aluno pelo portfólio.'
        end
        || E'\n\nCategoria: ' || new.categoria
        || E'\nResponder até: ' || to_char(new.prazo_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
        || case when new.avisar_faculdade then E'\nO aluno pediu para avisar a faculdade.' else '' end
        || E'\n\nAbra o Painel da equipe > Segurança para ler o relato.'
    )
  );
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.avisar_ocorrencia_por_email() from public, anon, authenticated;

-- Pedido de defesa: o título agora vem do contexto (combinado, convite, vaga ou portfólio).
create or replace function public.meus_pedidos_de_defesa()
returns table (id uuid, categoria text, resumo_defesa text, titulo_combinado text, defesa text, defesa_em timestamptz, status text)
language sql stable security definer set search_path = public
as $$
  select o.id, o.categoria, o.resumo_defesa,
         coalesce(nullif(o.contexto, ''), 'Combinado “' || c.titulo || '”', 'Contato pelo Fólium'),
         o.defesa, o.defesa_em, o.status
    from public.ocorrencias o left join public.combinados c on c.id = o.combinado_id
   where o.alvo_id = auth.uid() and o.tipo = 'denuncia' and o.resumo_defesa <> ''
   order by o.criada_em desc;
$$;
revoke all on function public.meus_pedidos_de_defesa() from public, anon;
grant execute on function public.meus_pedidos_de_defesa() to authenticated;

-- Ocorrências antigas ganham o contexto do combinado.
update public.ocorrencias o
   set contexto = left('Combinado “' || c.titulo || '”', 200)
  from public.combinados c
 where c.id = o.combinado_id and o.contexto = '';
