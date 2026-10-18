"use client";

import { BarChart3, CalendarClock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/Botao";
import { BuscaSegmentada, type ValoresBusca } from "@/components/BuscaSegmentada";
import { useEstado } from "@/data/estado";
import { IlustracaoEventos } from "./IlustracaoEventos";
import styles from "./PaginaInicial.module.css";

const PASSOS = [
  { titulo: "Crie sua conta", texto: "Uma conta serve para todos os eventos." },
  { titulo: "Inscreva-se no evento", texto: "Uma inscrição por evento, mesmo com vários trabalhos." },
  { titulo: "Envie e acompanhe", texto: "Submissão, pareceres, crachá e certificado no mesmo lugar." },
];

const ORGANIZADORES = [
  {
    icone: <CalendarClock size={24} aria-hidden="true" />,
    titulo: "Página e prazos",
    texto: "Publique o evento com categorias, vagas e prazos com dia, hora e fuso.",
  },
  {
    icone: <Users size={24} aria-hidden="true" />,
    titulo: "Comitê científico",
    texto: "Convide revisores, distribua os trabalhos e acompanhe os pareceres.",
  },
  {
    icone: <BarChart3 size={24} aria-hidden="true" />,
    titulo: "Alcance",
    texto: "Veja inscrições por semana, o funil do card até a inscrição e os cupons por divulgador.",
  },
];

/** A1 — Página inicial: herói, busca segmentada, três passos e chamada para criar conta. */
export function PaginaInicial() {
  const router = useRouter();
  const { papel } = useEstado();
  const visitante = papel === "visitante";

  function buscar(v: ValoresBusca) {
    const q = new URLSearchParams({ q: v.termo.trim(), onde: v.onde, quando: v.quando, filtro: v.filtro });
    router.push(`/eventos?${q.toString()}`);
  }

  return (
    <div className="container pagina">
      <section className={styles.heroi} aria-labelledby="titulo-inicio">
        <div className={styles.heroiTextos}>
          <h1 id="titulo-inicio" className={styles.titulo}>
            Encontre eventos científicos, inscreva-se e publique
          </h1>
          <p className={styles.subtitulo}>Congressos, simpósios e workshops de todas as áreas em um só lugar.</p>
        </div>
        <IlustracaoEventos />
      </section>

      <div className={styles.busca}>
        <BuscaSegmentada aoBuscar={buscar} />
      </div>

      <section id="como-funciona" className={styles.passos} aria-labelledby="titulo-como-funciona">
        <h2 id="titulo-como-funciona" className="sr-only">
          Como funciona
        </h2>
        <ol className={styles.listaPassos}>
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className={`card-suave ${styles.passo}`}>
              <span className={styles.numero} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.passoTitulo}>
                <span className="sr-only">Passo {i + 1}: </span>
                {p.titulo}
              </h3>
              <p className="corpo-apoio">{p.texto}</p>
            </li>
          ))}
        </ol>

        <aside className={`card-destaque ${styles.chamada}`}>
          {visitante ? (
            <>
              <p>
                <strong>Ainda não tem conta?</strong> Ela é necessária para se inscrever e enviar trabalhos.
              </p>
              <Botao href="/criar-conta" larguraTotal>
                Criar conta
              </Botao>
            </>
          ) : (
            <>
              <p>
                <strong>Você já está na sua conta.</strong> Acompanhe inscrições, trabalhos e avisos pelo menu.
              </p>
              <Botao href="/minhas-inscricoes" variante="secundario" larguraTotal>
                Minhas inscrições
              </Botao>
            </>
          )}
        </aside>
      </section>

      <section id="para-organizadores" className={`card ${styles.organizadores}`} aria-labelledby="titulo-organizadores">
        <div className={styles.orgCabecalho}>
          <span className="sobrelinha">Para organizadores</span>
          <h2 id="titulo-organizadores" className="h3">
            Organize o evento do começo ao certificado
          </h2>
          <p className="corpo-apoio">
            Com a mesma conta, você cria o evento e ganha o papel de organizador só nele. Ninguém se cadastra como
            revisor: o comitê entra por convite seu.
          </p>
        </div>
        <ul className={styles.orgLista}>
          {ORGANIZADORES.map((o) => (
            <li key={o.titulo} className={styles.orgItem}>
              <span className={styles.orgIcone}>{o.icone}</span>
              <div className="pilha-1">
                <h3 className={styles.orgTitulo}>{o.titulo}</h3>
                <p className="corpo-apoio">{o.texto}</p>
              </div>
            </li>
          ))}
        </ul>
        <div>
          {visitante ? (
            <Botao href="/criar-conta" variante="secundario">
              Criar conta para organizar
            </Botao>
          ) : (
            <Botao href="/organizacao/novo-evento" variante="secundario">
              Criar um evento
            </Botao>
          )}
        </div>
      </section>
    </div>
  );
}
