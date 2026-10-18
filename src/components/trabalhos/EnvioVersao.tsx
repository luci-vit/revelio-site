"use client";

import { FileText, Upload, X } from "lucide-react";
import { useId, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Estado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import type { Arquivo, Evento, Trabalho } from "@/data/tipos";
import { prazo } from "@/lib/formato";
import styles from "./DetalheTrabalho.module.css";

/** "2,4 MB" / "820 KB" */
function tamanhoLegivel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

/** Agora em horário de Brasília, no formato ISO usado nos dados. */
function agoraBRT() {
  const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return `${d.toISOString().slice(0, 19)}-03:00`;
}

/**
 * C5 — envio da versão ajustada (ou final). O upload é SIMULADO: só lemos
 * nome e tamanho do arquivo escolhido; nada sai do navegador.
 */
export function EnvioVersao({ trabalho, evento }: { trabalho: Trabalho; evento?: Evento }) {
  const { despachar } = useEstado();
  const mostrar = useToast();
  const idEntrada = useId();
  const [arquivo, setArquivo] = useState<Arquivo | null>(null);
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [substituindo, setSubstituindo] = useState(false);

  const ajustes = trabalho.situacao === "aprovado-com-ajustes";
  const nomeVersao = ajustes ? "versão ajustada" : "versão final";
  const prazoVersao = evento?.prazos.versaoFinal;
  const enviada = trabalho.versaoAjustada;

  function escolher(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErro(`Envie o arquivo em PDF. Ex.: ${exemploNome()}`);
      return;
    }
    setErro(null);
    setArquivo({ nome: file.name, paginas: 0, tamanho: tamanhoLegivel(file.size) });
  }

  function exemploNome() {
    const base = (trabalho.arquivo?.nome ?? `${trabalho.codigo.toLowerCase()}.pdf`).replace(/\.pdf$/i, "");
    return `${base}-v2.pdf`;
  }

  function usarExemplo() {
    setErro(null);
    setArquivo({
      nome: exemploNome(),
      paginas: (trabalho.arquivo?.paginas ?? 10) + 1,
      tamanho: trabalho.arquivo?.nome.startsWith("gastos") ? "2,6 MB" : "1,9 MB",
    });
  }

  function aoSoltar(e: DragEvent) {
    e.preventDefault();
    setArrastando(false);
    escolher(e.dataTransfer.files[0]);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!arquivo) {
      setErro(`Escolha o PDF da ${nomeVersao}. Ex.: ${exemploNome()}`);
      return;
    }
    const final = { ...arquivo, enviadoEm: agoraBRT() };
    despachar({ tipo: "enviarVersaoAjustada", codigo: trabalho.codigo, arquivo: final });
    mostrar({
      mensagem: (
        <>
          {ajustes ? "Versão ajustada enviada" : "Versão final enviada"} na submissão <strong>{trabalho.codigo}</strong>:{" "}
          {final.nome}.
        </>
      ),
      acao: { rotulo: "Meus trabalhos", href: "/meus-trabalhos" },
    });
    setArquivo(null);
    setResposta("");
    setSubstituindo(false);
  }

  if (enviada && !substituindo) {
    return (
      <section className="card-destaque pilha" aria-labelledby="titulo-envio">
        <h2 id="titulo-envio" className={styles.tituloCaixa}>
          {ajustes ? "Versão ajustada" : "Versão final"}
        </h2>
        <div>
          <Estado tom="sucesso">{ajustes ? "Versão ajustada enviada" : "Versão final enviada"}</Estado>
        </div>
        <div className={styles.arquivo}>
          <FileText size={22} aria-hidden="true" />
          <div>
            <p className="forte">{enviada.nome}</p>
            <p className="apoio tabular">
              {enviada.paginas ? `${enviada.paginas} páginas · ` : ""}
              {enviada.tamanho}
              {enviada.enviadoEm ? ` · enviada em ${prazo(enviada.enviadoEm)}` : ""}
            </p>
          </div>
        </div>
        <p className="apoio">
          A versão fica na mesma submissão ({trabalho.codigo}).
          {prazoVersao ? ` Você pode substituir o arquivo até ${prazo(prazoVersao)}.` : ""}
        </p>
        <Botao variante="secundario" onClick={() => setSubstituindo(true)}>
          Substituir arquivo
        </Botao>
      </section>
    );
  }

  return (
    <section className="card-destaque" aria-labelledby="titulo-envio">
      <form className="pilha" onSubmit={enviar} noValidate>
        <h2 id="titulo-envio" className={styles.tituloCaixa}>
          Enviar {nomeVersao}
        </h2>
        <p>
          {prazoVersao ? (
            <>
              Prazo: <strong className="tabular">{prazo(prazoVersao)}</strong>.{" "}
            </>
          ) : null}
          A versão fica na mesma submissão ({trabalho.codigo}).
        </p>

        {arquivo ? (
          <div className={styles.arquivo}>
            <FileText size={22} aria-hidden="true" />
            <div className={styles.arquivoTexto}>
              <p className="forte">{arquivo.nome}</p>
              <p className="apoio tabular">
                {arquivo.paginas ? `${arquivo.paginas} páginas · ` : ""}
                {arquivo.tamanho} · pronto para enviar
              </p>
            </div>
            <button
              type="button"
              className={styles.remover}
              onClick={() => setArquivo(null)}
              aria-label={`Remover ${arquivo.nome}`}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div
            className={`${styles.soltar} ${arrastando ? styles.soltarAtivo : ""} ${erro ? styles.soltarErro : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={aoSoltar}
          >
            <Upload size={20} aria-hidden="true" />
            <span>
              Arraste o PDF ou{" "}
              <label htmlFor={idEntrada} className={styles.escolher}>
                escolha o arquivo
              </label>
            </span>
            <input
              id={idEntrada}
              type="file"
              accept="application/pdf,.pdf"
              className={styles.entradaArquivo}
              aria-describedby={erro ? `${idEntrada}-erro` : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                escolher(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        )}
        {erro ? (
          <p id={`${idEntrada}-erro`} className="campo-erro" role="alert">
            <X size={16} aria-hidden="true" />
            {erro}
          </p>
        ) : null}
        {!arquivo ? (
          <button type="button" className={styles.exemplo} onClick={usarExemplo}>
            Usar arquivo de exemplo
          </button>
        ) : null}

        <Campo
          rotulo="Resposta aos revisores"
          multilinha
          placeholder="Descreva o que foi alterado…"
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
        />

        <div className="linha">
          <Botao type="submit">Enviar {nomeVersao}</Botao>
          {substituindo ? (
            <Botao variante="terciario" onClick={() => setSubstituindo(false)}>
              Cancelar
            </Botao>
          ) : null}
        </div>
      </form>
    </section>
  );
}
