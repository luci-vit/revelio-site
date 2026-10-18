"use client";

import { ArrowDown, ArrowUp, GripVertical, Plus } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Estado } from "@/components/Estado";
import { useEstado } from "@/data/estado";
import { PESSOAS } from "@/data/pessoas";
import { estaInscrito } from "@/data/selectors";
import type { Autor, Trabalho } from "@/data/tipos";
import { emailValido, nomeAutor } from "./util";
import styles from "./submissao.module.css";

/** Etapa 2 — Autores (C2): ordem de publicação, apresentador e coautores por e-mail. */
export function EtapaAutores({
  trabalho,
  alterar,
}: {
  trabalho: Trabalho;
  alterar: (parcial: Partial<Trabalho>) => void;
}) {
  const { estado } = useEstado();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string>();
  const [anuncio, setAnuncio] = useState("");
  const [arrastado, setArrastado] = useState<number | null>(null);
  const [alvo, setAlvo] = useState<number | null>(null);

  const autores = trabalho.autores;
  const ehResponsavel = (a: Autor) => Boolean(a.pessoaId) && a.pessoaId === trabalho.responsavelId;

  function mover(de: number, para: number) {
    if (para < 0 || para >= autores.length || de === para) return;
    const nova = [...autores];
    const [item] = nova.splice(de, 1);
    nova.splice(para, 0, item);
    alterar({ autores: nova });
    setAnuncio(`${nomeAutor(item)} agora é o autor ${para + 1} de ${nova.length}.`);
  }

  function remover(i: number) {
    const a = autores[i];
    alterar({ autores: autores.filter((_, j) => j !== i) });
    setAnuncio(`${nomeAutor(a)} foi removido da lista de autores.`);
  }

  function definirApresentador(i: number) {
    alterar({ autores: autores.map((a, j) => ({ ...a, apresentador: j === i })) });
  }

  function adicionar(e: FormEvent) {
    e.preventDefault();
    const valor = email.trim().toLowerCase();
    if (!emailValido(valor)) {
      setErro("Complete o e-mail. Ex.: nome@instituicao.br");
      return;
    }
    if (autores.some((a) => a.email.toLowerCase() === valor)) {
      setErro("Este e-mail já está na lista de autores.");
      return;
    }
    const p = PESSOAS.find((x) => x.email.toLowerCase() === valor);
    const novo: Autor =
      p && p.temConta
        ? {
            nome: p.nome,
            email: p.email,
            instituicao: p.instituicao,
            temConta: true,
            inscrito: estaInscrito(estado, p.id, trabalho.eventoSlug),
            pessoaId: p.id,
          }
        : { nome: p?.nome ?? "", email: valor, instituicao: p?.instituicao ?? "", temConta: false, inscrito: false, pessoaId: p?.id };
    alterar({ autores: [...autores, novo] });
    setEmail("");
    setErro(undefined);
    setAnuncio(
      novo.temConta
        ? `${novo.nome} (${novo.instituicao}) foi incluído como autor ${autores.length + 1}. Nome e instituição vieram da conta no Revelio.`
        : `${valor} foi incluído como autor ${autores.length + 1}. Sem conta no Revelio: receberá um e-mail.`,
    );
  }

  return (
    <section className={styles.secao} aria-labelledby="titulo-etapa">
      <div className={styles.secaoCabecalho}>
        <h2 id="titulo-etapa">Autores do trabalho</h2>
        <p className="corpo-apoio">A ordem abaixo é a ordem de publicação. Arraste ou use as setas para reordenar.</p>
      </div>

      <ol className={styles.autores} aria-label="Autores, na ordem de publicação">
        {autores.map((a, i) => {
          const resp = ehResponsavel(a);
          const nome = nomeAutor(a);
          const classes = [
            styles.autor,
            arrastado === i ? styles.arrastando : "",
            alvo === i && arrastado !== null && arrastado !== i ? styles.alvoSoltar : "",
          ].join(" ");
          return (
            <li
              key={a.email}
              className={classes}
              draggable
              onDragStart={(e) => {
                setArrastado(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (alvo !== i) setAlvo(i);
              }}
              onDragLeave={() => setAlvo((x) => (x === i ? null : x))}
              onDrop={(e) => {
                e.preventDefault();
                if (arrastado !== null) mover(arrastado, i);
                setArrastado(null);
                setAlvo(null);
              }}
              onDragEnd={() => {
                setArrastado(null);
                setAlvo(null);
              }}
            >
              <span className={styles.numero} aria-hidden="true">
                {i + 1}
              </span>

              <div className={styles.autorInfo}>
                <span className={styles.autorNome}>
                  <span className="sr-only">Autor {i + 1}: </span>
                  <strong>{nome}</strong>
                  {resp ? " (você)" : null}
                  {a.nome ? <> · {a.email}</> : null}
                </span>
                <span className={styles.autorDetalhe}>
                  {[
                    a.instituicao || null,
                    resp
                      ? "Autora responsável pelo envio"
                      : a.temConta
                        ? "Tem conta no Revelio: será avisado pelo sino e por e-mail"
                        : "Sem conta no Revelio: receberá um e-mail",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <div className={styles.autorRodape}>
                  <span className={styles.autorDetalhe} aria-hidden="true" title="Arraste para reordenar">
                    <GripVertical size={18} />
                  </span>
                  <button
                    type="button"
                    className={styles.botaoIcone}
                    onClick={() => mover(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Mover ${nome} para cima`}
                  >
                    <ArrowUp size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.botaoIcone}
                    onClick={() => mover(i, i + 1)}
                    disabled={i === autores.length - 1}
                    aria-label={`Mover ${nome} para baixo`}
                  >
                    <ArrowDown size={18} aria-hidden="true" />
                  </button>
                  <label className={styles.apresentador}>
                    <input
                      type="radio"
                      name="apresentador"
                      checked={Boolean(a.apresentador)}
                      onChange={() => definirApresentador(i)}
                      aria-label={`${nome} apresenta o trabalho`}
                    />
                    Apresenta o trabalho
                  </label>
                </div>
              </div>

              <div className={styles.autorAcoes}>
                {resp ? (
                  a.inscrito || estaInscrito(estado, a.pessoaId, trabalho.eventoSlug) ? (
                    <Estado tom="sucesso">Inscrita no evento</Estado>
                  ) : (
                    <Estado tom="atencao">Inscrição pendente</Estado>
                  )
                ) : (
                  <button
                    type="button"
                    className={styles.botaoTexto}
                    onClick={() => remover(i)}
                    aria-label={`Remover ${nome}`}
                  >
                    Remover
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <form className={styles.adicionar} onSubmit={adicionar} noValidate>
        <Campo
          rotulo="E-mail do coautor"
          obrigatorio
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="nome@instituicao.br"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setEmail(e.target.value);
            if (erro) setErro(undefined);
          }}
          erro={erro}
        />
        <div className={styles.adicionarBotao}>
          <Botao type="submit" variante="secundario" icone={<Plus size={20} aria-hidden="true" />}>
            Adicionar coautor
          </Botao>
        </div>
      </form>

      <p className="sr-only" role="status" aria-live="polite">
        {anuncio}
      </p>
    </section>
  );
}
