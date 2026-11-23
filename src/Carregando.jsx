import Icone from "./Icone";

// Tela: Carregando (GCarregandoMob). Usada pelo App enquanto o Firebase
// confirma a sessão ("Carregando…") e lê o perfil ("Carregando seu perfil…").
function Carregando({ texto = "Carregando…" }) {
  return (
    <div className="carregando" role="status" aria-live="polite">
      <div className="carregando__marca">
        <div className="ea-glass ea-glass--float ea-hl carregando__icone">
          <Icone nome="calendario" tamanho={44} traco={1.8} />
        </div>
        <div className="ea-spinner carregando__giro" aria-hidden="true" />
      </div>
      <span className="carregando__nome">Eventos das Atléticas</span>
      <span className="body ea-muted">{texto}</span>
      <div className="carregando__esqueletos" aria-hidden="true">
        <div className="ea-skeleton" />
        <div className="ea-skeleton" style={{ opacity: 0.7 }} />
        <div className="ea-skeleton" style={{ opacity: 0.45 }} />
      </div>
    </div>
  );
}

export default Carregando;
