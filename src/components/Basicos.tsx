import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Basicos.module.css";

/** Trilha de navegação: Eventos › IV Simpósio… */
export function Trilha({ itens }: { itens: { rotulo: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está em" className={styles.trilha}>
      <ol>
        {itens.map((it, i) => (
          <li key={i}>
            {it.href && i < itens.length - 1 ? <Link href={it.href}>{it.rotulo}</Link> : <span aria-current={i === itens.length - 1 ? "page" : undefined}>{it.rotulo}</span>}
            {i < itens.length - 1 ? <ChevronRight size={16} aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Título da página (H1 em Bricolage) com descrição de apoio e ações à direita. */
export function CabecalhoPagina({
  titulo,
  descricao,
  acoes,
  antes,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  /** Conteúdo acima do título (ex.: <Trilha />). */
  antes?: ReactNode;
}) {
  return (
    <header className={styles.cabecalho}>
      {antes}
      <div className={styles.cabecalhoLinha}>
        <div className={styles.cabecalhoTextos}>
          <h1 className="h2">{titulo}</h1>
          {descricao ? <p className="corpo-apoio">{descricao}</p> : null}
        </div>
        {acoes ? <div className={styles.cabecalhoAcoes}>{acoes}</div> : null}
      </div>
    </header>
  );
}

/** Barra de progresso (ex.: 1 de 3 pareceres concluídos). */
export function BarraProgresso({ valor, total, rotulo }: { valor: number; total: number; rotulo: string }) {
  const pct = total ? Math.round((valor / total) * 100) : 0;
  return (
    <div
      className={styles.barra}
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={valor}
      aria-valuetext={`${valor} de ${total}`}
    >
      <div className={styles.barraPreenchida} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Número em destaque do painel (E2): “Inscritos 128”. */
export function CardNumero({
  rotulo,
  valor,
  complemento,
  children,
}: {
  rotulo: string;
  valor: ReactNode;
  complemento?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`card ${styles.numero}`}>
      <span className="corpo-apoio">{rotulo}</span>
      <span className={styles.numeroValor}>
        {valor}
        {complemento ? <span className={styles.numeroComplemento}>{complemento}</span> : null}
      </span>
      {children}
    </div>
  );
}

/** Avatar circular com iniciais em Ameixa. */
export function Avatar({ iniciais, tamanho = 48 }: { iniciais: string; tamanho?: number }) {
  return (
    <span className={styles.avatar} style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.36 }} aria-hidden="true">
      {iniciais}
    </span>
  );
}
