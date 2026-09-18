// Sistema de Orçamentos - Marmoraria
// Gerenciador de Estado e Interface

const DEFAULT_COMPANY = {
  nome: "MÁRMORES & GRANITOS",
  logoUrl: "logo.png",
  cnpj: "26.106.792/0001-77",
  endereco: "Av. Barreira Grande, 3001 - Jd. Imperador - São Paulo - SP",
  especialidades: "MÁRMORES - GRANITOS\nPEDRAS DECORATIVAS\nPIAS - LAVATÓRIOS - PISOS\nESCADAS - SOLEIRAS - ETC.",
  fone1: "94031-1110",
  resp1: "Edu",
  fone2: "",
  resp2: "",
  cidadePadrao: "São Paulo",
  dadosBancarios: "Dados Bancarios: Caixa Econômica Agencia:242/ operação 013/ conta poupança 7675-7/ CPF:148.374.878-23 Cicero Eduardo dos Santos",
  observacoesPadrao: "OBS: Material para instalação será por conta do cliente"
};

// Estado da Aplicação
let appData = {
  empresa: { ...DEFAULT_COMPANY },
  orcamentoAtual: null,
  historico: []
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  try {
    carregarDadosLocais();
  } catch (e) {
    console.error("Erro ao carregar dados locais:", e);
  }

  try {
    renderizarAcabamentosNaFolha();
  } catch (e) {
    console.error("Erro ao renderizar acabamentos:", e);
  }
  
  try {
    if (!appData.orcamentoAtual) {
      novoOrcamento(false);
    } else {
      preencherFormulario();
      atualizarPreview();
    }
  } catch (e) {
    console.error("Erro ao inicializar orçamento:", e);
  }

  try {
    configurarEventos();
  } catch (e) {
    console.error("Erro ao configurar eventos:", e);
  }

  try {
    configurarMascaras();
  } catch (e) {
    console.error("Erro ao configurar máscaras:", e);
  }
});

// Carrega configurações e orçamentos do LocalStorage
function carregarDadosLocais() {
  const savedEmpresa = localStorage.getItem("orc_empresa");
  if (savedEmpresa) {
    try {
      appData.empresa = { ...DEFAULT_COMPANY, ...JSON.parse(savedEmpresa) };
    } catch (e) {
      console.error(e);
    }
  }

  // Remove o contato do João caso esteja salvo em cache anterior
  if (appData.empresa.resp2 === "João" || appData.empresa.fone2 === "94033-6591") {
    appData.empresa.fone2 = "";
    appData.empresa.resp2 = "";
  }
  appData.empresa.logoUrl = "logo.png";

  const savedHistorico = localStorage.getItem("orc_historico");
  if (savedHistorico) {
    try {
      let hist = JSON.parse(savedHistorico);
      // Remove qualquer registro antigo de teste/exemplo
      appData.historico = hist.filter(o => o.id !== "orc_exemplo" && (!o.cliente || o.cliente.nome !== "Edifício Allure"));
    } catch (e) {
      console.error(e);
    }
  }

  const savedAtual = localStorage.getItem("orc_atual");
  if (savedAtual) {
    try {
      const parsed = JSON.parse(savedAtual);
      // Limpa caso seja o exemplo antigo com dados de cliente
      if (parsed && parsed.id !== "orc_exemplo" && (!parsed.cliente || parsed.cliente.nome !== "Edifício Allure")) {
        if (parsed.cliente && (parsed.cliente.foneCel === "(11) 98765-4321" || parsed.cliente.foneCel === "98765-4321")) {
          parsed.cliente.foneCel = "";
        }
        appData.orcamentoAtual = parsed;
      } else {
        appData.orcamentoAtual = null;
        localStorage.removeItem("orc_atual");
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// Salva dados locais
function salvarDadosLocais() {
  localStorage.setItem("orc_empresa", JSON.stringify(appData.empresa));
  localStorage.setItem("orc_historico", JSON.stringify(appData.historico));
  if (appData.orcamentoAtual) {
    localStorage.setItem("orc_atual", JSON.stringify(appData.orcamentoAtual));
  }
}

// Cria novo orçamento em branco (sem dados de cliente)
function novoOrcamento(confirmar = true) {
  if (confirmar && !confirm("Deseja criar um novo orçamento em branco?")) {
    return;
  }
  const proximoNumero = obterProximoNumeroOrcamento();
  const hoje = new Date().toISOString().split('T')[0];

  appData.orcamentoAtual = {
    id: "orc_" + Date.now(),
    numero: proximoNumero,
    cidade: appData.empresa.cidadePadrao || "São Paulo",
    data: hoje,
    cliente: {
      nome: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
      cidade: appData.empresa.cidadePadrao || "São Paulo",
      estado: "SP",
      foneRes: "",
      foneCel: "",
      foneCom: "",
      email: "",
      cpfCnpj: "",
      rg: "",
      condicoesPagamento: ""
    },
    itens: [
      {
        id: Date.now(),
        qtd: 1,
        descricao: "",
        acabamento: "01",
        cor: "",
        valor: ""
      }
    ],
    parcelas: [
      { numero: 1, valor: "", vencimento: "" },
      { numero: 2, valor: "", vencimento: "" }
    ],
    observacoes: appData.empresa.observacoesPadrao,
    dadosBancarios: appData.empresa.dadosBancarios
  };

  preencherFormulario();
  atualizarPreview();
  salvarDadosLocais();
}

function obterProximoNumeroOrcamento() {
  if (!appData.historico || appData.historico.length === 0) {
    return "117";
  }
  const numeros = appData.historico
    .map(o => parseInt(o.numero, 10))
    .filter(n => !isNaN(n));
  if (numeros.length === 0) return "101";
  return String(Math.max(...numeros) + 1);
}

// Renderiza a grade de acabamentos na folha A4 com os SVGs
function renderizarAcabamentosNaFolha() {
  if (typeof ACABAMENTOS_SVG === 'undefined' || !ACABAMENTOS_SVG) {
    console.warn("ACABAMENTOS_SVG não disponível.");
    return;
  }

  const s2El = document.getElementById("acab-simples-list");
  if (s2El) {
    const s2cm = [
      { num: "01-RETO", svg: ACABAMENTOS_SVG["01"] || "" },
      { num: "02-CHANFRADO", svg: ACABAMENTOS_SVG["02"] || "" },
      { num: "03-MEIA CANA", svg: ACABAMENTOS_SVG["03"] || "" },
      { num: "04-BOLEADO", svg: ACABAMENTOS_SVG["04"] || "" },
      { num: "05-PEITO DE POMBO", svg: ACABAMENTOS_SVG["05"] || "" }
    ];
    s2El.innerHTML = s2cm.map(item => `
      <div class="acab-item-row">
        <span>${item.num}</span>
        <div class="acab-item-svg">${item.svg}</div>
      </div>
    `).join("");
  }

  const e4El = document.getElementById("acab-engrossado-list");
  if (e4El) {
    const e4cm = [
      { num: "06-RETO", svg: ACABAMENTOS_SVG["06"] || "" },
      { num: "07-1/2 CANA", svg: ACABAMENTOS_SVG["07"] || "" },
      { num: "08-CHANFRADO SIMPLES", svg: ACABAMENTOS_SVG["08"] || "" },
      { num: "09-BOLEADO DUPLO", svg: ACABAMENTOS_SVG["09"] || "" }
    ];
    e4El.innerHTML = e4cm.map(item => `
      <div class="acab-item-row">
        <span>${item.num}</span>
        <div class="acab-item-svg">${item.svg}</div>
      </div>
    `).join("");
  }

  const saiaEl = document.getElementById("acab-saia-list");
  if (saiaEl) {
    const saia45 = [
      { num: "10-45º", svg: ACABAMENTOS_SVG["10"] || "" },
      { num: "11-OUTROS DESENHOS", svg: ACABAMENTOS_SVG["11"] || "" }
    ];
    saiaEl.innerHTML = saia45.map(item => `
      <div class="acab-item-row">
        <span>${item.num}</span>
        <div class="acab-item-svg" style="height: 18px;">${item.svg}</div>
      </div>
    `).join("");
  }

  const colEl = document.getElementById("colunas-diagram-box");
  if (colEl) {
    colEl.innerHTML = `
      <div class="column-drawing-item">
        <span>COLUNA COM 2 PEDRAS</span>
        <div style="width: 24px; height: 32px;">${ACABAMENTOS_SVG["col-2pedras"] || ""}</div>
      </div>
      <div class="column-drawing-item">
        <span>QUADRADO</span>
        <div style="width: 24px; height: 32px;">${ACABAMENTOS_SVG["col-quadrado"] || ""}</div>
      </div>
      <div class="column-drawing-item">
        <span>SEXTAVADO</span>
        <div style="width: 26px; height: 32px;">${ACABAMENTOS_SVG["col-sextavado"] || ""}</div>
      </div>
    `;
  }
}

// Preenche os campos do formulário a partir de appData.orcamentoAtual
function preencherFormulario() {
  const orc = appData.orcamentoAtual;
  if (!orc) return;

  document.getElementById("f-numero").value = orc.numero || "";
  document.getElementById("f-cidade").value = orc.cidade || "";
  document.getElementById("f-data").value = orc.data || "";

  // Cliente
  document.getElementById("f-cli-nome").value = orc.cliente.nome || "";
  document.getElementById("f-cli-cep").value = orc.cliente.cep || "";
  document.getElementById("f-cli-endereco").value = orc.cliente.endereco || "";
  document.getElementById("f-cli-numero").value = orc.cliente.numero || "";
  document.getElementById("f-cli-complemento").value = orc.cliente.complemento || "";
  document.getElementById("f-cli-bairro").value = orc.cliente.bairro || "";
  document.getElementById("f-cli-cidade").value = orc.cliente.cidade || "";
  document.getElementById("f-cli-estado").value = orc.cliente.estado || "";
  document.getElementById("f-cli-foneres").value = orc.cliente.foneRes || "";
  document.getElementById("f-cli-fonecel").value = orc.cliente.foneCel || "";
  document.getElementById("f-cli-fonecom").value = orc.cliente.foneCom || "";
  document.getElementById("f-cli-email").value = orc.cliente.email || "";
  document.getElementById("f-cli-cpfcnpj").value = orc.cliente.cpfCnpj || "";
  document.getElementById("f-cli-rg").value = orc.cliente.rg || "";
  document.getElementById("f-cli-condpag").value = orc.cliente.condicoesPagamento || "";

  // Observações e Banco
  document.getElementById("f-observacoes").value = orc.observacoes || "";
  document.getElementById("f-dadosbancarios").value = orc.dadosBancarios || "";

  renderizarTabelaItensForm();
  renderizarTabelaParcelasForm();
}

// Renderiza a lista de itens no formulário
function renderizarTabelaItensForm() {
  const container = document.getElementById("itens-form-tbody");
  const orc = appData.orcamentoAtual;
  if (!container || !orc || !orc.itens) return;

  const acabList = (typeof LISTA_ACABAMENTOS !== 'undefined' && Array.isArray(LISTA_ACABAMENTOS)) ? LISTA_ACABAMENTOS : [
    { id: "01", nome: "01 - Reto (Simples 2cm)" },
    { id: "02", nome: "02 - Chanfrado (Simples 2cm)" },
    { id: "03", nome: "03 - Meia Cana (Simples 2cm)" },
    { id: "04", nome: "04 - Boleado (Simples 2cm)" },
    { id: "05", nome: "05 - Peito de Pombo (Simples 2cm)" },
    { id: "06", nome: "06 - Reto (Engrossado 4cm)" },
    { id: "07", nome: "07 - 1/2 Cana (Engrossado 4cm)" },
    { id: "08", nome: "08 - Chanfrado Simples (Engrossado 4cm)" },
    { id: "09", nome: "09 - Boleado Duplo (Engrossado 4cm)" },
    { id: "10", nome: "10 - 45º (Saia)" },
    { id: "11", nome: "11 - Outros Desenhos (Saia)" },
    { id: "col-2pedras", nome: "Coluna 2 Pedras" },
    { id: "col-quadrado", nome: "Coluna Quadrado" },
    { id: "col-sextavado", nome: "Coluna Sextavado" },
    { id: "nenhum", nome: "Sem acabamento" }
  ];

  container.innerHTML = orc.itens.map((item, idx) => {
    const acabOptions = acabList.map(a => 
      `<option value="${a.id}" ${item.acabamento === a.id ? 'selected' : ''}>${a.nome}</option>`
    ).join("");

    return `
      <tr data-index="${idx}">
        <td style="width: 50px;">
          <input type="number" min="1" class="item-qtd" value="${item.qtd || 1}" onchange="atualizarItem(${idx}, 'qtd', this.value)">
        </td>
        <td>
          <input type="text" class="item-desc" placeholder="Descrição do produto/serviço..." value="${escapeHtml(item.descricao || '')}" oninput="atualizarItem(${idx}, 'descricao', this.value)">
        </td>
        <td style="width: 130px;">
          <select class="item-acab" onchange="atualizarItem(${idx}, 'acabamento', this.value)">
            ${acabOptions}
          </select>
        </td>
        <td style="width: 120px;">
          <input type="text" class="item-cor" placeholder="Ex: Preto São Gabriel" value="${escapeHtml(item.cor || '')}" oninput="atualizarItem(${idx}, 'cor', this.value)">
        </td>
        <td style="width: 100px;">
          <input type="text" class="item-valor" placeholder="0,00" value="${item.valor || ''}" oninput="atualizarItem(${idx}, 'valor', this.value)">
        </td>
        <td style="width: 36px; text-align: center;">
          <button type="button" class="btn-icon" title="Excluir item" onclick="removerItem(${idx})">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Renderiza a tabela de parcelas no formulário
function renderizarTabelaParcelasForm() {
  const container = document.getElementById("parcelas-form-tbody");
  const orc = appData.orcamentoAtual;
  if (!container || !orc || !orc.parcelas) return;

  container.innerHTML = orc.parcelas.map((parc, idx) => `
    <tr>
      <td style="width: 45px; text-align: center; font-weight: bold;">${parc.numero}</td>
      <td>
        <input type="text" placeholder="Valor R$" value="${parc.valor || ''}" oninput="atualizarParcela(${idx}, 'valor', this.value)">
      </td>
      <td>
        <input type="date" value="${parc.vencimento || ''}" onchange="atualizarParcela(${idx}, 'vencimento', this.value)">
      </td>
      <td style="width: 36px; text-align: center;">
        <button type="button" class="btn-icon" title="Remover Parcela" onclick="removerParcela(${idx})">✕</button>
      </td>
    </tr>
  `).join("");
}

// Atualização de dados individuais
function atualizarItem(idx, campo, valor) {
  if (!appData.orcamentoAtual || !appData.orcamentoAtual.itens || !appData.orcamentoAtual.itens[idx]) return;
  appData.orcamentoAtual.itens[idx][campo] = valor;
  atualizarPreview();
  salvarDadosLocais();
}

function adicionarNovoItem() {
  if (!appData.orcamentoAtual) return;
  if (!appData.orcamentoAtual.itens) appData.orcamentoAtual.itens = [];
  appData.orcamentoAtual.itens.push({
    id: Date.now(),
    qtd: 1,
    descricao: "",
    acabamento: "01",
    cor: "",
    valor: ""
  });
  renderizarTabelaItensForm();
  atualizarPreview();
  salvarDadosLocais();
}

function removerItem(idx) {
  if (!appData.orcamentoAtual || !appData.orcamentoAtual.itens) return;
  if (appData.orcamentoAtual.itens.length <= 1) {
    alert("O orçamento deve ter pelo menos um item.");
    return;
  }
  appData.orcamentoAtual.itens.splice(idx, 1);
  renderizarTabelaItensForm();
  atualizarPreview();
  salvarDadosLocais();
}

function atualizarParcela(idx, campo, valor) {
  if (!appData.orcamentoAtual || !appData.orcamentoAtual.parcelas || !appData.orcamentoAtual.parcelas[idx]) return;
  appData.orcamentoAtual.parcelas[idx][campo] = valor;
  atualizarPreview();
  salvarDadosLocais();
}

function adicionarNovaParcela() {
  if (!appData.orcamentoAtual) return;
  if (!appData.orcamentoAtual.parcelas) appData.orcamentoAtual.parcelas = [];
  const num = appData.orcamentoAtual.parcelas.length + 1;
  appData.orcamentoAtual.parcelas.push({
    numero: num,
    valor: "",
    vencimento: ""
  });
  renderizarTabelaParcelasForm();
  atualizarPreview();
  salvarDadosLocais();
}

function removerParcela(idx) {
  if (!appData.orcamentoAtual || !appData.orcamentoAtual.parcelas) return;
  appData.orcamentoAtual.parcelas.splice(idx, 1);
  // Reordena numeração
  appData.orcamentoAtual.parcelas.forEach((p, i) => p.numero = i + 1);
  renderizarTabelaParcelasForm();
  atualizarPreview();
  salvarDadosLocais();
}

// Gerador automático de parcelamento (1x, 2x, 3x, 4x, etc.)
function gerarParcelasAutomaticas(qtdParcelas) {
  if (!appData.orcamentoAtual) return;
  qtdParcelas = parseInt(qtdParcelas, 10) || 1;
  const total = calcularTotalNumerico();

  if (total <= 0) {
    alert("Informe valores nos itens antes de gerar as parcelas automáticas.");
    return;
  }

  const valorPorParcela = (total / qtdParcelas).toFixed(2).replace('.', ',');
  const hoje = new Date();

  const parcelas = [];
  for (let i = 1; i <= qtdParcelas; i++) {
    const dataVenc = new Date(hoje);
    dataVenc.setDate(dataVenc.getDate() + (i * 30));
    const strData = dataVenc.toISOString().split('T')[0];

    parcelas.push({
      numero: i,
      valor: valorPorParcela,
      vencimento: strData
    });
  }

  appData.orcamentoAtual.parcelas = parcelas;
  renderizarTabelaParcelasForm();
  atualizarPreview();
}

function calcularTotalNumerico() {
  if (!appData.orcamentoAtual) return 0;
  let soma = 0;
  appData.orcamentoAtual.itens.forEach(item => {
    if (item.valor) {
      // Normaliza para float
      let str = String(item.valor).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
      let num = parseFloat(str);
      if (!isNaN(num)) {
        soma += num;
      }
    }
  });
  return soma;
}

// Converte data ISO (YYYY-MM-DD) para formato extenso em português
function formatarDataExtensa(dataIso, cidade) {
  if (!dataIso) return `${cidade || "São Paulo"}, ___ de _________ de _____`;
  try {
    const [ano, mes, dia] = dataIso.split('-');
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const nomeMes = meses[parseInt(mes, 10) - 1] || "";
    return `${cidade || "São Paulo"}, ${parseInt(dia, 10)} de ${nomeMes} de ${ano}`;
  } catch (e) {
    return `${cidade || "São Paulo"}, ${dataIso}`;
  }
}

// Formata data simples DD/MM/AAAA
function formatarDataSimples(dataIso) {
  if (!dataIso) return "";
  try {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return dataIso;
  }
}

// Atualiza em tempo real a folha A4 (Preview / Impressão)
function atualizarPreview() {
  const orc = appData.orcamentoAtual;
  if (!orc) return;

  const emp = appData.empresa;

  // Cabeçalho da Empresa
  const imgLogoEl = document.getElementById("p-emp-logo-img");
  if (imgLogoEl) {
    imgLogoEl.src = emp.logoUrl || "logo.png";
  }

  const cnpjEl = document.getElementById("p-emp-cnpj");
  if (cnpjEl) {
    cnpjEl.innerText = emp.cnpj ? `CNPJ: ${emp.cnpj}` : "";
  }

  const endEl = document.getElementById("p-emp-endereco");
  if (endEl) {
    endEl.innerText = emp.endereco || "";
  }
  
  // Especialidades
  const espLinhas = (emp.especialidades || "").split('\n').filter(l => l.trim().length > 0);
  const espEl = document.getElementById("p-emp-especialidades");
  if (espEl) {
    espEl.innerHTML = espLinhas.map(l => `<div>${escapeHtml(l)}</div>`).join("");
  }

  // Telefones
  const phonesContainer = document.getElementById("p-emp-phones-container");
  if (phonesContainer) {
    let phonesHtml = "";
    if (emp.fone1 && emp.fone1.trim().length > 0) {
      phonesHtml += `
        <div class="phone-contact">
          <span class="phone-icon">📞</span>
          <span class="phone-number">${escapeHtml(emp.fone1)}</span>
          ${emp.resp1 ? `<span class="person-name">${escapeHtml(emp.resp1)}</span>` : ''}
        </div>
      `;
    }
    if (emp.fone2 && emp.fone2.trim().length > 0) {
      phonesHtml += `
        <div class="phone-contact">
          <span class="phone-icon">📞</span>
          <span class="phone-number">${escapeHtml(emp.fone2)}</span>
          ${emp.resp2 ? `<span class="person-name">${escapeHtml(emp.resp2)}</span>` : ''}
        </div>
      `;
    }
    phonesContainer.innerHTML = phonesHtml;
  }

  // Data e Número
  const dateEl = document.getElementById("p-data-extenso");
  if (dateEl) {
    dateEl.innerText = formatarDataExtensa(orc.data, orc.cidade);
  }
  const numEl = document.getElementById("p-numero");
  if (numEl) {
    numEl.innerText = orc.numero || "---";
  }

  // Cliente
  const setTxt = (id, val, def = "---") => {
    const el = document.getElementById(id);
    if (el) el.innerText = (val && String(val).trim().length > 0) ? val : def;
  };

  setTxt("p-cli-nome", orc.cliente.nome, "---");
  
  let enderecoCompleto = orc.cliente.endereco || "";
  if (orc.cliente.numero && orc.cliente.numero.trim()) {
    enderecoCompleto += (enderecoCompleto ? ", Nº " : "Nº ") + orc.cliente.numero.trim();
  }
  if (orc.cliente.complemento && orc.cliente.complemento.trim()) {
    enderecoCompleto += (enderecoCompleto ? " - " : "") + orc.cliente.complemento.trim();
  }
  setTxt("p-cli-endereco", enderecoCompleto, "---");

  setTxt("p-cli-bairro", orc.cliente.bairro, "---");
  setTxt("p-cli-cep", orc.cliente.cep, "---");
  setTxt("p-cli-cidade", orc.cliente.cidade, "São Paulo");
  setTxt("p-cli-estado", orc.cliente.estado, "SP");
  
  // Agrupa telefones preenchidos
  let fonesList = [];
  if (orc.cliente.foneCel && orc.cliente.foneCel.trim()) fonesList.push(orc.cliente.foneCel.trim());
  if (orc.cliente.foneRes && orc.cliente.foneRes.trim()) fonesList.push(orc.cliente.foneRes.trim() + " (Res)");
  if (orc.cliente.foneCom && orc.cliente.foneCom.trim()) fonesList.push(orc.cliente.foneCom.trim() + " (Com)");
  setTxt("p-cli-fonecel", fonesList.join(" / "), "---");

  setTxt("p-cli-email", orc.cliente.email, "---");
  setTxt("p-cli-cpfcnpj", orc.cliente.cpfCnpj, "---");
  setTxt("p-cli-rg", orc.cliente.rg, "---");
  setTxt("p-cli-condpag", orc.cliente.condicoesPagamento, "A combinar");

  // Itens da Tabela
  const tbodyItens = document.getElementById("p-itens-tbody");
  if (tbodyItens) {
    let linhasHtml = "";

    const acabNomes = {
      "01": "01 - Reto",
      "02": "02 - Chanfrado",
      "03": "03 - Meia Cana",
      "04": "04 - Boleado",
      "05": "05 - P. Pombo",
      "06": "06 - Reto 4cm",
      "07": "07 - 1/2 Cana",
      "08": "08 - Chanf. 4cm",
      "09": "09 - Boleado Dup.",
      "10": "10 - 45º Saia",
      "11": "11 - Especiais",
      "col-2pedras": "Col. 2 Pedras",
      "col-quadrado": "Col. Quadrado",
      "col-sextavado": "Col. Sextavado",
      "nenhum": "Sem acab."
    };

    orc.itens.forEach(item => {
      let valorFormatado = "-";
      if (item.valor && item.valor.trim().length > 0) {
        if (item.valor.includes("R$")) {
          valorFormatado = item.valor;
        } else {
          valorFormatado = `R$ ${item.valor}`;
        }
      }

      let acabExibido = acabNomes[item.acabamento] || item.acabamento || "-";

      linhasHtml += `
        <tr>
          <td class="col-qtd">${item.qtd || 1}</td>
          <td class="col-desc">${escapeHtml(item.descricao || "")}</td>
          <td class="col-acab">${acabExibido}</td>
          <td class="col-cor">${escapeHtml(item.cor || "")}</td>
          <td class="col-val">${valorFormatado}</td>
        </tr>
      `;
    });

    // Linhas vazias para manter o grid elegante sem estourar a folha
    const linhasVaziasNecessarias = Math.max(1, 5 - orc.itens.length);
    for (let i = 0; i < linhasVaziasNecessarias; i++) {
      linhasHtml += `
        <tr>
          <td class="col-qtd" style="height: 18px;">&nbsp;</td>
          <td class="col-desc"></td>
          <td class="col-acab"></td>
          <td class="col-cor"></td>
          <td class="col-val"></td>
        </tr>
      `;
    }
    tbodyItens.innerHTML = linhasHtml;
  }

  // Parcelas
  const tbodyParcelas = document.getElementById("p-parcelas-tbody");
  if (tbodyParcelas) {
    let parcHtml = "";
    const maxParc = Math.max(2, (orc.parcelas ? orc.parcelas.length : 0));
    for (let i = 0; i < maxParc; i++) {
      const p = (orc.parcelas && orc.parcelas[i]) ? orc.parcelas[i] : { numero: i + 1, valor: "", vencimento: "" };
      let val = p.valor ? (p.valor.includes("R$") ? p.valor : `R$ ${p.valor}`) : "-";
      let dataFormatada = p.vencimento ? formatarDataSimples(p.vencimento) : "-";
      parcHtml += `
        <tr>
          <td style="width: 50px;">${p.numero}ª</td>
          <td>${val}</td>
          <td>${dataFormatada}</td>
        </tr>
      `;
    }
    tbodyParcelas.innerHTML = parcHtml;
  }

  // Total
  const totalNum = calcularTotalNumerico();
  let totalExibido = "0,00";
  if (totalNum > 0) {
    totalExibido = totalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (orc.itens.length > 0 && orc.itens.some(i => i.valor && i.valor.trim() !== "")) {
    totalExibido = orc.itens.find(i => i.valor && i.valor.trim() !== "").valor;
  }
  const totalEl = document.getElementById("p-total-valor");
  if (totalEl) {
    totalEl.innerText = totalExibido;
  }

  // Observação
  const obsContainer = document.getElementById("p-obs-container");
  if (obsContainer) {
    if (orc.observacoes && orc.observacoes.trim().length > 0) {
      obsContainer.innerHTML = `<div class="obs-box">${escapeHtml(orc.observacoes).replace(/\n/g, '<br>')}</div>`;
    } else {
      obsContainer.innerHTML = "";
    }
  }

  // Dados Bancários
  const dadosBancariosEl = document.getElementById("p-dadosbancarios");
  if (dadosBancariosEl) {
    dadosBancariosEl.innerText = orc.dadosBancarios || "";
  }
}

// Configuração dos ouvintes de eventos da interface
function configurarEventos() {
  // Inputs gerais do formulário
  const bindInput = (id, callback) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", e => {
        callback(e.target.value);
        atualizarPreview();
        salvarDadosLocais();
      });
    }
  };

  bindInput("f-numero", v => appData.orcamentoAtual.numero = v);
  bindInput("f-cidade", v => appData.orcamentoAtual.cidade = v);
  bindInput("f-data", v => appData.orcamentoAtual.data = v);

  // Cliente
  bindInput("f-cli-nome", v => appData.orcamentoAtual.cliente.nome = v);
  bindInput("f-cli-endereco", v => appData.orcamentoAtual.cliente.endereco = v);
  bindInput("f-cli-numero", v => appData.orcamentoAtual.cliente.numero = v);
  bindInput("f-cli-complemento", v => appData.orcamentoAtual.cliente.complemento = v);
  bindInput("f-cli-bairro", v => appData.orcamentoAtual.cliente.bairro = v);
  bindInput("f-cli-cep", v => appData.orcamentoAtual.cliente.cep = v);
  bindInput("f-cli-cidade", v => appData.orcamentoAtual.cliente.cidade = v);
  bindInput("f-cli-estado", v => appData.orcamentoAtual.cliente.estado = v);
  bindInput("f-cli-foneres", v => appData.orcamentoAtual.cliente.foneRes = v);
  bindInput("f-cli-fonecel", v => appData.orcamentoAtual.cliente.foneCel = v);
  bindInput("f-cli-fonecom", v => appData.orcamentoAtual.cliente.foneCom = v);
  bindInput("f-cli-email", v => appData.orcamentoAtual.cliente.email = v);
  bindInput("f-cli-cpfcnpj", v => appData.orcamentoAtual.cliente.cpfCnpj = v);
  bindInput("f-cli-rg", v => appData.orcamentoAtual.cliente.rg = v);
  bindInput("f-cli-condpag", v => appData.orcamentoAtual.cliente.condicoesPagamento = v);

  // Observações e Banco
  bindInput("f-observacoes", v => appData.orcamentoAtual.observacoes = v);
  bindInput("f-dadosbancarios", v => appData.orcamentoAtual.dadosBancarios = v);

  // Botões do Topo
  document.getElementById("btn-novo-orcamento").addEventListener("click", () => {
    if (confirm("Deseja criar um novo orçamento em branco?")) {
      novoOrcamento(false);
    }
  });

  document.getElementById("btn-salvar-orcamento").addEventListener("click", () => {
    salvarOrcamentoNoHistorico();
  });

  document.getElementById("btn-historico").addEventListener("click", () => {
    abrirModalHistorico();
  });

  document.getElementById("btn-empresa-config").addEventListener("click", () => {
    abrirModalEmpresa();
  });

  document.getElementById("btn-imprimir").addEventListener("click", () => {
    executarImpressaoPC();
  });

  const btnAndroid = document.getElementById("btn-imprimir-android");
  if (btnAndroid) {
    btnAndroid.addEventListener("click", () => {
      executarImpressaoAndroid();
    });
  }

  // Botões de itens e parcelas
  document.getElementById("btn-adicionar-item").addEventListener("click", () => {
    adicionarNovoItem();
  });

  document.getElementById("btn-adicionar-parcela").addEventListener("click", () => {
    adicionarNovaParcela();
  });

  document.getElementById("btn-gerar-parcelas").addEventListener("click", () => {
    const qtd = prompt("Dividir total em quantas parcelas? (ex: 1, 2, 3, 4)", "2");
    if (qtd) {
      gerarParcelasAutomaticas(qtd);
    }
  });

  // Zoom no preview
  const previewSheet = document.getElementById("a4-sheet-document");
  document.getElementById("preview-zoom").addEventListener("change", (e) => {
    const scale = parseFloat(e.target.value);
    previewSheet.style.transform = `scale(${scale})`;
    previewSheet.style.marginBottom = `${(scale - 1) * 300}px`;
  });
}

// Salva o orçamento no histórico
function salvarOrcamentoNoHistorico() {
  const orc = appData.orcamentoAtual;
  if (!orc) return;

  const idx = appData.historico.findIndex(o => o.id === orc.id);
  if (idx >= 0) {
    appData.historico[idx] = JSON.parse(JSON.stringify(orc));
  } else {
    appData.historico.unshift(JSON.parse(JSON.stringify(orc)));
  }

  salvarDadosLocais();
  alert(`Orçamento Nº ${orc.numero || ''} salvo com sucesso no histórico!`);
}

// Modal Histórico
function abrirModalHistorico() {
  const modal = document.getElementById("modal-historico");
  const lista = document.getElementById("historico-lista");
  
  if (appData.historico.length === 0) {
    lista.innerHTML = "<p style='color: #64748b; text-align: center; padding: 20px;'>Nenhum orçamento salvo no histórico ainda.</p>";
  } else {
    lista.innerHTML = appData.historico.map(o => `
      <div class="history-item">
        <div class="history-item-info">
          <strong>Nº ${o.numero || 'S/N'} - ${escapeHtml(o.cliente.nome || 'Cliente sem nome')}</strong>
          <span>Data: ${formatarDataSimples(o.data)} | Cidade: ${escapeHtml(o.cidade || '')} | Itens: ${o.itens ? o.itens.length : 0}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-primary btn-sm" onclick="carregarOrcamentoDoHistorico('${o.id}')">Abrir</button>
          <button class="btn btn-secondary btn-sm" onclick="duplicarOrcamento('${o.id}')">Duplicar</button>
          <button class="btn btn-danger btn-sm" onclick="excluirOrcamentoDoHistorico('${o.id}')">✕</button>
        </div>
      </div>
    `).join("");
  }

  modal.classList.add("active");
}

function fecharModalHistorico() {
  document.getElementById("modal-historico").classList.remove("active");
}

function carregarOrcamentoDoHistorico(id) {
  const orc = appData.historico.find(o => o.id === id);
  if (orc) {
    appData.orcamentoAtual = JSON.parse(JSON.stringify(orc));
    preencherFormulario();
    atualizarPreview();
    salvarDadosLocais();
    fecharModalHistorico();
  }
}

function duplicarOrcamento(id) {
  const orc = appData.historico.find(o => o.id === id);
  if (orc) {
    const copia = JSON.parse(JSON.stringify(orc));
    copia.id = "orc_" + Date.now();
    copia.numero = String(parseInt(copia.numero || 100, 10) + 1);
    copia.data = new Date().toISOString().split('T')[0];
    appData.orcamentoAtual = copia;
    preencherFormulario();
    atualizarPreview();
    salvarDadosLocais();
    fecharModalHistorico();
    alert(`Orçamento duplicado como Nº ${copia.numero}!`);
  }
}

function excluirOrcamentoDoHistorico(id) {
  if (confirm("Tem certeza que deseja remover este orçamento do histórico?")) {
    appData.historico = appData.historico.filter(o => o.id !== id);
    salvarDadosLocais();
    abrirModalHistorico();
  }
}

// Modal Configurações da Empresa
function abrirModalEmpresa() {
  const emp = appData.empresa;
  document.getElementById("cfg-nome").value = emp.nome || "";
  document.getElementById("cfg-logotexto").value = emp.logoTexto || "";
  document.getElementById("cfg-cnpj").value = emp.cnpj || "";
  document.getElementById("cfg-endereco").value = emp.endereco || "";
  document.getElementById("cfg-especialidades").value = emp.especialidades || "";
  document.getElementById("cfg-fone1").value = emp.fone1 || "";
  document.getElementById("cfg-resp1").value = emp.resp1 || "";
  document.getElementById("cfg-fone2").value = emp.fone2 || "";
  document.getElementById("cfg-resp2").value = emp.resp2 || "";
  document.getElementById("cfg-cidadepadrao").value = emp.cidadePadrao || "";
  document.getElementById("cfg-dadosbancarios").value = emp.dadosBancarios || "";
  document.getElementById("cfg-observacoespadrao").value = emp.observacoesPadrao || "";

  document.getElementById("modal-empresa").classList.add("active");
}

function fecharModalEmpresa() {
  document.getElementById("modal-empresa").classList.remove("active");
}

function salvarConfiguracoesEmpresa() {
  appData.empresa = {
    ...appData.empresa,
    logoUrl: appData.empresa.logoUrl || "logo.png",
    nome: document.getElementById("cfg-nome").value,
    cnpj: document.getElementById("cfg-cnpj").value,
    endereco: document.getElementById("cfg-endereco").value,
    especialidades: document.getElementById("cfg-especialidades").value,
    fone1: document.getElementById("cfg-fone1").value,
    resp1: document.getElementById("cfg-resp1").value,
    fone2: document.getElementById("cfg-fone2").value,
    resp2: document.getElementById("cfg-resp2").value,
    cidadePadrao: document.getElementById("cfg-cidadepadrao").value,
    dadosBancarios: document.getElementById("cfg-dadosbancarios").value,
    observacoesPadrao: document.getElementById("cfg-observacoespadrao").value
  };

  salvarDadosLocais();
  fecharModalEmpresa();
  atualizarPreview();
  alert("Dados da empresa atualizados com sucesso!");
}

// Exportar e Importar Backup JSON
function exportarDadosJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `orcamentos_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importarDadosJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.empresa) appData.empresa = data.empresa;
      if (data.historico) appData.historico = data.historico;
      if (data.orcamentoAtual) appData.orcamentoAtual = data.orcamentoAtual;
      salvarDadosLocais();
      preencherFormulario();
      atualizarPreview();
      alert("Backup importado com sucesso!");
      fecharModalHistorico();
    } catch (err) {
      alert("Erro ao ler o arquivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Impressão padrão para Computador / PC (abre o diálogo do navegador perfeitamente como antes)
function executarImpressaoPC() {
  window.print();
}

// Impressão específica para Celular / Aplicativo Android
function executarImpressaoAndroid() {
  // 1. No celular, muda para a aba de prévia da folha para renderizar o layout A4 completo
  alternarAbaMobile('preview');

  // 2. Dispara a chamada nativa do aplicativo Android
  setTimeout(() => {
    try {
      window.location.href = "app://print";
    } catch (e) {
      console.warn("Falha ao acionar protocolo do app:", e);
    }
  }, 250);
}

// Compatibilidade
function executarImpressao() {
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 900) {
    executarImpressaoAndroid();
  } else {
    executarImpressaoPC();
  }
}

// Utilitário para escapar caracteres HTML
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Alternância de Abas Mobile (Celular)
function alternarAbaMobile(aba) {
  const btnForm = document.getElementById("tab-btn-form");
  const btnPrev = document.getElementById("tab-btn-preview");

  if (aba === "preview") {
    document.body.classList.remove("tab-form-active");
    document.body.classList.add("tab-preview-active");
    if (btnForm) btnForm.classList.remove("active");
    if (btnPrev) btnPrev.classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    document.body.classList.remove("tab-preview-active");
    document.body.classList.add("tab-form-active");
    if (btnForm) btnForm.classList.add("active");
    if (btnPrev) btnPrev.classList.remove("active");
  }
}

// Compartilhamento direto via WhatsApp
function enviarWhatsApp() {
  const orc = appData.orcamentoAtual;
  if (!orc) return;
  const emp = appData.empresa;

  const totalNum = calcularTotalNumerico();
  const totalStr = totalNum > 0
    ? totalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : (orc.itens.find(i => i.valor && i.valor.trim() !== '') ? orc.itens.find(i => i.valor && i.valor.trim() !== '').valor : '0,00');

  let itensTexto = "";
  orc.itens.forEach((it, idx) => {
    if (it.descricao && it.descricao.trim()) {
      itensTexto += `• ${it.qtd || 1}x ${it.descricao}${it.cor ? ` (${it.cor})` : ''}${it.valor ? ` - R$ ${it.valor}` : ''}\n`;
    }
  });

  const textoMensagem = `*ORÇAMENTO Nº ${orc.numero || '---'} - ${emp.nome}*
Data: ${formatarDataSimples(orc.data)}
Cliente: ${orc.cliente.nome || 'Não informado'}

*Itens do Orçamento:*
${itensTexto || '• Itens a combinar'}
*VALOR TOTAL:* R$ ${totalStr}
${orc.cliente.condicoesPagamento ? `*Condições de Pagamento:* ${orc.cliente.condicoesPagamento}\n` : ''}
${orc.observacoes ? `_${orc.observacoes}_\n` : ''}
Qualquer dúvida, estamos à disposição!
Contato: ${emp.fone1} (${emp.resp1})`;

  // Obtém telefone do cliente
  let fone = orc.cliente.foneCel || orc.cliente.foneRes || "";
  let digits = fone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    digits = "55" + digits;
  }

  const urlZap = digits.length >= 10
    ? `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(textoMensagem)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensagem)}`;

  window.open(urlZap, '_blank');
}

// =========================================================
// MÁSCARAS DE ENTRADA E CONSULTA AUTOMÁTICA DE CEP (ViaCEP)
// =========================================================

function formatarTelefone(v) {
  if (!v) return "";
  v = v.replace(/\D/g, "").slice(0, 11);
  if (v.length > 10) {
    return v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (v.length > 6) {
    return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
  } else if (v.length > 0) {
    return v.replace(/^(\d*)$/, "($1");
  }
  return "";
}

function formatarCEP(v) {
  if (!v) return "";
  v = v.replace(/\D/g, "").slice(0, 8);
  if (v.length > 5) {
    return v.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
  }
  return v;
}

function formatarCpfCnpj(v) {
  if (!v) return "";
  v = v.replace(/\D/g, "").slice(0, 14);
  if (v.length > 11) {
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5")
            .replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, "$1.$2.$3/$4")
            .replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1.$2.$3")
            .replace(/^(\d{2})(\d{1,3})$/, "$1.$2");
  } else {
    return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4")
            .replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3")
            .replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
  }
}

function formatarRG(v) {
  if (!v) return "";
  v = v.replace(/[^0-9a-zA-Z]/g, "").slice(0, 10);
  if (v.length > 8) {
    return v.replace(/^(\d{2})(\d{3})(\d{3})([0-9a-zA-Z]{1,2})$/, "$1.$2.$3-$4");
  } else if (v.length > 5) {
    return v.replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1.$2.$3");
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{1,3})$/, "$1.$2");
  }
  return v;
}

function aplicarMascara(id, formatador, callback) {
  const el = document.getElementById(id);
  if (!el) return;

  const handler = () => {
    const raw = el.value;
    const formatado = formatador(raw);
    if (el.value !== formatado) {
      el.value = formatado;
    }
    if (callback) {
      callback(formatado);
    }
  };

  el.addEventListener("input", handler);
  el.addEventListener("blur", handler);
}

// Consulta gratuita de CEP via API pública ViaCEP
async function buscarEnderecoPorCep(cepRaw) {
  const digits = (cepRaw || "").replace(/\D/g, "");
  if (digits.length !== 8) return;

  const statusEl = document.getElementById("cep-status-msg");
  if (statusEl) {
    statusEl.innerText = "⏳ Buscando CEP...";
    statusEl.style.color = "#2563eb";
    statusEl.style.display = "inline";
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) throw new Error("Erro na requisição ViaCEP");
    const data = await res.json();

    if (data.erro) {
      if (statusEl) {
        statusEl.innerText = "⚠️ CEP não encontrado";
        statusEl.style.color = "#dc2626";
        setTimeout(() => { if (statusEl) statusEl.style.display = "none"; }, 3000);
      }
      return;
    }

    // Preenche os campos do formulário e o estado da aplicação
    if (data.logradouro) {
      appData.orcamentoAtual.cliente.endereco = data.logradouro;
      const fEnd = document.getElementById("f-cli-endereco");
      if (fEnd) fEnd.value = data.logradouro;
    }
    if (data.bairro) {
      appData.orcamentoAtual.cliente.bairro = data.bairro;
      const fBai = document.getElementById("f-cli-bairro");
      if (fBai) fBai.value = data.bairro;
    }
    if (data.localidade) {
      appData.orcamentoAtual.cliente.cidade = data.localidade;
      const fCid = document.getElementById("f-cli-cidade");
      if (fCid) fCid.value = data.localidade;
    }
    if (data.uf) {
      appData.orcamentoAtual.cliente.estado = data.uf;
      const fEst = document.getElementById("f-cli-estado");
      if (fEst) fEst.value = data.uf;
    }

    if (statusEl) {
      statusEl.innerText = "✓ Endereço preenchido!";
      statusEl.style.color = "#16a34a";
      setTimeout(() => { if (statusEl) statusEl.style.display = "none"; }, 2500);
    }

    atualizarPreview();
    salvarDadosLocais();

    // Move o foco para o campo Número para agilizar digitação
    const inputNumero = document.getElementById("f-cli-numero");
    if (inputNumero) {
      inputNumero.focus();
    }
  } catch (err) {
    console.warn("Erro ao buscar ViaCEP:", err);
    if (statusEl) {
      statusEl.innerText = "⚠️ Falha ao buscar CEP";
      statusEl.style.color = "#dc2626";
      setTimeout(() => { if (statusEl) statusEl.style.display = "none"; }, 3000);
    }
  }
}

function configurarMascaras() {
  // CEP: 00000-000 + Consulta ViaCEP
  aplicarMascara("f-cli-cep", formatarCEP, (val) => {
    appData.orcamentoAtual.cliente.cep = val;
    atualizarPreview();
    salvarDadosLocais();
    const clean = val.replace(/\D/g, "");
    if (clean.length === 8) {
      buscarEnderecoPorCep(clean);
    }
  });

  // CPF / CNPJ: 000.000.000-00 ou 00.000.000/0000-00
  aplicarMascara("f-cli-cpfcnpj", formatarCpfCnpj, (val) => {
    appData.orcamentoAtual.cliente.cpfCnpj = val;
    atualizarPreview();
    salvarDadosLocais();
  });

  // Telefone Celular: (00) 00000-0000
  aplicarMascara("f-cli-fonecel", formatarTelefone, (val) => {
    appData.orcamentoAtual.cliente.foneCel = val;
    atualizarPreview();
    salvarDadosLocais();
  });

  // Telefone Residencial: (00) 0000-0000 ou (00) 00000-0000
  aplicarMascara("f-cli-foneres", formatarTelefone, (val) => {
    appData.orcamentoAtual.cliente.foneRes = val;
    atualizarPreview();
    salvarDadosLocais();
  });

  // Telefone Comercial: (00) 0000-0000 ou (00) 00000-0000
  aplicarMascara("f-cli-fonecom", formatarTelefone, (val) => {
    appData.orcamentoAtual.cliente.foneCom = val;
    atualizarPreview();
    salvarDadosLocais();
  });

  // RG: 00.000.000-0
  aplicarMascara("f-cli-rg", formatarRG, (val) => {
    appData.orcamentoAtual.cliente.rg = val;
    atualizarPreview();
    salvarDadosLocais();
  });
}

// Registro do Service Worker para funcionamento 100% Offline e PWA no Android
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker registrado com sucesso:', reg.scope))
      .catch(err => console.log('Falha ao registrar Service Worker:', err));
  });
}
