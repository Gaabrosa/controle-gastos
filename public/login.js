if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}

const abaLogin = document.getElementById("aba-login");
const abaRegistrar = document.getElementById("aba-registrar");
const formLogin = document.getElementById("form-login");
const formRegistrar = document.getElementById("form-registrar");
const mensagem = document.getElementById("mensagem-login");

abaLogin.addEventListener("click", () => alternarAba(true));
abaRegistrar.addEventListener("click", () => alternarAba(false));

function alternarAba(mostrarLogin) {
  mensagem.textContent = "";
  formLogin.hidden = !mostrarLogin;
  formRegistrar.hidden = mostrarLogin;
  abaLogin.classList.toggle("ativa", mostrarLogin);
  abaRegistrar.classList.toggle("ativa", !mostrarLogin);
}

async function autenticar(url, corpo) {
  mensagem.textContent = "";

  let resposta;
  try {
    resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
  } catch {
    mensagem.textContent = "Não foi possível conectar ao servidor.";
    return;
  }

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    mensagem.textContent = dados.erro ?? "Erro ao autenticar.";
    return;
  }

  localStorage.setItem("token", dados.token);
  localStorage.setItem("usuarioNome", dados.usuario.nome);
  window.location.href = "index.html";
}

formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();
  autenticar("/auth/login", {
    email: document.getElementById("login-email").value.trim(),
    senha: document.getElementById("login-senha").value,
  });
});

formRegistrar.addEventListener("submit", (evento) => {
  evento.preventDefault();
  autenticar("/auth/registrar", {
    nome: document.getElementById("registrar-nome").value.trim(),
    email: document.getElementById("registrar-email").value.trim(),
    senha: document.getElementById("registrar-senha").value,
  });
});
