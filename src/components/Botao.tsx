import Link from "next/link";
import { Lock } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Botao.module.css";

export type VarianteBotao = "primario" | "secundario" | "terciario" | "destrutivo" | "escuro";

interface BaseProps {
  variante?: VarianteBotao;
  /** "medio" = 48px (padrão), "pequeno" = 44px. */
  tamanho?: "medio" | "pequeno";
  icone?: ReactNode;
  iconeDepois?: ReactNode;
  larguraTotal?: boolean;
  className?: string;
  children: ReactNode;
}

type BotaoProps = BaseProps & Omit<ComponentProps<"button">, keyof BaseProps> & { href?: undefined };
type LinkProps = BaseProps & Omit<ComponentProps<typeof Link>, keyof BaseProps> & { href: string };

function classes(p: BaseProps, extra?: string) {
  return [
    styles.botao,
    styles[p.variante ?? "primario"],
    p.tamanho === "pequeno" ? styles.pequeno : "",
    p.larguraTotal ? styles.total : "",
    p.className ?? "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Botão em pílula. Só a ação principal da área usa `primario` (gradiente,
 * texto Ameixa). Passe `href` para renderizar um link com a mesma aparência.
 */
export function Botao(props: BotaoProps | LinkProps) {
  const { variante, tamanho, icone, iconeDepois, larguraTotal, className, children, ...resto } = props;
  const conteudo = (
    <>
      {icone}
      <span>{children}</span>
      {iconeDepois}
    </>
  );
  const cls = classes({ variante, tamanho, larguraTotal, className, children });
  if (typeof props.href === "string") {
    return (
      <Link className={cls} {...(resto as Omit<LinkProps, keyof BaseProps>)}>
        {conteudo}
      </Link>
    );
  }
  const { type = "button", ...botao } = resto as Omit<BotaoProps, keyof BaseProps>;
  return (
    <button type={type} className={cls} {...botao}>
      {conteudo}
    </button>
  );
}

/**
 * Ação indisponível: botão travado com cadeado e a explicação logo abaixo
 * (ex.: "Faça sua inscrição no evento para enviar trabalhos. Inscrever-se").
 */
export function BotaoBloqueado({
  children,
  explicacao,
  id,
}: {
  children: ReactNode;
  explicacao: ReactNode;
  id?: string;
}) {
  const idExp = `${id ?? "bloqueado"}-explicacao`;
  return (
    <div className={styles.bloqueadoEnvoltorio}>
      <button type="button" className={`${styles.botao} ${styles.bloqueado}`} aria-disabled="true" aria-describedby={idExp}>
        <Lock size={20} aria-hidden="true" />
        <span>{children}</span>
      </button>
      <p id={idExp} className={styles.explicacao}>
        {explicacao}
      </p>
    </div>
  );
}
