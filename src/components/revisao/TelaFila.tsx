"use client";

import Link from "next/link";
import { BarraProgresso, CabecalhoPagina } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Aviso, Estado, IconesEstado } from "@/components/Estado";
import { HOJE_REVISAO } from "@/data/demo";
import { useEstado } from "@/data/estado";
import { convitesDaPessoa, eventoPorSlug, filaDoRevisor, inscricaoNoEvento } from "@/data/selectors";
import type { Parecer } from "@/data/tipos";
import { data, diasEntre, prazo } from "@/lib/formato";
import styles from "./Revisao.module.css";

/** Evento da demonstração em que Paulo revisa. */
const EVENTO = "sbda-2027";

/** Dia seguinte ao fim das submissões (distribuição), em ISO só-data. */
function diaSeguinte(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** “faltam 12 dias”, “falta 1 dia”, “termina hoje”, “prazo encerrado”. */
export function textoFaltam(prazoIso: string) {
  const n = diasEntre(HOJE_REVISAO, prazoIso);
  if (n > 1) return `faltam ${n} dias`;
  if (n === 1) return "falta 1 dia";
  if (n === 0) return "termina hoje";
  return "prazo encerrado";
}

/** D2 — Fila de revisões atribuídas. */
export function TelaFila() {
  const { estado, usuario } = useEstado();
  const evento = eventoPorSlug(estado, EVENTO);
  const convite = convitesDaPessoa(estado, usuario?.id).find((c) => c.eventoSlug === EVENTO);

  if (!evento) return null;
  const titulo = `Revisões · ${evento.nome}`;

  if (!usuario || !convite || convite.situacao !== "aceito") {
    return (
      <div className="container pagina">
        <CabecalhoPagina titulo={titulo} />
        {convite && convite.situacao === "pendente" ? (
          <Aviso tom="pessego" acao={<Botao tamanho="pequeno" href={`/convites/${convite.id}`}>Responder convite</Botao>}>
            <strong>Você ainda não respondeu ao convite.</strong> A fila de revisões aparece depois do aceite.
          </Aviso>
        ) : convite && convite.situacao === "recusado" ? (
          <Aviso tom="info" acao={<Botao variante="secundario" tamanho="pequeno" href={`/convites/${convite.id}`}>Ver convite</Botao>}>
            <strong>Você recusou o convite para este evento.</strong> Não há trabalhos para revisar.
          </Aviso>
        ) : (
          <Aviso tom="info">
            <strong>Você não tem revisões neste evento.</strong> Revisores entram só por convite da organização. Na
            demonstração, escolha o papel <strong>Revisor</strong> no seletor do canto inferior direito.
          </Aviso>
        )}
      </div>
    );
  }

  const fila = filaDoRevisor(estado, usuario.id, EVENTO).filter((x) => !x.parecer.conflito);
  const concluidos = fila.filter((x) => x.parecer.situacao === "concluido").length;
  const inscrito = Boolean(inscricaoNoEvento(estado, usuario.id, EVENTO));
  const prazoRevisao = evento.prazos.revisao;
  const distribuicao = evento.prazos.submissoes ? diaSeguinte(evento.prazos.submissoes) : undefined;

  return (
    <div className="container pagina pilha-3">
      <CabecalhoPagina titulo={titulo} />

      <div className={styles.resumo}>
        <div className={styles.progresso}>
          <p>
            <strong className="tabular">
              {concluidos} de {fila.length}
            </strong>{" "}
            pareceres concluídos
          </p>
          <BarraProgresso valor={concluidos} total={fila.length} rotulo="Pareceres concluídos" />
        </div>
        {prazoRevisao ? (
          <p className={styles.caixaPrazo}>
            <span>
              Prazo: <strong>{prazo(prazoRevisao)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>{textoFaltam(prazoRevisao)}</span>
          </p>
        ) : null}
      </div>

      {!inscrito ? (
        <Aviso
          tom="atencao"
          acao={
            <Botao variante="secundario" tamanho="pequeno" href={`/eventos/${EVENTO}/inscricao?retorno=/revisoes`}>
              Fazer inscrição
            </Botao>
          }
        >
          <strong>Falta a sua inscrição no evento.</strong> Revisores precisam estar inscritos para enviar pareceres.
        </Aviso>
      ) : null}

      <div className="pilha">
        <p className="corpo-apoio">
          {distribuicao ? <>Trabalhos distribuídos em {data(distribuicao)}, após o fim das submissões. </> : null}
          Você vê apenas os atribuídos a você; a autoria não é exibida.
        </p>

        <div className="tabela-envoltorio">
          <table className={`tabela ${styles.tabelaFila}`}>
            <caption className="sr-only">Trabalhos atribuídos a você</caption>
            <thead>
              <tr>
                <th scope="col">Nº</th>
                <th scope="col">Título</th>
                <th scope="col">Área</th>
                <th scope="col">Situação</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {fila.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.vazio}>
                    Nenhum trabalho atribuído ainda. A distribuição acontece depois do fim das submissões.
                  </td>
                </tr>
              ) : (
                fila.map(({ parecer, trabalho }) => (
                  <tr key={parecer.id}>
                    <td className="codigo">{trabalho.codigo}</td>
                    <td data-rotulo="Título">{trabalho.titulo}</td>
                    <td data-rotulo="Área">{trabalho.area}</td>
                    <td>
                      <Situacao parecer={parecer} />
                    </td>
                    <td className={styles.colAcao}>
                      <AcaoLinha parecer={parecer} codigo={trabalho.codigo} titulo={trabalho.titulo} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Situacao({ parecer }: { parecer: Parecer }) {
  if (parecer.situacao === "concluido") return <Estado tom="sucesso">Concluído</Estado>;
  if (parecer.situacao === "rascunho")
    return (
      <Estado tom="neutro" icone={IconesEstado.documento}>
        Rascunho salvo
      </Estado>
    );
  return (
    <Estado tom="neutro" icone={IconesEstado.relogio}>
      Pendente
    </Estado>
  );
}

function AcaoLinha({ parecer, codigo, titulo }: { parecer: Parecer; codigo: string; titulo: string }) {
  const href = `/revisoes/${codigo}`;
  if (parecer.situacao === "concluido")
    return (
      <Link href={href} aria-label={`Ver parecer de ${codigo}, ${titulo}`}>
        Ver parecer
      </Link>
    );
  if (parecer.situacao === "rascunho")
    return (
      <Botao variante="secundario" tamanho="pequeno" href={href} aria-label={`Continuar parecer de ${codigo}`}>
        Continuar
      </Botao>
    );
  return (
    <Botao tamanho="pequeno" href={href} aria-label={`Avaliar ${codigo}`}>
      Avaliar
    </Botao>
  );
}
