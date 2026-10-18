import { Construction } from "lucide-react";
import Link from "next/link";

/**
 * Marcador temporário das telas ainda não construídas. Cada tela substitui
 * este componente pela implementação do protótipo (docs/prototipo/<codigo>.png).
 */
export function EmConstrucao({ codigo, titulo, descricao }: { codigo: string; titulo: string; descricao?: string }) {
  return (
    <div className="container pagina">
      <div className="card pilha" style={{ maxWidth: 720 }}>
        <span className="sobrelinha">Tela {codigo}</span>
        <h1 className="h2">{titulo}</h1>
        {descricao ? <p className="corpo-apoio">{descricao}</p> : null}
        <p className="linha-1 apoio">
          <Construction size={18} aria-hidden="true" /> Em construção. Referência: <code>docs/prototipo/{codigo}.png</code>
        </p>
        <p>
          <Link href="/">Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
