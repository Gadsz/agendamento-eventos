import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// Data de hoje no fuso local, no formato AAAA-MM-DD (o mesmo do campo "data").
function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

function formatarData(data) {
  return data ? data.split("-").reverse().join("/") : "";
}

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

  const hoje = hojeISO();
  const eventosFuturos = listaEventos.filter((evento) => evento.data >= hoje);

  const eventosFiltrados = dataFiltro
    ? eventosFuturos.filter((evento) => evento.data === dataFiltro)
    : eventosFuturos;

  return (
    <div>
      <h2>Próximos Eventos</h2>

      <div>
        <label>Filtrar por data</label>
        <input
          type="date"
          min={hoje}
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
        />
        <button onClick={() => setDataFiltro("")}>Limpar</button>
      </div>

      {eventosFuturos.length === 0 && <p>Nenhum evento futuro cadastrado.</p>}
      {eventosFuturos.length > 0 && eventosFiltrados.length === 0 && (
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