import { useEffect, useRef } from "react";
import { partesData } from "./datas";
import { TIPOS } from "./tipos";
import Icone from "./Icone";

// Tela: Excluir evento (GExcluirDesk / GExcluirMob). Substitui o window.confirm.
// Desktop: diálogo centralizado. Mobile: folha presa à base (feito no CSS).
function ConfirmarExclusao({ evento, quantidadePresencas, excluindo, onCancelar, onConfirmar }) {
  const cancelarRef = useRef(null);
  const tipo = TIPOS[evento.tipo] || TIPOS.esportivo;
  const { dia, mes } = partesData(evento.data);

  useEffect(() => {
    cancelarRef.current?.focus(); // o foco começa em Cancelar
  }, []);

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "Escape") onCancelar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onCancelar]);

  const presencas =
    quantidadePresencas === 0
      ? ""
      : quantidadePresencas === 1
        ? " e a presença confirmada deixa de valer"
        : ` e as ${quantidadePresencas} presenças confirmadas deixam de valer`;

  return (
    <div className="dialogo">
      <div className="ea-scrim" onClick={onCancelar} />
      <div
        className="ea-glass ea-glass--float ea-dialog dialogo__caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-titulo"
        aria-describedby="dlg-texto"
      >
        <span className="dialogo__puxador so-mobile" aria-hidden="true" />
        <span className="dialogo__icone"><Icone nome="lixeira" tamanho={24} /></span>
        <h2 id="dlg-titulo" className="title">Excluir "{evento.nome}"?</h2>
        <p id="dlg-texto" className="body ea-muted">
          O evento sai da agenda de todos os estudantes{presencas}. Essa ação não pode ser desfeita.
        </p>
        <div className="ea-glass dialogo__resumo so-desktop">
          <div className={`ea-date dialogo__data dialogo__data--${tipo.modificador}`}>
            <div className="ea-date__n">{dia}</div>
            <div className="ea-date__m">{mes}</div>
          </div>
          <div className="pilha pilha--curta">
            <span className={tipo.tag}>{tipo.rotulo}</span>
            <span className="label">{evento.nome} · {quantidadePresencas} {quantidadePresencas === 1 ? "presença" : "presenças"}</span>
          </div>
        </div>
        <div className="dialogo__acoes">
          <button ref={cancelarRef} className="ea-btn ea-btn--ghost" onClick={onCancelar}>Cancelar</button>
          <button className="ea-btn ea-btn--danger" onClick={onConfirmar} disabled={excluindo}>
            <Icone nome="lixeira" tamanho={16} />Excluir evento
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarExclusao;
