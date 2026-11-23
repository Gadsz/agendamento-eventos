// Datas no formato do campo "data" do Firestore: AAAA-MM-DD, sempre no fuso local.

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function paraISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function deISO(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO() {
  return paraISO(new Date());
}

export function formatarData(data) {
  return data ? data.split("-").reverse().join("/") : "";
}

// "17", "dez", "qui", "quinta" — para o bloco de data dos cards.
export function partesData(iso) {
  const d = deISO(iso);
  return {
    dia: String(d.getDate()),
    mes: MESES[d.getMonth()],
    semana: SEMANA[d.getDay()],
    semanaLonga: SEMANA_LONGA[d.getDay()],
  };
}

export function diasAte(iso) {
  return Math.round((deISO(iso) - deISO(hojeISO())) / 86400000);
}

export function textoDias(iso) {
  const n = diasAte(iso);
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  return `em ${n} dias`;
}

// Os próximos 7 dias a partir de hoje, para o SeletorDia.
export function proximosDias(quantidade = 7) {
  const hoje = new Date();
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
    return {
      iso: paraISO(d),
      dia: String(d.getDate()),
      semana: SEMANA[d.getDay()],
      rotulo: `Eventos de ${SEMANA_LONGA[d.getDay()]}, ${d.getDate()} de ${MESES_LONGOS[d.getMonth()]}`,
    };
  });
}

export function mesAno(iso) {
  const d = deISO(iso);
  const mes = MESES_LONGOS[d.getMonth()];
  return `${mes[0].toUpperCase()}${mes.slice(1)} ${d.getFullYear()}`;
}
