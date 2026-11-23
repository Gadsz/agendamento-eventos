import { useEffect } from "react";
import { partesData } from "./datas";
import { TIPOS } from "./tipos";
import Icone from "./Icone";

// Tela: Presenças do evento (GPresencasEventoMob). Só a atlética dona vê,
// como mandam as regras do Firestore. `presencas` já vem ordenada por criadoEm.
function PresencasEvento({ evento, presencas, onVoltar }) {
  const tipo = TIPOS[evento.tipo] || TIPOS.esportivo;
  const { dia, mes, semana } = partesData(evento.data);

  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="presencas-evento">
      <div className="linha">
        <button className="ea-btn ea-btn--icon" aria-label="Voltar para meus eventos" onClick={onVoltar}>
          <Icone nome="voltar" tamanho={18} traco={2.4} />
        </button>
        <span className="label ea-muted">Presenças do evento</span>
      </div>

      <article className="ea-glass ea-glass--float presencas-evento__cabeca">
        <div className={`ea-date dialogo__data dialogo__data--${tipo.modificador}`}>
          <div className="ea-date__n">{dia}</div>
          <div className="ea-date__m">{mes} · {semana}</div>
        </div>
        <div className="pilha pilha--curta min-0">
          <span className={tipo.tag}>{tipo.rotulo}</span>
          <h1 className="title-s">{evento.nome}</h1>
          <span className="ea-muted presencas-evento__meta">
            {evento.horario || "Horário a definir"} · {evento.local || "Local a definir"}
          </span>
        </div>
      </article>

      <div className="linha-entre">
        <h2 className="contagem">
          {presencas.length} <span>{presencas.length === 1 ? "confirmado" : "confirmados"}</span>
        </h2>
        <span className="ea-glass label pilula-vivo"><span className="ponto-vivo" />Ao vivo</span>
      </div>

      {presencas.length === 0 ? (
        <p className="body ea-muted">Ninguém confirmou presença ainda.</p>
      ) : (
        <section className="ea-glass ea-glass--strong presencas-evento__lista" aria-label="Estudantes confirmados">
          <ListaPresencas presencas={presencas} mostrarData />
        </section>
      )}
    </div>
  );
}

// ListaPresencas: também usada dentro do card do evento em Eventos.jsx.
export function ListaPresencas({ presencas, mostrarData = false }) {
  return (
    <ul className="ea-attendees">
      {presencas.map((presenca, i) => (
        <li key={presenca.id}>
          <span className={`ea-avatar ea-avatar--round${i % 2 ? " ea-avatar--2" : ""}`} aria-hidden="true">
            {(presenca.usuarioEmail || "?")[0].toUpperCase()}
          </span>
          <span className="cresce quebra">{presenca.usuarioEmail}</span>
          {mostrarData && presenca.criadoEm && (
            <span className="ea-muted presenca__quando">
              {presenca.criadoEm.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default PresencasEvento;
