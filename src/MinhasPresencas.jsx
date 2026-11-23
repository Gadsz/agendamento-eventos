import { useState } from "react";
import { useEventos, cancelarPresenca } from "./dados";
import { hojeISO, formatarData, partesData, diasAte } from "./datas";
import { TIPOS } from "./tipos";
import Icone from "./Icone";

// Tela: Minhas presenças (GPresencasDesk / GPresencasMob).

function MinhasPresencas({ usuario, confirmacoes, irParaAgenda }) {
  const eventos = useEventos();
  const [erro, setErro] = useState("");

  const hoje = hojeISO();
  const confirmados = new Set(confirmacoes.map((c) => c.eventoId));
  const futuros = (eventos || []).filter((evento) => evento.data >= hoje);
  const meus = futuros.filter((evento) => confirmados.has(evento.id));
  const semConfirmacao = futuros.length - meus.length;
  const proxima = meus[0];

  async function cancelar(evento) {
    setErro("");
    try {
      await cancelarPresenca(evento, usuario);
    } catch {
      setErro("Não foi possível cancelar sua presença. Tente novamente.");
    }
  }

  return (
    <div className="presencas">
      <section className="presencas__lista">
        <div>
          <h1 className="display-xl">Minhas <span className="ea-hl">presenças</span></h1>
          <p className="body-l so-desktop presencas__texto">
            Os eventos em que você confirmou presença. A atlética organizadora vê sua confirmação.
          </p>
        </div>

        {/* No mobile o resumo vem antes da lista. */}
        {proxima && <ResumoProxima evento={proxima} className="so-mobile" />}

        {erro && <p className="ea-alert" role="alert"><Icone nome="alerta" />{erro}</p>}

        {eventos !== null && meus.length === 0 && (
          <section className="ea-glass ea-glass--strong vazio" role="status">
            <span className="vazio__icone ea-hl"><Icone nome="ingresso" tamanho={32} traco={1.8} /></span>
            <h2 className="title vazio__titulo">Você ainda não confirmou presença em nenhum evento.</h2>
            <button className="ea-btn" onClick={irParaAgenda}>Ver a agenda</button>
          </section>
        )}

        {meus.map((evento) => {
          const tipo = TIPOS[evento.tipo] || TIPOS.esportivo;
          const { dia, mes, semana } = partesData(evento.data);
          return (
            <article key={evento.id} className="ea-glass ea-glass--strong presenca">
              <div className="ea-date presenca__data">
                <div className="ea-date__n">{dia}</div>
                <div className="ea-date__m">{mes} · {semana}</div>
              </div>
              <div className="presenca__info">
                <span className={tipo.tag}>{tipo.rotulo}</span>
                <h2 className="title-s">{evento.nome}</h2>
                <div className="linha linha--quebra">
                  <span className="ea-meta"><Icone nome="relogio" tamanho={15} />{evento.horario || "Horário a definir"}</span>
                  <span className="ea-meta"><Icone nome="local" tamanho={15} />{evento.local || "Local a definir"}</span>
                  <span className="ea-meta so-desktop">
                    <span className="ea-avatar ea-avatar--mini" aria-hidden="true">{(evento.atleticaEmail || "?")[0].toUpperCase()}</span>
                    {evento.atleticaEmail}
                  </span>
                </div>
              </div>
              <div className="presenca__acoes">
                <span className="ea-going"><Icone nome="check" tamanho={15} traco={3} />Confirmada</span>
                <button className="ea-btn ea-btn--ghost ea-btn--sm" onClick={() => cancelar(evento)}>
                  <span className="so-desktop">Cancelar presença</span>
                  <span className="so-mobile">Cancelar</span>
                </button>
              </div>
            </article>
          );
        })}

        <button className="ea-btn ea-btn--ghost ea-btn--block so-mobile" onClick={irParaAgenda}>
          Ver mais eventos na agenda
        </button>
      </section>

      <aside className="presencas__lateral so-desktop">
        {proxima && <ResumoProxima evento={proxima} />}
        <div className="ea-glass presencas__convite">
          <span className="label">Quer ir em mais coisa?</span>
          <p className="body ea-muted">
            {semConfirmacao === 1
              ? "1 evento ainda não tem sua confirmação."
              : `${semConfirmacao} eventos ainda não têm sua confirmação.`}
          </p>
          <button className="ea-btn ea-btn--sm" onClick={irParaAgenda}>Ver a agenda</button>
        </div>
      </aside>
    </div>
  );
}

function ResumoProxima({ evento, className = "" }) {
  const dias = diasAte(evento.data);
  const { semanaLonga } = partesData(evento.data);
  return (
    <div className={`ea-glass ea-glass--float resumo ${className}`}>
      <span className="caption ea-muted">SUA PRÓXIMA PRESENÇA</span>
      <span className="resumo__numero">
        {dias} <span className="resumo__unidade">{dias === 1 ? "dia" : "dias"}</span>
      </span>
      <span className="body">
        {evento.nome} · {semanaLonga}, {formatarData(evento.data).slice(0, 5)}
        {evento.horario && ` às ${evento.horario}`}
      </span>
    </div>
  );
}

export default MinhasPresencas;
