// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_WmwkdSTVkBC3qih2XSD7Fd5OfBKvp1k",
  authDomain: "agendamento-eventos-cascavel.firebaseapp.com",
  projectId: "agendamento-eventos-cascavel",
  storageBucket: "agendamento-eventos-cascavel.firebasestorage.app",
  messagingSenderId: "466239854644",
  appId: "1:466239854644:web:809a186857d12695425261"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar no restante do projeto
export const auth = getAuth(app);       // Autenticação
export const db = getFirestore(app);    // Banco de dados