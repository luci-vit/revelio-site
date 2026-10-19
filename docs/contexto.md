# Revelio — contexto do projeto

Trabalho da disciplina Interação Humano-Computador (IHC 2026.2). Integrantes: Eduardo Veneza, Ma Qi Chao, Caio Lopes e Lucian Nascimento.

O documento oficial do projeto (análise de correlatas, identidade visual, perfis, mapas de navegação e protótipo de baixa fidelidade) está no Claude Docs: "Revelio — Documentação do projeto de IHC". Este arquivo resume o que o código precisa respeitar.

## O que é
Plataforma para criar, divulgar e viver **vários** eventos científicos (congressos, simpósios, workshops). Uma conta por pessoa, papéis por evento. Duas frentes com a mesma conta:

- **Site** (repositório `revelio-site`, Next.js): organizador, autor e revisor. O participante também pode usar.
- **App** (repositório `revelio-app`, React Native + Expo): participante, palestrante e organizador no dia do evento.

## Escopo do protótipo de alta fidelidade
- **Só dados fictícios**, sem backend, login real ou pagamento real. Tudo vem de arquivos de dados locais e o estado vive em memória.
- Deve ser navegável e clicável do começo ao fim de cada fluxo.
- Textos da interface em português do Brasil.

## Perfis e regras que a interface precisa mostrar
- Perfis: Visitante, Conta, Participante, Autor, Revisor, Palestrante, Organizador.
- O menu do organizador tem apenas **Eventos** e **Organização**, sem as abas pessoais **Minhas inscrições** e **Meus trabalhos**.
- **Revisor**: só por convite da organização e com inscrição no evento. Ninguém se cadastra como revisor.
- **Palestrante**: convidado pela organização (palestra, oficina, mesa) ou autor de trabalho aprovado marcado como apresentador.
- Submissão de trabalho e parecer existem **só no site**.
- **Cancelamento de sessão**: o palestrante avisa no app → a **organização sempre confirma** (cancelar, indicar substituto ou mudar horário) → quem tinha a sessão na grade recebe aviso e alternativas no mesmo horário, ordenadas pela mesma área. Enquanto a organização não decide, o palestrante pode desfazer o aviso.
- **Check-in**: a organização lê o QR code do ingresso no app; a presença é condição para o certificado. Pode ser feito na entrada ou por sala.
- Inscrição paga, com cupom de divulgador (ex.: UFBA10 = 10%).

## Cenário fictício (use estes dados)
- Evento principal: **IV Simpósio Brasileiro de Dados Abertos (SBDA 2027)**, 3 a 5 de fevereiro de 2027, Instituto de Computação da UFBA, Salvador (BA). 300 vagas.
- Categorias: Graduação R$ 40, Pós-graduação R$ 60, Profissional R$ 120.
- Prazos: submissões até 15/11/2026 23:59 (BRT); revisão até 10/12/2026 23:59; resultado 18/12/2026.
- Outros eventos: Jornada de IHC 2026 (20 e 21/11/2026, on-line, gratuita); Congresso Nordestino de Bioinformática (10 a 12/03/2027, Recife, UFPE, R$ 120); Congresso de Computação Aplicada 2026 (15 a 17/09/2026, encerrado).
- Pessoas: **Clara Almeida** (UFBA, graduação, participante sem trabalhos enviados, ingresso SBDA-1204); **Ana Ribeiro** (UFBA, pós-graduação, autora, ingresso SBDA-1187, trabalho SBDA-0042 "Dados abertos para cidades inclusivas", apresenta em 3/02 às 14h na Sala 2); Luiz Pereira (coautor, IFBA); **Paulo Silva** (revisor); **Marta Souza** (organizadora); **Rafael Lima** (palestrante da oficina "Publicando dados com qualidade", 3/02 10:30, Laboratório 3, 86 pessoas na grade, cancelada no dia).
- Programação de 3/02: 09:00 "Dados abertos e confiança pública" (palestra magna, Helena Martins, Auditório principal); 10:30 oficina de Rafael Lima (Lab 3); 10:30 "Mobilidade e dados de bilhetagem" (Carla Dias, Sala 2); 10:30 "Transparência nos municípios" (mesa-redonda, Sala 1); 10:30–11:00 "Pôsteres: qualidade de dados" (Hall); 14:00 apresentação de Ana; 16:00 "Dados e eleições" (painel, Sala 1); 16:00 "Minicurso de visualização" (Lab 3, conflita com o painel).
- Alcance (site, E7): 128 inscrições; 9.840 exibições do card → 2.310 cliques em "Ver evento" → 412 abriram a inscrição → 128 concluíram. Inscrições por semana a partir de 15/09: 6, 9, 14, 11, 10, 8, 12, 19, 22, 7, 5, 5. Cupons: UFBA10 (PPGCC-UFBA) 120 cliques/18 usos; LIGADADOS 210/14; DADOSBR 340/11; GOVLAB 35/7; NEWS 60/4. Origem: BA 46, SP 21, PE 14, MG 11, RJ 9, outros 27.

## Identidade visual
Imagens de referência em `docs/identidade/`. Tokens:

| Token | Valor | Uso |
| --- | --- | --- |
| Pôr do sol | gradiente 100° de #FF8A5C a #FF5C8A | Ação principal, ponto da marca, contador de avisos. Texto sobre ele é Ameixa, nunca branco. |
| Ameixa | #2B1631 | Texto, títulos, marca, superfícies escuras, item ativo de menu/segmento |
| Rosa profundo | #C2185B | Links, foco por teclado, botão terciário |
| Pêssego | #FFE6DC | Filtro ativo, seleção, hover, aviso não lido |
| Creme | #FFF8F4 | Fundo geral |
| Texto de apoio | #5E4A63 | Descrições, datas secundárias |
| Borda funcional | #8C7A8F | Contorno de campos e chips |
| Linha | #EFE3E0 | Divisórias e bordas de cards |
| Sucesso | #17723F sobre #E8F5EC | |
| Atenção | #A34700 sobre #FFF0E0 | |
| Erro | #B42318 sobre #FDECEA | |
| Informação | #2B1631 sobre #F3EAF4 | |

- Fontes: **Bricolage Grotesque** (700/800) nos títulos a partir de 22 px; **Inter** (400/500/600/700) no resto. Datas e códigos com algarismos tabulares.
- Formas: botões e chips em pílula (raio total), botão de 44 a 48 de altura; cards com raio 20; campos com raio 12 a 14.
- Vidro (inspirado no Scupp): branco a 58% a 93% com desfoque, borda branca translúcida. Usar só no que flutua: barra de navegação, busca, abas do app, painel de avisos. Nunca em formulários longos.
- Estados sempre com **ícone + texto + cor**, nunca só cor.
- Prazos sempre com dia, hora e fuso: "15/11/2026, 23:59 (BRT)".
- Acessibilidade: contraste AA (todas as combinações acima já passam), foco visível, alvos de toque de pelo menos 44 × 44.

## Como trabalhar neste repositório
- Antes de mudar algo, explique o que vai fazer em uma ou duas frases.
- Commits pequenos, um por tela ou componente, com mensagem em português.
- Rode a checagem de tipos e o lint antes de cada commit.
- Não invente telas fora do protótipo sem perguntar.
