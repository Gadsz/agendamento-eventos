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

  if (carregando) return <p>Carregando...</p>;

  if (!usuario) return <Login />;

  return (
    <div>
      <p>
        Logado como {usuario.email} {perfil && `(${perfil.tipo})`}{" "}
        <button onClick={() => signOut(auth)}>Sair</button>
      </p>
      <hr />

      {!perfil && <p>Carregando perfil...</p>}
      {perfil?.tipo === "atletica" && <Eventos />}
      {perfil?.tipo === "estudante" && <VisualizarEventos />}
    </div>
  );
}

export default App;