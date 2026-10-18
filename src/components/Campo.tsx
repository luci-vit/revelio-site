"use client";

import { XCircle } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";

interface CampoProps {
  rotulo: string;
  obrigatorio?: boolean;
  ajuda?: ReactNode;
  /** Mensagem de erro: diz o que fazer, com exemplo. */
  erro?: string;
  children?: never;
}

/**
 * Campo de texto com rótulo, ajuda e erro (ícone + texto + cor).
 * Ex.: <Campo rotulo="E-mail do coautor" obrigatorio erro="Complete o e-mail. Ex.: nome@instituicao.br" value=… onChange=… />
 */
export function Campo({
  rotulo,
  obrigatorio,
  ajuda,
  erro,
  multilinha,
  ...entrada
}: CampoProps & { multilinha?: boolean } & Omit<ComponentProps<"input">, "children"> &
  Omit<ComponentProps<"textarea">, "children">) {
  const id = useId();
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;
  const descritores = [ajuda ? idAjuda : null, erro ? idErro : null].filter(Boolean).join(" ") || undefined;
  const comum = {
    id,
    className: "entrada",
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": descritores,
    required: obrigatorio,
  };
  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio ? (
          <>
            {" "}
            <span className="obrigatorio" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>
      {multilinha ? (
        <textarea {...comum} {...(entrada as ComponentProps<"textarea">)} />
      ) : (
        <input {...comum} {...(entrada as ComponentProps<"input">)} />
      )}
      {erro ? (
        <p id={idErro} className="campo-erro">
          <XCircle size={16} aria-hidden="true" />
          {erro}
        </p>
      ) : ajuda ? (
        <p id={idAjuda} className="campo-ajuda">
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}

/** Select no mesmo estilo dos campos. */
export function CampoSelecao({
  rotulo,
  obrigatorio,
  ajuda,
  erro,
  children,
  ...select
}: Omit<CampoProps, "children"> & ComponentProps<"select">) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio ? <span className="obrigatorio"> *</span> : null}
      </label>
      <select id={id} className="entrada" aria-invalid={erro ? true : undefined} {...select}>
        {children}
      </select>
      {erro ? (
        <p className="campo-erro">
          <XCircle size={16} aria-hidden="true" />
          {erro}
        </p>
      ) : ajuda ? (
        <p className="campo-ajuda">{ajuda}</p>
      ) : null}
    </div>
  );
}
