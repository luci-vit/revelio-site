"use client";

import { Download, QrCode as IconeQr, Ticket } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Botao } from "@/components/Botao";
import { Aviso } from "@/components/Estado";
import { FaixaConfirmacao, useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, inscricaoNoEvento } from "@/data/selectors";
import { prazo } from "@/lib/formato";
import { noEvento } from "./apoio";
import { Cracha } from "./Cracha";
import styles from "./InscricaoConfirmada.module.css";

export function InscricaoConfirmada() {
  const { slug } = useParams<{ slug: string }>();
  const { estado, usuario } = useEstado();
  const mostrar = useToast();
  const evento = eventoPorSlug(estado, slug);

  if (!evento) {
    return (
      <div className="container pagina pilha" style={{ maxWidth: 640 }}>
        <h1 className="h2">Evento não encontrado</h1>
        <p className="corpo-apoio">O endereço pode ter mudado ou o evento não existe mais.</p>
        <div>
          <Botao href="/eventos" variante="secundario">
            Ver eventos
          </Botao>
        </div>
      </div>
    );
  }

  const inscricao = inscricaoNoEvento(estado, usuario?.id, evento.slug);

  if (!usuario || !inscricao) {
    return (
      <div className="container pagina pilha-3">
        <h1 className="h2">Crachá do evento</h1>
        <div className={styles.estreito}>
          <Aviso
            tom="info"
            acao={
              <Botao href={usuario ? `/eventos/${evento.slug}/inscricao` : "/criar-conta"} variante="primario">
                {usuario ? "Fazer inscrição" : "Criar conta"}
              </Botao>
            }
          >
            <strong>Você ainda não tem inscrição {noEvento(evento.nome)}.</strong>{" "}
            {usuario
              ? "Inscreva-se para receber o crachá."
              : "Crie sua conta e faça a inscrição para receber o crachá."}
          </Aviso>
        </div>
      </div>
    );
  }

  const submissoesAbertas = evento.situacaoSubmissoes === "aberta" && Boolean(evento.prazos.submissoes) && !evento.encerrado;

  return (
    <div className="container pagina pilha-3">
      <FaixaConfirmacao mensagem={<>Inscrição confirmada {noEvento(evento.nome)}.</>} />

      <div className={styles.grade}>
        <Cracha evento={evento} inscricao={inscricao} pessoa={usuario} />

        <div className="pilha-3">
          <section className="pilha">
            <h1 className="h3">Seu crachá está pronto</h1>
            <p>Leve-o impresso ou no celular. O código é lido no credenciamento.</p>
            <div className="linha">
              <Botao
                variante="secundario"
                icone={<Download size={20} aria-hidden="true" />}
                onClick={() =>
                  mostrar({
                    mensagem: (
                      <>
                        Crachá <strong className="tabular">{inscricao.ingresso}</strong> baixado (simulação).
                      </>
                    ),
                  })
                }
              >
                Baixar crachá (PDF)
              </Botao>
              <Link href={`/eventos/${evento.slug}?aba=programacao`} className={styles.link}>
                Ver programação
              </Link>
            </div>
            <Aviso tom="info" icone={<IconeQr size={18} aria-hidden="true" />}>
              <strong>Check-in pelo app.</strong> A organização lê o QR code do crachá no app Revelio, na entrada
              ou na sala. A presença registrada é condição para receber o certificado.
            </Aviso>
          </section>

          {submissoesAbertas && evento.prazos.submissoes ? (
            <section className={`card-destaque pilha ${styles.proximo}`} aria-labelledby="proximo-passo">
              <h2 id="proximo-passo" className="h4">
                Próximo passo: enviar um trabalho
              </h2>
              <p className="corpo-apoio">
                Submissões abertas até <time className="tabular">{prazo(evento.prazos.submissoes)}</time>.
              </p>
              <div>
                <Botao href={`/eventos/${evento.slug}/submissao`} variante="primario">
                  Enviar trabalho
                </Botao>
              </div>
            </section>
          ) : (
            <section className={`card-destaque pilha ${styles.proximo}`} aria-labelledby="proximo-passo">
              <h2 id="proximo-passo" className="h4">
                Próximo passo: acompanhar suas inscrições
              </h2>
              <p className="corpo-apoio">Seus crachás e certificados ficam reunidos em Minhas inscrições.</p>
              <div>
                <Botao href="/minhas-inscricoes" variante="primario" icone={<Ticket size={20} aria-hidden="true" />}>
                  Ir para Minhas inscrições
                </Botao>
              </div>
            </section>
          )}

          {submissoesAbertas ? (
            <p className="apoio">
              Seus crachás e certificados ficam em <Link href="/minhas-inscricoes">Minhas inscrições</Link>.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
