import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

function VisualizarEventos() {
  const [listaEventos, setListaEventos] = useState([]);

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

  return (
    <div>
      <h2>Próximos Eventos</h2>
      {listaEventos.length === 0 && <p>Nenhum evento cadastrado ainda.</p>}
      <ul>
        {listaEventos.map((evento) => (
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