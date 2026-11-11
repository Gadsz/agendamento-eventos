import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

function formatarData(data) {
  return data ? data.split("-").reverse().join("/") : "";
}

function Eventos() {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("esportivo");
  const [descricao, setDescricao] = useState("");
  const [listaEventos, setListaEventos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const referenciaEventos = collection(db, "eventos");
    const unsubscribe = onSnapshot(referenciaEventos, (snapshot) => {
      const eventos = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      setListaEventos(eventos);
    });

    return () => unsubscribe();
  }, []);

  function limparFormulario() {
    setNome("");
    setData("");
    setTipo("esportivo");
    setDescricao("");
    setEditandoId(null);
  }

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
      tipo,
      descricao: descricao.trim(),
    };

    try {
      if (editandoId) {
        await updateDoc(doc(db, "eventos", editandoId), dadosEvento);
      } else {
        await addDoc(collection(db, "eventos"), dadosEvento);
      }
      limparFormulario();
    } catch (error) {
      setErro("Não foi possível salvar o evento. Tente novamente.");
    }
  }

  function handleEditar(evento) {
    setErro("");
    setNome(evento.nome);
    setData(evento.data);
    setTipo(evento.tipo);
    setDescricao(evento.descricao || "");
    setEditandoId(evento.id);
  }

  async function handleExcluir(evento) {
    if (!window.confirm(`Excluir o evento "${evento.nome}"?`)) return;

    setErro("");
    try {
      await deleteDoc(doc(db, "eventos", evento.id));
      if (editandoId === evento.id) limparFormulario();
    } catch (error) {
      setErro("Não foi possível excluir o evento. Tente novamente.");
    }
  }

  return (
    <div>
      <h2>Gerenciar Eventos</h2>

      <form onSubmit={handleSalvar}>
        <div>
          <label>Nome do evento</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label>Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <div>
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="esportivo">Esportivo</option>
            <option value="festa">Festa</option>
          </select>
        </div>
        <div>
          <label>Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button type="submit">
          {editandoId ? "Salvar Alteração" : "Cadastrar Evento"}
        </button>
        {editandoId && (
          <button type="button" onClick={limparFormulario}>
            Cancelar edição
          </button>
        )}
      </form>

      <h3>Eventos Cadastrados</h3>
      {listaEventos.length === 0 && <p>Nenhum evento cadastrado ainda.</p>}
      <ul>
        {listaEventos.map((evento) => (
          <li key={evento.id}>
            <strong>{evento.nome}</strong> — {formatarData(evento.data)} (
            {evento.tipo})
            <p>{evento.descricao}</p>
            <button onClick={() => handleEditar(evento)}>Editar</button>
            <button onClick={() => handleExcluir(evento)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Eventos;