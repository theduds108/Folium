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

## Onde mexer

- `lib/data.ts`: alunos, cursos e serviços de exemplo (vira o banco de dados depois)
- `lib/config.ts`: domínio do e-mail institucional aceito no cadastro
- `app/globals.css`: cores da paleta "folha + papel + terra" e todo o visual
- `app/page.tsx`: página inicial
- `app/talentos/`: busca de talentos com filtros
- `app/aluno/[slug]/`: portfólio público de cada aluno
- `app/entrar/`: entrada com e-mail institucional
- `app/meu-perfil/`: edição do portfólio com prévia ao vivo

## Ainda falta

- Banco de dados e login de verdade (Supabase)
- Upload de imagens dos trabalhos
- Domínio próprio e hospedagem (Vercel)
- Painel de administração
