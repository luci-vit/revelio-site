// Tipos do cenário fictício do Revelio. Sem backend: tudo vive em memória.

export type Papel = "visitante" | "participante" | "autor" | "revisor" | "organizador";

export type Formato = "Presencial" | "On-line" | "Híbrido";

/** Blocos de área usados na busca (B1). */
export type GrupoArea = "Computação" | "Saúde" | "Educação" | "Ambiente" | "Ciência de Dados";

export type SituacaoSubmissoes = "aberta" | "em-breve" | "encerrada";

export interface Pessoa {
  id: string;
  nome: string;
  iniciais: string;
  email: string;
  instituicao: string;
  /** Ex.: "Pós-graduação", "Docente", "Profissional". */
  vinculo: string;
  temConta: boolean;
  /** Áreas de interesse/atuação (usadas no comitê e na distribuição). */
  areas?: string[];
}

export interface Categoria {
  id: "graduacao" | "pos-graduacao" | "profissional" | "gratuita";
  nome: string;
  preco: number;
}

export interface Sessao {
  id: string;
  /** ISO, só a data: "2027-02-03". */
  dia: string;
  inicio: string; // "09:00"
  fim: string; // "10:00"
  titulo: string;
  tipo: "Palestra magna" | "Oficina" | "Palestra" | "Mesa-redonda" | "Pôsteres" | "Apresentação oral" | "Painel" | "Minicurso";
  responsavel?: string;
  sala: string;
  area?: string;
  /** Pessoas que adicionaram a sessão à grade (app). */
  naGrade?: number;
  cancelada?: boolean;
  /** Ids de sessões com conflito de horário. */
  conflitaCom?: string[];
}

export interface Prazos {
  /** ISO com fuso de Brasília, ex.: "2026-11-15T23:59:00-03:00". */
  submissoesAbrem?: string;
  submissoes?: string;
  revisao?: string;
  resultado?: string;
  versaoFinal?: string;
}

export interface Evento {
  slug: string;
  /** Prefixo de códigos de trabalhos e ingressos, ex.: "SBDA". */
  sigla: string;
  nome: string;
  nomeCurto: string;
  /** Texto curto para a capa do card, ex.: "Dados Abertos". */
  tituloCapa: string;
  area: string;
  grupoArea: GrupoArea;
  formato: Formato;
  /** ISO, só a data. */
  dataInicio: string;
  dataFim: string;
  horario?: string; // "8h às 18h (BRT)"
  local: {
    cidade?: string;
    uf?: string;
    instituicao?: string;
    endereco?: string;
    online: boolean;
  };
  organizacao: string;
  organizadorId?: string;
  vagas: number;
  vagasDisponiveis: number;
  categorias: Categoria[];
  prazos: Prazos;
  situacaoSubmissoes: SituacaoSubmissoes;
  encerrado: boolean;
  descricao: string;
  publico: string;
  formatosAceitos: string;
  areasTematicas: string[];
  programacao: Sessao[];
  /** Gradiente da capa (sem foto no protótipo). */
  capa: string;
  /** Fase atual no painel da organização (E2). */
  fase?: "inscricoes" | "submissoes" | "revisao" | "selecao" | "publicacao" | "certificados" | "encerrado";
  resultadoPublicado?: boolean;
  certificadosEmitidos?: boolean;
}

export interface Cupom {
  codigo: string;
  divulgador: string;
  desconto: number; // 0.1 = 10%
  eventoSlug: string;
}

export type SituacaoInscricao = "inscrita" | "encerrado" | "cancelada";

export interface Inscricao {
  id: string;
  eventoSlug: string;
  pessoaId: string;
  categoriaId: Categoria["id"];
  /** Código do ingresso / crachá, ex.: "SBDA-1187". */
  ingresso: string;
  cupom?: string;
  valorPago: number;
  situacao: SituacaoInscricao;
  /** ISO. */
  data: string;
  certificadoDisponivel?: boolean;
  /** Como a pessoa vai participar (B3). Sem valor: formato do evento. */
  modalidade?: "Presencial" | "On-line";
  /** Nome impresso no crachá (B3). Sem valor: nome da conta. */
  nomeCracha?: string;
}

export interface Autor {
  nome: string;
  email: string;
  instituicao: string;
  temConta: boolean;
  inscrito: boolean;
  pessoaId?: string;
  apresentador?: boolean;
}

export type SituacaoTrabalho =
  | "rascunho"
  | "enviado"
  | "em-revisao"
  | "aprovado"
  | "aprovado-com-ajustes"
  | "rejeitado";

export type EtapaSubmissao = "dados" | "autores" | "arquivo" | "conferir";

export interface Arquivo {
  nome: string;
  paginas: number;
  tamanho: string; // "1,8 MB"
  enviadoEm?: string; // ISO
}

export interface Trabalho {
  codigo: string;
  eventoSlug: string;
  titulo: string;
  resumo: string;
  palavrasChave: string[];
  area: string;
  modalidade: "Artigo completo" | "Resumo expandido";
  autores: Autor[];
  /** Pessoa que enviou (autora responsável). */
  responsavelId: string;
  arquivo?: Arquivo;
  situacao: SituacaoTrabalho;
  /** Para rascunhos: em que etapa a submissão parou. */
  etapa?: EtapaSubmissao;
  /** Hora do último salvamento do rascunho ("14:32"). */
  salvoEm?: string;
  /** Revisores atribuídos (até 2). */
  revisores: (string | null)[];
  versaoAjustada?: Arquivo;
  /** Orientação da comissão ao autor junto com a decisão (C5). */
  orientacaoComissao?: string;
  apresentacao?: { dia: string; inicio: string; sala: string };
  /**
   * O SBDA-0042 começa como rascunho para que o fluxo C2→C4 possa ser
   * demonstrado, mas as telas posteriores ao prazo (D2, E4, E5…) o tratam
   * como enviado. Ver `trabalhosSubmetidos` em selectors.ts.
   */
  fluxoDemonstracao?: boolean;
}

export type Recomendacao = "aceitar" | "aceitar-com-ajustes" | "rejeitar";

export interface Parecer {
  id: string;
  trabalhoCodigo: string;
  revisorId: string;
  situacao: "pendente" | "rascunho" | "concluido";
  recomendacao?: Recomendacao;
  /** Notas de 1 a 5. */
  notas?: {
    originalidade?: number;
    relevancia?: number;
    metodologia?: number;
    clareza?: number;
  };
  comentarioAutores?: string;
  comentarioOrganizacao?: string;
  concluidoEm?: string; // ISO
}

export interface ConviteRevisao {
  id: string;
  eventoSlug: string;
  pessoaId: string;
  convidadoPorId: string;
  area: string;
  trabalhosPrevistos: number;
  situacao: "pendente" | "aceito" | "recusado";
  enviadoEm: string; // ISO
}

export type Decisao = "aprovado" | "aprovado-com-ajustes" | "rejeitado";

export type TipoNotificacao = "convite" | "prazo" | "resultado" | "certificado" | "inscricao" | "horario" | "parecer";

export interface Notificacao {
  id: string;
  pessoaId: string;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  quando: string; // texto pronto: "há 2 h", "ontem", "12/10/2026"
  acao?: { rotulo: string; href: string };
  lida: boolean;
}
