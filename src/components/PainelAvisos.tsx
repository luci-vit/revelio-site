"use client";

import { CalendarDays, CheckCircle2, Clock, FileText, Mail, MessageSquareText, Ticket } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEstado } from "@/data/estado";
import { notificacoesDaPessoa } from "@/data/selectors";
import type { TipoNotificacao } from "@/data/tipos";
import styles from "./PainelAvisos.module.css";

const ICONE: Record<TipoNotificacao, { icone: ReactNode; classe: string }> = {
  convite: { icone: <Mail size={22} />, classe: styles.iconeInfo },
  prazo: { icone: <Clock size={22} />, classe: styles.iconeAtencao },
  resultado: { icone: <CheckCircle2 size={22} />, classe: styles.iconeSucesso },
  certificado: { icone: <FileText size={22} />, classe: styles.iconeNeutro },
  inscricao: { icone: <Ticket size={22} />, classe: styles.iconeSucesso },
  horario: { icone: <CalendarDays size={22} />, classe: styles.iconeNeutro },
  parecer: { icone: <MessageSquareText size={22} />, classe: styles.iconeAtencao },
};

/**
 * Painel do sino (vidro). Não lida = ponto Rosa profundo, fundo Pêssego e
 * título em negrito. Cada aviso diz o evento, o que mudou e o que fazer.
 */
export function PainelAvisos({ id, aoFechar }: { id: string; aoFechar: () => void }) {
  const { estado, despachar, usuario } = useEstado();
  const avisos = notificacoesDaPessoa(estado, usuario?.id);

  return (
    <div id={id} className={`${styles.painel} vidro`} role="dialog" aria-label="Notificações">
      <div className={styles.topo}>
        <h2 className={styles.titulo}>Notificações</h2>
        <button
          type="button"
          className={styles.marcarTodas}
          onClick={() => usuario && despachar({ tipo: "marcarTodasLidas", pessoaId: usuario.id })}
        >
          Marcar todas como lidas
        </button>
      </div>
      {avisos.length === 0 ? (
        <p className={styles.vazio}>Nenhuma notificação por enquanto.</p>
      ) : (
        <ul className={styles.lista}>
          {avisos.map((n) => {
            const ic = ICONE[n.tipo];
            return (
              <li key={n.id} className={`${styles.item} ${n.lida ? "" : styles.naoLida}`}>
                <span className={styles.ponto} aria-hidden="true" />
                <span className={`${styles.icone} ${ic.classe}`} aria-hidden="true">
                  {ic.icone}
                </span>
                <div className={styles.textos}>
                  <p className={styles.itemTitulo}>
                    {n.lida ? null : <span className="sr-only">Não lida: </span>}
                    {n.titulo}
                  </p>
                  <p className={styles.descricao}>{n.descricao}</p>
                  <p className={styles.meta}>
                    {n.quando}
                    {n.acao ? (
                      <>
                        {" · "}
                        <Link
                          href={n.acao.href}
                          onClick={() => {
                            despachar({ tipo: "marcarLida", notificacaoId: n.id });
                            aoFechar();
                          }}
                        >
                          {n.acao.rotulo}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
