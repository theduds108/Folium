# Guia de preços: de onde vêm as faixas (nov/2026)

Pesquisa feita em 09/11/2026 para trocar as estimativas escritas à mão do guia "Quanto cobrar" (lib/precos.ts) por números de mercado. Cada serviço no código tem um campo `fonte`, e a tela do guia mostra a origem de cada faixa.

## Resumo honesto
- **24 de 47 serviços** têm preço publicado para o próprio serviço (ou um muito próximo). **15** não têm, e foram calculados por horas típicas × R$ 30 a 60/h. **8** seguem como estimativa do Fólium, marcados na tela com o selo "estimativa".
- **Só as aulas têm dado de Bauru** (Superprof). Todo o resto é média nacional. Não achei nenhuma fonte pública de preço de freela por cidade para a região.
- **As fontes são de profissionais formados**, não de estudantes. Por isso a faixa do Fólium fica na parte de baixo do que elas mostram. Esse ajuste é decisão nossa, não vem de pesquisa.
- **Nenhuma fonte é pesquisa com metodologia.** O Cronoshare mostra faixas de orçamentos da plataforma, sem média nem tamanho de amostra, e algumas páginas se contradizem (ex.: logo R$ 800 a 2.500 no topo e R$ 600 a 1.500 no texto; urgência +20% a 50% numa página e +50% a 100% em outra). O Superprof mostra a média dos perfis listados, e em idiomas e música são só 7 a 23 professores.
- Para um trabalho formal, vale citar como "referências de mercado", não como "pesquisa de preços".

## Fontes usadas
| Fonte | O que é | Data | Qualidade |
|---|---|---|---|
| Cronoshare, páginas "Quanto custa" (cronoshare.com.br/quanto-custa/...) | Faixas de orçamentos de profissionais na plataforma, média nacional | publicadas jan e fev/2026 | Média. Muitos serviços, mas sem metodologia nem amostra; faixas largas |
| Superprof Bauru (superprof.com.br/aulas/<materia>/bauru/) | Média do preço por hora dos professores listados em Bauru | sem data na página; imagens de out/2026 | Boa para matemática e reforço (165 a 170 professores); fraca em música e idiomas (7 a 23) |
| jobrise.io | Hora de dev freelancer no Brasil: júnior R$ 40 a 80, pleno R$ 90 a 180 | mai/2026 | Média; sem metodologia, já usada em mercado-planos-e-precos.md |
| Exame + Workana | Hora por área: TI R$ 29 a 122, design R$ 23 a 113, tradução e conteúdo R$ 20 a 58 | set/2016 | Velha (10 anos). Só usada como conferência de ordem de grandeza |
| Clockify (índice Jobbers) | Hora mediana de freelancer no Brasil: US$ 35 | 2026, data confusa na página | Fraca; texto de marketing |

Tentadas e sem resultado: Monitor Mercantil (pesquisa de tíquete médio de freelas, página não abriu), Superprof inglês em Bauru (não abriu), tabelas do Sindicato dos Jornalistas e do Sintra (não achei tabela de freela pública atual), páginas do Cronoshare para diagramação, 3D, motion, locução, embalagem e desenho técnico (não existem).

## Como cada faixa foi feita
- **mercado**: li a faixa da fonte e coloquei a do Fólium no começo dela, porque é para quem está começando. Ex.: logo básico de profissional R$ 600 a 800 → aluno R$ 400 a 1.500 por identidade (o máximo cobre quem já tem portfólio). Nas aulas, o máximo do Fólium fica perto da média de Bauru.
- **hora**: mínimo = menor número de horas × R$ 30; máximo = maior número de horas × R$ 60. R$ 30 a 60/h fica abaixo da hora de dev júnior (R$ 40 a 80, jobrise) e de designer júnior (R$ 50 a 60, Cronoshare).
- **estimativa**: valor antigo mantido.
- Cuidado legal anotado na tela: projeto arquitetônico para prefeitura precisa de arquiteto com CAU; declarações contábeis precisam de contador com CRC.

## Tabela completa
| Serviço | Faixa no guia | Horas típicas | Tipo | Fonte publicada em | O que a fonte diz |
|---|---|---|---|---|---|
| Identidade visual | R$ 400 a R$ 1.500 por projeto | 12 a 40 h | mercado | jan/2026 | Logo básico R$ 600 a 800; logo completo R$ 1.500 a 2.000; identidade completa de agência R$ 3.000 a 10.000. |
| Design gráfico | R$ 100 a R$ 450 por peça ou kit | 3 a 12 h | mercado | fev/2026 | Designer júnior cobra R$ 50 a 60 por hora; cartão de visita sai de R$ 100 a 500. |
| Design editorial | R$ 450 a R$ 3.000 por projeto | 15 a 50 h | hora | – | – |
| Ilustração | R$ 150 a R$ 500 por peça | 3 a 10 h | mercado | jan/2026 | Uma ilustração fica em torno de R$ 500; projeto completo até R$ 2.000. |
| UX/UI design | R$ 600 a R$ 2.500 por projeto | 20 a 60 h | mercado | jan/2026 | Não há preço só de UX/UI. O mais próximo é web design de empresa: R$ 2.000 a 6.000. |
| Design de embalagem | R$ 300 a R$ 1.200 por projeto | 10 a 35 h | estimativa | – | – |
| Modelagem 3D | R$ 150 a R$ 1.500 por modelo | 5 a 25 h | hora | – | – |
| Moda e figurino | R$ 100 a R$ 600 por peça ou projeto | 5 a 25 h | estimativa | – | – |
| Fotografia | R$ 200 a R$ 900 por ensaio ou evento | 3 a 14 h | mercado | jan/2026 | Fotógrafo cobra R$ 800 a 2.500 por trabalho, ou R$ 150 a 500 por hora. |
| Vídeo e edição | R$ 100 a R$ 900 por vídeo ou evento | 2 a 14 h | mercado | jan/2026 | Só há preço de vídeo de casamento: R$ 1.200 a 3.000, com captação. Edição avulsa fica abaixo. |
| Motion design e animação | R$ 180 a R$ 1.800 por vídeo | 6 a 30 h | hora | – | – |
| Locução e podcast | R$ 60 a R$ 400 por gravação ou episódio | 2 a 10 h | estimativa | – | – |
| Produção musical | R$ 150 a R$ 900 por faixa | 8 a 30 h | estimativa | – | – |
| Social media | R$ 500 a R$ 1.200 por mês, 8 a 12 posts | 16 a 40 h | mercado | jan/2026 | Gestão de redes por agência: R$ 600 a 7.000 por mês, o comum a partir de R$ 1.500. |
| Marketing digital e tráfego pago | R$ 400 a R$ 1.500 por mês | 12 a 40 h | mercado | jan/2026 | Gestão de tráfego pago: R$ 400 a 2.500 por mês, fora a verba dos anúncios. |
| Redação e revisão | R$ 40 a R$ 360 por texto | 1.5 a 6 h | hora | – | – |
| Assessoria de imprensa | R$ 600 a R$ 2.000 por mês | 12 a 35 h | mercado | jan/2026 | Assessoria mensal R$ 2.500 a 10.000 (em São Paulo R$ 3.000 a 6.000); release avulso R$ 500 a 1.500. |
| Roteiro | R$ 120 a R$ 1.200 por roteiro | 4 a 20 h | hora | – | – |
| Tradução | R$ 30 a R$ 70 por página (até 250 palavras) | 0.8 a 1.5 h | mercado | jan/2026 | Tradução juramentada sai por R$ 50 a 70 a página, ou R$ 0,15 a 0,18 a palavra. A comum, sem juramento, fica abaixo. |
| Organização de eventos | R$ 300 a R$ 1.500 por evento | 10 a 40 h | estimativa | – | – |
| Sites e sistemas | R$ 500 a R$ 2.500 por projeto | 20 a 70 h | mercado | jan/2026 | Site simples R$ 400 a 2.000; site completo R$ 2.500 a 10.000. |
| Landing page | R$ 400 a R$ 1.500 por página | 8 a 30 h | mercado | jan/2026 | Landing page R$ 800 a 2.000 com profissional; a jobrise (mai/2026) cita R$ 1.500 a 4.000. |
| Loja virtual | R$ 1.000 a R$ 3.500 por loja | 15 a 50 h | mercado | jan/2026 | Loja virtual a partir de R$ 1.000, o comum de R$ 1.500 a 15.000. |
| Manutenção de sites | R$ 100 a R$ 400 por mês | 3 a 8 h | mercado | jan/2026 | Manutenção básica R$ 150 a 250 por mês; completa R$ 250 a 400. |
| Aplicativos | R$ 1.500 a R$ 6.000 por projeto | 40 a 150 h | mercado | jan/2026 | Aplicativo com empresa sai de R$ 15.000 a 30.000. Desenvolvedor remoto cobra a partir de R$ 30 por hora. |
| Banco de dados e APIs | R$ 300 a R$ 2.400 por projeto | 10 a 40 h | hora | – | – |
| Chatbot e atendimento automático | R$ 240 a R$ 1.800 por projeto | 8 a 30 h | hora | – | – |
| Automação e planilhas | R$ 90 a R$ 1.200 por projeto | 3 a 20 h | hora | – | – |
| Análise de dados | R$ 240 a R$ 1.800 por projeto | 8 a 30 h | hora | – | – |
| Dashboards e BI | R$ 240 a R$ 1.800 por painel | 8 a 30 h | hora | – | – |
| SEO e desempenho de sites | R$ 250 a R$ 1.200 por projeto | 6 a 25 h | mercado | jan/2026 | Consultor de SEO cobra R$ 30 a 55 por hora; projeto de R$ 2.000 a 8.000. |
| Testes e qualidade de software | R$ 150 a R$ 1.500 por projeto | 5 a 25 h | hora | – | – |
| Segurança e LGPD básica | R$ 300 a R$ 1.000 por checagem | 4 a 20 h | mercado | jan/2026 | Auditoria de site a partir de R$ 500; adequação à LGPD de microempresa R$ 2.000 a 5.000. |
| Domínio, e-mail e hospedagem | R$ 30 a R$ 360 por configuração | 1 a 6 h | hora | – | – |
| Suporte e manutenção de computadores | R$ 60 a R$ 150 por atendimento | 1 a 4 h | mercado | jan/2026 | Formatação com programas sai em média R$ 110 (R$ 100 a 150); remoção de vírus R$ 80 a 100; visita em casa mais R$ 30. |
| Jogos digitais | R$ 900 a R$ 7.200 por projeto | 30 a 120 h | hora | – | – |
| Projeto de interiores | R$ 500 a R$ 2.000 por ambiente | 12 a 50 h | mercado | jan/2026 | Arquiteto cobra R$ 50 a 250 por m². Um quarto de 12 m² dá R$ 600 a 3.000. |
| Projeto arquitetônico | R$ 800 a R$ 4.000 por projeto | 25 a 100 h | mercado | jan/2026 | Projeto arquitetônico de R$ 2.300 a 6.900, ou R$ 20 a 80 por m². Para aprovar na prefeitura, precisa de arquiteto com registro no CAU. |
| Maquete e renderização | R$ 150 a R$ 1.500 por cena | 5 a 25 h | hora | – | – |
| Desenho técnico (CAD) | R$ 90 a R$ 1.200 por desenho | 3 a 20 h | hora | – | – |
| Plano de negócios | R$ 300 a R$ 1.500 por plano | 12 a 40 h | estimativa | – | – |
| Pesquisa de mercado | R$ 200 a R$ 1.200 por pesquisa | 8 a 30 h | estimativa | – | – |
| Consultoria financeira e contábil | R$ 100 a R$ 800 por projeto ou mês | 3 a 20 h | mercado | jan/2026 | Contador para autônomo cobra R$ 300 a 450 por mês. Declarações e balanço exigem contador com registro no CRC. |
| Gestão de redes e atendimento | R$ 300 a R$ 900 por mês | 15 a 40 h | estimativa | – | – |
| Aulas particulares e reforço | R$ 30 a R$ 60 por hora | 1 a 1 h | mercado | out/2026 | Matemática R$ 52/h e reforço escolar R$ 49/h em média, com 165 a 170 professores. Os perfis vão de R$ 20 a 100. |
| Aulas de idiomas | R$ 35 a R$ 65 por hora | 1 a 1 h | mercado | out/2026 | Espanhol R$ 62/h em média, com 21 professores (perfis de R$ 45 a 100). |
| Aulas de música | R$ 40 a R$ 70 por hora | 1 a 1 h | mercado | out/2026 | Violão R$ 63/h, piano R$ 58/h e canto R$ 73/h em média, com 7 a 23 professores por instrumento. |
## Para atualizar
Mudar valores e fontes em `lib/precos.ts` (faixas nas linhas de `AREAS`, origem em `FONTES`, data da consulta em `CONSULTADO_EM`). Vale refazer a cada 6 meses. O melhor dado para Bauru seria uma enquete com alunos e contratantes do próprio Fólium, ou o histórico de orçamentos do mural quando houver volume.
