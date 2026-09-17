// SVGs fiéis aos acabamentos de marmoraria do modelo original
const ACABAMENTOS_SVG = {
  // 01 - RETO (Borda reta simples 2cm)
  "01": `<svg viewBox="0 0 70 20" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,14 L 18,5 L 62,5 L 46,14 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 46,14 L 62,5 L 62,10 L 46,19 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,14 L 46,14 L 46,19 L 2,19 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // 02 - CHANFRADO (Borda chanfrada simples 2cm)
  "02": `<svg viewBox="0 0 70 20" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,13 L 18,4 L 59,4 L 43,13 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 43,13 L 59,4 L 63,7 L 47,16 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <path d="M 47,16 L 63,7 L 63,11 L 47,19 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,13 L 43,13 L 47,16 L 47,19 L 2,19 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // 03 - MEIA CANA (Borda arredondada no topo 2cm)
  "03": `<svg viewBox="0 0 70 20" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,13 L 18,4 L 58,4 L 42,13 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 42,13 Q 50,13 62,7 L 62,11 L 47,19 L 47,16 Q 42,16 42,13" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,13 L 42,13 Q 47,14 47,19 L 2,19 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // 04 - BOLEADO (Borda totalmente arredondada 2cm)
  "04": `<svg viewBox="0 0 70 20" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,13 L 18,4 L 58,4 L 42,13 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 42,13 Q 50,15 62,8 L 62,12 Q 52,19 44,19 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,13 L 42,13 C 48,13 48,19 42,19 L 2,19 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // 05 - PEITO DE POMBO (Borda clássica moldurada 2cm)
  "05": `<svg viewBox="0 0 70 20" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,12 L 18,3 L 56,3 L 40,12 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 40,12 Q 44,14 43,16 Q 47,18 47,19 L 63,10 Q 63,9 59,7 L 56,3 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,12 L 40,12 Q 44,13 43,15 Q 47,17 47,19 L 2,19 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // 06 - RETO ENGROSSADO (4,0 cm)
  "06": `<svg viewBox="0 0 70 24" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,11 L 18,3 L 60,3 L 44,11 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 44,11 L 60,3 L 60,14 L 44,22 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,11 L 44,11 L 44,22 L 2,22 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <line x1="2" y1="16.5" x2="44" y2="16.5" stroke="#475569" stroke-width="0.9" stroke-dasharray="2,1"/>
    <line x1="44" y1="16.5" x2="60" y2="8.5" stroke="#475569" stroke-width="0.9" stroke-dasharray="2,1"/>
  </svg>`,

  // 07 - 1/2 CANA ENGROSSADO (4,0 cm)
  "07": `<svg viewBox="0 0 70 24" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,11 L 18,3 L 58,3 L 42,11 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 42,11 Q 48,12 47,16 L 47,22 L 63,14 L 63,8 Q 58,6 58,3 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,11 L 42,11 Q 47,12 47,16 L 47,22 L 2,22 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <line x1="2" y1="16.5" x2="47" y2="16.5" stroke="#475569" stroke-width="0.9"/>
  </svg>`,

  // 08 - CHANFRADO SIMPLES ENGROSSADO (4,0 cm)
  "08": `<svg viewBox="0 0 70 24" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,11 L 18,3 L 57,3 L 41,11 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 41,11 L 57,3 L 61,6 L 45,14 L 45,22 L 61,14 L 61,6" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,11 L 41,11 L 45,14 L 45,22 L 2,22 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <line x1="2" y1="16.5" x2="45" y2="16.5" stroke="#475569" stroke-width="0.9"/>
  </svg>`,

  // 09 - BOLEADO DUPLO ENGROSSADO (4,0 cm)
  "09": `<svg viewBox="0 0 70 24" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,11 L 18,3 L 56,3 L 40,11 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 40,11 Q 48,13 45,16.5 Q 49,19 45,22 L 61,14 Q 63,11 60,8 L 56,3" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,11 L 40,11 Q 46,13 44,16.5 Q 46,19 42,22 L 2,22 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // 10 - 45º COM SAIA (a partir de 6,0 cm)
  "10": `<svg viewBox="0 0 70 28" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,10 L 16,3 L 56,3 L 42,10 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 42,10 L 56,3 L 56,22 L 42,27 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,10 L 42,10 L 42,27 L 36,27 L 36,15 L 2,15 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <line x1="42" y1="10" x2="36" y2="15" stroke="#ef4444" stroke-width="1.2"/>
  </svg>`,

  // 11 - OUTROS DESENHOS
  "11": `<svg viewBox="0 0 70 28" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2,10 L 16,3 L 56,3 L 42,10 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 42,10 L 56,3 L 56,12 L 51,14 L 51,20 L 39,26 L 39,20 L 44,18 L 42,10" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <path d="M 2,10 L 42,10 L 44,15 L 38,17 L 38,25 L 32,25 L 32,15 L 2,15 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  // COLUNAS
  "col-2pedras": `<svg viewBox="0 0 35 45" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4,12 L 18,4 L 18,36 L 4,44 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <path d="M 18,4 L 32,12 L 32,44 L 18,36 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  "col-quadrado": `<svg viewBox="0 0 35 45" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 17,2 L 31,8 L 17,14 L 3,8 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 3,8 L 17,14 L 17,42 L 3,36 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <path d="M 17,14 L 31,8 L 31,36 L 17,42 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

  "col-sextavado": `<svg viewBox="0 0 38 45" class="acab-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="M 19,2 L 31,6 L 31,12 L 19,16 L 7,12 L 7,6 Z" fill="#e2e8f0" stroke="#334155" stroke-width="1.2"/>
    <path d="M 7,12 L 19,16 L 19,43 L 7,39 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
    <path d="M 19,16 L 31,12 L 31,39 L 19,43 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
  </svg>`
};

// Lista de nomes e códigos para o select do formulário
const LISTA_ACABAMENTOS = [
  { id: "01", nome: "01 - Reto (Simples 2cm)" },
  { id: "02", nome: "02 - Chanfrado (Simples 2cm)" },
  { id: "03", nome: "03 - Meia Cana (Simples 2cm)" },
  { id: "04", nome: "04 - Boleado (Simples 2cm)" },
  { id: "05", nome: "05 - Peito de Pombo (Simples 2cm)" },
  { id: "06", nome: "06 - Reto Engrossado (4cm)" },
  { id: "07", nome: "07 - 1/2 Cana Engrossado (4cm)" },
  { id: "08", nome: "08 - Chanfrado Simples Engrossado (4cm)" },
  { id: "09", nome: "09 - Boleado Duplo Engrossado (4cm)" },
  { id: "10", nome: "10 - 45º com Saia (a partir 6cm)" },
  { id: "11", nome: "11 - Outros Desenhos" },
  { id: "col-2pedras", nome: "Coluna com 2 Pedras" },
  { id: "col-quadrado", nome: "Coluna Quadrada" },
  { id: "col-sextavado", nome: "Coluna Sextavada" }
];
