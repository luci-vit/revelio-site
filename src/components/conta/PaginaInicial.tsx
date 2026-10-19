"use client";

import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Compass,
  FileText,
  Mic,
  ScanEye,
  Target,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";
import { Botao } from "@/components/Botao";
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

const PERFIS = [
  {
    icone: Compass,
    titulo: "Visitante",
    acesso: "Sem cadastro",
    texto: "Explore os eventos, conheça a programação e consulte os prazos. Crie uma conta quando quiser se inscrever.",
  },
  {
    icone: Ticket,
    titulo: "Participante",
    acesso: "Ao se inscrever em um evento",
    texto: "Acompanhe suas inscrições e acesse o ingresso, o crachá e o certificado, disponível após a confirmação de presença.",
  },
  {
    icone: FileText,
    titulo: "Autor",
    acesso: "Ao submeter um trabalho",
    texto: "Envie trabalhos pelo site, inclua coautores e acompanhe pareceres, resultados e o envio da versão final.",
  },
  {
    icone: ScanEye,
    titulo: "Revisor",
    acesso: "Por convite da organização",
    texto: "Com inscrição no evento e convite aceito, avalie os trabalhos atribuídos e envie seus pareceres pelo site.",
  },
  {
    icone: Mic,
    titulo: "Palestrante",
    acesso: "Por convite ou como apresentador",
    texto: "Conduza palestras, oficinas e mesas a convite da organização ou apresente um trabalho aprovado. Acompanhe suas sessões no app.",
  },
  {
    icone: Users,
    titulo: "Organizador",
    acesso: "Ao criar um evento",
    texto: "Publique o evento, gerencie inscrições, convide o comitê científico e acompanhe da seleção dos trabalhos à emissão de certificados.",
  },
];

/** A1 — Landing page: projeto, objetivo, perfis e caminhos para participar ou organizar. */
export function PaginaInicial() {
  const { papel } = useEstado();
  const visitante = papel === "visitante";

  return (
    <div className={`container pagina ${styles.landing}`}>
      <section className={styles.heroi} aria-labelledby="titulo-inicio">
        <div className={styles.heroiTextos}>
          <span className="sobrelinha">Criar, divulgar e viver a ciência</span>
          <h1 id="titulo-inicio" className={styles.titulo}>
            Encontre eventos científicos, <span><span className={styles.semQuebra}>inscreva-se</span> e publique.</span>
          </h1>
          <p className={styles.subtitulo}>
            O Revelio conecta pessoas e conhecimento. Congressos, simpósios e workshops de todas as áreas,
            da descoberta do evento à participação.
          </p>
          <div className={styles.acoesHeroi}>
            <Botao href="/eventos" iconeDepois={<ArrowRight size={20} aria-hidden="true" />}>
              Ver eventos
            </Botao>
            <Botao href="#sobre-projeto" variante="terciario">
              Conheça o projeto
            </Botao>
          </div>
          <p className="apoio">Explore os eventos sem precisar de uma conta.</p>
        </div>
        <IlustracaoEventos />
      </section>

      <section id="sobre-projeto" className={styles.sobre} aria-labelledby="titulo-projeto">
        <div className={styles.apresentacao}>
          <span className="sobrelinha">O projeto</span>
          <h2 id="titulo-projeto">Um lugar para cada encontro com a ciência.</h2>
          <p className="corpo-apoio">
            O Revelio é uma plataforma para criar, divulgar e participar de eventos científicos. Reúne
            quem quer aprender, compartilhar pesquisas, avaliar trabalhos e organizar esses encontros.
          </p>
          <p className="corpo-apoio">
            No site, você encontra eventos e acompanha inscrições, submissões e avaliações. No app,
            a experiência continua no dia do evento, com programação, ingresso e avisos.
          </p>
        </div>
        <aside className={styles.objetivo} aria-labelledby="titulo-objetivo">
          <Target size={28} aria-hidden="true" />
          <span className="sobrelinha">Nosso objetivo</span>
          <h3 id="titulo-objetivo">Aproximar pessoas. Fazer o conhecimento circular.</h3>
          <p className="corpo-apoio">
            Facilitar o acesso à ciência e simplificar a jornada de quem participa e de quem organiza.
            Menos informações espalhadas, mais clareza sobre o que fazer e quando fazer.
          </p>
        </aside>
      </section>

      <section id="como-funciona" className={styles.secao} aria-labelledby="titulo-como-funciona">
        <div className={styles.cabecalhoSecao}>
          <span className="sobrelinha">Como funciona</span>
          <h2 id="titulo-como-funciona">Da descoberta à sua próxima participação.</h2>
          <p className="corpo-apoio">Encontre um evento da sua área e acompanhe cada etapa no mesmo lugar.</p>
        </div>
        <div className={styles.passos}>
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
        </div>
      </section>

      <section className={styles.secao} aria-labelledby="titulo-perfis">
        <div className={styles.cabecalhoSecao}>
          <span className="sobrelinha">Perfis no Revelio</span>
          <h2 id="titulo-perfis">Diferentes formas de fazer parte.</h2>
          <p className="corpo-apoio">Conheça o que cada perfil pode fazer e como ele passa a fazer parte da sua jornada.</p>
        </div>
        <div className={styles.conta}>
          <span className={styles.contaIcone}>
            <UserRound size={24} aria-hidden="true" />
          </span>
          <div>
            <h3>Uma conta, vários papéis.</h3>
            <p className="corpo-apoio">
              A conta é seu acesso ao Revelio. Os papéis dependem da sua atuação em cada evento:
              você pode participar de um, publicar em outro e organizar o próximo. Não precisa criar novos cadastros.
            </p>
          </div>
        </div>
        <ul className={styles.perfis}>
          {PERFIS.map(({ icone: Icone, titulo, acesso, texto }) => (
            <li key={titulo} className={styles.perfil}>
              <Icone size={26} aria-hidden="true" className={styles.perfilIcone} />
              <h3>{titulo}</h3>
              <span className={styles.perfilAcesso}>{acesso}</span>
              <p className="corpo-apoio">{texto}</p>
            </li>
          ))}
        </ul>
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

      <section className={styles.convite} aria-labelledby="titulo-convite">
        <div className="pilha-1">
          <h2 id="titulo-convite">Seu próximo encontro com a ciência começa aqui.</h2>
          <p>Descubra eventos, conheça novas ideias e compartilhe o que você pesquisa.</p>
        </div>
        <Botao href="/eventos" iconeDepois={<ArrowRight size={20} aria-hidden="true" />}>
          Ver eventos
        </Botao>
      </section>
    </div>
  );
}
