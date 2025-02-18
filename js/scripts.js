// Gerenciamento de usuários
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual')) || null;
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Estruturas de dados adicionais
let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

// Função para atualizar interface baseado no estado de login
function atualizarInterface() {
    const loginBtn = document.querySelector('#loginBtn');
    const registerBtn = document.querySelector('#registerBtn');
    const carrinhoCount = document.querySelector('#carrinhoCount');
    const userInfo = document.querySelector('#userInfo');

    if (usuarioAtual) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userInfo.innerHTML = `
            <span class="me-2">Olá, ${usuarioAtual.nome}</span>
            <button class="btn btn-outline-dark" onclick="logout()">Sair</button>
        `;
        userInfo.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }

    // Atualizar contador do carrinho
    carrinhoCount.textContent = carrinho.length;
}

// Função de registro
function registrar(event) {
    event.preventDefault();
    
    const nome = document.querySelector('#registerName').value;
    const email = document.querySelector('#registerEmail').value;
    const senha = document.querySelector('#registerPassword').value;
    const confirmarSenha = document.querySelector('#registerConfirmPassword').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    if (usuarios.find(u => u.email === email)) {
        alert('Este email já está registrado!');
        return;
    }

    const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha
    };

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    alert('Registro realizado com sucesso!');
    bootstrap.Modal.getInstance(document.querySelector('#registerModal')).hide();
    
    // Limpar formulário
    event.target.reset();
}

// Função de login
function login(event) {
    event.preventDefault();
    
    const email = document.querySelector('#loginEmail').value;
    const senha = document.querySelector('#loginPassword').value;

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        alert('Email ou senha incorretos!');
        return;
    }

    usuarioAtual = usuario;
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
    
    alert('Login realizado com sucesso!');
    bootstrap.Modal.getInstance(document.querySelector('#loginModal')).hide();
    
    // Limpar formulário
    event.target.reset();
    atualizarInterface();
}

// Função de logout
function logout() {
    usuarioAtual = null;
    localStorage.removeItem('usuarioAtual');
    atualizarInterface();
}

// Funções do carrinho
function adicionarAoCarrinho(produtoId, nome, preco) {
    if (!usuarioAtual) {
        alert('Por favor, faça login para adicionar itens ao carrinho!');
        return;
    }

    const item = {
        id: parseInt(produtoId),
        nome: nome,
        preco: parseFloat(preco),
        quantidade: 1
    };

    const itemExistente = carrinho.find(i => i.id === item.id);
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push(item);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarInterface();
    alert('Item adicionado ao carrinho!');
}

// Funções do carrinho atualizadas
function atualizarCarrinho() {
    const carrinhoItems = document.querySelector('#carrinhoItems');
    const carrinhoTotal = document.querySelector('#carrinhoTotal');
    let total = 0;

    if (carrinho.length === 0) {
        carrinhoItems.innerHTML = '<p class="text-center text-muted">Seu carrinho está vazio</p>';
        carrinhoTotal.textContent = 'R$ 0,00';
        return;
    }

    carrinhoItems.innerHTML = carrinho.map(item => {
        total += item.preco * item.quantidade;
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div>
                    <h6 class="mb-0">${item.nome}</h6>
                    <small class="text-muted">R$ ${item.preco.toFixed(2)} cada</small>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-dark me-2" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span class="mx-2">${item.quantidade}</span>
                    <button class="btn btn-sm btn-outline-dark ms-2" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    <button class="btn btn-sm btn-outline-danger ms-3" onclick="removerDoCarrinho(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function alterarQuantidade(produtoId, delta) {
    const item = carrinho.find(i => i.id === parseInt(produtoId));
    if (item) {
        item.quantidade += delta;
        if (item.quantidade <= 0) {
            removerDoCarrinho(produtoId);
        } else {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarCarrinho();
            atualizarInterface();
        }
    }
}

function removerDoCarrinho(produtoId) {
    carrinho = carrinho.filter(i => i.id !== parseInt(produtoId));
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    atualizarInterface();
}

function finalizarCompra() {
    if (!usuarioAtual) {
        alert('Por favor, faça login para finalizar a compra!');
        return;
    }

    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const pedido = {
        id: Date.now(),
        usuario: usuarioAtual.id,
        items: [...carrinho],
        total: carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0),
        data: new Date().toISOString(),
        status: 'Pendente'
    };

    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    carrinho = [];
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    alert('Compra finalizada com sucesso!');
    atualizarCarrinho();
    atualizarInterface();
    bootstrap.Modal.getInstance(document.querySelector('#carrinhoModal')).hide();
}

// Funções do perfil
function atualizarPerfil(event) {
    event.preventDefault();
    
    usuarioAtual.nome = document.querySelector('#perfilNome').value;
    usuarioAtual.endereco = document.querySelector('#perfilEndereco').value;

    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioAtual.id);
    usuarios[usuarioIndex] = usuarioAtual;

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));

    alert('Perfil atualizado com sucesso!');
    atualizarInterface();
}

function carregarPerfil() {
    if (usuarioAtual) {
        document.querySelector('#perfilNome').value = usuarioAtual.nome || '';
        document.querySelector('#perfilEmail').value = usuarioAtual.email || '';
        document.querySelector('#perfilEndereco').value = usuarioAtual.endereco || '';
    }
}

function carregarHistoricoPedidos() {
    const historicoPedidos = document.querySelector('#historicoPedidos');
    const pedidosUsuario = pedidos.filter(p => p.usuario === usuarioAtual.id);

    if (pedidosUsuario.length === 0) {
        historicoPedidos.innerHTML = '<p class="text-muted">Nenhum pedido encontrado.</p>';
        return;
    }

    historicoPedidos.innerHTML = pedidosUsuario.map(pedido => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between">
                <span>Pedido #${pedido.id}</span>
                <span class="badge bg-primary">${pedido.status}</span>
            </div>
            <div class="card-body">
                <p class="card-text">Data: ${new Date(pedido.data).toLocaleDateString()}</p>
                <p class="card-text">Total: R$ ${pedido.total.toFixed(2)}</p>
                <div class="mt-2">
                    <small class="text-muted">Items:</small>
                    <ul class="list-unstyled">
                        ${pedido.items.map(item => `
                            <li>${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Formulário de registro
    document.querySelector('#registerForm').addEventListener('submit', registrar);
    
    // Formulário de login
    document.querySelector('#loginForm').addEventListener('submit', login);
    
    // Atualizar interface inicial
    atualizarInterface();
    
    // Adicionar eventos aos botões "Adicionar ao carrinho"
    document.querySelectorAll('.card').forEach(card => {
        const addButton = card.querySelector('.btn-add-cart');
        if (addButton) {
            addButton.addEventListener('click', () => {
                const produtoId = card.dataset.produtoId;
                const nome = card.querySelector('.fw-bolder').textContent;
                const preco = card.querySelector('.preco').dataset.preco;
                
                adicionarAoCarrinho(produtoId, nome, preco);
            });
        }
    });

    // Perfil
    document.querySelector('#perfilForm').addEventListener('submit', atualizarPerfil);

    // Carrinho
    const carrinhoModal = document.getElementById('carrinhoModal');
    if (carrinhoModal) {
        carrinhoModal.addEventListener('show.bs.modal', atualizarCarrinho);
    }
    
    // Perfil e histórico
    document.querySelector('#perfilModal').addEventListener('show.bs.modal', () => {
        carregarPerfil();
        carregarHistoricoPedidos();
    });
});