"use client";

import { Plus, TrendingUp } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Aviso } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { numero, porcentagem } from "@/lib/formato";
import styles from "./Alcance.module.css";

export interface LinhaCupom {
  codigo: string;
  divulgador: string;
  cliques: number;
  usos: number;
}

const taxa = (c: LinhaCupom) => (c.cliques ? c.usos / c.cliques : 0);

/**
 * Cupons por divulgador (E7): tabela ordenada por inscrições, com barra de usos
 * e conversão (inscrições ÷ cliques). A maior conversão fica em negrito e a
 * leitura aparece numa dica em pêssego logo abaixo.
 */
export function TabelaCupons({ cupons: iniciais }: { cupons: LinhaCupom[] }) {
  const idTitulo = useId();
  const mostrar = useToast();
  const [cupons, setCupons] = useState(iniciais);
  const [criando, setCriando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [divulgador, setDivulgador] = useState("");
  const [erros, setErros] = useState<{ codigo?: string; divulgador?: string }>({});

  const ordenados = [...cupons].sort((a, b) => b.usos - a.usos || b.cliques - a.cliques);
  const maxUsos = Math.max(...cupons.map((c) => c.usos), 1);
  const comCliques = cupons.filter((c) => c.cliques > 0);
  const melhor = comCliques.reduce<LinhaCupom | null>((m, c) => (!m || taxa(c) > taxa(m) ? c : m), null);
  const maisCliques = comCliques.reduce<LinhaCupom | null>((m, c) => (!m || c.cliques > m.cliques ? c : m), null);

  function criar(e: FormEvent) {
    e.preventDefault();
    const cod = codigo.trim().toUpperCase().replace(/\s+/g, "");
    const div = divulgador.trim();
    const novos: typeof erros = {};
    if (!/^[A-Z0-9]{3,12}$/.test(cod)) novos.codigo = "Use de 3 a 12 letras ou números, sem espaços. Ex.: IHCUFBA";
    else if (cupons.some((c) => c.codigo === cod)) novos.codigo = `O cupom ${cod} já existe. Escolha outro código.`;
    if (!div) novos.divulgador = "Informe quem vai divulgar. Ex.: Grupo de pesquisa X";
    setErros(novos);
    if (novos.codigo || novos.divulgador) return;
    setCupons((cs) => [...cs, { codigo: cod, divulgador: div, cliques: 0, usos: 0 }]);
    setCodigo("");
    setDivulgador("");
    setCriando(false);
    mostrar({ mensagem: <>Cupom <strong>{cod}</strong> criado para {div}. O link já pode ser divulgado.</> });
  }

  return (
    <section className={`card ${styles.cartao}`} aria-labelledby={idTitulo}>
      <div className={styles.cartaoTopo}>
        <div className={styles.cartaoTextos}>
          <h2 id={idTitulo} className={styles.cartaoTitulo}>
            Cupons por divulgador
          </h2>
          <p className="apoio">Ordenado por inscrições. Conversão = inscrições ÷ cliques no link.</p>
        </div>
        {!criando ? (
          <Botao variante="secundario" tamanho="pequeno" icone={<Plus size={20} aria-hidden="true" />} onClick={() => setCriando(true)}>
            Criar cupom
          </Botao>
        ) : null}
      </div>

      {criando ? (
        <form className={styles.formCupom} onSubmit={criar} noValidate>
          <Campo rotulo="Código do cupom" obrigatorio value={codigo} onChange={(e) => setCodigo(e.target.value)} erro={erros.codigo} autoFocus autoCapitalize="characters" />
          <Campo rotulo="Divulgador" obrigatorio value={divulgador} onChange={(e) => setDivulgador(e.target.value)} erro={erros.divulgador} />
          <div className={styles.formAcoes}>
            <Botao type="submit" variante="escuro" tamanho="pequeno">
              Criar
            </Botao>
            <Botao
              variante="terciario"
              tamanho="pequeno"
              onClick={() => {
                setCriando(false);
                setErros({});
              }}
            >
              Cancelar
            </Botao>
          </div>
        </form>
      ) : null}

      <div className="tabela-envoltorio">
        <table className={`tabela ${styles.tabelaCupons}`}>
          <caption className="sr-only">Cupons por divulgador: cliques no link, inscrições com o cupom e conversão</caption>
          <thead>
            <tr>
              <th scope="col">Divulgador</th>
              <th scope="col">Cupom</th>
              <th scope="col" className={styles.num}>
                Cliques no link
              </th>
              <th scope="col">Inscrições com o cupom</th>
              <th scope="col" className={styles.num}>
                Conversão
              </th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((c) => {
              const destaque = melhor?.codigo === c.codigo;
              return (
                <tr key={c.codigo}>
                  <th scope="row" className={styles.divulgador}>
                    {c.divulgador}
                  </th>
                  <td>
                    <span className={styles.chipCupom}>{c.codigo}</span>
                  </td>
                  <td className={styles.num}>{numero(c.cliques)}</td>
                  <td>
                    <span className={styles.usos}>
                      <span className={styles.usosBarra} style={{ width: `${(c.usos / maxUsos) * 100}%` }} aria-hidden="true" />
                      <strong className="tabular">{numero(c.usos)}</strong>
                    </span>
                  </td>
                  <td className={`${styles.num} ${destaque ? styles.melhor : ""}`}>
                    {c.cliques ? porcentagem(c.usos, c.cliques, 1) : "—"}
                    {destaque ? <span className="sr-only"> (maior conversão)</span> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {melhor && maisCliques && melhor.codigo !== maisCliques.codigo ? (
        <Aviso tom="pessego" icone={<TrendingUp size={18} aria-hidden="true" />}>
          <strong>{melhor.divulgador}</strong> traz poucos cliques, mas converte {porcentagem(melhor.usos, melhor.cliques, 1)};{" "}
          <strong>{maisCliques.divulgador}</strong> traz mais cliques e converte {porcentagem(maisCliques.usos, maisCliques.cliques, 1)}.
        </Aviso>
      ) : null}
    </section>
  );
}
