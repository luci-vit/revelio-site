"use client";

import { Bell } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Botao } from "@/components/Botao";
import { FaixaConfirmacao } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import styles from "./ProximoPasso.module.css";

/** A3 — Conta criada e próximo passo. Papéis surgem por evento, não aqui. */
export function ProximoPasso() {
  const router = useRouter();
  const params = useSearchParams();
  const { estado, usuario, papel } = useEstado();

  if (papel === "visitante" || !usuario) {
    return (
      <div className="container pagina">
        <div className={`card pilha ${styles.vazio}`}>
          <h1 className="h2">Você ainda não tem conta</h1>
          <p className="corpo-apoio">Crie sua conta para se inscrever em eventos e enviar trabalhos.</p>
          <div>
            <Botao href="/criar-conta">Criar conta</Botao>
          </div>
        </div>
      </div>
    );
  }

  const nome = estado.contaNova?.nome ?? usuario.nome;
  const email = estado.contaNova?.email ?? usuario.email;
  const primeiroNome = nome.trim().split(/\s+/)[0];
  const eventoOrigem = estado.eventos.find((e) => e.slug === params.get("evento"));

  function verNotificacoes() {
    // Abre o painel do sino da barra de navegação; sem ele, vai para os avisos em Minhas inscrições.
    const sino = document.querySelector<HTMLButtonElement>('button[aria-controls="painel-avisos"]');
    if (sino) {
      window.scrollTo({ top: 0 });
      if (sino.getAttribute("aria-expanded") !== "true") sino.click();
      sino.focus();
    } else {
      router.push("/minhas-inscricoes");
    }
  }

  return (
    <div className="container pagina pilha-3">
      <FaixaConfirmacao
        mensagem={
          <>
            Conta criada. Enviamos uma confirmação para <strong>{email}</strong>.
          </>
        }
      />

      <header className="pilha-1">
        <h1 className="h2">Boas-vindas, {primeiroNome}. O que você quer fazer agora?</h1>
        <p className="corpo-apoio">Você pode mudar de ideia a qualquer momento pelo menu.</p>
      </header>

      <ul className={styles.opcoes}>
        <li className={`card-destaque ${styles.opcao}`}>
          <div className="pilha-1">
            <h2 className="h3">Participar de um evento</h2>
            {eventoOrigem ? (
              <p>
                Volte para o <strong>{eventoOrigem.nome}</strong> e conclua a inscrição.
              </p>
            ) : (
              <p>Busque eventos, inscreva-se e envie trabalhos.</p>
            )}
          </div>
          <div>
            {eventoOrigem ? (
              <Botao href={`/eventos/${eventoOrigem.slug}/inscricao`}>Concluir inscrição</Botao>
            ) : (
              <Botao href="/eventos">Encontrar eventos</Botao>
            )}
          </div>
        </li>

        <li className={`card ${styles.opcao}`}>
          <div className="pilha-1">
            <h2 className="h3">Organizar um evento</h2>
            <p>Crie a página, defina prazos e convide revisores.</p>
          </div>
          <div>
            <Botao href="/organizacao/novo-evento" variante="secundario">
              Criar um evento
            </Botao>
          </div>
        </li>

        <li className={`card-suave ${styles.opcao}`}>
          <div className="pilha-1">
            <h2 className="h3">Recebeu um convite?</h2>
            <p>
              Convites para revisar aparecem no sino <Bell size={18} className={styles.sinoInline} aria-hidden="true" />{" "}
              e no seu e-mail.
            </p>
          </div>
          <div>
            <button type="button" className={styles.link} onClick={verNotificacoes}>
              Ver notificações
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
}
