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
   - `20261102210000_descricao_trabalho_maior.sql`
   - `20261102220000_contas_planos.sql` (tipos de conta, planos Grátis/Premium, talentos salvos e Jornal do Fólium)

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
| `contas` | Tipo de cada conta (`colaborador` ou `contratante`) e plano (`gratis` ou `premium`) |
| `salvos` | Talentos salvos pelos contratantes Premium |
| `jornal_materias` | Matérias do Jornal do Fólium, escritas pela equipe |
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

1. Abra http://localhost:3000/entrar e coloque um e-mail do padrão `nome.RA@alunos.unisagrado.edu.br`.
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
- **Liberar o Premium**: tabela `contas`. Quem pediu aparece com `plano_pedido = premium`.
  Mude `plano` para `premium` e, se quiser data para acabar, preencha `plano_ate`.
  Pelo site ninguém consegue mudar o próprio plano nem o tipo de conta.
- **Publicar uma matéria no jornal**: tabela `jornal_materias`, **Insert row**. Preencha `titulo`,
  `linha_fina`, `texto` (parágrafos separados por uma linha em branco), `editoria`, `autor` e
  `publico` (`todos`, `colaborador` ou `contratante`), e marque `publicada`. Só assinantes Premium
  leem. Enquanto não houver matéria publicada, o jornal mostra três matérias de exemplo.

## Login com nome de usuário e senha

O primeiro acesso é pelo link no e-mail (garante que é aluno UNISAGRADO). Depois a pessoa cria
nome de usuário e senha em `/senha` e passa a entrar com eles, sem e-mail nenhum.

1. SQL Editor: rode `supabase/migrations/20261104220000_nome_usuario.sql`.
2. Authentication > URL Configuration > Redirect URLs: inclua `https://folium-phi.vercel.app/**`
   (os links do primeiro acesso e do "Esqueci a senha" voltam para `/senha/`).
3. Authentication > Sign In / Providers > Email: deixe "Email" ligado (é ele que permite senha) e, em
   **Minimum password length**, ponha `8`; em **Password Requirements**, escolha
   "Lowercase, uppercase letters, digits and symbols". É isso que recusa senha fraca no servidor
   (a lista na tela é só ajuda visual).
4. SQL Editor: rode `supabase/migrations/20261104230000_login_seguro.sql`. Ele troca a função de login
   por uma que só devolve o e-mail quando a senha está certa e trava o nome de usuário por 15 minutos
   depois de 5 erros.

Onde ficam os dados: a senha é guardada só pelo Supabase Auth, como hash bcrypt (não dá para
ler de volta); nenhuma tabela nossa nem o navegador guardam a senha. O navegador guarda apenas a
sessão (um token que expira), que é o mesmo que qualquer site de login guarda.

## Dados só para quem tem conta

Rode `supabase/migrations/20261105000000_dados_protegidos.sql` no SQL Editor. Depois dele:
- sem login, o banco não entrega portfólios, trabalhos, vagas, empresas nem denúncias;
- os buckets `fotos` e `curriculos` ficam privados: o site pede links assinados (6 horas) para
  quem está logado (ver `lib/arquivos.tsx`). Links antigos de foto ou currículo copiados para fora
  do site param de abrir, de propósito.

## Feedback por e-mail

Cada feedback enviado em /feedback fica na tabela `feedbacks` e, se os dois segredos abaixo estiverem cadastrados, também chega por e-mail (migração `20261108130000_feedback_por_email.sql`). O e-mail sai pelo Resend (grátis), com remetente `onboarding@resend.dev`; nesse modo o Resend só entrega para o e-mail da própria conta dele, então use o mesmo e-mail nos dois lugares.

1. Crie uma conta em https://resend.com com o e-mail que vai receber os avisos.
2. Em **API Keys**, crie uma chave com permissão "Sending access" e copie (começa com `re_`).
3. No Supabase, abra o **SQL Editor** e rode o arquivo `20261108130000_feedback_por_email.sql`.
4. Ainda no SQL Editor, rode as duas linhas abaixo, trocando os textos entre aspas (sem texto selecionado além delas). Isso guarda a chave no Vault, que é o cofre do Supabase; não coloque a chave em arquivo do site nem mande no chat:

   ```sql
   select vault.create_secret('re_COLE_A_CHAVE_AQUI', 'resend_api_key');
   select vault.create_secret('seu-email@exemplo.com', 'feedback_email_destino');
   ```
5. Teste enviando um feedback em /feedback logada. O e-mail chega em alguns segundos (veja também o spam na primeira vez).

Para trocar a chave ou o e-mail depois, em **Project Settings → Vault** edite os segredos `resend_api_key` e `feedback_email_destino`. Se o e-mail não chegar, o feedback continua salvo na tabela `feedbacks` (Table Editor); veja os envios em **Database → Extensions → pg_net** (tabela `net._http_response`).

## Salvar trabalhos de uma vez e excluir conta (11/11/2026)

Rode no **SQL Editor** (sem texto selecionado) o arquivo `20261111000000_salvar_trabalhos_excluir_conta.sql`. Ele cria duas funções:

- `salvar_trabalhos`: o portfólio grava a lista de trabalhos numa transação só (tudo ou nada). Enquanto o SQL não for rodado, o site continua salvando do jeito antigo.
- `excluir_minha_conta`: usada pelo botão **Excluir minha conta** em /privacidade. Sem o SQL, o botão avisa que a exclusão ainda não foi ativada.

## Combinados, convites, avaliações, link público e painel da equipe (11/11/2026)

1. Rode no **SQL Editor** (sem texto selecionado) o arquivo `20261111120000_combinados_convites_equipe.sql`.
2. Coloque você (e quem mais for da equipe) na tabela `equipe`, trocando o e-mail:

   ```sql
   insert into public.equipe (id) select id from auth.users where email = 'SEU-EMAIL-AQUI' on conflict do nothing;
   ```
3. Entre no site com essa conta: o menu ☰ ganha **Painel da equipe** (/equipe), onde dá para aprovar vagas, ver denúncias e feedbacks e liberar o Premium sem abrir o Table Editor.

Enquanto o SQL não rodar, o site continua funcionando: o link público, as estatísticas, os convites e os combinados só não aparecem (ou avisam que ainda não foram ativados).

## Ajustes da auditoria de segurança (12/11/2026)

1. Rode no **SQL Editor** (sem texto selecionado) o arquivo `20261112000000_seguranca_auditoria.sql`. Ele:
   - tira de quem está sem login o acesso às funções `plano_de`, `tipo_de` e `eh_aluno_institucional`;
   - passa a exigir e-mail **confirmado** para alguém ser tratado como aluno UNISAGRADO;
   - faz quem tem conta abrir só fotos, currículos e certificados de portfólios **publicados** (e os próprios). A equipe continua vendo tudo.
   - deixa **contratante novo em análise**: ele vê os portfólios, mas WhatsApp, e-mail, currículo e certificados dos alunos só aparecem depois que a equipe aprova em **/equipe > Contratantes**. Convites e propostas também só depois da aprovação. **Os contratantes que já existem começam em análise**: aprove-os logo depois de rodar o SQL.
2. Authentication > Sign In / Providers > Email: confira **Confirm email** ligado e ligue **Secure password change**.
3. Authentication > URL Configuration > Redirect URLs: só `https://folium-phi.vercel.app/**` e `http://localhost:3000/**` (nunca `https://*.vercel.app/**`).

Os headers de segurança do site (CSP, HSTS etc.) ficam em `vercel.json`. Se o projeto do Supabase mudar de endereço, troque o endereço `clpxenmytonfniwkmmuy.supabase.co` lá também, senão o site não consegue falar com o banco.

## Segurança das pessoas (12/11/2026, à tarde)

Rode **depois** do SQL da auditoria (acima). No **SQL Editor** (sem texto selecionado), rode `20261112180000_seguranca_pessoas.sql`. Ele:

- guarda o **aceite dos termos e do código de conduta** (data e versão). Sem o aceite, ninguém propõe nem aceita combinado. Todas as contas, inclusive as que já existem, veem uma faixa pedindo o aceite;
- cria as **ocorrências**: o botão **Preciso de ajuda** (só aluno, em combinado em andamento, prazo de 24 horas) e a **denúncia de combinado** nos dois sentidos (prazo de 5 dias úteis), com prints no bucket privado `provas`;
- deixa o aluno **pausar** o combinado sem penalidade;
- dá à equipe a aba **/equipe > Segurança**: começar análise, pedir a versão da outra parte (ela lê só o resumo que a equipe escrever), decidir (arquivar, advertência, suspensão de 30 dias, banimento, má-fé de quem denunciou) e encerrar o combinado. Tudo fica no histórico;
- conta **suspensa** não publica vaga, não convida, não propõe nem aceita combinado; banida também sai da busca;
- muda as **avaliações**: notas por critério, às cegas (aparecem quando os dois avaliaram ou 14 dias depois), só para contas aprovadas, com direito de resposta. A média só aparece a partir de 3 avaliações.

Se o **Feedback por e-mail** já estiver configurado (Resend no Vault), a equipe recebe também um e-mail a cada pedido de ajuda ou denúncia, sem o relato (que só se lê no painel).

O pedido de "avisar a faculdade" não manda nada sozinho: ele aparece no cartão da ocorrência para a equipe entrar em contato com a faculdade.
