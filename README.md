# Fólium

Plataforma de portfólios que conecta universitários da UNISAGRADO a quem quer contratar freelas.
Site responsivo instalável (PWA) feito em Next.js.

## Rodar no computador

Precisa do Node.js 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Sem configurar nada, o site roda em **modo demonstração** (dados de exemplo, nada é salvo de verdade).
Para ligar o banco, o login e o upload de fotos, siga o [SUPABASE.md](SUPABASE.md).

## Onde mexer

- `lib/data.ts`: alunos, cursos e serviços de exemplo
- `lib/config.ts`: domínio do e-mail institucional e se mostra os exemplos junto com os perfis reais
- `lib/supabase.ts`, `lib/repositorio.ts`, `lib/sessao.ts`: conexão com o banco, leituras/gravações e login
- `supabase/migrations/`: tabelas e regras de segurança do banco
- `app/globals.css`: cores da paleta "folha + papel + terra" e todo o visual
- `app/page.tsx`: página inicial
- `app/talentos/`: busca de talentos com filtros
- `app/aluno/[slug]/`: portfólio dos alunos de exemplo
- `app/perfil/`: portfólio dos alunos reais (`/perfil/?u=nome-do-aluno`)
- `app/oportunidades/`: mural de vagas e formulário para empresas
- `app/entrar/`: entrada com e-mail institucional
- `app/meu-perfil/`: edição do portfólio com prévia ao vivo

## Ainda falta

- Domínio próprio e hospedagem (Vercel)
- Painel de administração (por enquanto, aprovar vagas e ver denúncias pelo painel do Supabase)
