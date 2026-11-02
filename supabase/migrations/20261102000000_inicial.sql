-- Fólium: estrutura inicial do banco.
-- Rode este arquivo uma vez no SQL Editor do Supabase (ou com `supabase db push`).

-- Domínios de e-mail aceitos para criar portfólio. Para incluir outra
-- faculdade no futuro: insert into public.dominios_institucionais values ('fib.br');
create table public.dominios_institucionais (
  dominio text primary key
);
insert into public.dominios_institucionais values ('unisagrado.edu.br');
alter table public.dominios_institucionais enable row level security;
create policy "todos leem dominios" on public.dominios_institucionais for select using (true);

-- Verdadeiro quando o usuário logado tem e-mail de uma instituição parceira.
create or replace function public.eh_aluno_institucional()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.dominios_institucionais d
    where lower(split_part(auth.jwt() ->> 'email', '@', 2)) = d.dominio
       or lower(split_part(auth.jwt() ->> 'email', '@', 2)) like '%.' || d.dominio
  );
$$;

-- Perfil público do aluno (um por conta).
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 60),
  nome text not null check (length(nome) between 2 and 80),
  curso text not null,
  semestre int not null default 1 check (semestre between 1 and 12),
  cidade text not null default 'Bauru, SP',
  bio text not null default '' check (length(bio) <= 280),
  servicos text[] not null default '{}',
  habilidades text[] not null default '{}',
  valor_referencia text not null default '',
  whatsapp text not null default '',
  email_contato text not null default '',
  foto_url text,
  disponivel boolean not null default true,
  publicado boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "todos veem perfis publicados" on public.perfis
  for select using (publicado or auth.uid() = id);

create policy "aluno institucional cria o proprio perfil" on public.perfis
  for insert with check (auth.uid() = id and public.eh_aluno_institucional());

create policy "aluno edita o proprio perfil" on public.perfis
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "aluno apaga o proprio perfil" on public.perfis
  for delete using (auth.uid() = id);

-- Trabalhos do portfólio.
create table public.trabalhos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  titulo text not null check (length(titulo) between 1 and 80),
  tipo text not null,
  descricao text not null default '' check (length(descricao) <= 200),
  imagem_url text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
create index trabalhos_perfil on public.trabalhos (perfil_id, ordem);

alter table public.trabalhos enable row level security;

create policy "todos veem trabalhos de perfis publicados" on public.trabalhos
  for select using (
    exists (select 1 from public.perfis p where p.id = perfil_id and (p.publicado or p.id = auth.uid()))
  );
create policy "aluno gerencia os proprios trabalhos" on public.trabalhos
  for all using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());

-- Limite de 6 trabalhos no plano grátis.
create or replace function public.limitar_trabalhos()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.trabalhos where perfil_id = new.perfil_id) >= 6 then
    raise exception 'Limite de 6 trabalhos no plano grátis';
  end if;
  return new;
end;
$$;
create trigger limitar_trabalhos before insert on public.trabalhos
  for each row execute function public.limitar_trabalhos();

-- Oportunidades publicadas por empresas (sem precisar de conta).
-- Ficam "pendente" até a equipe aprovar no painel do Supabase (Table Editor).
create table public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (length(titulo) between 3 and 100),
  empresa text not null check (length(empresa) between 2 and 80),
  contato text not null check (length(contato) between 5 and 120),
  tipo text not null check (tipo in ('Freela', 'Projeto', 'Estágio')),
  servico text not null,
  cidade text not null default 'Bauru, SP',
  orcamento text not null default '',
  prazo text not null default '',
  descricao text not null check (length(descricao) <= 600),
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'recusada')),
  criada_em timestamptz not null default now()
);

alter table public.oportunidades enable row level security;

create policy "todos veem oportunidades aprovadas" on public.oportunidades
  for select using (status = 'aprovada');
create policy "qualquer pessoa envia oportunidade para analise" on public.oportunidades
  for insert with check (status = 'pendente');

-- Interesse de um aluno numa oportunidade.
create table public.interesses (
  oportunidade_id uuid not null references public.oportunidades (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (oportunidade_id, perfil_id)
);

alter table public.interesses enable row level security;

create policy "aluno ve os proprios interesses" on public.interesses
  for select using (perfil_id = auth.uid());
create policy "aluno marca interesse" on public.interesses
  for insert with check (perfil_id = auth.uid());
create policy "aluno desmarca interesse" on public.interesses
  for delete using (perfil_id = auth.uid());

-- Denúncias (qualquer pessoa envia, só a equipe lê pelo painel).
create table public.denuncias (
  id uuid primary key default gen_random_uuid(),
  alvo_tipo text not null check (alvo_tipo in ('perfil', 'oportunidade')),
  alvo text not null,
  motivo text not null,
  detalhes text not null default '' check (length(detalhes) <= 600),
  criada_em timestamptz not null default now()
);

alter table public.denuncias enable row level security;

create policy "qualquer pessoa denuncia" on public.denuncias
  for insert with check (true);

-- Mantém atualizado_em em dia.
create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;
create trigger tocar_perfis before update on public.perfis
  for each row execute function public.tocar_atualizado_em();

-- Fotos (perfil e trabalhos). Cada aluno só grava na própria pasta: fotos/<id do usuário>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "todos veem fotos" on storage.objects
  for select using (bucket_id = 'fotos');
create policy "aluno envia fotos na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aluno troca fotos da propria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aluno apaga fotos da propria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
