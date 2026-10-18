"use client";

import { useState, type ChangeEvent } from "react";
import { Campo, CampoSelecao } from "@/components/Campo";
import type { Evento, Trabalho } from "@/data/tipos";
import { LIMITE_TITULO, limitePaginas, modalidadesDoEvento, palavrasDoTexto, validarDados } from "./util";
import styles from "./submissao.module.css";

type Mudanca = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

/** Etapa 1 — Dados do trabalho: título, resumo, palavras-chave, área e modalidade. */
export function EtapaDados({
  trabalho,
  evento,
  alterar,
  mostrarErros,
}: {
  trabalho: Trabalho;
  evento: Evento;
  alterar: (parcial: Partial<Trabalho>) => void;
  mostrarErros: boolean;
}) {
  const [palavras, setPalavras] = useState(trabalho.palavrasChave.join(", "));
  const erros = mostrarErros ? validarDados(trabalho) : {};
  const modalidades = modalidadesDoEvento(evento);

  return (
    <section className={styles.secao} aria-labelledby="titulo-etapa">
      <div className={styles.secaoCabecalho}>
        <h2 id="titulo-etapa">Dados do trabalho</h2>
        <p className="corpo-apoio">Os revisores leem estes dados antes do arquivo. Campos com * são obrigatórios.</p>
      </div>

      <Campo
        rotulo="Título"
        obrigatorio
        maxLength={LIMITE_TITULO}
        value={trabalho.titulo}
        onChange={(e: Mudanca) => alterar({ titulo: e.target.value })}
        erro={erros.titulo}
        ajuda={
          <span className={styles.contador}>
            {trabalho.titulo.length}/{LIMITE_TITULO} caracteres
          </span>
        }
      />

      <Campo
        rotulo="Resumo"
        obrigatorio
        multilinha
        rows={6}
        value={trabalho.resumo}
        onChange={(e: Mudanca) => alterar({ resumo: e.target.value })}
        erro={erros.resumo}
        ajuda="Um parágrafo com objetivo, método e principais resultados."
      />

      <Campo
        rotulo="Palavras-chave"
        obrigatorio
        value={palavras}
        onChange={(e: Mudanca) => {
          setPalavras(e.target.value);
          alterar({ palavrasChave: palavrasDoTexto(e.target.value) });
        }}
        erro={erros.palavrasChave}
        ajuda="Separe por vírgula. Ex.: dados abertos, acessibilidade, cidades inteligentes"
      />

      <CampoSelecao
        rotulo="Área temática"
        obrigatorio
        value={trabalho.area}
        onChange={(e) => alterar({ area: e.target.value })}
        erro={erros.area}
      >
        <option value="">Escolha a área</option>
        {evento.areasTematicas.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </CampoSelecao>

      <fieldset className={styles.grupo}>
        <legend>
          Modalidade <span className="obrigatorio" aria-hidden="true" style={{ color: "var(--rosa-profundo)" }}>*</span>
        </legend>
        <div className={styles.modalidades}>
          {modalidades.map((m) => (
            <label key={m} className={styles.modalidade}>
              <input
                type="radio"
                name="modalidade"
                value={m}
                checked={trabalho.modalidade === m}
                onChange={() => alterar({ modalidade: m })}
              />
              {m} · até {limitePaginas(evento, m)} páginas
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
