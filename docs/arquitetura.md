# Arquitetura do revelio-site

Next.js 16 (App Router) + TypeScript, sem backend. CSS puro: tokens globais em `src/app/globals.css` e CSS Modules por componente/tela. Ícones: `lucide-react`.

## Rotas (uma pasta por tela)

| Tela | Rota | Arquivo |
| --- | --- | --- |
| A1 | `/` | `src/app/page.tsx` |
| A2 | `/criar-conta` | `src/app/criar-conta/page.tsx` |
| A3 | `/criar-conta/proximo-passo` | `src/app/criar-conta/proximo-passo/page.tsx` |
| B1 | `/eventos` | `src/app/eventos/page.tsx` |
| B2 + C1 | `/eventos/[slug]` (aba via `?aba=sobre\|programacao\|chamada\|prazos\|aprovados`) | `src/app/eventos/[slug]/page.tsx` |
| B3 | `/eventos/[slug]/inscricao` | `src/app/eventos/[slug]/inscricao/page.tsx` |
| B4 | `/eventos/[slug]/inscricao/confirmada` | `src/app/eventos/[slug]/inscricao/confirmada/page.tsx` |
| B5 | `/minhas-inscricoes` | `src/app/minhas-inscricoes/page.tsx` |
| C2 + C3 | `/eventos/[slug]/submissao` (`?codigo=SBDA-0042` para continuar rascunho) | `src/app/eventos/[slug]/submissao/page.tsx` |
| C4 | `/meus-trabalhos` | `src/app/meus-trabalhos/page.tsx` |
| C5 | `/meus-trabalhos/[codigo]` | `src/app/meus-trabalhos/[codigo]/page.tsx` |
| D1 | `/convites/[id]` (ex.: `c-paulo-sbda`) | `src/app/convites/[id]/page.tsx` |
| D2 | `/revisoes` | `src/app/revisoes/page.tsx` |
| D3 | `/revisoes/[codigo]` | `src/app/revisoes/[codigo]/page.tsx` |
| E1 | `/organizacao/novo-evento` | `src/app/organizacao/novo-evento/page.tsx` |
| E2 | `/organizacao/[slug]` | `src/app/organizacao/[slug]/page.tsx` |
| E3 | `/organizacao/[slug]/comite` | … |
| E4 | `/organizacao/[slug]/trabalhos` | … |
| E5 | `/organizacao/[slug]/selecao` | … |
| E6 | `/organizacao/[slug]/publicacao` (certificados em `#certificados`) | … |
| E7 | `/organizacao/[slug]/alcance` | … |

As telas E2–E7 já ficam dentro de `LayoutOrganizacao` (menu lateral), via `src/app/organizacao/[slug]/layout.tsx`.

Parâmetros que ligam os fluxos: A1 → `/eventos?q=&onde=&quando=&filtro=`; C3 → `/meus-trabalhos?enviado=SBDA-0042` (faixa de confirmação); D1 → `/eventos/sbda-2027/inscricao?retorno=/revisoes` (volta à fila depois de se inscrever); A2 → `?evento=<slug>` segue para A3.

Componentes de cada tela ficam em `src/components/<fluxo>/`: `conta/` (A), `evento/` (B1, B2, C1), `inscricao/` (B3–B5), `submissao/` (C2, C3), `trabalhos/` (C4, C5), `revisao/` (D), `organizacao/<tela>/` (E).

## Estado e dados (`src/data/`)

- `tipos.ts` — tipos do domínio.
- `eventos.ts`, `pessoas.ts`, `seed.ts`, `alcance.ts` — cenário fictício (de `docs/contexto.md`).
- `estado.tsx` — `EstadoProvider` + `useEstado()` → `{ estado, despachar, usuario, papel, definirPapel }`. Ações tipadas em `Acao` (inscrever, salvarTrabalho, enviarTrabalho, responderConvite, salvarParecer, atribuirRevisor, distribuirAutomaticamente, definirDecisao, publicarResultado, emitirCertificados, salvarEvento, marcarLida…). Persistido em `sessionStorage`.
- `selectors.ts` — consultas prontas (`inscricaoNoEvento`, `trabalhosDaPessoa`, `trabalhosSubmetidos`, `filaDoRevisor`, `pareceresDoTrabalho`, `proximoCodigo`…).
- `demo.ts` — “hoje” da demonstração por papel.

Regras do domínio já no reducer: parecer pendente sai da fila quando o revisor é trocado/removido (`atribuirRevisor`); revisor com conflito de interesse é liberado do trabalho (D3); concordância “autora/autor” vem de `Pessoa.concordancia`, nunca do nome.

Papel → pessoa logada: participante/autor = Ana Ribeiro, revisor = Paulo Silva, organizador = Marta Souza. O seletor “Demonstração” (canto inferior direito) troca o papel.

Telas que usam o estado são componentes cliente (`"use client"`). Para ler `params` num cliente use `useParams()`; para `?aba=`, `useSearchParams()` dentro de `<Suspense>`.

## Componentes compartilhados (`src/components/`)

| Componente | Uso |
| --- | --- |
| `Botao`, `BotaoBloqueado` | Pílulas: `primario` (gradiente, só a ação principal), `secundario`, `terciario`, `destrutivo`, `escuro`. `href` vira link. Bloqueado = cadeado + explicação. |
| `Estado`, `Etiqueta`, `Aviso`, `IconesEstado` | Estados sempre com ícone + texto + cor; etiqueta neutra; faixa de aviso (`tom="pessego"` para dicas). |
| `Campo`, `CampoSelecao` | Campo com rótulo, `*`, ajuda e erro (“Complete o e-mail. Ex.: …”). |
| `Segmentado` | Controle em pílula (abas de período). |
| `Abas` | Abas sublinhadas (página do evento). |
| `Etapas`, `etapasAte` | Indicador de etapas (submissão, fases do evento). |
| `BuscaSegmentada` | Busca em vidro Buscar · Onde · Quando · Filtros. |
| `BlocosArea` | Blocos de área da busca. |
| `CardEvento`, `SituacaoSubmissoes`, `precoAPartirDe` | Card de evento da identidade 3.7. |
| `Trilha`, `CabecalhoPagina`, `BarraProgresso`, `CardNumero`, `Avatar` | Básicos de página. |
| `useToast`, `FaixaConfirmacao` | Aviso em Ameixa com identificador e próximo passo. |
| `NavBar`, `PainelAvisos`, `SeletorPapel`, `Logo` | Já montados no layout raiz. |

Classes globais úteis: `.container`, `.pagina`, `.pilha`, `.pilha-1`, `.pilha-3`, `.linha`, `.linha-1`, `.entre`, `.com-lateral` (conteúdo + coluna de 380px), `.grade-cards`, `.card`, `.card-suave`, `.card-destaque` (borda Ameixa 2px, como a caixa de inscrição), `.vidro`, `.vidro-escuro`, `.dica`, `.pares` (lista `dl` rótulo/valor), `.tabela-envoltorio` + `.tabela` (`td.codigo` para códigos), `.entrada`, `.apoio`, `.corpo-apoio`, `.sobrelinha`, `.tabular`, `.sr-only`.

Formatação em `src/lib/formato.ts`: `prazo(iso)` → “15/11/2026, 23:59 (BRT)”, `periodoExtenso`, `periodoCurto`, `dinheiro`, `numero`, `porcentagem`, `diasEntre`.

## Regras de design (resumo de `docs/contexto.md`)

- Texto sobre o gradiente é Ameixa, nunca branco. Só uma ação primária (gradiente) por área.
- Vidro só no que flutua (navegação, busca, avisos). Formulários longos, pareceres e tabelas em superfície sólida.
- Bricolage só de 22 px para cima (`h1`, `h2`, `h3` já usam); abaixo, Inter.
- Prazos com dia, hora e fuso. Datas e códigos com algarismos tabulares.
- Alvos de toque ≥ 44 × 44, foco visível, contraste AA.
