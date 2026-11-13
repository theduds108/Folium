# Testes de ponta a ponta

Abrem o Fólium num navegador de verdade (Chromium), em tela de celular (390×844) e de computador (1366×800),
e conferem os fluxos que mais quebram: login, sessão salva, sair, primeiro acesso, criar senha,
recuperação, tour, menu, editor de portfólio, vagas e o que acontece quando a internet falha.

Não usam o Supabase de verdade: `supabase-simulado.js` responde como o Supabase (login, tabelas, funções),
guardando tudo na memória. Nenhum aluno, e-mail ou dado real é tocado.

## Rodar

```bash
npm i -D playwright && npx playwright install chromium   # só na primeira vez
bash testes/e2e/rodar.sh
```

Cada linha sai como `PASS` ou `FAIL`. As capturas de tela ficam em `testes/e2e/capturas/` (fora do git).

| Arquivo | O que confere |
| --- | --- |
| 01-login-sessao-logout | usuário/e-mail + senha, senha errada, sessão salva ao recarregar e em outra aba, sair só neste aparelho |
| 02-primeiro-acesso-recuperacao | link do e-mail, criar usuário e senha, senha fraca, tour 1x, "Esqueci a senha" exige senha nova, falha passageira |
| 03-varredura-paginas | 17 páginas × visitante/aluno/contratante × celular/computador: erros de JS, rolagem lateral, link interno em nova aba |
| 04-editor-portfolio | perfil que não carregou não pode ser salvo por cima; salvar mantém os trabalhos |
| 05-falhas-interesse-menu | "Tenho interesse" grava, desfaz e lembra; avisos de falha nas vagas/talentos; trabalhos voltam se a gravação falhar; sair pelo menu |
| 06-modo-demo | site sem banco (modo demonstração) continua funcionando |
| 07-melhorias-11-11 | faixa de preço ao publicar vaga, perfil sem conexão, convite de colegas, termos no cadastro, salvar trabalhos pela função do banco, excluir a conta |
| 08-combinados-convites-equipe | link público sem contatos, PDF, estatísticas, aviso de vaga nova, convite, combinado (propor, aceitar, concluir), avaliações dos dois lados e painel da equipe |
| 09-contratante-em-analise | contratante novo só vê contatos depois que a equipe aprova |
| 11-formacao-collab | ficha Formação (situação, turno, outras formações) salva e aparece no perfil; colegas do trabalho em collab com link na mesma aba |
| 10-seguranca-pessoas | aceite do código de conduta, botão Preciso de ajuda (telefones, pausa, faculdade, contratante não vê), denúncia do contratante, pedido de defesa, decisão e suspensão pela equipe, avaliação por critérios às cegas e resposta |
