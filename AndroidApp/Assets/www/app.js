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
  carregarDadosLocais();
  renderizarAcabamentosNaFolha();
  
  if (!appData.orcamentoAtual) {
    novoOrcamento(false);
  } else {
    preencherFormulario();
    atualizarPreview();
  }

  configurarEventos();
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
  // Simples 2.0cm
  const s2cm = [
    { num: "01-RETO", svg: ACABAMENTOS_SVG["01"] },
    { num: "02-CHANFRADO", svg: ACABAMENTOS_SVG["02"] },
    { num: "03-MEIA CANA", svg: ACABAMENTOS_SVG["03"] },
    { num: "04-BOLEADO", svg: ACABAMENTOS_SVG["04"] },
    { num: "05-PEITO DE POMBO", svg: ACABAMENTOS_SVG["05"] }
  ];
  document.getElementById("acab-simples-list").innerHTML = s2cm.map(item => `
    <div class="acab-item-row">
      <span>${item.num}</span>
      <div class="acab-item-svg">${item.svg}</div>
    </div>
  `).join("");

  // Engrossado 4.0cm
  const e4cm = [
    { num: "06-RETO", svg: ACABAMENTOS_SVG["06"] },
    { num: "07-1/2 CANA", svg: ACABAMENTOS_SVG["07"] },
    { num: "08-CHANFRADO SIMPLES", svg: ACABAMENTOS_SVG["08"] },
    { num: "09-BOLEADO DUPLO", svg: ACABAMENTOS_SVG["09"] }
  ];
  document.getElementById("acab-engrossado-list").innerHTML = e4cm.map(item => `
    <div class="acab-item-row">
      <span>${item.num}</span>
      <div class="acab-item-svg">${item.svg}</div>
    </div>
  `).join("");

  // 45º com saia
  const saia45 = [
    { num: "10-45º", svg: ACABAMENTOS_SVG["10"] },
    { num: "11-OUTROS DESENHOS", svg: ACABAMENTOS_SVG["11"] }
  ];
  document.getElementById("acab-saia-list").innerHTML = saia45.map(item => `
    <div class="acab-item-row">
      <span>${item.num}</span>
      <div class="acab-item-svg" style="height: 18px;">${item.svg}</div>
    </div>
  `).join("");

  // Colunas
  document.getElementById("colunas-diagram-box").innerHTML = `
    <div class="column-drawing-item">
      <span>COLUNA COM 2 PEDRAS</span>
      <div style="width: 24px; height: 32px;">${ACABAMENTOS_SVG["col-2pedras"]}</div>
    </div>
    <div class="column-drawing-item">
      <span>QUADRADO</span>
      <div style="width: 24px; height: 32px;">${ACABAMENTOS_SVG["col-quadrado"]}</div>
    </div>
    <div class="column-drawing-item">
      <span>SEXTAVADO</span>
      <div style="width: 26px; height: 32px;">${ACABAMENTOS_SVG["col-sextavado"]}</div>
    </div>
  `;
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
  document.getElementById("f-cli-endereco").value = orc.cliente.endereco || "";
  document.getElementById("f-cli-bairro").value = orc.cliente.bairro || "";
  document.getElementById("f-cli-cep").value = orc.cliente.cep || "";
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
  if (!container || !orc) return;

  container.innerHTML = orc.itens.map((item, idx) => {
    const acabOptions = LISTA_ACABAMENTOS.map(a => 
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
  if (!container || !orc) return;

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
  if (!appData.orcamentoAtual || !appData.orcamentoAtual.itens[idx]) return;
  appData.orcamentoAtual.itens[idx][campo] = valor;
  atualizarPreview();
}

function adicionarNovoItem() {
  if (!appData.orcamentoAtual) return;
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
}

function removerItem(idx) {
  if (!appData.orcamentoAtual) return;
  if (appData.orcamentoAtual.itens.length <= 1) {
    alert("O orçamento deve ter pelo menos um item.");
    return;
  }
  appData.orcamentoAtual.itens.splice(idx, 1);
  renderizarTabelaItensForm();
  atualizarPreview();
}

function atualizarParcela(idx, campo, valor) {
  if (!appData.orcamentoAtual || !appData.orcamentoAtual.parcelas[idx]) return;
  appData.orcamentoAtual.parcelas[idx][campo] = valor;
  atualizarPreview();
}

function adicionarNovaParcela() {
  if (!appData.orcamentoAtual) return;
  const num = appData.orcamentoAtual.parcelas.length + 1;
  appData.orcamentoAtual.parcelas.push({
    numero: num,
    valor: "",
    vencimento: ""
  });
  renderizarTabelaParcelasForm();
  atualizarPreview();
}

function removerParcela(idx) {
  if (!appData.orcamentoAtual) return;
  appData.orcamentoAtual.parcelas.splice(idx, 1);
  // Reordena numeração
  appData.orcamentoAtual.parcelas.forEach((p, i) => p.numero = i + 1);
  renderizarTabelaParcelasForm();
  atualizarPreview();
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
  
  // Especialidades
  const espLinhas = (emp.especialidades || "").split('\n').filter(l => l.trim().length > 0);
  document.getElementById("p-emp-especialidades").innerHTML = espLinhas.map(l => `<div>${escapeHtml(l)}</div>`).join("");

  // Telefones
  const phonesContainer = document.getElementById("p-emp-phones-container");
  if (phonesContainer) {
    let phonesHtml = "";
    if (emp.fone1 && emp.fone1.trim().length > 0) {
      phonesHtml += `
        <div class="phone-contact">
          <span class="phone-number">${escapeHtml(emp.fone1)}</span>
          ${emp.resp1 ? `<span class="person-name">${escapeHtml(emp.resp1)}</span>` : ''}
        </div>
      `;
    }
    if (emp.fone2 && emp.fone2.trim().length > 0) {
      phonesHtml += `
        <div class="phone-contact">
          <span class="phone-number">${escapeHtml(emp.fone2)}</span>
          ${emp.resp2 ? `<span class="person-name">${escapeHtml(emp.resp2)}</span>` : ''}
        </div>
      `;
    }
    phonesContainer.innerHTML = phonesHtml;
  }

  // Data e Número
  document.getElementById("p-data-extenso").innerText = formatarDataExtensa(orc.data, orc.cidade);
  document.getElementById("p-numero").innerText = orc.numero || "---";

  // Cliente
  document.getElementById("p-cli-nome").innerText = orc.cliente.nome || "";
  document.getElementById("p-cli-endereco").innerText = orc.cliente.endereco || "";
  document.getElementById("p-cli-bairro").innerText = orc.cliente.bairro || "";
  document.getElementById("p-cli-cep").innerText = orc.cliente.cep || "";
  document.getElementById("p-cli-cidade").innerText = orc.cliente.cidade || "";
  document.getElementById("p-cli-estado").innerText = orc.cliente.estado || "";
  document.getElementById("p-cli-foneres").innerText = orc.cliente.foneRes || "";
  document.getElementById("p-cli-fonecel").innerText = orc.cliente.foneCel || "";
  document.getElementById("p-cli-fonecom").innerText = orc.cliente.foneCom || "";
  document.getElementById("p-cli-email").innerText = orc.cliente.email || "";
  document.getElementById("p-cli-cpfcnpj").innerText = orc.cliente.cpfCnpj || "";
  document.getElementById("p-cli-rg").innerText = orc.cliente.rg || "";
  document.getElementById("p-cli-condpag").innerText = orc.cliente.condicoesPagamento || "";

  // Itens da Tabela
  const tbodyItens = document.getElementById("p-itens-tbody");
  let linhasHtml = "";

  orc.itens.forEach(item => {
    let valorFormatado = "-";
    if (item.valor && item.valor.trim().length > 0) {
      if (item.valor.includes("R$")) {
        valorFormatado = item.valor;
      } else {
        valorFormatado = `R$ ${item.valor}`;
      }
    }

    // Extrai o número do acabamento (ex: '01' vira '1', '10' vira '10')
    let acabExibido = item.acabamento || "";
    if (acabExibido.startsWith("0")) {
      acabExibido = acabExibido.substring(1);
    } else if (acabExibido.startsWith("col-")) {
      acabExibido = acabExibido.replace("col-", "");
    }

    linhasHtml += `
      <tr>
        <td class="col-qtd">${item.qtd || ""}</td>
        <td class="col-desc">${escapeHtml(item.descricao || "")}</td>
        <td class="col-acab">${acabExibido}</td>
        <td class="col-cor">${escapeHtml(item.cor || "")}</td>
        <td class="col-val">${valorFormatado}</td>
      </tr>
    `;
  });

  // Linhas vazias para preencher o grid de forma equilibrada sem estourar a folha A4
  const linhasVaziasNecessarias = Math.max(1, 6 - orc.itens.length);
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

  // Parcelas
  const tbodyParcelas = document.getElementById("p-parcelas-tbody");
  let parcHtml = "";
  const maxParc = Math.max(2, (orc.parcelas ? orc.parcelas.length : 0));
  for (let i = 0; i < maxParc; i++) {
    const p = (orc.parcelas && orc.parcelas[i]) ? orc.parcelas[i] : { numero: i + 1, valor: "", vencimento: "" };
    let val = p.valor ? (p.valor.includes("R$") ? p.valor : `R$ ${p.valor}`) : "";
    let dataFormatada = p.vencimento ? formatarDataSimples(p.vencimento) : "";
    parcHtml += `
      <tr>
        <td style="width: 40px;">${p.numero}</td>
        <td style="width: 65px;">${val}</td>
        <td>${dataFormatada}</td>
      </tr>
    `;
  }
  tbodyParcelas.innerHTML = parcHtml;

  // Total
  const totalNum = calcularTotalNumerico();
  let totalExibido = "0,00";
  if (totalNum > 0) {
    totalExibido = totalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (orc.itens.length > 0 && orc.itens.some(i => i.valor && i.valor.trim() !== "")) {
    totalExibido = orc.itens.find(i => i.valor && i.valor.trim() !== "").valor;
  }
  document.getElementById("p-total-valor").innerText = totalExibido;

  // Observação
  const obsContainer = document.getElementById("p-obs-container");
  if (orc.observacoes && orc.observacoes.trim().length > 0) {
    obsContainer.innerHTML = `<div class="obs-box">${escapeHtml(orc.observacoes).replace(/\n/g, '<br>')}</div>`;
  } else {
    obsContainer.innerHTML = "";
  }

  // Dados Bancários
  document.getElementById("p-dadosbancarios").innerText = orc.dadosBancarios || "";
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

    // Fallback: se estiver em navegador mobile comum (fora do APK)
    setTimeout(() => {
      window.print();
    }, 500);
  }, 250);
}

// Compatibilidade
function executarImpressao() {
  executarImpressaoPC();
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

// Registro do Service Worker para funcionamento 100% Offline e PWA no Android
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker registrado com sucesso:', reg.scope))
      .catch(err => console.log('Falha ao registrar Service Worker:', err));
  });
}
