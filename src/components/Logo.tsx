import Link from "next/link";
import styles from "./Logo.module.css";

/** Símbolo: anel Ameixa com o ponto de luz em gradiente. */
export function Simbolo({ tamanho = 32, claro = false }: { tamanho?: number; claro?: boolean }) {
  const id = `sol-${tamanho}-${claro ? "c" : "e"}`;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0.18">
          <stop offset="0" stopColor="#FF8A5C" />
          <stop offset="1" stopColor="#FF5C8A" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" fill="none" stroke={claro ? "#fff" : "#2B1631"} strokeWidth="5" />
      <circle cx="19.5" cy="11.5" r="5" fill={`url(#${id})`} />
    </svg>
  );
}

export function Logo({ href = "/", claro = false }: { href?: string; claro?: boolean }) {
  return (
    <Link href={href} className={`${styles.logo} ${claro ? styles.claro : ""}`} aria-label="Revelio, página inicial">
      <Simbolo tamanho={34} claro={claro} />
      <span className={styles.palavra}>
        revel<span className={styles.i}>ı</span>o
      </span>
    </Link>
  );
}
