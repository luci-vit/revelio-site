import { CalendarDays, MapPin } from "lucide-react";
import type { Evento, Inscricao, Pessoa } from "@/data/tipos";
import { periodoExtenso } from "@/lib/formato";
import { localCurto, modalidadeDa, nomeInstituicao } from "./apoio";
import { QrCode } from "./QrCode";
import styles from "./Cracha.module.css";

/** Crachá / ingresso do evento, com QR code lido no check-in. */
export function Cracha({ evento, inscricao, pessoa }: { evento: Evento; inscricao: Inscricao; pessoa: Pessoa }) {
  const categoria = evento.categorias.find((c) => c.id === inscricao.categoriaId);
  const local = evento.local.online
    ? "On-line"
    : [evento.local.instituicao, localCurto(evento)].filter(Boolean).join(" · ");
  return (
    <article className={styles.cracha} aria-label={`Crachá de ${inscricao.nomeCracha ?? pessoa.nome}`}>
      <header className={styles.topo}>
        <span className={styles.anel} aria-hidden="true" />
        <span className={styles.evento}>{evento.nome}</span>
      </header>
      <div className={styles.corpo}>
        <div className={styles.dados}>
          <p className={styles.nome}>{inscricao.nomeCracha ?? pessoa.nome}</p>
          <p className="corpo-apoio">{nomeInstituicao(pessoa.instituicao)}</p>
          <p className="corpo-apoio">
            {categoria?.nome ?? "Inscrição"} · {modalidadeDa(inscricao, evento)}
          </p>
          <p className={styles.codigo}>
            Inscrição <span className="tabular">{inscricao.ingresso}</span>
          </p>
        </div>
        <div className={styles.qr}>
          <QrCode codigo={inscricao.ingresso} tamanho={136} />
        </div>
      </div>
      <footer className={styles.rodape}>
        <span className="linha-1">
          <CalendarDays size={18} aria-hidden="true" />
          <span className="tabular">{periodoExtenso(evento.dataInicio, evento.dataFim)}</span>
        </span>
        <span className="linha-1">
          <MapPin size={18} aria-hidden="true" />
          <span>{local}</span>
        </span>
      </footer>
    </article>
  );
}
