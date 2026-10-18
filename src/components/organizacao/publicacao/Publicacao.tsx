"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Botao, BotaoBloqueado } from "@/components/Botao";
import { Estado, IconesEstado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, trabalhosSubmetidos } from "@/data/selectors";
import type { Decisao, Notificacao } from "@/data/tipos";
import { data } from "@/lib/formato";
import { ROTULO_DECISAO } from "../comum";
import styles from "./Publicacao.module.css";

/**
 * Totais do protótipo (E6): o cenário fictício só traz alguns trabalhos do SBDA,
 * mas a comissão decidiu 46. A prévia lista os trabalhos do estado e soma o resto.
 */
const AGREGADO: Record<string, Record<Decisao, number>> = {
  "sbda-2027": { aprovado: 18, "aprovado-com-ajustes": 9, rejeitado: 19 },
};

const MENSAGEM: Record<Decisao, string> = {
  aprovado: "foi aprovado",
  "aprovado-com-ajustes": "foi aprovado com ajustes",
  rejeitado: "não foi aprovado",
};

/** E6 — publicação do resultado e liberação de certificados. */
export function Publicacao() {
  const { slug } = useParams<{ slug: string }>();
  const { estado, despachar } = useEstado();
  const mostrar = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const evento = eventoPorSlug(estado, slug);
  if (!evento) return <p>Evento não encontrado.</p>;

  const trabalhos = trabalhosSubmetidos(estado, slug);
  const decididos = trabalhos.filter((t) => estado.decisoes[t.codigo]);
  const conta = (d: Decisao) => decididos.filter((t) => estado.decisoes[t.codigo] === d).length;
  const totais = AGREGADO[slug] ?? { aprovado: conta("aprovado"), "aprovado-com-ajustes": conta("aprovado-com-ajustes"), rejeitado: conta("rejeitado") };
  const totalDecisoes = totais.aprovado + totais["aprovado-com-ajustes"] + totais.rejeitado;
  const aprovadosNaPrevia = decididos.filter((t) => estado.decisoes[t.codigo] !== "rejeitado");
  const restantes = Math.max(0, totais.aprovado + totais["aprovado-com-ajustes"] - aprovadosNaPrevia.length);
  const publicado = Boolean(evento.resultadoPublicado);

  function publicar() {
    despachar({ tipo: "publicarResultado", eventoSlug: slug });
    let avisados = 0;
    for (const t of decididos) {
      const d = estado.decisoes[t.codigo];
      const comConta = t.autores.filter((a) => a.pessoaId && a.temConta);
      for (const a of comConta) {
        const n: Notificacao = {
          id: `n-resultado-${t.codigo}-${a.pessoaId}`,
          pessoaId: a.pessoaId!,
          tipo: "resultado",
          titulo: "Resultado publicado",
          descricao: `Seu trabalho ${t.codigo} ${MENSAGEM[d]}.`,
          quando: "agora",
          acao: { rotulo: "Ver pareceres", href: `/meus-trabalhos/${t.codigo}` },
          lida: false,
        };
        despachar({ tipo: "adicionarNotificacao", notificacao: n });
        avisados++;
      }
    }
    setConfirmando(false);
    mostrar({
      mensagem: (
        <>
          Resultado publicado. <strong>{avisados}</strong> {avisados === 1 ? "autor avisado" : "autores avisados"} no Revelio.
        </>
      ),
      acao: { rotulo: "Ver aba Aprovados", href: `/eventos/${slug}?aba=aprovados` },
    });
  }

  function liberarCertificados() {
    despachar({ tipo: "emitirCertificados", eventoSlug: slug });
    mostrar({ mensagem: <>Certificados liberados para inscritos com presença confirmada.</> });
  }

  return (
    <div className="pilha-3">
      <header className="pilha-1">
        <h1 className="h2">Publicação do resultado</h1>
        <p className="corpo-apoio tabular">
          {totalDecisoes} decisões registradas: {totais.aprovado} aprovados, {totais["aprovado-com-ajustes"]} aprovados com ajustes,{" "}
          {totais.rejeitado} não aprovados.
        </p>
      </header>

      <div className={styles.grade}>
        <section aria-labelledby="previa-titulo" className="pilha">
          <h2 id="previa-titulo" className={`sobrelinha ${styles.sobrelinha}`}>
            Prévia da lista pública
          </h2>
          <div className="card">
            <h3 className={styles.tituloCard}>Trabalhos aprovados · {evento.nomeCurto}</h3>
            {aprovadosNaPrevia.length === 0 ? (
              <p className={`apoio ${styles.vazio}`}>
                Nenhum trabalho aprovado registrado nesta demonstração. <Link href={`/organizacao/${slug}/selecao`}>Registrar decisões na Seleção</Link>
              </p>
            ) : (
              <ul className={styles.lista}>
                {aprovadosNaPrevia.map((t) => (
                  <li key={t.codigo}>
                    <span>{t.titulo}</span>
                    <span className="apoio">
                      {t.autores.map((a) => a.nome).join(", ")} · {t.area}
                      {estado.decisoes[t.codigo] === "aprovado-com-ajustes" ? (
                        <span className="sr-only"> · {ROTULO_DECISAO["aprovado-com-ajustes"]}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {restantes > 0 ? (
              <p className={`apoio tabular ${styles.mais}`}>
                + {restantes} {restantes === 1 ? "trabalho" : "trabalhos"}
              </p>
            ) : null}
          </div>
        </section>

        <div className="pilha-3">
          <section className="card-destaque pilha" aria-labelledby="publicar-titulo">
            <h2 id="publicar-titulo" className="h4">
              Publicar e avisar autores
            </h2>
            {publicado ? (
              <>
                <p>
                  <Estado tom="sucesso" grande>
                    Resultado publicado
                  </Estado>
                </p>
                <p className="corpo-apoio">
                  A lista está na aba <Link href={`/eventos/${slug}?aba=aprovados`}>“Aprovados”</Link> do evento. Os autores receberam o resultado e
                  os pareceres.
                </p>
              </>
            ) : (
              <>
                <p>A lista aparece na aba “Aprovados” do evento. Todos os autores recebem o resultado e os pareceres.</p>
                {confirmando ? (
                  <div className={`pilha ${styles.confirmacao}`} role="group" aria-labelledby="confirmar-texto">
                    <p id="confirmar-texto" className="forte">
                      Publicar agora? A lista fica pública e não dá para desfazer o aviso aos autores.
                    </p>
                    <div className="linha">
                      <Botao onClick={publicar} autoFocus>
                        Confirmar e publicar
                      </Botao>
                      <Botao variante="terciario" onClick={() => setConfirmando(false)}>
                        Cancelar
                      </Botao>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Botao onClick={() => setConfirmando(true)}>Publicar resultado</Botao>
                  </div>
                )}
              </>
            )}
          </section>

          <section id="certificados" className={`card-suave pilha ${styles.certificados}`} aria-labelledby="certificados-titulo">
            <h2 id="certificados-titulo" className="h4">
              Certificados
            </h2>
            <p>Liberados para inscritos com presença confirmada.</p>
            {evento.certificadosEmitidos ? (
              <p>
                <Estado tom="sucesso">Certificados liberados</Estado>
              </p>
            ) : evento.encerrado ? (
              <div>
                <Botao variante="secundario" onClick={liberarCertificados}>
                  Liberar certificados
                </Botao>
              </div>
            ) : (
              <BotaoBloqueado
                id="liberar-certificados"
                explicacao={
                  <>
                    {IconesEstado.info}
                    <span>Disponível após o encerramento, em {data(evento.dataFim)}.</span>
                  </>
                }
              >
                Liberar certificados
              </BotaoBloqueado>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
