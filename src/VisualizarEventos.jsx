import { useState } from "react";
import { useEventos, confirmarPresenca, cancelarPresenca } from "./dados";
import { hojeISO, formatarData, partesData, proximosDias, textoDias, mesAno } from "./datas";
import CartaoEvento from "./CartaoEvento";
import { TIPOS } from "./tipos";
import Icone from "./Icone";

// Telas: Agenda do estudante (GAgendaDesk / GAgendaMob) e
// Filtro sem resultado (GFiltroVazioMob).

function VisualizarEventos({ usuario, confirmacoes }) {
  const eventos = useEventos();
  const [dataFiltro, setDataFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [atleticaFiltro, setAtleticaFiltro] = useState("");
  const [erro, setErro] = useState("");

  const hoje = hojeISO();
  const futuros = (eventos || []).filter((evento) => evento.data >= hoje);
  const confirmados = new Set(confirmacoes.map((c) => c.eventoId));

  // Atléticas que têm eventos futuros, para o select de filtro.
  const atleticas = [...new Map(futuros.map((e) => [e.atleticaId, e.atleticaEmail])).entries()]
    .filter(([id]) => id);

  const temFiltro = Boolean(dataFiltro || tipoFiltro !== "todos" || atleticaFiltro);
  const filtrados = futuros.filter(
    (evento) =>
      (!dataFiltro || evento.data === dataFiltro) &&
      (tipoFiltro === "todos" || evento.tipo === tipoFiltro) &&
      (!atleticaFiltro || evento.atleticaId === atleticaFiltro)
  );

  // Sem filtro, o próximo evento vai para o destaque e sai da lista.
  const destaque = temFiltro ? null : futuros[0];
  const lista = destaque ? filtrados.slice(1) : filtrados;

  const dias = proximosDias(7).map((dia) => ({
    ...dia,
    tipo: futuros.find((evento) => evento.data === dia.iso)?.tipo,
  }));

  function limparFiltros() {
    setDataFiltro("");
    setTipoFiltro("todos");
    setAtleticaFiltro("");
  }

  async function alternarPresenca(evento) {
    setErro("");
    try {
      if (confirmados.has(evento.id)) {
        await cancelarPresenca(evento, usuario);
      } else {
        await confirmarPresenca(evento, usuario);
      }
    } catch {
      setErro("Não foi possível atualizar sua presença. Tente novamente.");
    }
  }

  return (
    <div className="agenda">
      <section className="agenda__abertura">
        <div className="agenda__titulos">
          <span className="ea-glass label pilula-vivo">
            <span className="ponto-vivo" />
            <span className="so-desktop">Atualiza em tempo real</span>
            <span className="so-mobile">Ao vivo</span>
          </span>
          <h1 className="display-xl">Próximos <span className="ea-hl">eventos</span></h1>
          <p className="body-l so-desktop agenda__texto">
            Jogos e festas de todas as atléticas de Cascavel, em ordem de data. Confirme presença e a atlética já fica sabendo.
          </p>
          <div className="numeros so-desktop">
            <span className="ea-glass label numero"><strong>{futuros.length}</strong> eventos</span>
            <span className="ea-glass label numero"><strong>{atleticas.length}</strong> atléticas</span>
            <span className="ea-glass label numero"><strong>{confirmados.size}</strong> confirmados por você</span>
          </div>
        </div>

        {destaque && (
          <div className="agenda__destaque">
            <div className="destaque__pilha so-desktop" aria-hidden="true">
              <div className="ea-glass" />
              <div className="ea-glass" />
            </div>
            <Destaque
              evento={destaque}
              confirmado={confirmados.has(destaque.id)}
              onAlternarPresenca={alternarPresenca}
            />
          </div>
        )}
      </section>

      <section className="ea-glass filtros" aria-label="Filtros">
        <div className="filtros__linha">
          <h2 className="title filtros__mes so-desktop">{mesAno(hoje)}</h2>
          <div className="ea-days faixa-rolavel" role="group" aria-label="Filtrar por dia">
            {dias.map((dia) => (
              <button
                key={dia.iso}
                type="button"
                className="ea-day"
                aria-label={dia.rotulo}
                aria-pressed={dataFiltro === dia.iso}
                onClick={() => setDataFiltro(dataFiltro === dia.iso ? "" : dia.iso)}
              >
                <span className="ea-day__wd">{dia.semana}</span>
                <span className="ea-day__n">{dia.dia}</span>
                <span className={`ea-day__dot${dia.tipo ? ` ea-day__dot--${TIPOS[dia.tipo]?.modificador}` : ""}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="filtros__linha filtros__linha--campos">
          <div className="faixa-rolavel filtros__chips" role="group" aria-label="Tipo de evento">
            <button type="button" className="ea-chip" aria-pressed={tipoFiltro === "todos"} onClick={() => setTipoFiltro("todos")}>Todos</button>
            <button type="button" className="ea-chip ea-chip--sport" aria-pressed={tipoFiltro === "esportivo"} onClick={() => setTipoFiltro("esportivo")}>Esportivo</button>
            <button type="button" className="ea-chip ea-chip--party" aria-pressed={tipoFiltro === "festa"} onClick={() => setTipoFiltro("festa")}>Festa</button>
          </div>
          <span className="filtros__espaco" />
          <label className="ea-field filtros__campo">
            Outra data
            <input className="ea-input" type="date" min={hoje} value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} />
          </label>
          <label className="ea-field filtros__campo">
            Atlética
            <select className="ea-input" value={atleticaFiltro} onChange={(e) => setAtleticaFiltro(e.target.value)}>
              <option value="">Todas</option>
              {atleticas.map(([id, email]) => (
                <option key={id} value={id}>{email}</option>
              ))}
            </select>
          </label>
          {temFiltro && (
            <button type="button" className="ea-btn ea-btn--sm botao-texto" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {erro && <p className="ea-alert" role="alert"><Icone nome="alerta" />{erro}</p>}

      {eventos === null && (
        <div className="lista-eventos" aria-hidden="true">
          <div className="ea-skeleton esqueleto-card" />
          <div className="ea-skeleton esqueleto-card" />
          <div className="ea-skeleton esqueleto-card" />
        </div>
      )}

      {eventos !== null && futuros.length === 0 && (
        <Vazio titulo="Nenhum evento futuro cadastrado." texto="Quando uma atlética publicar um evento, ele aparece aqui na hora." />
      )}

      {futuros.length > 0 && filtrados.length === 0 && (
        <Vazio
          titulo={dataFiltro && tipoFiltro === "todos" && !atleticaFiltro ? "Nenhum evento nesta data." : "Nenhum evento com esses filtros."}
          texto={sugestao(futuros, dataFiltro)}
          acao={<button className="ea-btn" onClick={limparFiltros}>Ver todos os eventos</button>}
        />
      )}

      {lista.length > 0 && (
        <>
          <h2 className="caption ea-muted so-mobile">{temFiltro ? "RESULTADOS" : "A SEGUIR"}</h2>
          <section className="lista-eventos" aria-label="Eventos">
            {lista.map((evento) => (
              <CartaoEvento
                key={evento.id}
                evento={evento}
                confirmado={confirmados.has(evento.id)}
                onAlternarPresenca={alternarPresenca}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function Destaque({ evento, confirmado, onAlternarPresenca }) {
  const tipo = TIPOS[evento.tipo] || TIPOS.esportivo;
  const { dia, mes, semanaLonga } = partesData(evento.data);

  return (
    <article className="ea-glass ea-glass--float destaque">
      <div className="linha-entre">
        <span className={tipo.tag}>{tipo.rotulo}</span>
        <span className="label ea-muted">{textoDias(evento.data)}</span>
      </div>
      <div className="linha">
        <div className="ea-date destaque__data">
          <div className="ea-date__n">{dia}</div>
          <div className="ea-date__m">{mes}</div>
        </div>
        <div className="min-0">
          <div className="caption ea-muted">PRÓXIMO EVENTO</div>
          <h2 className="title destaque__nome">{evento.nome}</h2>
        </div>
      </div>
      {evento.descricao && <p className="body ea-muted destaque__desc">{evento.descricao}</p>}
      <div className="linha linha--quebra">
        <span className="label info">{semanaLonga} · {evento.horario || "horário a definir"}</span>
        <span className="label info">{evento.local || "Local a definir"}</span>
      </div>
      <span className="ea-meta destaque__org">
        <span className="ea-avatar" aria-hidden="true">{(evento.atleticaEmail || "?")[0].toUpperCase()}</span>
        {evento.atleticaEmail}
      </span>
      {confirmado ? (
        <div className="linha">
          <span className="ea-going cresce"><Icone nome="check" tamanho={15} traco={3} />Presença confirmada</span>
          <button className="ea-btn ea-btn--icon" aria-label={`Cancelar presença em ${evento.nome}`} onClick={() => onAlternarPresenca(evento)}>
            <Icone nome="fechar" tamanho={16} traco={2.4} />
          </button>
        </div>
      ) : (
        <button className="ea-btn ea-btn--block" onClick={() => onAlternarPresenca(evento)}>Confirmar presença</button>
      )}
    </article>
  );
}

function Vazio({ titulo, texto, acao }) {
  return (
    <section className="ea-glass ea-glass--strong vazio" role="status">
      <span className="vazio__icone ea-hl"><Icone nome="calendarioVazio" tamanho={32} traco={1.8} /></span>
      <h2 className="title vazio__titulo">{titulo}</h2>
      {texto && <p className="body ea-muted">{texto}</p>}
      {acao}
    </section>
  );
}

// "O mais perto é X (18/12) e Y (20/12)." — os dois eventos futuros mais próximos da data filtrada.
function sugestao(futuros, dataFiltro) {
  const proximos = futuros.filter((e) => !dataFiltro || e.data >= dataFiltro).slice(0, 2);
  if (proximos.length === 0) return "";
  const nomes = proximos.map((e) => `${e.nome} (${formatarData(e.data).slice(0, 5)})`);
  return `O mais perto é ${nomes.join(" e ")}.`;
}

export default VisualizarEventos;
