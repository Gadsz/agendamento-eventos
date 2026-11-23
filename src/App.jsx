import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useConfirmacoes } from "./dados";
import Icone from "./Icone";
import Login from "./Login";
import Carregando from "./Carregando";
import VisualizarEventos from "./VisualizarEventos";
import MinhasPresencas from "./MinhasPresencas";
import Eventos from "./Eventos";

// Tema do design system: "menta" (padrão), "por-do-sol", "pastel" ou "chiclete".
const TEMA = "menta";

const NAVEGACAO = {
  estudante: [
    { id: "agenda", rotulo: "Agenda", rotuloCurto: "Agenda", icone: "calendario" },
    { id: "presencas", rotulo: "Minhas presenças", rotuloCurto: "Presenças", icone: "ingresso" },
  ],
  atletica: [
    { id: "eventos", rotulo: "Meus eventos", rotuloCurto: "Eventos", icone: "calendario" },
    // No desktop o formulário fica sempre ao lado da lista; no mobile é uma tela.
    { id: "novo", rotulo: "Novo evento", rotuloCurto: "Novo", icone: "mais", soMobile: true },
  ],
};

function Cena({ children }) {
  return (
    <div className="ea-scene app" data-theme={TEMA}>
      {children}
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tela, setTela] = useState(null);

  useEffect(() => {
    let cancelarPerfil = null;

    const cancelarAuth = onAuthStateChanged(auth, (usuarioLogado) => {
      if (cancelarPerfil) {
        cancelarPerfil();
        cancelarPerfil = null;
      }

      setUsuario(usuarioLogado);
      setTela(null);

      if (usuarioLogado) {
        cancelarPerfil = onSnapshot(doc(db, "usuarios", usuarioLogado.uid), (docSnap) => {
          setPerfil(docSnap.exists() ? docSnap.data() : null);
          setCarregando(false);
        });
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

  const ehAtletica = perfil?.tipo === "atletica";
  const confirmacoes = useConfirmacoes(ehAtletica ? "atleticaId" : "usuarioId", perfil ? usuario?.uid : null);

  if (carregando) {
    return <Cena><Carregando texto="Carregando…" /></Cena>;
  }

  if (!usuario) {
    return <Cena><Login /></Cena>;
  }

  if (!perfil) {
    return <Cena><Carregando texto="Carregando seu perfil…" /></Cena>;
  }

  const itens = NAVEGACAO[perfil.tipo];
  const atual = tela ?? itens[0].id;
  const rotuloPerfil = ehAtletica ? "Atlética" : "Estudante";
  const classeTagPerfil = ehAtletica ? "ea-tag ea-tag--party" : "ea-tag ea-tag--sport";

  return (
    <Cena>
      <div className="pagina">
        {/* BarraTopo: só no desktop */}
        <header className="ea-glass ea-topbar so-desktop">
          <span className="marca marca--pequena">
            <span className="ea-hl"><Icone nome="calendario" tamanho={20} /></span>
            Eventos das Atléticas
          </span>
          <nav className="ea-nav" aria-label="Principal">
            {itens.filter((item) => !item.soMobile).map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={atual === item.id ? "page" : undefined}
                onClick={(e) => { e.preventDefault(); setTela(item.id); }}
              >
                {item.rotulo}
                {item.id === "presencas" && confirmacoes.length > 0 && (
                  <span className="ea-count">{confirmacoes.length}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="topo__usuario">
            <span className="ea-muted">{usuario.email}</span>
            <span className={classeTagPerfil}>{rotuloPerfil}</span>
            <button className="ea-btn ea-btn--ghost ea-btn--sm" onClick={() => signOut(auth)}>
              Sair
            </button>
          </div>
        </header>

        {/* Cabeçalho do mobile: inicial, saudação e perfil */}
        <div className="topo-mobile so-mobile">
          <span className="topo-mobile__quem">
            <span className={`ea-avatar ea-avatar--round${ehAtletica ? " ea-avatar--2" : ""} topo-mobile__avatar`} aria-hidden="true">
              {usuario.email[0].toUpperCase()}
            </span>
            <span className="topo-mobile__textos">
              <span className="label ea-muted">{ehAtletica ? "Atlética" : "Oi, estudante"}</span>
              <span className="label">{usuario.email}</span>
            </span>
          </span>
          <span className={classeTagPerfil}>{rotuloPerfil}</span>
        </div>

        <main>
          {atual === "agenda" && (
            <VisualizarEventos usuario={usuario} confirmacoes={confirmacoes} />
          )}
          {atual === "presencas" && (
            <MinhasPresencas usuario={usuario} confirmacoes={confirmacoes} irParaAgenda={() => setTela("agenda")} />
          )}
          {ehAtletica && (
            <Eventos
              usuario={usuario}
              confirmacoes={confirmacoes}
              formMobileAberto={atual === "novo"}
              fecharFormMobile={() => setTela("eventos")}
            />
          )}
        </main>
      </div>

      {/* NavInferior: só no mobile. Sair fica sempre por último. */}
      <nav className="ea-glass ea-glass--float ea-bottomnav nav-inferior so-mobile" aria-label="Principal">
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={atual === item.id ? "page" : undefined}
            onClick={() => setTela(item.id)}
          >
            <Icone nome={item.icone} tamanho={22} />
            {item.rotuloCurto}
          </button>
        ))}
        <button type="button" onClick={() => signOut(auth)}>
          <Icone nome="sair" tamanho={22} />
          Sair
        </button>
      </nav>
    </Cena>
  );
}

export default App;
