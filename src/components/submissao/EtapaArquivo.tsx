"use client";

import { FileText, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Botao } from "@/components/Botao";
import { Aviso, Estado } from "@/components/Estado";
import type { Arquivo, Evento, Trabalho } from "@/data/tipos";
import { LIMITE_MB, limitePaginas, tamanhoLegivel } from "./util";
import styles from "./submissao.module.css";

/** Arquivo de exemplo do protótipo (C3). */
export const ARQUIVO_EXEMPLO: Arquivo = { nome: "artigo-sbda.pdf", paginas: 11, tamanho: "2,1 MB" };

/**
 * Conta as páginas de um PDF localmente, procurando objetos /Type /Page.
 * Nada é enviado: o arquivo só é lido no navegador.
 */
async function contarPaginas(arquivo: File) {
  const texto = await arquivo.text();
  const achados = texto.match(/\/Type\s*\/Page(?![s\w])/g);
  return achados?.length ?? 0;
}

/** Etapa 3 — Arquivo: upload simulado, PDF até 10 MB e limite de páginas da modalidade. */
export function EtapaArquivo({
  trabalho,
  evento,
  alterar,
  semNomes,
  definirSemNomes,
  mostrarErros,
}: {
  trabalho: Trabalho;
  evento: Evento;
  alterar: (parcial: Partial<Trabalho>) => void;
  semNomes: boolean;
  definirSemNomes: (v: boolean) => void;
  mostrarErros: boolean;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string>();
  const [lendo, setLendo] = useState(false);
  const [sobre, setSobre] = useState(false);
  const limite = limitePaginas(evento, trabalho.modalidade);
  const arq = trabalho.arquivo;
  const excedePaginas = arq ? arq.paginas > limite : false;

  async function escolher(f: File | undefined) {
    if (!f) return;
    const ehPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!ehPdf) {
      setErro(`Envie o trabalho em PDF. O arquivo “${f.name}” não é PDF.`);
      return;
    }
    if (f.size > LIMITE_MB * 1024 * 1024) {
      setErro(`O arquivo tem ${tamanhoLegivel(f.size)}. Reduza para até ${LIMITE_MB} MB (ex.: comprima as imagens).`);
      return;
    }
    setLendo(true);
    let paginas = 0;
    try {
      paginas = await contarPaginas(f);
    } catch {
      paginas = 0;
    }
    setLendo(false);
    setErro(undefined);
    alterar({ arquivo: { nome: f.name, tamanho: tamanhoLegivel(f.size), paginas: paginas || 1 } });
    definirSemNomes(false);
  }

  function aoSoltar(e: DragEvent) {
    e.preventDefault();
    setSobre(false);
    void escolher(e.dataTransfer.files[0]);
  }

  return (
    <section className={styles.secao} aria-labelledby="titulo-etapa">
      <div className={styles.secaoCabecalho}>
        <h2 id="titulo-etapa">Arquivo do trabalho</h2>
        <p className="corpo-apoio">
          PDF de até {LIMITE_MB} MB. {trabalho.modalidade}: até {limite} páginas. A revisão é cega: não coloque o nome dos
          autores no arquivo.
        </p>
      </div>

      {arq ? (
        <div className="card pilha">
          <div className={styles.arquivo}>
            <FileText size={32} aria-hidden="true" />
            <div className="pilha-1" style={{ gap: 2 }}>
              <span className={styles.arquivoNome}>{arq.nome}</span>
              <span className="corpo-apoio tabular">
                {arq.tamanho} · {arq.paginas} {arq.paginas === 1 ? "página" : "páginas"}
              </span>
            </div>
            <button type="button" className={styles.botaoTexto} onClick={() => entrada.current?.click()}>
              Trocar arquivo
            </button>
          </div>
          {excedePaginas ? (
            <Aviso tom="erro">
              O arquivo tem {arq.paginas} páginas e {trabalho.modalidade.toLowerCase()} aceita até {limite}. Envie uma versão
              menor ou troque a modalidade em Dados do trabalho.
            </Aviso>
          ) : (
            <Estado tom="sucesso">PDF dentro dos limites</Estado>
          )}
          <label className={styles.confirmacao}>
            <input type="checkbox" checked={semNomes} onChange={(e) => definirSemNomes(e.target.checked)} />
            <span>Confirmo que o arquivo não tem os nomes dos autores (revisão cega).</span>
          </label>
          {mostrarErros && !semNomes ? (
            <p className="campo-erro">Marque a confirmação acima para continuar.</p>
          ) : null}
        </div>
      ) : (
        <label
          className={`${styles.zona} ${sobre ? styles.zonaAtiva : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setSobre(true);
          }}
          onDragLeave={() => setSobre(false)}
          onDrop={aoSoltar}
        >
          <Upload size={32} aria-hidden="true" />
          <span className={styles.zonaTitulo}>{lendo ? "Lendo o arquivo…" : "Escolha o PDF ou arraste aqui"}</span>
          <span className="corpo-apoio">Protótipo: o arquivo é lido só no seu navegador e não é enviado.</span>
          <input
            ref={entrada}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              void escolher(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {arq ? (
        <input
          ref={entrada}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            void escolher(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      ) : null}

      {erro ? (
        <Aviso tom="erro">{erro}</Aviso>
      ) : mostrarErros && !arq ? (
        <Aviso tom="erro">Anexe o arquivo do trabalho em PDF para continuar.</Aviso>
      ) : null}

      {!arq ? (
        <div>
          <Botao
            variante="secundario"
            icone={<FileText size={20} aria-hidden="true" />}
            onClick={() => {
              setErro(undefined);
              alterar({ arquivo: ARQUIVO_EXEMPLO });
              definirSemNomes(true);
            }}
          >
            Usar arquivo de exemplo
          </Botao>
        </div>
      ) : null}
    </section>
  );
}
