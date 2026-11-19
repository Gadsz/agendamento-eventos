import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

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

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("estudante");
  const [erro, setErro] = useState("");

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      const resultado = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );
      const usuario = resultado.user;

      await setDoc(doc(db, "usuarios", usuario.uid), {
        email: usuario.email,
        tipo: tipoUsuario,
      });
      // Após o cadastro, o App detecta o login e abre a tela do perfil.
    } catch (error) {
      setErro(traduzirErro(error));
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (error) {
      setErro(traduzirErro(error));
    }
  }

  return (
    <div className="card auth-card">
      <h2>Entrar ou criar conta</h2>
      <p className="muted">
        Acesse a agenda de eventos das atléticas de Cascavel.
      </p>

      <form>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <fieldset className="perfil-opcoes">
          <legend>Ao criar a conta, eu sou:</legend>
          <label className="opcao">
            <input
              type="radio"
              name="tipo"
              value="estudante"
              checked={tipoUsuario === "estudante"}
              onChange={(e) => setTipoUsuario(e.target.value)}
            />
            Estudante
          </label>
          <label className="opcao">
            <input
              type="radio"
              name="tipo"
              value="atletica"
              checked={tipoUsuario === "atletica"}
              onChange={(e) => setTipoUsuario(e.target.value)}
            />
            Atlética
          </label>
        </fieldset>

        {erro && (
          <p className="error" role="alert">
            {erro}
          </p>
        )}

        <div className="actions">
          <button className="btn btn-primary" onClick={handleLogin}>
            Entrar
          </button>
          <button className="btn btn-secondary" onClick={handleCadastro}>
            Criar conta
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;