# 📐 Sistema de Orçamentos para Marmoraria (Mármores & Granitos)

Sistema moderno, ágil e responsivo para elaboração, cálculo e emissão de orçamentos de marmoraria, com pré-visualização em tempo real e impressão fiel no padrão **Folha A4 / PDF**, além de compatibilidade com **dispositivos Android** (PWA e APK nativo).

---

## 🌟 Funcionalidades

- **Layout Fiel ao Modelo Tradicional de Marmoraria**:
  - Cabeçalho personalizado com logotipo oficial da empresa, CNPJ, endereço e especialidades.
  - Dados completos do cliente/obra (endereço, contatos, CPF/CNPJ, condições de pagamento).
  - Tabela dinâmica de mercadorias (quantidade, descrição do serviço, acabamento nº, cor do material e valor).
  - **Infográfico ilustrado de acabamentos** em vetores SVG de alta definição:
    - *Bordas simples (2,0 cm)*: 01-Reto, 02-Chanfrado, 03-Meia Cana, 04-Boleado, 05-Peito de Pombo.
    - *Bordas engrossadas (4,0 cm)*: 06-Reto, 07-1/2 Cana, 08-Chanfrado Simples, 09-Boleado Duplo.
    - *45º com saia*: 10-45º, 11-Outros Desenhos.
    - *Colunas*: 2 Pedras, Quadrado e Sextavado.
  - Resumo financeiro com tabela de parcelamento, valor total em destaque e observações em vermelho.
  - Rodapé com linhas de assinatura (**VENDEDOR** / **COMPRADOR**) e dados bancários / chave PIX para depósito.

- **Automação e Cálculos**:
  - Totalização automática dos itens em tempo real.
  - Gerador automático de parcelas (1x, 2x, 3x, etc.) com cálculo de vencimentos a cada 30 dias.
  - Datas por extenso no padrão brasileiro (ex: *São Paulo, 17 de setembro de 2026*).

- **Impressão Inteligente (A4 / PDF)**:
  - Formatação milimétrica para impressão direta pelo navegador ou salvar em PDF (`Ctrl + P`).
  - Proteção contra quebra de linha: assinaturas e rodapés nunca são cortados no meio da página.
  - Suporte tanto para orçamentos rápidos em 1 folha quanto orçamentos longos paginados naturalmente.

- **Recursos Mobile & Android**:
  - **Botão "📲 WhatsApp"**: Dispara o orçamento pré-formatado diretamente para o WhatsApp do cliente.
  - **PWA (Progressive Web App)**: Pode ser instalado na tela inicial do celular e funciona **100% offline**.
  - **APK Android Nativo**: Instalador compilado (`OrcamentoMarmoraria.apk`) pronto para uso em smartphones Android.

---

## 🚀 Como Executar

### No Computador (Windows)
1. Dê um duplo clique no arquivo:
   ```
   iniciar.bat
   ```
   *(Ou abra o arquivo `index.html` em qualquer navegador: Chrome, Edge, Firefox, Brave)*

### Acesso no Celular via Wi-Fi
1. Dê um duplo clique em `servidor_celular.bat`.
2. Abra o link gerado (ex: `http://192.168.1.X:8080/`) no navegador do seu smartphone conectado à mesma rede Wi-Fi.

### No Celular via APK Android
1. Transfira o arquivo `OrcamentoMarmoraria.apk` para o seu celular Android.
2. Toque nele para instalar e use como aplicativo nativo.

---

## 📁 Estrutura do Projeto

```
SistemaOrcamentos/
├── index.html                  # Interface principal da aplicação
├── style.css                   # Estilização completa e regras de impressão A4
├── app.js                      # Lógica de cálculo, persistência e automação
├── acabamentos.js              # Ilustrações técnicas em SVG dos acabamentos
├── logo.png                    # Imagem oficial do logotipo
├── manifest.json               # Configuração PWA (Mobile / Android)
├── sw.js                       # Service Worker para funcionamento 100% offline
├── icon-192.png / icon-512.png # Ícones do app para Android
├── OrcamentoMarmoraria.apk      # Instalador nativo para Android
├── iniciar.bat                 # Inicializador rápido para desktop
├── servidor_celular.bat        # Servidor local para acesso Wi-Fi
└── AndroidApp/                 # Projeto fonte .NET 10 Android / WebView
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 Moderno, JavaScript ES6+, SVG.
- **Mobile / Android**: PWA, Service Workers, .NET 10 Android (C# WebView).
- **Armazenamento**: LocalStorage do navegador (com exportação/importação em JSON).

---

## 📄 Licença

Este projeto é de uso livre para personalização e aplicação comercial em marmorarias.
