import { useState } from "react";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { useEventos } from "./dados";
import { hojeISO, partesData, diasAte } from "./datas";
import { TIPOS } from "./tipos";
import FormEvento from "./FormEvento";
import ConfirmarExclusao from "./ConfirmarExclusao";
import PresencasEvento, { ListaPresencas } from "./PresencasEvento";
import Icone from "./Icone";

// Telas: Gerenciar eventos (GGerenciarDesk / GGerenciarMob), Editar evento
// no mobile (GFormMob, via FormEvento), Excluir (ConfirmarExclusao) e
// Presenças do evento (PresencasEvento).

function porOrdemDeConfirmacao(a, b) {
  // criadoEm fica null até o servidor gravar: esses vão para o fim.
  return (a.criadoEm?.toMillis?.() ?? Infinity) - (b.criadoEm?.toMillis?.() ?? Infinity);
}

function Eventos({ usuario, confirmacoes, formMobileAberto, fecharFormMobile }) {
  const eventos = useEventos(usuario.uid);
  const [editando, setEditando] = useState(null);
  const [versaoForm, setVersaoForm] = useState(0); // troca a key do form para limpá-lo
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [aberto, setAberto] = useState(null); // id do evento com a lista de presenças aberta
  const [verPresencas, setVerPresencas] = useState(null);
  const [erro, setErro] = useState("");

  const presencasPorEvento = {};
  for (const c of confirmacoes) {
    (presencasPorEvento[c.eventoId] ||= []).push(c);
  }
  Object.values(presencasPorEvento).forEach((lista) => lista.sort(porOrdemDeConfirmacao));
  const presencasDe = (evento) => presencasPorEvento[evento.id] || [];

  const hoje = hojeISO();
  const ativos = (eventos || []).filter((evento) => evento.data >= hoje);
  // Próximos primeiro; os que já passaram vão para o fim, do mais recente ao mais antigo.
  const lista = [...ativos, ...(eventos || []).filter((evento) => evento.data < hoje).reverse()];

  function concluirForm() {
    setEditando(null);
    setVersaoForm((v) => v + 1);
    fecharFormMobile();
  }

  function handleEditar(evento) {
    setErro("");
    setEditando(evento); // no mobile, editando já mostra o formulário como tela
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleExcluir() {
    setExcluindo(true);
    setErro("");
    try {
      // Apaga o evento e as confirmações dele juntos: nenhuma presença fica órfã.
      const lote = writeBatch(db);
      lote.delete(doc(db, "eventos", paraExcluir.id));
      presencasDe(paraExcluir).forEach((c) => lote.delete(doc(db, "confirmacoes", c.id)));
      await lote.commit();
      if (editando?.id === paraExcluir.id) concluirForm();
    } catch {
      setErro("Não foi possível excluir o evento. Tente novamente.");
    } finally {
      setExcluindo(false);
      setParaExcluir(null);
    }
  }

  if (verPresencas) {
    return (
      <PresencasEvento
        evento={verPresencas}
        presencas={presencasDe(verPresencas)}
        onVoltar={() => setVerPresencas(null)}
      />
    );
  }

  const formVisivelNoMobile = formMobileAberto || Boolean(editando);

  return (
    <div className={`gerenciar${formVisivelNoMobile ? " gerenciar--form" : ""}`}>
      <div className="gerenciar__cabeca">
        <div>
          <span className="caption ea-muted so-desktop">{usuario.email.toUpperCase()}</span>
          <h1 className="display-xl">Meus <span className="ea-hl">eventos</span></h1>
        </div>
        <div className="numeros">
          <span className="ea-glass label numero"><strong>{ativos.length}</strong> {ativos.length === 1 ? "evento ativo" : "eventos ativos"}</span>
          <span className="ea-glass label numero"><strong>{confirmacoes.length}</strong> presenças<span className="so-desktop">&nbsp;confirmadas</span></span>
          {ativos[0] && (
            <span className="ea-glass label numero">próximo em <strong>{diasAte(ativos[0].data)}</strong> dias</span>
          )}
        </div>
      </div>

      {erro && <p className="ea-alert" role="alert"><Icone nome="alerta" />{erro}</p>}

      <div className="gerenciar__corpo">
        <div className="gerenciar__form">
          <FormEvento
            key={editando ? editando.id : `novo-${versaoForm}`}
            usuario={usuario}
            evento={editando}
            quantidadePresencas={editando ? presencasDe(editando).length : 0}
            onConcluir={concluirForm}
          />
        </div>

        <section className="gerenciar__lista" aria-label="Eventos cadastrados">
          {eventos === null && <div className="ea-skeleton esqueleto-card" aria-hidden="true" />}
          {eventos !== null && lista.length === 0 && (
            <p className="body ea-muted">Nenhum evento cadastrado ainda.</p>
          )}

          {lista.map((evento) => {
            const tipo = TIPOS[evento.tipo] || TIPOS.esportivo;
            const { dia, mes, semana } = partesData(evento.data);
            const presencas = presencasDe(evento);
            const estaAberto = aberto === evento.id;

            return (
              <article key={evento.id} className={`ea-glass evento-atl${evento.data < hoje ? " evento-atl--passado" : ""}`}>
                <div className="evento-atl__cabeca">
                  <div className={`ea-date evento-atl__data dialogo__data--${tipo.modificador}`}>
                    <div className="ea-date__n">{dia}</div>
                    <div className="ea-date__m">{mes} · {semana}</div>
                  </div>
                  <div className="evento-atl__info">
                    <span className={tipo.tag}>{tipo.rotulo}</span>
                    <h3 className="title-s">{evento.nome}</h3>
                    {evento.descricao && <p className="body ea-muted evento-atl__desc so-desktop">{evento.descricao}</p>}
                    <div className="linha linha--quebra">
                      <span className="ea-meta"><Icone nome="relogio" tamanho={15} />{evento.horario || "Horário a definir"}</span>
                      <span className="ea-meta"><Icone nome="local" tamanho={15} />{evento.local || "Local a definir"}</span>
                    </div>
                  </div>
                  <div className="evento-atl__acoes">
                    <button className="ea-btn ea-btn--ghost ea-btn--sm" onClick={() => handleEditar(evento)}>
                      <Icone nome="lapis" tamanho={15} />Editar
                    </button>
                    <button className="ea-btn ea-btn--danger ea-btn--sm" onClick={() => setParaExcluir(evento)}>
                      <Icone nome="lixeira" tamanho={15} />Excluir
                    </button>
                  </div>
                </div>

                <div className={`presencas-caixa${estaAberto ? " presencas-caixa--aberta" : ""}`}>
                  <button
                    className="label presencas-caixa__botao"
                    aria-expanded={estaAberto}
                    onClick={() => setAberto(estaAberto ? null : evento.id)}
                    disabled={presencas.length === 0}
                  >
                    <Icone nome={estaAberto ? "abaixo" : "avancar"} tamanho={14} traco={2.6} />
                    {presencas.length === 1 ? "1 presença confirmada" : `${presencas.length} presenças confirmadas`}
                  </button>
                  {estaAberto && (
                    <>
                      <ListaPresencas presencas={presencas.slice(0, 4)} />
                      <button className="link label" onClick={() => setVerPresencas(evento)}>
                        Ver lista completa
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {paraExcluir && (
        <ConfirmarExclusao
          evento={paraExcluir}
          quantidadePresencas={presencasDe(paraExcluir).length}
          excluindo={excluindo}
          onCancelar={() => setParaExcluir(null)}
          onConfirmar={handleExcluir}
        />
      )}
    </div>
  );
}

export default Eventos;
