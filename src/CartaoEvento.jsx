import Icone from "./Icone";
import { partesData } from "./datas";
import { TIPOS } from "./tipos";

// CartaoEvento da agenda do estudante. No desktop é card em grade;
// no mobile (até 640px) o CSS o transforma em linha compacta.
function CartaoEvento({ evento, confirmado, onAlternarPresenca }) {
  const tipo = TIPOS[evento.tipo] || TIPOS.esportivo;
  const { dia, mes, semana } = partesData(evento.data);

  return (
    <article className={`ea-glass ea-card cartao cartao--${tipo.modificador}`}>
      <div className="cartao__topo">
        <div className="cartao__data">
          <div className="ea-card__day">{dia}</div>
          <div className="ea-card__when">
            <span className="so-desktop">{mes} · </span>{semana}
          </div>
        </div>
        <span className={tipo.tag}>{tipo.rotulo}</span>
      </div>

      <div className="cartao__corpo">
        <h3 className="ea-card__name">{evento.nome}</h3>
        {evento.descricao && <p className="ea-card__desc cartao__desc">{evento.descricao}</p>}
        <div className="cartao__metas">
          <span className="ea-meta"><Icone nome="relogio" tamanho={15} />{evento.horario || "Horário a definir"}</span>
          <span className="ea-meta"><Icone nome="local" tamanho={15} />{evento.local || "Local a definir"}</span>
        </div>
        <span className="ea-meta cartao__org">
          <span className="ea-avatar" aria-hidden="true">{(evento.atleticaEmail || "?")[0].toUpperCase()}</span>
          Organizado por {evento.atleticaEmail || "atlética"}
        </span>
      </div>

      <div className="cartao__acao">
        {confirmado ? (
          <>
            <span className="ea-going so-desktop"><Icone nome="check" tamanho={15} traco={3} />Presença confirmada</span>
            <button className="ea-btn ea-btn--icon so-desktop" aria-label={`Cancelar presença em ${evento.nome}`} onClick={() => onAlternarPresenca(evento)}>
              <Icone nome="fechar" tamanho={16} traco={2.4} />
            </button>
            <button className="ea-btn ea-btn--icon botao-redondo botao-redondo--ativo so-mobile" aria-label={`Presença confirmada em ${evento.nome}. Toque para cancelar`} onClick={() => onAlternarPresenca(evento)}>
              <Icone nome="check" tamanho={18} traco={3} />
            </button>
          </>
        ) : (
          <>
            <button className="ea-btn ea-btn--sm so-desktop" onClick={() => onAlternarPresenca(evento)}>
              Confirmar presença
            </button>
            <button className="ea-btn ea-btn--icon botao-redondo so-mobile" aria-label={`Confirmar presença em ${evento.nome}`} onClick={() => onAlternarPresenca(evento)}>
              <Icone nome="maisSimples" tamanho={18} traco={2.6} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default CartaoEvento;
