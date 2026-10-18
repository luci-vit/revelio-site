"use client";

import { AlertTriangle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { BarraProgresso, CabecalhoPagina, CardNumero } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Aviso } from "@/components/Estado";
import { Etapas, etapasAte } from "@/components/Etapas";
import { PAINEL_SBDA } from "@/data/alcance";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, eventosOrganizados } from "@/data/selectors";
import type { Evento } from "@/data/tipos";
import { data, numero, prazo } from "@/lib/formato";
import { AcessoOrganizacao, EventoNaoEncontrado } from "../comum/AcessoOrganizacao";
import { numerosDoPainel } from "./numeros";
import styles from "./PainelEvento.module.css";

const FASES = ["Inscrições", "Submissões", "Revisão", "Seleção", "Publicação", "Certificados"];

const INDICE_FASE: Record<NonNullable<Evento["fase"]>, number> = {
  inscricoes: 0,
  submissoes: 1,
  revisao: 2,
  selecao: 3,
  publicacao: 4,
  certificados: 5,
  encerrado: 6,
};

/** Índice da fase em andamento (6 = todas concluídas). */
export function faseAtual(evento: Evento) {
  let i = INDICE_FASE[evento.fase ?? "inscricoes"];
  if (evento.resultadoPublicado) i = Math.max(i, 5);
  if (evento.certificadosEmitidos) i = 6;
  return i;
}

function textoDaFase(evento: Evento, i: number) {
  const p = evento.prazos;
  switch (i) {
    case 0:
      return p.submissoesAbrem ? `submissões abrem em ${prazo(p.submissoesAbrem)}` : null;
    case 1:
      return p.submissoes ? `termina em ${prazo(p.submissoes)}` : null;
    case 2:
      return p.revisao ? `termina em ${prazo(p.revisao)}` : null;
    case 3:
      return p.resultado ? `resultado até ${prazo(p.resultado)}` : null;
    case 4:
      return "resultado ainda não publicado";
    case 5:
      return `certificados depois do evento (${data(evento.dataFim)})`;
    default:
      return "certificados emitidos";
  }
}

function menosDias(iso: string, dias: number) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d - dias));
  return dt.toISOString().slice(0, 10);
}

export function PainelEvento({ slug }: { slug: string }) {
  const { estado, usuario } = useEstado();
  const router = useRouter();
  const idSeletor = useId();
  const evento = eventoPorSlug(estado, slug);

  if (!evento) return <EventoNaoEncontrado slug={slug} />;

  const n = numerosDoPainel(estado, slug);
  const atual = faseAtual(evento);
  const nomeFase = atual < FASES.length ? FASES[atual] : "Concluído";
  const complemento = textoDaFase(evento, atual);
  const meus = eventosOrganizados(estado, usuario?.id);
  const lembrete =
    slug === "sbda-2027" ? PAINEL_SBDA.lembreteRevisores : evento.prazos.revisao ? menosDias(evento.prazos.revisao, 3) : null;

  return (
    <div className={styles.painel}>
      <CabecalhoPagina
        titulo={evento.nome}
        descricao={
          <>
            Fase atual: <strong className={styles.fase}>{nomeFase}</strong>
            {complemento ? <span className="tabular"> · {complemento}</span> : null}
          </>
        }
        acoes={
          <div className={styles.acoes}>
            {meus.length > 1 ? (
              <div className={styles.seletor}>
                <label htmlFor={idSeletor} className="sr-only">
                  Trocar de evento
                </label>
                <select
                  id={idSeletor}
                  className="entrada"
                  value={slug}
                  onChange={(e) => router.push(`/organizacao/${e.target.value}`)}
                >
                  {meus.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {e.nomeCurto}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <Botao variante="secundario" tamanho="pequeno" href="/organizacao/novo-evento" icone={<Plus size={18} aria-hidden="true" />}>
              Criar evento
            </Botao>
          </div>
        }
      />

      <section aria-labelledby="titulo-fases" className={styles.fases}>
        <h2 id="titulo-fases" className="sr-only">
          Fases do evento
        </h2>
        <Etapas etapas={etapasAte(FASES, atual)} rotulo="Fases do evento" />
      </section>

      <section aria-label="Números do evento" className={styles.numeros}>
        <CardNumero rotulo="Inscritos" valor={<span className="tabular">{numero(n.inscritos)}</span>} />
        <CardNumero rotulo="Trabalhos recebidos" valor={<span className="tabular">{numero(n.trabalhosRecebidos)}</span>} />
        <CardNumero
          rotulo="Revisores (aceitos)"
          valor={<span className="tabular">{numero(n.revisoresAceitos)}</span>}
          complemento={`de ${numero(n.revisoresConvidados)} convidados`}
        />
        <CardNumero
          rotulo="Pareceres concluídos"
          valor={<span className="tabular">{numero(n.pareceresConcluidos)}</span>}
          complemento={`de ${numero(n.pareceresTotal)}`}
        >
          <BarraProgresso valor={n.pareceresConcluidos} total={n.pareceresTotal} rotulo="Pareceres concluídos" />
        </CardNumero>
      </section>

      {atual === 2 && n.trabalhosComUmParecer > 0 ? (
        <Aviso
          tom="atencao"
          icone={<AlertTriangle size={20} aria-hidden="true" />}
          acao={
            <Botao variante="secundario" href={`/organizacao/${slug}/trabalhos`}>
              Ver pendências
            </Botao>
          }
        >
          <strong>
            {n.trabalhosComUmParecer} {n.trabalhosComUmParecer === 1 ? "trabalho" : "trabalhos"}
          </strong>{" "}
          ainda {n.trabalhosComUmParecer === 1 ? "tem" : "têm"} só 1 parecer.
          {lembrete ? (
            <>
              {" "}
              Revisores com pendência recebem lembrete em <span className="tabular">{data(lembrete)}</span>.
            </>
          ) : null}
        </Aviso>
      ) : null}
    </div>
  );
}

export function PaginaPainel({ slug }: { slug: string }) {
  return (
    <AcessoOrganizacao>
      <PainelEvento slug={slug} />
    </AcessoOrganizacao>
  );
}
