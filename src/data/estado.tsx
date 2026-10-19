"use client";

// Estado em memória da demonstração (sem backend). Guardado no sessionStorage
// só para sobreviver a um recarregamento da página durante a apresentação.

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { EVENTOS } from "./eventos";
import { PESSOA_POR_PAPEL, pessoa } from "./pessoas";
import {
  CONVITES_INICIAIS,
  DECISOES_INICIAIS,
  INSCRICOES_INICIAIS,
  NOTIFICACOES_INICIAIS,
  PARECERES_INICIAIS,
  TRABALHOS_INICIAIS,
} from "./seed";
import type {
  Categoria,
  ConviteRevisao,
  Decisao,
  Evento,
  Inscricao,
  Notificacao,
  Papel,
  Parecer,
  Pessoa,
  Trabalho,
} from "./tipos";

export interface Estado {
  papel: Papel;
  /** Nome digitado em "Criar conta" (A2). Só para personalizar A3. */
  contaNova?: { nome: string; email: string };
  eventos: Evento[];
  inscricoes: Inscricao[];
  trabalhos: Trabalho[];
  pareceres: Parecer[];
  convites: ConviteRevisao[];
  decisoes: Record<string, Decisao>;
  notificacoes: Notificacao[];
  /** Eventos salvos (coração do card). */
  salvos: string[];
}

export const ESTADO_INICIAL: Estado = {
  papel: "visitante",
  eventos: EVENTOS,
  inscricoes: INSCRICOES_INICIAIS,
  trabalhos: TRABALHOS_INICIAIS,
  pareceres: PARECERES_INICIAIS,
  convites: CONVITES_INICIAIS,
  decisoes: DECISOES_INICIAIS,
  notificacoes: NOTIFICACOES_INICIAIS,
  salvos: [],
};

export type Acao =
  | { tipo: "definirPapel"; papel: Papel }
  | { tipo: "criarConta"; nome: string; email: string }
  | { tipo: "alternarSalvo"; eventoSlug: string }
  | {
      tipo: "inscrever";
      eventoSlug: string;
      pessoaId: string;
      categoriaId: Categoria["id"];
      cupom?: string;
      valorPago: number;
      ingresso: string;
      modalidade?: Inscricao["modalidade"];
      nomeCracha?: string;
    }
  | { tipo: "salvarTrabalho"; trabalho: Trabalho }
  | { tipo: "enviarTrabalho"; codigo: string }
  | { tipo: "enviarVersaoAjustada"; codigo: string; arquivo: NonNullable<Trabalho["versaoAjustada"]> }
  | { tipo: "responderConvite"; conviteId: string; resposta: "aceito" | "recusado" }
  | { tipo: "convidarRevisor"; convite: ConviteRevisao }
  | { tipo: "cancelarConvite"; conviteId: string }
  | { tipo: "salvarParecer"; parecer: Parecer }
  | { tipo: "atribuirRevisor"; codigo: string; posicao: 0 | 1; revisorId: string | null }
  | { tipo: "distribuirAutomaticamente"; eventoSlug: string }
  | { tipo: "definirDecisao"; codigo: string; decisao: Decisao | null }
  | { tipo: "publicarResultado"; eventoSlug: string }
  | { tipo: "emitirCertificados"; eventoSlug: string }
  | { tipo: "salvarEvento"; evento: Evento }
  | { tipo: "marcarLida"; notificacaoId: string }
  | { tipo: "marcarTodasLidas"; pessoaId: string }
  | { tipo: "adicionarNotificacao"; notificacao: Notificacao }
  | { tipo: "reiniciar" };

/** Quem é autor/coautor de um trabalho não pode revisá-lo. */
export function conflitoDeInteresse(t: Trabalho, revisorId: string) {
  return t.autores.some((a) => a.pessoaId === revisorId) || t.responsavelId === revisorId;
}

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case "definirPapel":
      return { ...estado, papel: acao.papel };

    case "criarConta":
      return { ...estado, papel: "participante", contaNova: { nome: acao.nome, email: acao.email } };

    case "alternarSalvo":
      return {
        ...estado,
        salvos: estado.salvos.includes(acao.eventoSlug)
          ? estado.salvos.filter((s) => s !== acao.eventoSlug)
          : [...estado.salvos, acao.eventoSlug],
      };

    case "inscrever": {
      const jaExiste = estado.inscricoes.some(
        (i) => i.eventoSlug === acao.eventoSlug && i.pessoaId === acao.pessoaId && i.situacao !== "cancelada",
      );
      if (jaExiste) return estado;
      const nova: Inscricao = {
        id: `i-${acao.eventoSlug}-${acao.pessoaId}`,
        eventoSlug: acao.eventoSlug,
        pessoaId: acao.pessoaId,
        categoriaId: acao.categoriaId,
        ingresso: acao.ingresso,
        cupom: acao.cupom,
        valorPago: acao.valorPago,
        modalidade: acao.modalidade,
        nomeCracha: acao.nomeCracha,
        situacao: "inscrita",
        data: new Date().toISOString(),
      };
      return {
        ...estado,
        inscricoes: [...estado.inscricoes, nova],
        eventos: estado.eventos.map((e) =>
          e.slug === acao.eventoSlug ? { ...e, vagasDisponiveis: Math.max(0, e.vagasDisponiveis - 1) } : e,
        ),
      };
    }

    case "salvarTrabalho": {
      const existe = estado.trabalhos.some((t) => t.codigo === acao.trabalho.codigo);
      return {
        ...estado,
        trabalhos: existe
          ? estado.trabalhos.map((t) => (t.codigo === acao.trabalho.codigo ? acao.trabalho : t))
          : [...estado.trabalhos, acao.trabalho],
      };
    }

    case "enviarTrabalho":
      return {
        ...estado,
        trabalhos: estado.trabalhos.map((t) =>
          t.codigo === acao.codigo ? { ...t, situacao: "enviado", etapa: undefined } : t,
        ),
      };

    case "enviarVersaoAjustada":
      return {
        ...estado,
        trabalhos: estado.trabalhos.map((t) =>
          t.codigo === acao.codigo ? { ...t, versaoAjustada: acao.arquivo } : t,
        ),
      };

    case "responderConvite":
      return {
        ...estado,
        convites: estado.convites.map((c) => (c.id === acao.conviteId ? { ...c, situacao: acao.resposta } : c)),
      };

    case "convidarRevisor":
      return { ...estado, convites: [...estado.convites, acao.convite] };

    case "cancelarConvite":
      return { ...estado, convites: estado.convites.filter((c) => c.id !== acao.conviteId) };

    case "salvarParecer": {
      const existe = estado.pareceres.some((p) => p.id === acao.parecer.id);
      return {
        ...estado,
        pareceres: existe
          ? estado.pareceres.map((p) => (p.id === acao.parecer.id ? acao.parecer : p))
          : [...estado.pareceres, acao.parecer],
      };
    }

    case "atribuirRevisor": {
      const trabalhos = estado.trabalhos.map((t) => {
        if (t.codigo !== acao.codigo) return t;
        const revisores = [...t.revisores];
        while (revisores.length < 2) revisores.push(null);
        revisores[acao.posicao] = acao.revisorId;
        return { ...t, revisores };
      });
      // Quem saiu do trabalho perde o parecer ainda não concluído (sai da fila dele).
      const anterior = estado.trabalhos.find((t) => t.codigo === acao.codigo)?.revisores[acao.posicao] ?? null;
      let pareceres =
        anterior && anterior !== acao.revisorId
          ? estado.pareceres.filter(
              (p) => !(p.trabalhoCodigo === acao.codigo && p.revisorId === anterior && p.situacao !== "concluido"),
            )
          : estado.pareceres;
      if (acao.revisorId && !pareceres.some((p) => p.trabalhoCodigo === acao.codigo && p.revisorId === acao.revisorId)) {
        pareceres = [
          ...pareceres,
          { id: `p-${acao.codigo}-${acao.revisorId}`, trabalhoCodigo: acao.codigo, revisorId: acao.revisorId, situacao: "pendente" },
        ];
      }
      return { ...estado, trabalhos, pareceres };
    }

    case "distribuirAutomaticamente": {
      // Revisores que aceitaram o convite, preferindo a mesma área e quem tem menos trabalhos.
      const aceitos = estado.convites.filter((c) => c.eventoSlug === acao.eventoSlug && c.situacao === "aceito");
      const carga = new Map<string, number>();
      for (const t of estado.trabalhos) for (const r of t.revisores) if (r) carga.set(r, (carga.get(r) ?? 0) + 1);
      let pareceres = estado.pareceres;
      const trabalhos = estado.trabalhos.map((t) => {
        if (t.eventoSlug !== acao.eventoSlug || (t.situacao === "rascunho" && !t.fluxoDemonstracao)) return t;
        const revisores = [...t.revisores];
        while (revisores.length < 2) revisores.push(null);
        for (const pos of [0, 1] as const) {
          if (revisores[pos]) continue;
          const candidatos = aceitos
            .filter((c) => !revisores.includes(c.pessoaId) && !conflitoDeInteresse(t, c.pessoaId))
            .sort(
              (a, b) =>
                Number(b.area === t.area) - Number(a.area === t.area) ||
                (carga.get(a.pessoaId) ?? 0) - (carga.get(b.pessoaId) ?? 0),
            );
          const escolhido = candidatos[0];
          if (!escolhido) continue;
          revisores[pos] = escolhido.pessoaId;
          carga.set(escolhido.pessoaId, (carga.get(escolhido.pessoaId) ?? 0) + 1);
          pareceres = [
            ...pareceres,
            {
              id: `p-${t.codigo}-${escolhido.pessoaId}`,
              trabalhoCodigo: t.codigo,
              revisorId: escolhido.pessoaId,
              situacao: "pendente",
            },
          ];
        }
        return { ...t, revisores };
      });
      return { ...estado, trabalhos, pareceres };
    }

    case "definirDecisao": {
      const decisoes = { ...estado.decisoes };
      if (acao.decisao) decisoes[acao.codigo] = acao.decisao;
      else delete decisoes[acao.codigo];
      return { ...estado, decisoes };
    }

    case "publicarResultado":
      return {
        ...estado,
        eventos: estado.eventos.map((e) =>
          e.slug === acao.eventoSlug ? { ...e, resultadoPublicado: true, fase: "publicacao" } : e,
        ),
        trabalhos: estado.trabalhos.map((t) =>
          t.eventoSlug === acao.eventoSlug && estado.decisoes[t.codigo]
            ? { ...t, situacao: estado.decisoes[t.codigo] }
            : t,
        ),
      };

    case "emitirCertificados":
      return {
        ...estado,
        eventos: estado.eventos.map((e) =>
          e.slug === acao.eventoSlug ? { ...e, certificadosEmitidos: true, fase: "certificados" } : e,
        ),
      };

    case "salvarEvento": {
      const existe = estado.eventos.some((e) => e.slug === acao.evento.slug);
      return {
        ...estado,
        eventos: existe
          ? estado.eventos.map((e) => (e.slug === acao.evento.slug ? acao.evento : e))
          : [...estado.eventos, acao.evento],
      };
    }

    case "marcarLida":
      return {
        ...estado,
        notificacoes: estado.notificacoes.map((n) => (n.id === acao.notificacaoId ? { ...n, lida: true } : n)),
      };

    case "marcarTodasLidas":
      return {
        ...estado,
        notificacoes: estado.notificacoes.map((n) => (n.pessoaId === acao.pessoaId ? { ...n, lida: true } : n)),
      };

    case "adicionarNotificacao":
      return { ...estado, notificacoes: [acao.notificacao, ...estado.notificacoes] };

    case "reiniciar":
      return ESTADO_INICIAL;
  }
}

interface ContextoEstado {
  estado: Estado;
  despachar: (acao: Acao) => void;
  /** Pessoa “logada” no papel atual (null para visitante). */
  usuario: Pessoa | null;
  papel: Papel;
  definirPapel: (papel: Papel) => void;
}

const Contexto = createContext<ContextoEstado | null>(null);

const CHAVE = "revelio-estado-v1";

export function EstadoProvider({ children }: { children: ReactNode }) {
  // `pronto` só vira true depois que o estado guardado foi aplicado; antes disso
  // não salvamos, senão ESTADO_INICIAL sobrescreveria o que estava guardado.
  const [{ estado, pronto }, despacharInterno] = useReducer(
    (
      atual: { estado: Estado; pronto: boolean },
      acao: Acao | { tipo: "restaurar"; estado: Estado | null },
    ) =>
      acao.tipo === "restaurar"
        ? { estado: acao.estado ?? atual.estado, pronto: true }
        : { ...atual, estado: reducer(atual.estado, acao) },
    { estado: ESTADO_INICIAL, pronto: false },
  );

  // Restaura depois da hidratação para não divergir do HTML do servidor.
  useEffect(() => {
    let salvo: Estado | null = null;
    try {
      const bruto = sessionStorage.getItem(CHAVE);
      if (bruto) salvo = { ...ESTADO_INICIAL, ...(JSON.parse(bruto) as Partial<Estado>) };
      // Acrescenta a nova participante ao cenário anterior sem apagar a demonstração salva.
      const participanteId = PESSOA_POR_PAPEL.participante;
      if (salvo && !salvo.inscricoes.some((i) => i.pessoaId === participanteId)) {
        const notificacoesSalvas = new Set(salvo.notificacoes.map((n) => n.id));
        salvo.inscricoes = [
          ...salvo.inscricoes,
          ...INSCRICOES_INICIAIS.filter((i) => i.pessoaId === participanteId),
        ];
        salvo.notificacoes = [
          ...NOTIFICACOES_INICIAIS.filter(
            (n) => n.pessoaId === participanteId && !notificacoesSalvas.has(n.id),
          ),
          ...salvo.notificacoes,
        ];
      }
    } catch {
      // sem storage: segue com o estado inicial
    }
    despacharInterno({ tipo: "restaurar", estado: salvo });
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      // ignora
    }
  }, [estado, pronto]);

  const despachar = useCallback((acao: Acao) => despacharInterno(acao), []);

  const valor = useMemo<ContextoEstado>(() => {
    const id = PESSOA_POR_PAPEL[estado.papel];
    return {
      estado,
      despachar,
      usuario: pessoa(id) ?? null,
      papel: estado.papel,
      definirPapel: (papel) => despachar({ tipo: "definirPapel", papel }),
    };
  }, [estado, despachar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useEstado precisa estar dentro de <EstadoProvider>");
  return ctx;
}
