"use client";

import { FileText, Info } from "lucide-react";
import Link from "next/link";
import { Botao, BotaoBloqueado } from "@/components/Botao";
import { Estado, IconesEstado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { hojeDoPapel } from "@/data/demo";
import { useEstado } from "@/data/estado";
import { estaInscrito } from "@/data/selectors";
import type { Evento } from "@/data/tipos";
import * as f from "@/lib/formato";
import { inscritaOu } from "./LateralEvento";
import styles from "./PaginaEvento.module.css";

function listaEmTexto(itens: string[]) {
  const l = itens.map((i) => i.charAt(0).toLowerCase() + i.slice(1));
  return l.length <= 1 ? l.join("") : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`;
}

function semPontoFinal(s: string) {
  const t = s.trim().replace(/\.$/, "");
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/** C1 — Instruções aos autores (aba “Chamada de trabalhos”). */
export function InstrucoesAutores({ evento }: { evento: Evento }) {
  const mostrar = useToast();
  const modelo = `modelo-${evento.sigla.toLowerCase()}.docx`;
  return (
    <section className="pilha-3" aria-labelledby="titulo-instrucoes">
      <h2 id="titulo-instrucoes" className="h3">
        Instruções aos autores
      </h2>
      <ul className={styles.instrucoes}>
        <li>Áreas: {listaEmTexto(evento.areasTematicas)}.</li>
        <li>Formatos: {semPontoFinal(evento.formatosAceitos)}, em PDF de até 10 MB.</li>
        <li>Cada trabalho é avaliado por pelo menos dois revisores do comitê científico.</li>
        <li>Coautores não precisam ter conta; quem envia precisa estar inscrito.</li>
      </ul>
      <p className="corpo-apoio linha-1">
        <FileText size={18} aria-hidden="true" />
        Modelo de formatação:{" "}
        <button
          type="button"
          className={styles.linkBotao}
          onClick={() =>
            mostrar({
              mensagem: (
                <>
                  <strong>{modelo}</strong> é um arquivo fictício: no protótipo não há download.
                </>
              ),
            })
          }
        >
          {modelo}
        </button>
      </p>
    </section>
  );
}

/** C1 — Caixa “Enviar trabalho” da lateral, com a variante que vale para quem está vendo. */
export function CaixaEnviarTrabalho({ evento }: { evento: Evento }) {
  const { estado, usuario, papel } = useEstado();
  const inscrito = estaInscrito(estado, usuario?.id, evento.slug);
  const p = evento.prazos;
  const hoje = hojeDoPapel(papel);
  const prazoPassou = p.submissoes ? f.diasEntre(hoje, p.submissoes) < 0 : true;
  const situacao = evento.situacaoSubmissoes === "aberta" && prazoPassou ? "encerrada" : evento.situacaoSubmissoes;
  const inscricaoHref = `/eventos/${evento.slug}/inscricao`;

  const rascunho = usuario
    ? estado.trabalhos.find((t) => t.eventoSlug === evento.slug && t.responsavelId === usuario.id && t.situacao === "rascunho")
    : undefined;
  const meus = usuario
    ? estado.trabalhos.filter(
        (t) => t.eventoSlug === evento.slug && (t.responsavelId === usuario.id || t.autores.some((a) => a.pessoaId === usuario.id)),
      ).length
    : 0;

  let selo;
  let corpo;
  if (situacao === "em-breve") {
    const abre = p.submissoesAbrem ? f.prazo(p.submissoesAbrem) : "data a definir";
    selo = (
      <Estado tom="neutro" icone={IconesEstado.calendario}>
        Abrem em {abre}
      </Estado>
    );
    corpo = (
      <BotaoBloqueado id="enviar" explicacao={<><Info size={16} aria-hidden="true" /> As submissões ainda não abriram. Volte a partir de {abre}.</>}>
        Enviar trabalho
      </BotaoBloqueado>
    );
  } else if (situacao === "encerrada") {
    selo = (
      <Estado tom="neutro" icone={IconesEstado.cadeado}>
        {p.submissoes ? `Encerradas em ${f.prazo(p.submissoes)}` : "Encerradas"}
      </Estado>
    );
    corpo = (
      <BotaoBloqueado id="enviar" explicacao={<><Info size={16} aria-hidden="true" /> O prazo de submissão terminou. Não é possível enviar novos trabalhos.</>}>
        Enviar trabalho
      </BotaoBloqueado>
    );
  } else {
    const faltam = f.diasEntre(hoje, p.submissoes!);
    selo =
      faltam <= 2 ? (
        <Estado tom="atencao">
          Abertas até {f.prazo(p.submissoes!)} · faltam {faltam} {faltam === 1 ? "dia" : "dias"}
        </Estado>
      ) : (
        <Estado tom="info" icone={IconesEstado.relogio}>
          Abertas até {f.prazo(p.submissoes!)}
        </Estado>
      );
    corpo = inscrito ? (
      <>
        <p className="corpo-apoio">Você está {inscritaOu(usuario)}. Pode enviar mais de um trabalho.</p>
        <div>
          <Botao href={`/eventos/${evento.slug}/submissao`}>Enviar trabalho</Botao>
        </div>
        {rascunho ? (
          <p className="apoio">
            Você tem um rascunho salvo:{" "}
            <Link href={`/eventos/${evento.slug}/submissao?codigo=${rascunho.codigo}`}>
              continuar <span className="tabular" style={{ whiteSpace: "nowrap" }}>{rascunho.codigo}</span>
            </Link>
          </p>
        ) : null}
      </>
    ) : (
      <BotaoBloqueado
        id="enviar"
        explicacao={
          <>
            <Info size={16} aria-hidden="true" /> Faça sua inscrição no evento para enviar trabalhos.{" "}
            <Link href={inscricaoHref} className={styles.linkForte}>
              Inscrever-se
            </Link>
          </>
        }
      >
        Enviar trabalho
      </BotaoBloqueado>
    );
  }

  return (
    <section className={`card-destaque ${styles.caixa}`} aria-labelledby="titulo-enviar">
      <h2 id="titulo-enviar" className={styles.tituloCaixa}>
        Enviar trabalho
      </h2>
      <div className={styles.selo}>{selo}</div>
      {corpo}
      {meus > 0 ? (
        <p className="apoio">
          <Link href="/meus-trabalhos">
            Ver meus trabalhos neste evento (<span className="tabular">{meus}</span>)
          </Link>
        </p>
      ) : null}
    </section>
  );
}
