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

function Eventos() {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("esportivo");
  const [descricao, setDescricao] = useState("");
  const [listaEventos, setListaEventos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const referenciaEventos = collection(db, "eventos");
    const unsubscribe = onSnapshot(referenciaEventos, (snapshot) => {
      const eventos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setListaEventos(eventos);
    });

    return () => unsubscribe();
  }, []);

  async function handleSalvar(e) {
    e.preventDefault();

    const dadosEvento = { nome, data, tipo, descricao };

    if (editandoId) {
      await updateDoc(doc(db, "eventos", editandoId), dadosEvento);
      setEditandoId(null);
    } else {
      await addDoc(collection(db, "eventos"), dadosEvento);
    }

    setNome("");
    setData("");
    setTipo("esportivo");
    setDescricao("");
  }

  function handleEditar(evento) {
    setNome(evento.nome);
    setData(evento.data);
    setTipo(evento.tipo);
    setDescricao(evento.descricao);
    setEditandoId(evento.id);
  }

  async function handleExcluir(id) {
    await deleteDoc(doc(db, "eventos", id));
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
        <button type="submit">
          {editandoId ? "Salvar Alteração" : "Cadastrar Evento"}
        </button>
      </form>

      <h3>Eventos Cadastrados</h3>
      <ul>
        {listaEventos.map((evento) => (
          <li key={evento.id}>
            <strong>{evento.nome}</strong> — {evento.data} ({evento.tipo})
            <p>{evento.descricao}</p>
            <button onClick={() => handleEditar(evento)}>Editar</button>
            <button onClick={() => handleExcluir(evento.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Eventos;