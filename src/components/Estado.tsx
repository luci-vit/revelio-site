import { AlertTriangle, CalendarDays, CheckCircle2, Clock, FileText, Info, Lock, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Estado.module.css";

export type TomEstado = "sucesso" | "atencao" | "erro" | "info" | "neutro";

const ICONE_PADRAO: Record<TomEstado, ReactNode> = {
  sucesso: <CheckCircle2 size={18} aria-hidden="true" />,
  atencao: <AlertTriangle size={18} aria-hidden="true" />,
  erro: <XCircle size={18} aria-hidden="true" />,
  info: <Info size={18} aria-hidden="true" />,
  neutro: <Clock size={18} aria-hidden="true" />,
};

/** Ícones prontos para estados comuns. */
export const IconesEstado = {
  relogio: <Clock size={18} aria-hidden="true" />,
  cadeado: <Lock size={18} aria-hidden="true" />,
  documento: <FileText size={18} aria-hidden="true" />,
  calendario: <CalendarDays size={18} aria-hidden="true" />,
  ok: <CheckCircle2 size={18} aria-hidden="true" />,
  alerta: <AlertTriangle size={18} aria-hidden="true" />,
  erro: <XCircle size={18} aria-hidden="true" />,
  info: <Info size={18} aria-hidden="true" />,
};

/**
 * Selo de estado: SEMPRE ícone + texto + cor.
 * Ex.: <Estado tom="sucesso">Inscrita</Estado>
 *      <Estado tom="neutro" icone={IconesEstado.cadeado}>Submissões encerradas</Estado>
 */
export function Estado({
  tom,
  icone,
  children,
  grande = false,
}: {
  tom: TomEstado;
  icone?: ReactNode;
  children: ReactNode;
  grande?: boolean;
}) {
  return (
    <span className={`${styles.estado} ${styles[tom]} ${grande ? styles.grande : ""}`}>
      {icone ?? ICONE_PADRAO[tom]}
      <span>{children}</span>
    </span>
  );
}

/** Etiqueta neutra de área/formato (não é estado). */
export function Etiqueta({ children }: { children: ReactNode }) {
  return <span className={styles.etiqueta}>{children}</span>;
}

/**
 * Caixa de aviso em linha (faixa de largura total), também com ícone + texto + cor.
 * Use `acao` para um botão/link à direita.
 */
export function Aviso({
  tom = "info",
  icone,
  children,
  acao,
}: {
  tom?: TomEstado | "pessego";
  icone?: ReactNode;
  children: ReactNode;
  acao?: ReactNode;
}) {
  const ic = icone ?? (tom === "pessego" ? ICONE_PADRAO.info : ICONE_PADRAO[tom]);
  return (
    <div className={`${styles.aviso} ${styles["aviso-" + tom]}`} role={tom === "erro" ? "alert" : undefined}>
      <span className={styles.avisoIcone}>{ic}</span>
      <div className={styles.avisoTexto}>{children}</div>
      {acao ? <div className={styles.avisoAcao}>{acao}</div> : null}
    </div>
  );
}
