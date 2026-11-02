# Ligar o banco de dados (Supabase)

O Fólium usa o [Supabase](https://supabase.com), que é grátis para começar e dá, num lugar só:
banco de dados, login por e-mail e armazenamento das fotos.

Leva uns 10 minutos e só precisa ser feito uma vez.

## 1. Criar o projeto

1. Entre em https://supabase.com e crie uma conta (dá para entrar com o GitHub).
2. Clique em **New project**. Nome: `folium`. Crie uma senha forte para o banco e guarde.
   Região: **South America (São Paulo)**.
3. Espere o projeto ficar pronto (1 a 2 minutos).

## 2. Criar as tabelas

1. No menu da esquerda, abra **SQL Editor** e clique em **New query**.
2. Rode, um de cada vez e nesta ordem, os arquivos da pasta `supabase/migrations/`
   (copie o conteúdo, cole lá e clique em **Run**; deve aparecer "Success. No rows returned"):
   - `20261102000000_inicial.sql`
   - `20261102120000_portfolio_completo.sql` (título, sobre mim, experiências, cursos, idiomas, links, currículo em PDF)
   - `20261102180000_empresas.sql` (catálogo de empresas para a busca no campo de experiência)

   Cada arquivo só precisa ser rodado uma vez. Quando aparecer um arquivo novo nessa pasta, rode só ele.

Isso cria:

| Tabela | Para que serve |
| --- | --- |
| `perfis` | Portfólio de cada aluno (um por conta) |
| `trabalhos` | Trabalhos de cada portfólio (até 6 no plano grátis) |
| `oportunidades` | Vagas enviadas pelas empresas. Entram como `pendente` |
| `interesses` | Alunos que clicaram em "Tenho interesse" numa vaga |
| `denuncias` | Denúncias de perfis e vagas |
| `empresas` | Catálogo de empresas da busca de experiência; cresce sozinho quando alunos cadastram empresas novas |
| `dominios_institucionais` | Domínios de e-mail aceitos (`unisagrado.edu.br`) |

E as pastas `fotos` (imagens) e `curriculos` (PDFs). As regras de segurança já vêm prontas:
só quem entra com e-mail institucional cria portfólio, cada aluno só edita o próprio perfil e
as próprias fotos, e ninguém de fora lê denúncias nem vagas ainda não aprovadas.

## 3. Configurar o login

Em **Authentication > URL Configuration**:

- **Site URL**: `http://localhost:3000` (troque pelo domínio quando o site for ao ar)
- **Redirect URLs**: adicione `http://localhost:3000/**` (e depois `https://seu-dominio/**`)

Opcional, mas recomendado: em **Authentication > Emails > Magic Link**, troque o texto do e-mail para português:

- Assunto: `Seu link de acesso ao Fólium`
- Corpo:
  ```html
  <h2>Entrar no Fólium</h2>
  <p>Clique no link abaixo para entrar. Ele vale por 1 hora.</p>
  <p><a href="{{ .ConfirmationURL }}">Entrar no Fólium</a></p>
  <p>Se não foi você que pediu, pode ignorar este e-mail.</p>
  ```

> O envio de e-mail grátis do Supabase tem um limite baixo por hora, bom para testes.
> Antes de abrir para todos os alunos, ligue um serviço de e-mail próprio em
> **Project Settings > Authentication > SMTP** (o [Resend](https://resend.com) tem plano grátis).

## 4. Ligar o site ao projeto

1. Em **Project Settings > API** (ou **Data API**), copie a **Project URL** e a chave **anon public**.
2. Na pasta do projeto, copie o arquivo `.env.local.example` para `.env.local` e cole os dois valores:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   No PowerShell: `copy .env.local.example .env.local` e depois `notepad .env.local`.
3. Pare o servidor e rode `npm run dev` de novo.

A chave **anon** pode ficar no site, ela é pública. Nunca coloque no site a chave **service_role**.
O arquivo `.env.local` não vai para o GitHub.

## 5. Testar

1. Abra http://localhost:3000/entrar e coloque um e-mail `@unisagrado.edu.br`.
2. Abra o link que chegar no e-mail **no mesmo navegador**.
3. Preencha o portfólio, envie uma foto e clique em **Salvar portfólio**.
4. Veja seu cartão em **Talentos** e confira os dados em **Table Editor > perfis** no Supabase.

## Tarefas da equipe no painel do Supabase

Enquanto não existe um painel de administração próprio, tudo é feito em **Table Editor**:

- **Aprovar uma vaga**: tabela `oportunidades`, mude `status` de `pendente` para `aprovada`
  (ou `recusada`). Confira a empresa pelo `contato` antes.
- **Ver denúncias**: tabela `denuncias`. Para tirar um perfil do ar, na tabela `perfis`
  mude `publicado` para `false`.
- **Aceitar outra faculdade**: tabela `dominios_institucionais`, adicione o domínio
  (ex.: `fib.br`) e inclua o mesmo domínio em `lib/config.ts`.
- **Esconder os alunos e vagas de exemplo**: em `lib/config.ts`, troque `MOSTRAR_EXEMPLOS` para `false`.
