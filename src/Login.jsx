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
    <div>
      <h2>Entrar ou Criar Conta</h2>
      <form>
        <div>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="tipo"
              value="estudante"
              checked={tipoUsuario === "estudante"}
              onChange={(e) => setTipoUsuario(e.target.value)}
            />
            Sou Estudante
          </label>
          <label>
            <input
              type="radio"
              name="tipo"
              value="atletica"
              checked={tipoUsuario === "atletica"}
              onChange={(e) => setTipoUsuario(e.target.value)}
            />
            Sou Atlética
          </label>
        </div>

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button onClick={handleLogin}>Entrar</button>
        <button onClick={handleCadastro}>Criar Conta</button>
      </form>
    </div>
  );
}

export default Login;