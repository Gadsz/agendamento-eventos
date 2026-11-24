// Testes automatizados das regras de segurança (Firebase Emulator Suite).
// Rodar: npm test   (sobe o emulador do Firestore, executa e derruba)
/* global process */
import { readFileSync } from "node:fs";
import { test, before, after, beforeEach } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";

const A = { uid: "atletica-a", email: "a@atletica.com" };
const B = { uid: "atletica-b", email: "b@atletica.com" };
const E = { uid: "estudante-e", email: "e@aluno.com" };
const F = { uid: "estudante-f", email: "f@aluno.com" };

function isoDaqui(dias) {
  const d = new Date(Date.now() + dias * 86400000);
  return d.toISOString().slice(0, 10);
}
const eventoDeA = (extra = {}) => ({
  nome: "Vôlei solidário", data: isoDaqui(10), horario: "13:30", local: "Ciro Nardi",
  tipo: "esportivo", descricao: "Partida beneficente.", atleticaId: A.uid, atleticaEmail: A.email, ...extra,
});
const confirmacaoDeE = (extra = {}) => ({
  eventoId: "ev1", usuarioId: E.uid, usuarioEmail: E.email, atleticaId: A.uid, criadoEm: serverTimestamp(), ...extra,
});

let env;
const db = (u) => env.authenticatedContext(u.uid, { email: u.email }).firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-eventos",
    firestore: { rules: readFileSync(process.env.REGRAS || "../docs/firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
after(async () => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const s = ctx.firestore();
    await setDoc(doc(s, "usuarios", A.uid), { email: A.email, tipo: "atletica" });
    await setDoc(doc(s, "usuarios", B.uid), { email: B.email, tipo: "atletica" });
    await setDoc(doc(s, "usuarios", E.uid), { email: E.email, tipo: "estudante" });
    await setDoc(doc(s, "usuarios", F.uid), { email: F.email, tipo: "estudante" });
    await setDoc(doc(s, "eventos", "ev1"), eventoDeA());
    await setDoc(doc(s, "eventos", "passado"), eventoDeA({ data: isoDaqui(-5) }));
    await setDoc(doc(s, "confirmacoes", `ev1_${F.uid}`), {
      eventoId: "ev1", usuarioId: F.uid, usuarioEmail: F.email, atleticaId: A.uid, criadoEm: Timestamp.now(),
    });
  });
});

// ---- Perfis (RF01, RNF03) ----
test("R01 [T01] cria o próprio perfil de estudante", async () => {
  const novo = { uid: "novo", email: "novo@aluno.com" };
  await assertSucceeds(setDoc(doc(db(novo), "usuarios", novo.uid), { email: novo.email, tipo: "estudante" }));
});
test("R02 recusa perfil com tipo inválido (ex.: admin)", async () => {
  const novo = { uid: "novo", email: "novo@aluno.com" };
  await assertFails(setDoc(doc(db(novo), "usuarios", novo.uid), { email: novo.email, tipo: "admin" }));
});
test("R03 recusa trocar o próprio perfil depois de criado", async () => {
  await assertFails(updateDoc(doc(db(E), "usuarios", E.uid), { tipo: "atletica" }));
});

// ---- Eventos (RF02, RF03, RNF03) ----
test("R04 [T03] atlética cadastra evento válido", async () => {
  await assertSucceeds(setDoc(doc(db(A), "eventos", "novo"), eventoDeA()));
});
test("R05 recusa evento sem atleticaId (código da main atual)", async () => {
  const semAutor = eventoDeA();
  delete semAutor.atleticaId;
  await assertFails(setDoc(doc(db(A), "eventos", "novo"), semAutor));
});
test("R06 recusa atleticaEmail diferente do e-mail autenticado", async () => {
  await assertFails(setDoc(doc(db(A), "eventos", "novo"), eventoDeA({ atleticaEmail: B.email })));
});
test("R07 recusa tipo, data ou campo fora do esquema", async () => {
  await assertFails(setDoc(doc(db(A), "eventos", "x1"), eventoDeA({ tipo: "show" })));
  await assertFails(setDoc(doc(db(A), "eventos", "x2"), eventoDeA({ data: "17/12/2026" })));
  await assertFails(setDoc(doc(db(A), "eventos", "x3"), eventoDeA({ destaque: true })));
});
test("R08 [T09] estudante não grava evento", async () => {
  await assertFails(setDoc(doc(db(E), "eventos", "novo"), eventoDeA({ atleticaId: E.uid, atleticaEmail: E.email })));
});
test("R09 [T04] atlética edita e exclui o próprio evento", async () => {
  await assertSucceeds(updateDoc(doc(db(A), "eventos", "ev1"), { nome: "Vôlei solidário II" }));
  await assertSucceeds(deleteDoc(doc(db(A), "eventos", "passado")));
});
test("R10 [T06] atlética B não edita nem exclui evento da A", async () => {
  await assertFails(updateDoc(doc(db(B), "eventos", "ev1"), { nome: "Invadido" }));
  await assertFails(deleteDoc(doc(db(B), "eventos", "ev1")));
});
test("R11 atlética A não transfere a autoria do evento", async () => {
  await assertFails(updateDoc(doc(db(A), "eventos", "ev1"), { atleticaId: B.uid }));
});
test("R12 usuário não autenticado não lê eventos", async () => {
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "eventos", "ev1")));
});

// ---- Confirmações (RF06, RF07, RNF03) ----
test("R13 [T12] estudante confirma presença em evento futuro", async () => {
  await assertSucceeds(setDoc(doc(db(E), "confirmacoes", `ev1_${E.uid}`), confirmacaoDeE()));
});
test("R14 [T16] recusa confirmação em nome de outro estudante", async () => {
  await assertFails(setDoc(doc(db(E), "confirmacoes", `ev1_${F.uid}`), confirmacaoDeE({ usuarioId: F.uid, usuarioEmail: F.email })));
});
test("R15 recusa confirmação com atlética errada, e-mail falso ou id fora do padrão", async () => {
  await assertFails(setDoc(doc(db(E), "confirmacoes", `ev1_${E.uid}`), confirmacaoDeE({ atleticaId: B.uid })));
  await assertFails(setDoc(doc(db(E), "confirmacoes", `ev1_${E.uid}`), confirmacaoDeE({ usuarioEmail: "falso@x.com" })));
  await assertFails(setDoc(doc(db(E), "confirmacoes", "qualquer"), confirmacaoDeE()));
});
test("R16 recusa confirmação em evento que já passou", async () => {
  await assertFails(setDoc(doc(db(E), "confirmacoes", `passado_${E.uid}`), confirmacaoDeE({ eventoId: "passado" })));
});
test("R17 atlética não confirma presença", async () => {
  await assertFails(setDoc(doc(db(A), "confirmacoes", `ev1_${A.uid}`), confirmacaoDeE({ usuarioId: A.uid, usuarioEmail: A.email })));
});
test("R18 [T13/T14] confirmação lida só pelo estudante e pela atlética organizadora", async () => {
  const ref = (u) => doc(db(u), "confirmacoes", `ev1_${F.uid}`);
  await assertSucceeds(getDoc(ref(F)));
  await assertSucceeds(getDoc(ref(A)));
  await assertFails(getDoc(ref(B)));
  await assertFails(getDoc(ref(E)));
});
test("R19 [T12] estudante cancela a própria presença; outro estudante não", async () => {
  await assertFails(deleteDoc(doc(db(E), "confirmacoes", `ev1_${F.uid}`)));
  await assertSucceeds(deleteDoc(doc(db(F), "confirmacoes", `ev1_${F.uid}`)));
});
test("R20 [T17] atlética exclui o evento e as confirmações em um lote", async () => {
  const s = db(A);
  const lote = writeBatch(s);
  lote.delete(doc(s, "eventos", "ev1"));
  lote.delete(doc(s, "confirmacoes", `ev1_${F.uid}`));
  await assertSucceeds(lote.commit());
});
