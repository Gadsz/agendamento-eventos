import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Eventos em tempo real, em ordem de data. Com atleticaId, só os daquela atlética.
export function useEventos(atleticaId) {
  const [eventos, setEventos] = useState(null);

  useEffect(() => {
    // Com where + orderBy em campos diferentes o Firestore pede índice composto; ordenamos no cliente.
    const consulta = atleticaId
      ? query(collection(db, "eventos"), where("atleticaId", "==", atleticaId))
      : query(collection(db, "eventos"), orderBy("data"));

    return onSnapshot(consulta, (snapshot) => {
      const lista = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      setEventos(lista);
    });
  }, [atleticaId]);

  return eventos; // null enquanto a primeira leitura não chega
}

// Confirmações de presença. As regras do Firestore só deixam ler as próprias:
// o estudante filtra por usuarioId e a atlética por atleticaId.
export function useConfirmacoes(campo, uid) {
  const [confirmacoes, setConfirmacoes] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const consulta = query(collection(db, "confirmacoes"), where(campo, "==", uid));
    return onSnapshot(consulta, (snapshot) => {
      setConfirmacoes(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });
  }, [campo, uid]);

  return confirmacoes;
}

// Id fixo (eventoId_uid): impede confirmação duplicada e é exigido pelas regras.
export function confirmarPresenca(evento, usuario) {
  return setDoc(doc(db, "confirmacoes", `${evento.id}_${usuario.uid}`), {
    eventoId: evento.id,
    usuarioId: usuario.uid,
    usuarioEmail: usuario.email,
    atleticaId: evento.atleticaId,
    criadoEm: serverTimestamp(),
  });
}

export function cancelarPresenca(evento, usuario) {
  return deleteDoc(doc(db, "confirmacoes", `${evento.id}_${usuario.uid}`));
}
