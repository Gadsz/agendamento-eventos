import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Icone from "./Icone";

// Telas: Entrar (GLoginDesk / GLoginMob) e Criar conta (GCadastroDesk / GCadastroMob).

function traduzirErro(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/missing-password":
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "E-mail ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    default:
      return "Não foi possível concluir a operação. Tente novamente.";
  }
}

const PERFIS = [
  { valor: "estudante", titulo: "Estudante", descricao: "Vejo a agenda e confirmo presença", icone: "estudante" },
  { valor: "atletica", titulo: "Atlética", descricao: "Publico e gerencio eventos", icone: "atletica" },
];

function Login() {
  const [modo, setModo] = useState("entrar"); // "entrar" | "criar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("estudante");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const criando = modo === "criar";

  function trocarModo(novoModo) {
    setModo(novoModo);
    setErro("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    setEnviando(true);
    try {
      if (criando) {
        const resultado = await createUserWithEmailAndPassword(auth, email.trim(), senha);
        await setDoc(doc(db, "usuarios", resultado.user.uid), {
          email: resultado.user.email,
          tipo: tipoUsuario,
        });
        // Após o cadastro, o App detecta o login e abre a tela do perfil.
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), senha);
      }
    } catch (error) {
      setErro(traduzirErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <section className="login__apresentacao">
        <div className="marca">
          <span className="marca__icone ea-glass ea-glass--strong ea-hl">
            <Icone nome="calendario" tamanho={22} />
          </span>
          Eventos das Atléticas
        </div>

        {criando ? (
          <h1 className="display-xl">
            Entre pra <span className="ea-hl">agenda</span> da cidade.
          </h1>
        ) : (
          <h1 className="display-xl">
            Todos os rolês das atléticas num <span className="ea-hl">lugar só.</span>
          </h1>
        )}

        <p className="body-l login__texto">
          {criando
            ? "Estudante confirma presença nos eventos. Atlética publica, edita e acompanha quem vai. Escolha seu perfil ao criar a conta."
            : "Jogos, festas e encontros das atléticas de Cascavel, atualizados em tempo real. Entre para ver a agenda ou publicar os eventos da sua atlética."}
        </p>

        {/* Decorativo: some no mobile para o formulário caber na primeira dobra. */}
        <div className="login__vitrine so-desktop" aria-hidden="true">
          <div className="ea-glass login__mini login__mini--1">
            <span className="ea-date login__mini-data">17</span>
            <span className="login__mini-texto">
              <span className="ea-tag ea-tag--sport">Esportivo</span>
              <strong>GeoGuesser</strong>
            </span>
          </div>
          <div className="ea-glass ea-glass--strong login__mini login__mini--2">
            <span className="ea-date login__mini-data login__mini-data--festa">18</span>
            <span className="login__mini-texto">
              <span className="ea-tag ea-tag--party">Festa</span>
              <strong>Feira de Discos</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="ea-glass ea-glass--float login__card" aria-label={criando ? "Criar conta" : "Entrar"}>
        <div className="ea-tabs" role="tablist" aria-label="Acesso">
          <button type="button" className="ea-tab" role="tab" aria-selected={!criando} onClick={() => trocarModo("entrar")}>
            Entrar
          </button>
          <button type="button" className="ea-tab" role="tab" aria-selected={criando} onClick={() => trocarModo("criar")}>
            Criar conta
          </button>
        </div>

        <div>
          <h2 className="title">{criando ? "Criar sua conta" : "Bem-vindo de volta"}</h2>
          {!criando && (
            <p className="label ea-muted login__sub">Acesse a agenda de eventos das atléticas de Cascavel.</p>
          )}
        </div>

        <form className="pilha" onSubmit={handleSubmit} noValidate>
          <label className="ea-field">
            E-mail
            <input
              className="ea-input"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={erro ? "true" : undefined}
              aria-describedby={erro ? "erro-login" : undefined}
            />
          </label>

          <label className="ea-field">
            Senha
            <span className="campo-senha">
              <input
                className="ea-input"
                type={mostrarSenha ? "text" : "password"}
                autoComplete={criando ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                className="ea-btn ea-btn--icon campo-senha__botao"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={mostrarSenha}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                <Icone nome="olho" />
              </button>
            </span>
            {criando && <span className="ea-hint">Mínimo de 6 caracteres.</span>}
          </label>

          {criando && (
            <fieldset className="perfis">
              <legend className="label">Eu sou</legend>
              <div className="perfis__opcoes">
                {PERFIS.map((perfil) => (
                  <label key={perfil.valor} className="ea-option perfis__opcao">
                    <span className="perfis__topo">
                      <Icone nome={perfil.icone} tamanho={24} />
                      <input
                        type="radio"
                        name="tipo"
                        value={perfil.valor}
                        checked={tipoUsuario === perfil.valor}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                      />
                    </span>
                    <span className="ea-option__title">{perfil.titulo}</span>
                    <span className="ea-option__desc">{perfil.descricao}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {erro && (
            <p id="erro-login" className="ea-alert" role="alert">
              <Icone nome="alerta" />
              <span>
                {erro}
                {criando && erro === "Este e-mail já está cadastrado." && (
                  <>
                    {" "}
                    <button type="button" className="link" onClick={() => trocarModo("entrar")}>
                      Entrar
                    </button>
                  </>
                )}
              </span>
            </p>
          )}

          <button type="submit" className="ea-btn ea-btn--block btn-alto" disabled={enviando}>
            {criando ? "Criar conta" : "Entrar"}
            {!criando && <Icone nome="seta" traco={2.5} />}
          </button>
        </form>

        <p className="label ea-muted login__troca">
          {criando ? "Já tem conta? " : "Ainda não tem conta? "}
          <button type="button" className="link" onClick={() => trocarModo(criando ? "entrar" : "criar")}>
            {criando ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default Login;
