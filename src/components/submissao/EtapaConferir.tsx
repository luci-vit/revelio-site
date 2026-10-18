"use client";

import { FileText } from "lucide-react";
import type { ReactNode } from "react";
import type { EtapaSubmissao, Trabalho } from "@/data/tipos";
import { nomeAutor } from "./util";
import styles from "./submissao.module.css";

function CardResumo({
  titulo,
  editar,
  rotuloEditar = "Editar",
  children,
}: {
  titulo: string;
  editar: () => void;
  rotuloEditar?: string;
  children: ReactNode;
}) {
  return (
    <div className={`card ${styles.resumoCard}`}>
      <div className={styles.resumoCabecalho}>
        <h3>{titulo}</h3>
        <button type="button" className={styles.botaoTexto} onClick={editar} aria-label={`${rotuloEditar}: ${titulo}`}>
          {rotuloEditar}
        </button>
      </div>
      {children}
    </div>
  );
}

/** Etapa 4 — Conferir e enviar (C3): resumo com atalhos para cada etapa. */
export function EtapaConferir({
  trabalho,
  irPara,
  semNomes,
}: {
  trabalho: Trabalho;
  irPara: (etapa: EtapaSubmissao) => void;
  semNomes: boolean;
}) {
  const arq = trabalho.arquivo;
  return (
    <section className={styles.secao} aria-labelledby="titulo-etapa">
      <div className={styles.secaoCabecalho}>
        <h2 id="titulo-etapa">Confira antes de enviar</h2>
      </div>

      <CardResumo titulo="Dados do trabalho" editar={() => irPara("dados")}>
        <div className={styles.resumoLinhas}>
          <p>
            <strong>Título:</strong> {trabalho.titulo || "—"}
          </p>
          <p>
            <strong>Formato:</strong> {trabalho.modalidade} · <strong>Área:</strong> {trabalho.area || "—"}
          </p>
          {trabalho.palavrasChave.length ? (
            <p>
              <strong>Palavras-chave:</strong> {trabalho.palavrasChave.join(", ")}
            </p>
          ) : null}
          <p className={styles.truncado}>
            <strong>Resumo:</strong> {trabalho.resumo || "—"}
          </p>
        </div>
      </CardResumo>

      <CardResumo titulo="Autores" editar={() => irPara("autores")}>
        <p>
          {trabalho.autores
            .map((a, i) => `${i + 1}. ${nomeAutor(a)}${a.instituicao ? ` (${a.instituicao})` : ""}`)
            .join(" · ")}
        </p>
        {trabalho.autores.some((a) => a.apresentador) ? (
          <p className="apoio">
            Apresenta: {nomeAutor(trabalho.autores.find((a) => a.apresentador)!)}
          </p>
        ) : null}
      </CardResumo>

      {arq ? (
        <div className={`card ${styles.arquivo}`}>
          <FileText size={32} aria-hidden="true" />
          <div className="pilha-1" style={{ gap: 2 }}>
            <span className={styles.arquivoNome}>{arq.nome}</span>
            <span className="corpo-apoio tabular">
              {arq.tamanho} · {arq.paginas} {arq.paginas === 1 ? "página" : "páginas"}
              {semNomes ? " · sem nomes dos autores no arquivo" : ""}
            </span>
          </div>
          <button type="button" className={styles.botaoTexto} onClick={() => irPara("arquivo")}>
            Trocar arquivo
          </button>
        </div>
      ) : (
        <CardResumo titulo="Arquivo" editar={() => irPara("arquivo")} rotuloEditar="Anexar">
          <p className="corpo-apoio">Nenhum arquivo anexado.</p>
        </CardResumo>
      )}
    </section>
  );
}
