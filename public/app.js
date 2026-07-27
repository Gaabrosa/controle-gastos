const API_URL = "/gastos";

const form = document.getElementById("form-gasto");
const campoId = document.getElementById("gasto-id");
const campoDescricao = document.getElementById("descricao");
const campoValor = document.getElementById("valor");
const campoCategoria = document.getElementById("categoria");
const campoData = document.getElementById("data");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const listaGastos = document.getElementById("lista-gastos");
const totalGastos = document.getElementById("total-gastos");
const mensagem = document.getElementById("mensagem");

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
  btnSalvar.textContent = "Adicionar";
  btnCancelar.hidden = true;
}

async function carregarGastos() {
  limparErro();

  let resposta;
  try {
    resposta = await fetch(API_URL);
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

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${escaparHtml(gasto.descricao)}</td>
      <td>${escaparHtml(gasto.categoria ?? "")}</td>
      <td>${formatoData.format(new Date(gasto.data))}</td>
      <td>${formatoMoeda.format(gasto.valor)}</td>
      <td>
        <button type="button" class="editar">Editar</button>
        <button type="button" class="remover">Excluir</button>
      </td>
    `;

    linha.querySelector(".editar").addEventListener("click", () => entrarModoEdicao(gasto));
    linha.querySelector(".remover").addEventListener("click", () => removerGasto(gasto.id));

    listaGastos.appendChild(linha);
  }

  totalGastos.textContent = formatoMoeda.format(total);
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
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  campoDescricao.focus();
}

async function removerGasto(id) {
  limparErro();

  const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

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

  const resposta = await fetch(url, {
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
