import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("estudante");
  const [erro, setErro] = useState("");

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");
    try {
      const resultado = await createUserWithEmailAndPassword(auth, email, senha);
      const usuario = resultado.user;

      await setDoc(doc(db, "usuarios", usuario.uid), {
        email: usuario.email,
        tipo: tipoUsuario,
      });

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