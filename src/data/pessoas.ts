import type { Papel, Pessoa } from "./tipos";

export const PESSOAS: Pessoa[] = [
  {
    id: "ana",
    nome: "Ana Ribeiro",
    iniciais: "AR",
    email: "ana.ribeiro@ufba.br",
    instituicao: "UFBA",
    vinculo: "Pós-graduação",
    temConta: true,
    areas: ["Cidades inteligentes", "Governo aberto"],
    concordancia: "feminino",
  },
  {
    id: "luiz",
    nome: "Luiz Pereira",
    iniciais: "LP",
    email: "luiz.pereira@ifba.edu.br",
    instituicao: "IFBA",
    vinculo: "Docente",
    temConta: false,
  },
  {
    id: "paulo",
    nome: "Paulo Silva",
    iniciais: "PS",
    email: "paulo.silva@ufrb.edu.br",
    instituicao: "UFRB",
    vinculo: "Docente",
    temConta: true,
    areas: ["Cidades inteligentes"],
  },
  {
    id: "marta",
    nome: "Marta Souza",
    iniciais: "MS",
    email: "marta.souza@ufba.br",
    instituicao: "UFBA",
    vinculo: "Docente",
    temConta: true,
  },
  {
    id: "rafael",
    nome: "Rafael Lima",
    iniciais: "RL",
    email: "rafael.lima@dados.gov.br",
    instituicao: "Dados.gov",
    vinculo: "Profissional",
    temConta: true,
  },
  {
    id: "helena",
    nome: "Helena Martins",
    iniciais: "HM",
    email: "helena.martins@usp.br",
    instituicao: "USP",
    vinculo: "Docente",
    temConta: true,
  },
  {
    id: "carla",
    nome: "Carla Dias",
    iniciais: "CD",
    email: "carla.dias@ufpe.br",
    instituicao: "UFPE",
    vinculo: "Pós-graduação",
    temConta: true,
  },
  {
    id: "marcos",
    nome: "Marcos Teles",
    iniciais: "MT",
    email: "marcos.teles@ufc.br",
    instituicao: "UFC",
    vinculo: "Docente",
    temConta: true,
    areas: ["Cidades inteligentes", "Mobilidade"],
  },
  {
    id: "juliana",
    nome: "Juliana Costa",
    iniciais: "JC",
    email: "juliana.costa@ufpe.br",
    instituicao: "UFPE",
    vinculo: "Docente",
    temConta: true,
    areas: ["Qualidade de dados"],
  },
  {
    id: "roberto",
    nome: "Roberto Alves",
    iniciais: "RA",
    email: "roberto.alves@usp.br",
    instituicao: "USP",
    vinculo: "Docente",
    temConta: true,
    areas: ["Transparência", "Governo aberto"],
  },
  {
    id: "fernanda",
    nome: "Fernanda Lima",
    iniciais: "FL",
    email: "fernanda.lima@ufmg.br",
    instituicao: "UFMG",
    vinculo: "Docente",
    temConta: true,
    areas: ["Qualidade de dados", "Metadados"],
  },
  {
    id: "tiago",
    nome: "Tiago Moreira",
    iniciais: "TM",
    email: "tiago.moreira@ifba.edu.br",
    instituicao: "IFBA",
    vinculo: "Docente",
    temConta: false,
    areas: ["Transparência"],
  },
  {
    id: "beatriz",
    nome: "Beatriz Nunes",
    iniciais: "BN",
    email: "beatriz.nunes@ufba.br",
    instituicao: "UFBA",
    vinculo: "Pós-graduação",
    temConta: true,
  },
];

export function pessoa(id: string | null | undefined): Pessoa | undefined {
  if (!id) return undefined;
  return PESSOAS.find((p) => p.id === id);
}

/**
 * Pessoa que “está logada” em cada papel da demonstração.
 * Participante e autor são a mesma conta (Ana); o papel muda com o evento.
 */
export const PESSOA_POR_PAPEL: Record<Papel, string | null> = {
  visitante: null,
  participante: "ana",
  autor: "ana",
  revisor: "paulo",
  organizador: "marta",
};

export const NOME_PAPEL: Record<Papel, string> = {
  visitante: "Visitante",
  participante: "Participante",
  autor: "Autor",
  revisor: "Revisor",
  organizador: "Organizador",
};
