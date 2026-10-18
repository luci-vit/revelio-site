"use client";

import { useEstado } from "@/data/estado";
import { Aviso } from "@/components/Estado";
import { Botao } from "@/components/Botao";
import type { ReactNode } from "react";

/**
 * As telas da organização só fazem sentido para quem organiza o evento.
 * Na demonstração, oferece trocar para o papel de organizador.
 */
export function AcessoOrganizacao({ children }: { children: ReactNode }) {
  const { papel, definirPapel } = useEstado();
  if (papel === "organizador") return <>{children}</>;
  return (
    <div className="pilha-3" style={{ maxWidth: 720 }}>
      <h1 className="h2">Área da organização</h1>
      <Aviso
        tom="info"
        acao={
          <Botao variante="secundario" tamanho="pequeno" onClick={() => definirPapel("organizador")}>
            Entrar como organizadora
          </Botao>
        }
      >
        Esta área é só para quem organiza o evento. Na demonstração, troque o papel para <strong>Organizador</strong> (Marta
        Souza).
      </Aviso>
    </div>
  );
}

/** Mensagem para endereço de evento que não existe no estado. */
export function EventoNaoEncontrado({ slug }: { slug: string }) {
  return (
    <div className="pilha-3" style={{ maxWidth: 720 }}>
      <h1 className="h2">Evento não encontrado</h1>
      <Aviso
        tom="erro"
        acao={
          <Botao variante="secundario" tamanho="pequeno" href="/organizacao/sbda-2027">
            Abrir o SBDA 2027
          </Botao>
        }
      >
        Não há evento com o endereço <strong className="tabular">{slug}</strong>. Confira o link ou abra um dos seus eventos.
      </Aviso>
    </div>
  );
}
