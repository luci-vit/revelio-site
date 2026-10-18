"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { CabecalhoPagina } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { FaixaConfirmacao } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, trabalhosDaPessoa } from "@/data/selectors";
import { SituacaoTrabalho, acaoDoTrabalho } from "./situacao";
import styles from "./MeusTrabalhos.module.css";

/** C4 — Meus trabalhos (com a faixa de confirmação vinda da submissão). */
export function MeusTrabalhos() {
  const { estado, usuario } = useEstado();
  const enviado = useSearchParams().get("enviado")?.toUpperCase();
  const trabalhos = trabalhosDaPessoa(estado, usuario?.id);

  return (
    <div className="container pagina pilha-3">
      {enviado && usuario ? (
        <FaixaConfirmacao
          mensagem={
            <>
              Trabalho enviado. Número da submissão: <strong className="tabular">{enviado}</strong>. Os coautores foram
              avisados por e-mail.
            </>
          }
          acao={{ rotulo: "Ver trabalho", href: `/meus-trabalhos/${enviado}` }}
        />
      ) : null}

      <CabecalhoPagina
        titulo="Meus trabalhos"
        descricao="Todos os trabalhos, de todos os eventos, com a situação de cada um."
      />

      {!usuario ? (
        <Vazio
          titulo="Entre na sua conta para ver seus trabalhos"
          texto="Os trabalhos enviados ficam ligados à sua conta, em todos os eventos."
          acao={
            <Botao href="/criar-conta" variante="secundario">
              Criar conta
            </Botao>
          }
        />
      ) : trabalhos.length === 0 ? (
        <Vazio
          titulo="Você ainda não enviou trabalhos"
          texto="Para enviar, inscreva-se num evento com chamada de trabalhos aberta."
          acao={
            <Botao href="/eventos" variante="secundario">
              Ver eventos
            </Botao>
          }
        />
      ) : (
        <div className="tabela-envoltorio">
          <table className={`tabela ${styles.tabela}`}>
            <caption className="sr-only">Meus trabalhos e a situação de cada um</caption>
            <thead>
              <tr>
                <th scope="col">Nº</th>
                <th scope="col">Título</th>
                <th scope="col">Evento</th>
                <th scope="col">Situação</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {trabalhos.map((t) => {
                const evento = eventoPorSlug(estado, t.eventoSlug);
                const acao = acaoDoTrabalho(t);
                return (
                  <tr key={t.codigo} className={t.codigo === enviado ? styles.destacada : undefined}>
                    <td className="codigo" data-rotulo="Nº">
                      {t.codigo}
                    </td>
                    <td data-rotulo="Título">{t.titulo}</td>
                    <td data-rotulo="Evento">{evento?.nomeCurto ?? t.eventoSlug}</td>
                    <td data-rotulo="Situação">
                      <SituacaoTrabalho trabalho={t} evento={evento} detalhada />
                    </td>
                    <td data-rotulo="Ação">
                      <Link href={acao.href} className={styles.acao}>
                        {acao.rotulo}
                        <span className="sr-only"> de {t.codigo}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao: ReactNode }) {
  return (
    <div className={`card-suave ${styles.vazio}`}>
      <FileText size={32} aria-hidden="true" className={styles.vazioIcone} />
      <h2 className="h4">{titulo}</h2>
      <p className="corpo-apoio">{texto}</p>
      {acao}
    </div>
  );
}
