const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API_URL = "/gastos";

const usuarioNome = localStorage.getItem("usuarioNome") ?? "";
document.getElementById("usuario-nome").textContent = usuarioNome;
document.getElementById("usuario-avatar").textContent = usuarioNome.trim().charAt(0).toUpperCase();

document.getElementById("btn-sair").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioNome");
  window.location.href = "login.html";
});

async function fetchAutenticado(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { ...opcoes.headers, Authorization: `Bearer ${token}` },
  });

  if (resposta.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioNome");
    window.location.href = "login.html";
    throw new Error("Não autenticado");
  }

  return resposta;
}

const form = document.getElementById("form-gasto");
const campoId = document.getElementById("gasto-id");
const campoDescricao = document.getElementById("descricao");
const campoValor = document.getElementById("valor");
const campoCategoria = document.getElementById("categoria");
const campoData = document.getElementById("data");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const listaGastos = document.getElementById("lista-gastos");
const estadoVazio = document.getElementById("estado-vazio");
const totalGastos = document.getElementById("total-gastos");
const mensagem = document.getElementById("mensagem");
const formTitulo = document.getElementById("form-titulo");
const avisoVencimento = document.getElementById("aviso-vencimento");

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function mostrarErro(texto) {
  mensagem.textContent = texto;
}

function limparErro() {
  mensagem.textContent = "";
}

function sairModoEdicao() {
  form.reset();
  campoId.value = "";
  formTitulo.textContent = "Novo gasto";
  btnSalvar.textContent = "Adicionar";
  btnCancelar.hidden = true;
}

async function carregarGastos() {
  limparErro();

  let resposta;
  try {
    resposta = await fetchAutenticado(API_URL);
  } catch {
    mostrarErro("Não foi possível conectar ao servidor.");
    return;
  }

  if (!resposta.ok) {
    mostrarErro("Erro ao carregar os gastos.");
    return;
  }

  const gastos = await resposta.json();
  renderizarGastos(gastos);
}

function renderizarGastos(gastos) {
  listaGastos.innerHTML = "";
  let total = 0;

  for (const gasto of gastos) {
    total += Number(gasto.valor);

    const item = document.createElement("li");
    item.className = "gasto";
    item.innerHTML = `
      <div class="gasto-info">
        <span class="gasto-descricao">${escaparHtml(gasto.descricao)}</span>
        <span class="gasto-meta">
          ${gasto.categoria ? `${escaparHtml(gasto.categoria)} · ` : ""}${formatoData.format(new Date(gasto.data))}
        </span>
      </div>
      <div class="gasto-lado">
        <span class="gasto-valor">${formatoMoeda.format(gasto.valor)}</span>
        <div class="gasto-acoes">
          <button type="button" class="btn-icone editar" title="Editar">Editar</button>
          <button type="button" class="btn-icone remover" title="Excluir">Excluir</button>
        </div>
      </div>
    `;

    item.querySelector(".editar").addEventListener("click", () => entrarModoEdicao(gasto));
    item.querySelector(".remover").addEventListener("click", () => removerGasto(gasto.id));

    listaGastos.appendChild(item);
  }

  estadoVazio.hidden = gastos.length > 0;
  totalGastos.textContent = formatoMoeda.format(total);

  mostrarAvisoVencimento(gastos);
}

function mostrarAvisoVencimento(gastos) {
  const hoje = new Date();
  const amanha = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 1));
  const amanhaISO = amanha.toISOString().slice(0, 10);

  const vencendoAmanha = gastos.filter((gasto) => gasto.data.slice(0, 10) === amanhaISO);

  if (vencendoAmanha.length === 0) {
    avisoVencimento.hidden = true;
    return;
  }

  const descricoes = vencendoAmanha.map((gasto) => escaparHtml(gasto.descricao)).join(", ");
  avisoVencimento.innerHTML =
    vencendoAmanha.length === 1
      ? `<strong>Atenção:</strong> "${descricoes}" vence amanhã.`
      : `<strong>Atenção:</strong> ${vencendoAmanha.length} gastos vencem amanhã: ${descricoes}.`;
  avisoVencimento.hidden = false;
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function entrarModoEdicao(gasto) {
  campoId.value = gasto.id;
  campoDescricao.value = gasto.descricao;
  campoValor.value = gasto.valor;
  campoCategoria.value = gasto.categoria ?? "";
  campoData.value = gasto.data.slice(0, 10);
  formTitulo.textContent = "Editar gasto";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  campoDescricao.focus();
}

async function removerGasto(id) {
  limparErro();

  const resposta = await fetchAutenticado(`${API_URL}/${id}`, { method: "DELETE" });

  if (!resposta.ok) {
    mostrarErro("Erro ao excluir o gasto.");
    return;
  }

  await carregarGastos();
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparErro();

  const corpo = {
    descricao: campoDescricao.value.trim(),
    valor: Number(campoValor.value),
    categoria: campoCategoria.value.trim() || null,
    data: campoData.value || null,
  };

  const id = campoId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const metodo = id ? "PUT" : "POST";

  const resposta = await fetchAutenticado(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    mostrarErro(erro.erro ?? "Erro ao salvar o gasto.");
    return;
  }

  sairModoEdicao();
  await carregarGastos();
});

btnCancelar.addEventListener("click", sairModoEdicao);

carregarGastos();
