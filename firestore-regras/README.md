# Testes das regras do Firestore

Os 20 testes (R01 a R20) verificam, no emulador do Firestore, as regras de segurança de `../docs/firestore.rules`.

## Rodar

Requisitos: Node 18 ou superior e Java 17 ou superior.

```bash
cd firestore-regras
npm install
npm test
```

O `npm test` sobe o emulador, roda os testes e desliga o emulador. Não é preciso ter conta nem projeto no Firebase: o projeto `demo-eventos` é só local.

Para comparar com outra versão das regras:

```bash
REGRAS=outro.rules npx firebase emulators:exec --only firestore --project demo-eventos "node --test test/regras.test.js"
```

## Publicar as regras

Copie o conteúdo de `docs/firestore.rules` para o console do Firebase (Firestore → Regras) ou rode `firebase deploy --only firestore:rules`. Se algum teste falhar depois de mudar o código, a regra está avisando que o documento saiu do esquema.
