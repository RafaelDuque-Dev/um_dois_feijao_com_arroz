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
        const resposta = await fetch('data/produtos.json');
        listaDeProdutos = await resposta.json();

        renderizarProdutos(listaDeProdutos);
    } catch (erro) {
        console.error("Erro ao carregar o JSON:", erro);
        document.getElementById('produtos').innerHTML =
            '<p>Erro ao carregar os itens.</p>';
    }
}

// ==========================================
// ELEMENTOS
// ==========================================
const containerProdutos = document.getElementById('produtos');
const inputPesquisa = document.getElementById('pesquisa');
const selectFiltro = document.getElementById('filtroTipo');

// ==========================================
// RENDERIZAÇÃO DOS PRODUTOS
// ==========================================
function renderizarProdutos(produtos) {
    containerProdutos.replaceChildren();

    if (produtos.length === 0) {
        containerProdutos.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'card';

        let seletorPeso = '';

        // Exibe seletor somente para produtos por KG
        if (produto.unidade === 'kg') {
            seletorPeso = `
                <select id="peso-${produto.id}" class="seletor-peso">
                    <option value="0.5">1/2 KG</option>
                    <option value="1">1 KG</option>
                    <option value="1.5">1,5 KG</option>
                    <option value="2">2 KG</option>
                </select>
            `;
        }

        div.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <div class="card-info">
                <h3>${produto.nome}</h3>
                <p class="preco">
                    R$ ${produto.preco.toFixed(2).replace('.', ',')}
                    <span class="unidade">/ ${produto.unidade}</span>
                </p>
                ${seletorPeso}
                <button onclick="adicionarAoCarrinho(${produto.id})">
                    Adicionar à Sacola
                </button>
            </div>
        `;

        containerProdutos.appendChild(div);
    });
}

// ==========================================
// FILTROS
// ==========================================
function filtrarProdutos() {
    const termo = inputPesquisa.value.toLowerCase();
    const categoria = selectFiltro.value;

    const filtrados = listaDeProdutos.filter(p => {
        const bateNome = p.nome.toLowerCase().includes(termo);
        const bateCategoria =
            categoria === 'todos' || p.tipo === categoria;

        return bateNome && bateCategoria;
    });

    renderizarProdutos(filtrados);
}

// ==========================================
// SACOLA
// ==========================================
function abrirSacola() {
    document.getElementById('sacola').classList.add('ativa');
}

function fecharSacola() {
    document.getElementById('sacola').classList.remove('ativa');
}

// ==========================================
// ADICIONAR AO CARRINHO
// ==========================================
function adicionarAoCarrinho(idProduto) {
    const produto = listaDeProdutos.find(p => p.id === idProduto);

    if (!produto) return;

    let pesoSelecionado = 1;

    // Se for produto vendido por KG
    if (produto.unidade === 'kg') {
        pesoSelecionado = parseFloat(
            document.getElementById(`peso-${idProduto}`).value
        );
    }

    // Procura item igual com mesmo peso
    const itemExistente = carrinho.find(item =>
        item.id === idProduto &&
        item.peso === pesoSelecionado
    );

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            ...produto,
            peso: pesoSelecionado,
            quantidade: 1
        });
    }

    atualizarSacolaUI();
    abrirSacola();
}

// ==========================================
// AUMENTAR QUANTIDADE
// ==========================================
function aumentarQuantidade(index) {
    carrinho[index].quantidade++;
    atualizarSacolaUI();
}

// ==========================================
// DIMINUIR QUANTIDADE
// ==========================================
function diminuirQuantidade(index) {
    carrinho[index].quantidade--;

    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }

    atualizarSacolaUI();
}

// ==========================================
// ATUALIZAR UI SACOLA
// ==========================================
function atualizarSacolaUI() {
    listaSacola.innerHTML = '';

    let total = 0;
    let qtdTotal = 0;

    carrinho.forEach((item, index) => {
        const peso = item.peso || 1;
        const subtotal = item.preco * peso * item.quantidade;

        total += subtotal;
        qtdTotal += item.quantidade;

        const descricaoUnidade =
            item.unidade === 'kg'
                ? `${item.peso} kg`
                : item.unidade;

        const div = document.createElement('div');
        div.className = 'item-sacola';

        div.innerHTML = `
            <div class="item-info">
                <h4>${item.nome} (${descricaoUnidade})</h4>
                <p>R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
            </div>

            <div class="item-controle">
                <button class="btn-quantidade btn-diminuir"
                    onclick="diminuirQuantidade(${index})">-</button>

                <span class="item-quantidade" style="font-weight:bold;">
                    ${item.quantidade}
                </span>

                <button class="btn-quantidade btn-aumentar"
                    onclick="aumentarQuantidade(${index})">+</button>
            </div>
        `;

        listaSacola.appendChild(div);
    });

    if (carrinho.length === 0) {
        listaSacola.innerHTML =
            '<p class="sacola-vazia">Sua sacola está vazia.</p>';
    }

    contador.innerText = qtdTotal;
    valorTotalElemento.innerText =
        `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// ==========================================
// FINALIZAR PEDIDO WHATSAPP
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

    let enderecoFormatado = `${rua}\n${bairro} - ${cidade}`;

    if (complemento) {
        enderecoFormatado += `\n📌 Complemento: ${complemento}`;
    }

    let mensagem = `🛒 *Pedido - Um Dois Feijão com Arroz*\n\n`;

    mensagem += `👤 *Cliente:* ${nome}\n`;
    mensagem += `📞 *Telefone:* ${telefone}\n\n`;

    mensagem += `📍 *Endereço:*\n${enderecoFormatado}\n\n`;

    mensagem += `📦 *Itens do Pedido:*\n`;

    let total = 0;

    carrinho.forEach(item => {
        const peso = item.peso || 1;
        const subtotal = item.preco * peso * item.quantidade;

        const descricaoUnidade =
            item.unidade === 'kg'
                ? `${peso} kg`
                : item.unidade;

        mensagem += `• ${item.nome} (${descricaoUnidade})\n`;
        mensagem += `  Qtd: ${item.quantidade} | R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

        total += subtotal;
    });

    mensagem += `\n💰 *Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

    const numeroWhatsApp = "5511998988312";

    const url =
        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
carregarProdutos();

inputPesquisa.addEventListener('input', filtrarProdutos);
selectFiltro.addEventListener('change', filtrarProdutos);