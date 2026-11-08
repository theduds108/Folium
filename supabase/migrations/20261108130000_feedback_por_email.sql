-- Fólium: cada feedback novo chega também por e-mail para a equipe.
--
-- Como funciona: quando alguém envia um feedback (tabela "feedbacks"), um gatilho no banco manda
-- um e-mail pelo serviço Resend. A chave do Resend e o e-mail que recebe os avisos ficam guardados
-- no Vault do Supabase (cofre de segredos), nunca neste arquivo nem no site.
-- Se o e-mail falhar (chave errada, serviço fora do ar), o feedback é salvo do mesmo jeito.
-- Sem os dois segredos cadastrados, nada é enviado e o feedback continua só na tabela.
--
-- Pode rodar mais de uma vez sem problema.
-- Rode este arquivo no SQL Editor do Supabase (sem texto selecionado) e depois siga o passo a passo
-- em SUPABASE.md, seção "Feedback por e-mail", para cadastrar os dois segredos.

create extension if not exists pg_net with schema extensions;

create or replace function public.avisar_feedback_por_email()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_chave text;
  v_destino text;
  v_autor text;
  v_tipo text;
begin
  select decrypted_secret into v_chave from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select decrypted_secret into v_destino from vault.decrypted_secrets where name = 'feedback_email_destino' limit 1;
  if coalesce(v_chave, '') = '' or coalesce(v_destino, '') = '' then
    return new;
  end if;

  select u.email::text into v_autor from auth.users u where u.id = new.autor_id;
  v_tipo := case new.tipo
    when 'sugestao' then 'Sugestão'
    when 'problema' then 'Problema'
    when 'elogio' then 'Elogio'
    else 'Outro'
  end;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_chave,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Fólium <onboarding@resend.dev>',
      'to', jsonb_build_array(v_destino),
      'subject', 'Feedback no Fólium: ' || v_tipo,
      'text',
        'Novo feedback no Fólium' || E'\n\n' ||
        'Tipo: ' || v_tipo || E'\n' ||
        'Nota: ' || coalesce(new.nota::text || ' de 5', 'sem nota') || E'\n' ||
        'Página: ' || coalesce(nullif(new.pagina, ''), 'não informada') || E'\n' ||
        'De: ' || coalesce(v_autor, 'conta sem e-mail') || E'\n' ||
        'Em: ' || to_char(new.criado_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') || E'\n\n' ||
        new.mensagem
    )
  );
  return new;
exception when others then
  -- Nunca deixa um problema de e-mail impedir o envio do feedback.
  return new;
end;
$$;

revoke all on function public.avisar_feedback_por_email() from public, anon, authenticated;

drop trigger if exists avisar_feedback_por_email on public.feedbacks;
create trigger avisar_feedback_por_email after insert on public.feedbacks
  for each row execute function public.avisar_feedback_por_email();
