
const listaSacola = document.getElementById('listaSacola');
const contador = document.getElementById('contador');
const valorTotalElemento = document.getElementById('valorTotal');

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
let listaDeProdutos = [];
let carrinho = [];

// ==========================================
// CARREGAMENTO DE DADOS
// ==========================================
async function carregarProdutos() {
    try {
        // Altere para o caminho real do seu arquivo
        const resposta = await fetch('data/produtos.json'); 
        listaDeProdutos = await resposta.json();
        
        renderizarProdutos(listaDeProdutos);
    } catch (erro) {
        console.error("Erro ao carregar o JSON:", erro);
        document.getElementById('produtos').innerHTML = '<p>Erro ao carregar os itens.</p>';
    }
}

// ==========================================
// RENDERIZAÇÃO E FILTROS
// ==========================================
const containerProdutos = document.getElementById('produtos');
const inputPesquisa = document.getElementById('pesquisa');
const selectFiltro = document.getElementById('filtroTipo');

function renderizarProdutos(produtos) {
    containerProdutos.replaceChildren();
    
    if (produtos.length === 0) {
        containerProdutos.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <div class="card-info">
                <h3>${produto.nome}</h3>
                <p class="preco">
                    R$ ${produto.preco.toFixed(2).replace('.', ',')} 
                    <span class="unidade">/ ${produto.unidade}</span>
                </p>
                <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar à Sacola</button>
            </div>
        `;
        containerProdutos.appendChild(div);
    });
}

function filtrarProdutos() {
    const termo = inputPesquisa.value.toLowerCase();
    const categoria = selectFiltro.value;

    const filtrados = listaDeProdutos.filter(p => {
        const bateNome = p.nome.toLowerCase().includes(termo);
        const bateCategoria = categoria === 'todos' || p.tipo === categoria;
        return bateNome && bateCategoria;
    });

    renderizarProdutos(filtrados);
}

// ==========================================
// LÓGICA DA SACOLA
// ==========================================
function abrirSacola() {
    document.getElementById('sacola').classList.add('ativa');
}

function fecharSacola() {
    document.getElementById('sacola').classList.remove('ativa');
}

function adicionarAoCarrinho(idProduto) {
    const mapaProdutos = new Map();

    listaDeProdutos.forEach(p => mapaProdutos.set(p.id, p));

    // depois
    const produto = mapaProdutos.get(idProduto);
    const itemNoCarrinho = carrinho.find(item => item.id === idProduto);

    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade += 1;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }

    atualizarSacolaUI();
    abrirSacola();
}

function aumentarQuantidade(id) {
    const item = carrinho.find(i => i.id === id);
    if (item) {
        item.quantidade++;
        atualizarSacolaUI();
    }
}

function diminuirQuantidade(id) {
    const item = carrinho.find(i => i.id === id);
    if (item) {
        item.quantidade--;
        if (item.quantidade <= 0) {
            carrinho = carrinho.filter(i => i.id !== id);
        }
        atualizarSacolaUI();
    }
}

function atualizarSacolaUI() {
    const listaSacola = document.getElementById('listaSacola');
    const contador = document.getElementById('contador');
    const valorTotalElemento = document.getElementById('valorTotal');
    
    listaSacola.innerHTML = '';
    let total = 0;
    let qtdTotal = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        qtdTotal += item.quantidade;
        
        const div = document.createElement('div');
        div.className = 'item-sacola'; // Corrigido de 'item-sacola-elegante' para o CSS original
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.nome} (${item.unidade})</h4>
                <p>R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="item-controle"> <button class="btn-quantidade btn-diminuir" onclick="diminuirQuantidade(${item.id})">-</button>
                <span class="item-quantidade" style="font-weight: bold;">${item.quantidade}</span>
                <button class="btn-quantidade btn-aumentar" onclick="aumentarQuantidade(${item.id})">+</button>
            </div>
        `;
        listaSacola.appendChild(div);
    });

    if (carrinho.length === 0) {
        listaSacola.innerHTML = '<p class="sacola-vazia">Sua sacola está vazia.</p>';
    }

    contador.innerText = qtdTotal;
    valorTotalElemento.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// ==========================================
// FINALIZAR PEDIDO (WHATSAPP)
// ==========================================
function enviarPedido() {
    if (carrinho.length === 0) {
        alert("Sua sacola está vazia!");
        return;
    }

    const nome = document.getElementById('nomeCliente').value;
    const telefone = document.getElementById('telefoneCliente').value;
    const rua = document.getElementById('rua').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const complemento = document.getElementById('complemento').value;

    if (!nome || !telefone || !rua || !bairro || !cidade) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    // ✅ AQUI ESTAVA FALTANDO
    let enderecoFormatado = `${rua}\n${bairro} - ${cidade}`;

    if (complemento) {
        enderecoFormatado += `\n📌 Complemento: ${complemento}`;
    }

    // Montando mensagem
    let mensagem = `🛒 *Pedido - Um Dois Feijão com Arroz*\n\n`;

    mensagem += `👤 *Cliente:* ${nome}\n`;
    mensagem += `📞 *Telefone:* ${telefone}\n\n`;

    mensagem += `📍 *Endereço:*\n${enderecoFormatado}\n\n`;

    mensagem += `📦 *Itens do Pedido:*\n`;

    let total = 0;

    carrinho.forEach(p => {
        const subtotal = p.preco * p.quantidade;

        mensagem += `• ${p.nome} (${p.unidade})\n`;
        mensagem += `  Qtd: ${p.quantidade} | R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

        total += subtotal;
    });

    mensagem += `\n💰 *Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

    // Número de destino (coloque o seu aqui)
    const numeroWhatsApp = "5511998988312"; // Substitua pelo número real do WhatsApp (com código do país e DDD)
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
}

// Inicialização
carregarProdutos();
inputPesquisa.addEventListener('input', filtrarProdutos);
selectFiltro.addEventListener('change', filtrarProdutos);