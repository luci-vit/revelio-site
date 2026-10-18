"use client";

import { Info, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Botao } from "@/components/Botao";
import { Aviso, Estado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, pareceresDoTrabalho, trabalhosSubmetidos } from "@/data/selectors";
import type { Decisao, Parecer, Trabalho } from "@/data/tipos";
import { data, prazo } from "@/lib/formato";
import { nomePessoa, ROTULO_DECISAO, ROTULO_RECOMENDACAO } from "../comum";
import styles from "./Selecao.module.css";

const DECISOES: Decisao[] = ["aprovado", "aprovado-com-ajustes", "rejeitado"];
const PARECERES_POR_TRABALHO = 2;

function media(p: Parecer) {
  const v = Object.values(p.notas ?? {}).filter((n): n is number => typeof n === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function resumo(t: Trabalho, pareceres: Parecer[]) {
  const concluidos = pareceres.filter((p) => p.situacao === "concluido");
  const recs = concluidos.map((p) => p.recomendacao).filter(Boolean) as NonNullable<Parecer["recomendacao"]>[];
  const medias = concluidos.map(media).filter((m): m is number => m !== null);
  const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null;
  const divergente = recs.includes("rejeitar") && recs.some((r) => r !== "rejeitar");
  // Revisores a cobrar: atribuídos que ainda não concluíram.
  const pendentes = t.revisores.filter((r): r is string => Boolean(r) && !concluidos.some((p) => p.revisorId === r));
  return { concluidos: concluidos.length, recs, mediaGeral, divergente, pendentes };
}

/** E5 — seleção: decisão da comissão a partir dos pareceres. */
export function Selecao() {
  const { slug } = useParams<{ slug: string }>();
  const { estado, despachar } = useEstado();
  const mostrar = useToast();
  const evento = eventoPorSlug(estado, slug);
  const trabalhos = trabalhosSubmetidos(estado, slug);
  // Escolhas ainda não registradas (o select muda, “Registrar” grava).
  const [rascunho, setRascunho] = useState<Record<string, Decisao | "">>({});
  const [orientacoes, setOrientacoes] = useState<Record<string, string>>({});
  const [emFoco, setEmFoco] = useState<string | null>(null);

  if (!evento) return <p>Evento não encontrado.</p>;
  const publicado = Boolean(evento.resultadoPublicado);
  const orientacaoPadrao = evento.prazos.versaoFinal
    ? `Atender às melhorias indicadas nos pareceres até ${data(evento.prazos.versaoFinal)}.`
    : "Atender às melhorias indicadas nos pareceres.";

  const decididos = trabalhos.filter((t) => estado.decisoes[t.codigo]);
  const contagem = (d: Decisao) => decididos.filter((t) => estado.decisoes[t.codigo] === d).length;

  // Card de orientação: o último trabalho mexido com “aprovado com ajustes”, senão o primeiro registrado.
  const valorDe = (codigo: string) => rascunho[codigo] ?? estado.decisoes[codigo] ?? "";
  const comAjustes = trabalhos.filter((t) => valorDe(t.codigo) === "aprovado-com-ajustes").map((t) => t.codigo);
  const codigoOrientacao = emFoco && comAjustes.includes(emFoco) ? emFoco : comAjustes[0];

  function registrar(t: Trabalho) {
    const d = rascunho[t.codigo];
    if (!d) return;
    despachar({ tipo: "definirDecisao", codigo: t.codigo, decisao: d });
    setRascunho((r) => {
      const n = { ...r };
      delete n[t.codigo];
      return n;
    });
    mostrar({
      mensagem: (
        <>
          Decisão registrada: <strong>{t.codigo}</strong> · {ROTULO_DECISAO[d]}. Fica em preparação até a publicação.
        </>
      ),
      acao: { rotulo: "Ir para publicação", href: `/organizacao/${slug}/publicacao` },
    });
  }

  function cobrar(t: Trabalho, revisores: string[]) {
    for (const r of revisores) {
      despachar({
        tipo: "adicionarNotificacao",
        notificacao: {
          id: `n-cobranca-${t.codigo}-${r}-${estado.notificacoes.length}`,
          pessoaId: r,
          tipo: "prazo",
          titulo: "Parecer pendente",
          descricao: `${evento!.nomeCurto} · ${t.codigo}. A organização aguarda seu parecer.`,
          quando: "agora",
          acao: { rotulo: "Registrar parecer", href: `/revisoes/${t.codigo}` },
          lida: false,
        },
      });
    }
    mostrar({
      mensagem: (
        <>
          Lembrete enviado a {revisores.map(nomePessoa).join(" e ")} sobre <strong>{t.codigo}</strong>.
        </>
      ),
    });
  }

  return (
    <div className="pilha-3">
      <header className="pilha-1">
        <h1 className="h2">Seleção</h1>
        <p className="corpo-apoio">
          Revisão encerrada em <span className="tabular">{evento.prazos.revisao ? prazo(evento.prazos.revisao) : "—"}</span>. As decisões
          ficam em preparação até a publicação.
        </p>
        <p className="apoio tabular" aria-live="polite">
          {decididos.length} de {trabalhos.length} decididos: {contagem("aprovado")} aprovados, {contagem("aprovado-com-ajustes")} aprovados com
          ajustes, {contagem("rejeitado")} não aprovados.
        </p>
      </header>

      {publicado ? (
        <Aviso tom="sucesso" acao={<Link href={`/organizacao/${slug}/publicacao`}>Ver publicação</Link>}>
          Resultado publicado. As decisões já foram enviadas aos autores.
        </Aviso>
      ) : null}

      <div className="tabela-envoltorio">
        <table className={`tabela ${styles.tabela}`}>
          <caption className="sr-only">Trabalhos, pareceres e decisão da comissão</caption>
          <thead>
            <tr>
              <th scope="col">Nº</th>
              <th scope="col">Pareceres</th>
              <th scope="col">Recomendações</th>
              <th scope="col" colSpan={2}>
                Decisão da comissão
              </th>
            </tr>
          </thead>
          <tbody>
            {trabalhos.map((t) => {
              const r = resumo(t, pareceresDoTrabalho(estado, t.codigo));
              const completo = r.concluidos >= PARECERES_POR_TRABALHO;
              const registrada = estado.decisoes[t.codigo];
              const valor = valorDe(t.codigo);
              const mudou = rascunho[t.codigo] !== undefined && rascunho[t.codigo] !== registrada;
              const faltam = PARECERES_POR_TRABALHO - r.concluidos;
              const idSel = `decisao-${t.codigo}`;
              return (
                <tr key={t.codigo} className={!completo || r.divergente ? styles.destaque : undefined}>
                  <td className="codigo">{t.codigo}</td>
                  <td>
                    <span className="tabular">
                      {r.concluidos} de {PARECERES_POR_TRABALHO}
                    </span>
                    {r.mediaGeral !== null ? (
                      <span className={styles.media}>média {r.mediaGeral.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                    ) : null}
                  </td>
                  <td>
                    <div className="pilha-1">
                      <span>{r.recs.length ? r.recs.map((x) => ROTULO_RECOMENDACAO[x]).join(" · ") : "—"}</span>
                      {r.divergente ? (
                        <span>
                          <Estado tom="atencao">Pareceres divergentes</Estado>
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className={styles.colDecisao}>
                    {completo ? (
                      <>
                        <label htmlFor={idSel} className="sr-only">
                          Decisão para {t.codigo}
                        </label>
                        <select
                          id={idSel}
                          className={`entrada ${styles.seletor} ${valor ? "" : styles.vazio}`}
                          value={valor}
                          disabled={publicado}
                          onChange={(e) => {
                            setRascunho((x) => ({ ...x, [t.codigo]: e.target.value as Decisao | "" }));
                            setEmFoco(t.codigo);
                          }}
                        >
                          {!registrada ? <option value="">Escolher</option> : null}
                          {DECISOES.map((d) => (
                            <option key={d} value={d}>
                              {ROTULO_DECISAO[d]}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <button type="button" className={styles.bloqueado} aria-disabled="true" aria-describedby={`falta-${t.codigo}`}>
                        <Lock size={20} aria-hidden="true" />
                        Decidir<span className="sr-only"> {t.codigo}</span>
                      </button>
                    )}
                  </td>
                  <td className={styles.colAcao}>
                    {!completo ? (
                      <p id={`falta-${t.codigo}`} className={styles.falta}>
                        <Info size={18} aria-hidden="true" />
                        <span>
                          {faltam === 1 ? "Falta 1 parecer." : `Faltam ${faltam} pareceres.`}{" "}
                          {r.pendentes.length ? (
                            <button type="button" className={styles.link} onClick={() => cobrar(t, r.pendentes)}>
                              Cobrar revisor{r.pendentes.length > 1 ? "es" : ""}
                            </button>
                          ) : (
                            <Link href={`/organizacao/${slug}/trabalhos`}>Atribuir revisor</Link>
                          )}
                        </span>
                      </p>
                    ) : mudou && valor ? (
                      <Botao variante="secundario" onClick={() => registrar(t)}>
                        Registrar<span className="sr-only"> decisão de {t.codigo}</span>
                      </Botao>
                    ) : registrada ? (
                      <Estado tom="sucesso">Decidido</Estado>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {codigoOrientacao ? (
        <div className="card">
          <div className="campo">
            <label htmlFor="orientacao" className={styles.rotuloOrientacao}>
              Orientação aos autores ({codigoOrientacao})
            </label>
            <textarea
              id="orientacao"
              className="entrada"
              value={orientacoes[codigoOrientacao] ?? orientacaoPadrao}
              disabled={publicado}
              onChange={(e) => setOrientacoes((o) => ({ ...o, [codigoOrientacao]: e.target.value }))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
