import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert("Conta criada com sucesso!");
    } catch (error) {
      setErro(error.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Login realizado com sucesso!");
    } catch (error) {
      setErro(error.message);
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

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button onClick={handleLogin}>Entrar</button>
        <button onClick={handleCadastro}>Criar Conta</button>
      </form>
    </div>
  );
}

export default Login;