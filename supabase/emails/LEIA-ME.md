# E-mails de login do Fólium

O Supabase manda dois e-mails, e o site usa os dois (login sem senha):

| Quando | Template no Supabase | Arquivo | Assunto sugerido |
| --- | --- | --- | --- |
| Primeiro acesso (conta nova) | **Confirm sign up** | `confirmar-cadastro.html` | Confirme seu e-mail no Fólium |
| Acessos seguintes | **Magic Link** | `link-de-acesso.html` | Seu link de acesso ao Fólium |

Como trocar: Supabase > Authentication > Emails (Email Templates) > escolha o template >
cole o conteúdo do arquivo em **Message body** e o assunto em **Subject** > Save.
Não apague `{{ .ConfirmationURL }}`: é o link de entrada.

Limites do envio padrão do Supabase: o remetente aparece como "Supabase Auth" e há poucos
e-mails por hora. Para lançar de verdade, configure um SMTP próprio
(Authentication > Emails > SMTP Settings, ex.: Resend, que tem plano grátis).
