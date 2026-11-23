import { useState } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import Icone from "./Icone";

// Formulário de cadastro e edição de evento.
// Desktop: painel ao lado da lista (GGerenciarDesk). Mobile: tela própria (GFormMob).
// O pai troca a `key` ao mudar de evento, então o estado inicial basta.
function FormEvento({ usuario, evento, quantidadePresencas = 0, onConcluir }) {
  const editando = Boolean(evento);
  const [nome, setNome] = useState(evento?.nome || "");
  const [data, setData] = useState(evento?.data || "");
  const [horario, setHorario] = useState(evento?.horario || "");
  const [local, setLocal] = useState(evento?.local || "");
  const [tipo, setTipo] = useState(evento?.tipo || "esportivo");
  const [descricao, setDescricao] = useState(evento?.descricao || "");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !data) {
      setErro("Informe o nome e a data do evento.");
      return;
    }

    const dadosEvento = {
      nome: nome.trim(),
      data,
      horario,
      local: local.trim(),
      tipo,
      descricao: descricao.trim(),
    };

    setSalvando(true);
    try {
      if (editando) {
        await updateDoc(doc(db, "eventos", evento.id), dadosEvento);
      } else {
        // atleticaId é exigido pelas regras do Firestore; o e-mail identifica a atlética na agenda.
        await addDoc(collection(db, "eventos"), {
          ...dadosEvento,
          atleticaId: usuario.uid,
          atleticaEmail: usuario.email,
        });
      }
      onConcluir();
    } catch {
      setErro("Não foi possível salvar o evento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section aria-labelledby="form-titulo" className="ea-glass ea-glass--strong form-evento">
      <div className="linha">
        <span className="ea-date form-evento__icone so-desktop"><Icone nome={editando ? "lapis" : "calendario"} tamanho={20} /></span>
        <div className="min-0">
          {editando && <span className="caption ea-muted">EDITANDO</span>}
          <h2 id="form-titulo" className="title form-evento__titulo">{editando ? evento.nome : "Novo evento"}</h2>
        </div>
      </div>

      <form className="pilha" onSubmit={handleSalvar} noValidate>
        <label className="ea-field">
          Nome do evento
          <input className="ea-input" placeholder="Ex.: Vôlei solidário" value={nome} onChange={(e) => setNome(e.target.value)} aria-invalid={erro && !nome.trim() ? "true" : undefined} aria-describedby={erro ? "erro-form" : undefined} />
        </label>
        <div className="grade-2">
          <label className="ea-field">
            Data
            <input className="ea-input" type="date" value={data} onChange={(e) => setData(e.target.value)} aria-invalid={erro && !data ? "true" : undefined} />
          </label>
          <label className="ea-field">
            Horário (opcional)
            <input className="ea-input" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
          </label>
        </div>
        <label className="ea-field">
          Local (opcional)
          <input className="ea-input" placeholder="Ex.: Ginásio do IFPR" value={local} onChange={(e) => setLocal(e.target.value)} />
        </label>
        <div className="ea-field" role="group" aria-labelledby="tipo-rotulo">
          <span id="tipo-rotulo">Tipo</span>
          <div className="ea-tabs" role="tablist" aria-label="Tipo">
            <button type="button" className="ea-tab" role="tab" aria-selected={tipo === "esportivo"} onClick={() => setTipo("esportivo")}>Esportivo</button>
            <button type="button" className="ea-tab" role="tab" aria-selected={tipo === "festa"} onClick={() => setTipo("festa")}>Festa</button>
          </div>
        </div>
        <label className="ea-field">
          Descrição
          <textarea className="ea-input" placeholder="Conte o que vai rolar" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </label>

        {editando && quantidadePresencas > 0 && (
          <p className="ea-hint">
            {quantidadePresencas === 1
              ? "A presença confirmada continua valendo depois da alteração."
              : `As ${quantidadePresencas} presenças confirmadas continuam valendo depois da alteração.`}
          </p>
        )}

        {erro && <p id="erro-form" className="ea-alert" role="alert"><Icone nome="alerta" />{erro}</p>}

        <button type="submit" className="ea-btn ea-btn--block btn-alto" disabled={salvando}>
          {editando ? "Salvar alteração" : "Cadastrar evento"}
        </button>
        {/* Sem edição, "Voltar" só existe no mobile, onde o formulário é uma tela. */}
        <button type="button" className={`ea-btn ea-btn--ghost ea-btn--block${editando ? "" : " so-mobile"}`} onClick={onConcluir}>
          {editando ? "Cancelar edição" : "Voltar"}
        </button>
      </form>
    </section>
  );
}

export default FormEvento;
