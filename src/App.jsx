import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./Login";
import Eventos from "./Eventos";
import VisualizarEventos from "./VisualizarEventos";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelarPerfil = null;

    const cancelarAuth = onAuthStateChanged(auth, (usuarioLogado) => {
      if (cancelarPerfil) {
        cancelarPerfil();
        cancelarPerfil = null;
      }

      setUsuario(usuarioLogado);

      if (usuarioLogado) {
        cancelarPerfil = onSnapshot(
          doc(db, "usuarios", usuarioLogado.uid),
          (docSnap) => {
            setPerfil(docSnap.exists() ? docSnap.data() : null);
            setCarregando(false);
          }
        );
      } else {
        setPerfil(null);
        setCarregando(false);
      }
    });

    return () => {
      cancelarAuth();
      if (cancelarPerfil) cancelarPerfil();
    };
  }, []);

  if (carregando) {
    return (
      <main className="page">
        <p className="info">Carregando...</p>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="page auth-page">
        <Login />
      </main>
    );
  }

  return (
    <>
      <header className="topbar">
        <strong className="topbar-title">Eventos das Atléticas</strong>
        <div className="topbar-user">
          <span className="user-email">{usuario.email}</span>
          {perfil && (
            <span className="badge badge-perfil">
              {perfil.tipo === "atletica" ? "Atlética" : "Estudante"}
            </span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => signOut(auth)}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="page">
        {!perfil && <p className="info">Carregando perfil...</p>}
        {perfil?.tipo === "atletica" && <Eventos />}
        {perfil?.tipo === "estudante" && <VisualizarEventos />}
      </main>
    </>
  );
}

export default App;