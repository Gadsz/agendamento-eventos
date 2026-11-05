import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

function VisualizarEventos() {
  const [listaEventos, setListaEventos] = useState([]);
  const [dataFiltro, setDataFiltro] = useState("");

  useEffect(() => {
    const consulta = query(collection(db, "eventos"), orderBy("data"));
    const cancelar = onSnapshot(consulta, (snapshot) => {
      const eventos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setListaEventos(eventos);
    });

    return () => cancelar();
  }, []);

  function formatarData(data) {
    return data.split("-").reverse().join("/");
  }

  const eventosFiltrados = dataFiltro
    ? listaEventos.filter((evento) => evento.data === dataFiltro)
    : listaEventos;

  return (
    <div>
      <h2>Próximos Eventos</h2>

      <div>
        <label>Filtrar por data</label>
        <input
          type="date"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
        />
        <button onClick={() => setDataFiltro("")}>Limpar</button>
      </div>

      {listaEventos.length === 0 && <p>Nenhum evento cadastrado ainda.</p>}
      {listaEventos.length > 0 && eventosFiltrados.length === 0 && (
        <p>Nenhum evento nesta data.</p>
      )}

      <ul>
        {eventosFiltrados.map((evento) => (
          <li key={evento.id}>
            <strong>{evento.nome}</strong> — {formatarData(evento.data)} (
            {evento.tipo})
            <p>{evento.descricao}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VisualizarEventos;