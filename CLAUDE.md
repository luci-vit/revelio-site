# revelio-site

Site do Revelio em **Next.js (App Router) com TypeScript**. Protótipo de alta fidelidade com **dados fictícios**, sem backend.

Leia primeiro:
- `docs/contexto.md` — regras do projeto, cenário fictício e tokens da identidade visual.
- `docs/prototipo/` — protótipo de baixa fidelidade do site, uma imagem por tela (A1.png … E7.png).
- `docs/identidade/` — painéis da identidade visual (marca, paleta, tipografia, vidro, botões, navegação, card, notificações).

- `docs/arquitetura.md` — rotas, estado em memória, componentes compartilhados e convenções do código.

## Montagem inicial (feita)
1. Criar o projeto Next.js nesta pasta (TypeScript, App Router, ESLint). Se o criador reclamar que a pasta não está vazia, criar numa pasta temporária e mover o conteúdo para cá, mantendo `CLAUDE.md`, `README.md` e `docs/`.
2. Definir os tokens de `docs/contexto.md` como variáveis CSS globais (cores, gradiente, raios, espaçamentos múltiplos de 8).
3. Carregar Inter e Bricolage Grotesque com `next/font/google`.
4. Criar `src/data/` com o cenário fictício e um estado em memória (papel atual, inscrições, trabalhos, decisões).
5. Barra de navegação em vidro com o menu em pílula, que muda com o papel: visitante (Eventos, Como funciona, Para organizadores, Entrar, Criar conta) e conta logada (Eventos, Minhas inscrições, Meus trabalhos, Revisões só para revisor, Organização só para organizador), mais sino e avatar.

## Telas (na ordem de construção)
| Fluxo | Telas |
| --- | --- |
| Conta (visitante) | A1 página inicial com busca segmentada · A2 criar conta (sem escolher papel) · A3 próximo passo |
| Participante | B1 busca e filtros (busca segmentada, abas de período, blocos de área, cards) · B2 página do evento (abas Sobre, Programação, Chamada, Prazos, Aprovados; inscrição e prazos na lateral) · B3 inscrição com cupom · B4 inscrição confirmada e crachá · B5 minhas inscrições com painel de avisos |
| Autor | C1 chamada de trabalhos (botão bloqueado com explicação para quem não está inscrito) · C2 submissão em etapas: autores · C3 conferir e enviar · C4 meus trabalhos · C5 pareceres e versão ajustada |
| Revisor | D1 convite (aceitar e se inscrever) · D2 fila de revisões · D3 registrar parecer |
| Organizador | E1 criar evento: prazos com validação · E2 painel do evento · E3 comitê científico (convites) · E4 distribuição · E5 seleção · E6 publicação e certificados · E7 alcance (inscrições por semana, funil, cupons por divulgador, origem por estado) |

Para a demonstração, permita alternar o papel atual (visitante, participante, autor, revisor, organizador).

## Como rodar
`npm run dev` e abrir http://localhost:3000. Para mostrar ao professor, publicar na Vercel.
Antes de cada commit: `npm run typecheck && npm run lint`.
