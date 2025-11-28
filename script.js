/* ============================================================
   1. BANCO DE DADOS SIMULADO (JSON)
   ============================================================ */
const DB = {
    municipios: [
        { id: 1, nome: "Santos", uf: "SP" },
        { id: 2, nome: "São Vicente", uf: "SP" },
        { id: 3, nome: "Cubatão", uf: "SP" }
    ],
    exposicoes: [
        { id: 1, titulo: "Vozes da Maré", dt_abertura: "10/03/2024", cd_municipio: 1 },
        { id: 2, titulo: "Periferia em Cores", dt_abertura: "15/04/2024", cd_municipio: 2 }
    ],
    administradores: [
        // LOGIN ADMIN: usuario: admin | senha: 123
        { id: 1, nome: "Admin Chefe", usuario: "admin", senha: "123" } 
    ],
    agentes_culturais: [
        // LOGIN AGENTE: email: mano@rap.com | senha: 123
        { id: 1, nome: "Mano Brownie", email: "mano@rap.com", senha: "123", atividade: "Música", cd_municipio: 1, nome_catalogo: "Rimas do Porto" }
    ],
    obras: [
        { id: 1, titulo: "Resistência Sonora", genero: "Audiovisual", sinopse: "Clipe oficial gravado na zona noroeste.", img: "musica.jpg", cd_agente: 1 },
        { id: 2, titulo: "Grafite no Muro", genero: "Artes Visuais", sinopse: "Intervenção urbana.", img: "grafite.jpg", cd_agente: 1 }
    ],
    solicitacoes: [
        { id: 1, descricao: "Solicito inclusão na exposição Vozes da Maré", status: "Pendente", agente: "Mano Brownie" }
    ],
    solicitacoes_exposicao: [] // Carrinho do Admin
};

/* ============================================================
   2. GERENCIADOR DE SESSÃO (Login/Logout)
   ============================================================ */
const Sessao = {
    logar: (usuario, tipo) => {
        // Salva os dados no navegador
        localStorage.setItem('usuario_logado', JSON.stringify(usuario));
        localStorage.setItem('tipo_usuario', tipo);
    },
    logout: () => {
        localStorage.clear();
        window.location.href = 'index.html'; // Manda pra home ao sair
    },
    getUsuario: () => {
        const user = localStorage.getItem('usuario_logado');
        return user ? JSON.parse(user) : null;
    },
    getTipo: () => localStorage.getItem('tipo_usuario')
};

/* ============================================================
   3. FUNÇÕES DE LOGIN (CORRIGIDA)
   ============================================================ */
function realizarLogin(event) {
    // IMPEDE QUE A PÁGINA RECARREGUE AO CLICAR NO BOTÃO
    if(event) event.preventDefault(); 

    // Pega os valores e LIMPA ESPAÇOS EM BRANCO (trim)
    const emailInput = document.getElementById('email').value.trim();
    const senhaInput = document.getElementById('senha').value.trim();

    console.log("Tentando logar com:", emailInput, senhaInput); // Para debug no F12

    // 1. Verifica se é ADMIN
    const admin = DB.administradores.find(a => a.usuario === emailInput && a.senha === senhaInput);
    if(admin) {
        Sessao.logar(admin, 'admin');
        alert("Login de Admin realizado!");
        window.location.href = 'admin.html';
        return false;
    }

    // 2. Verifica se é AGENTE
    const agente = DB.agentes_culturais.find(a => a.email === emailInput && a.senha === senhaInput);
    if(agente) {
        Sessao.logar(agente, 'agente');
        alert("Bem-vindo Agente " + agente.nome);
        window.location.href = 'agente.html';
        return false;
    }

    // Se não achou ninguém
    alert("Usuário ou senha inválidos!\nTente: admin/123 ou mano@rap.com/123");
    return false;
}

function realizarCadastro(event) {
    event.preventDefault();
    alert("Cadastro simulado com sucesso! Agora faça login com os dados que você criou.");
    window.location.href = 'login.html';
}

/* ============================================================
   4. FUNÇÕES DO AGENTE (PAINEL)
   ============================================================ */
function carregarPainelAgente() {
    const usuario = Sessao.getUsuario();
    const tipo = Sessao.getTipo();

    // SEGURANÇA: Se não estiver logado ou não for agente, chuta pro login
    /*if (!usuario || tipo !== 'agente') {
        alert("Você precisa estar logado como Agente Cultural.");
        window.location.href = 'login.html';
        return;
    }*/

    // Preenche os dados na tela
    const elNome = document.getElementById('nome-agente');
    const elCatalogo = document.getElementById('nome-catalogo-display');
    const modal = document.getElementById('modal-catalogo');

    if(elNome) elNome.innerText = usuario.nome;
    
    if(elCatalogo) {
        if(usuario.nome_catalogo) {
            elCatalogo.innerText = usuario.nome_catalogo;
            if(modal) modal.style.display = 'none';
        } else {
            if(modal) modal.style.display = 'flex';
        }
    }

    renderizarMinhasObras(usuario.id);
}

function salvarNomeCatalogo() {
    const nome = document.getElementById('input-nome-catalogo').value;
    if(nome) {
        const usuario = Sessao.getUsuario();
        usuario.nome_catalogo = nome;
        Sessao.logar(usuario, 'agente'); // Atualiza a sessão
        
        document.getElementById('modal-catalogo').style.display = 'none';
        carregarPainelAgente(); // Recarrega a tela
    }
}

function publicarObra(event) {
    event.preventDefault();
    const titulo = document.getElementById('titulo-obra').value;
    const genero = document.getElementById('genero-obra').value;
    const sinopse = document.getElementById('sinopse-obra').value; // Correção aqui (estava descricao)
    const usuario = Sessao.getUsuario();

    // Cria nova obra no "Banco"
    DB.obras.push({
        id: Date.now(),
        titulo: titulo, 
        genero: genero, 
        sinopse: sinopse, 
        img: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=500&q=60", 
        cd_agente: usuario.id
    });

    alert("Obra publicada com sucesso!");
    document.getElementById('form-obra').reset();
    renderizarMinhasObras(usuario.id);
}

function renderizarMinhasObras(idAgente) {
    const container = document.getElementById('minhas-obras');
    if(!container) return;

    container.innerHTML = "";
    const obrasDoAgente = DB.obras.filter(o => o.cd_agente === idAgente);

    if(obrasDoAgente.length === 0) {
        container.innerHTML = "<p>Nenhuma obra publicada ainda.</p>";
        return;
    }

    obrasDoAgente.forEach(obra => {
        container.innerHTML += `
            <div class="card">
                <img src="${obra.img}">
                <div class="card-content">
                    <h3>${obra.titulo}</h3>
                    <p class="tag-genero">${obra.genero}</p>
                    <p>${obra.sinopse || 'Sem descrição'}</p>
                </div>
            </div>`;
    });
}

/* ============================================================
   5. FUNÇÕES DE BUSCA E NAVEGAÇÃO (VISITANTE)
   ============================================================ */
function verificarEnter(event) {
    if (event.key === "Enter") realizarBusca();
}

function realizarBusca() {
    const termo = document.getElementById('campo-busca').value.toLowerCase().trim();
    if (!termo) { alert("Digite algo para buscar!"); return; }

    document.getElementById('secao-navegacao').style.display = 'none';
    const secaoBusca = document.getElementById('secao-busca');
    secaoBusca.style.display = 'block';
    
    document.getElementById('titulo-pagina').innerText = `Busca: "${termo}"`;
    const container = document.getElementById('grid-resultados');
    container.innerHTML = "";

    let encontrou = false;

    // Busca Obras
    DB.obras.forEach(obra => {
        if(obra.titulo.toLowerCase().includes(termo) || obra.genero.toLowerCase().includes(termo)) {
            encontrou = true;
            container.innerHTML += criarCardHTML(obra, 'OBRA');
        }
    });

    // Busca Agentes
    DB.agentes_culturais.forEach(agente => {
        if(agente.nome.toLowerCase().includes(termo) || agente.atividade.toLowerCase().includes(termo)) {
            encontrou = true;
            container.innerHTML += `
                <div class="card" style="border-left: 3px solid var(--accent)">
                    <div style="height:150px; background:#222; display:flex; align-items:center; justify-content:center; font-size:3rem;">🎭</div>
                    <div class="card-content">
                        <span class="tag-genero">AGENTE</span>
                        <h3>${agente.nome}</h3>
                        <p>${agente.atividade}</p>
                    </div>
                </div>`;
        }
    });

    if(!encontrou) container.innerHTML = "<p>Nenhum resultado encontrado.</p>";
}

function limparBusca() {
    document.getElementById('campo-busca').value = "";
    document.getElementById('secao-busca').style.display = 'none';
    document.getElementById('secao-navegacao').style.display = 'block';
    document.getElementById('titulo-pagina').innerText = "VITRINE CULTURAL";
}

function carregarMunicipios() {
    const container = document.getElementById('lista-municipios');
    if(!container) return;
    container.innerHTML = `<button class="tab-btn active" onclick="filtrarExposicoes('todos', this)">TODOS</button>`;
    
    DB.municipios.forEach(mun => {
        container.innerHTML += `<button class="tab-btn" onclick="filtrarExposicoes(${mun.id}, this)">${mun.nome}</button>`;
    });
    filtrarExposicoes('todos', null);
}

function filtrarExposicoes(idMunicipio, btn) {
    if(btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const container = document.getElementById('grid-exposicoes');
    if(!container) return;
    container.innerHTML = "";

    const lista = idMunicipio === 'todos' ? DB.exposicoes : DB.exposicoes.filter(e => e.cd_municipio === idMunicipio);

    if(lista.length === 0) {
        container.innerHTML = "<p>Nenhuma exposição neste município.</p>";
        return;
    }

    lista.forEach(exp => {
        // Mostra obras relacionadas (lógica simplificada: todas as obras)
        DB.obras.forEach(obra => {
            container.innerHTML += criarCardHTML(obra, `EXPOSIÇÃO: ${exp.titulo}`);
        });
    });
}

function criarCardHTML(obra, tagExtra) {
    // Busca nome do agente
    const agente = DB.agentes_culturais.find(a => a.id === obra.cd_agente);
    return `
        <div class="card">
            <img src="${obra.img}">
            <div class="card-content">
                <span class="tag-genero" style="font-size:0.6rem; opacity:0.8">${tagExtra || obra.genero}</span>
                <h3>${obra.titulo}</h3>
                <p><strong>Artista:</strong> ${agente ? agente.nome : 'Desconhecido'}</p>
                <p>${obra.sinopse || ''}</p>
            </div>
        </div>`;
}

/* ============================================================
   6. FUNÇÕES DO ADMIN (PEDIDO/CURADORIA)
   ============================================================ */
function carregarPainelAdmin() {
    /*if (Sessao.getTipo() !== 'admin') {
        window.location.href = 'login.html';
        return;
    }*/
    renderizarObrasAdmin();
    atualizarCarrinhoUI();
}
    const titulo = document.querySelector('header nav');
    if(titulo) {
        // Adiciona um botão de sair visualmente se não tiver
        if(!titulo.innerHTML.includes("Sair")) {
             titulo.innerHTML += `<button onclick="Sessao.logout()" class="btn-destaque" style="background:transparent; color:#fff; width:auto; margin-left: 15px;">Sair (Modo Teste)</button>`;
        }
    }

function renderizarObrasAdmin() {
    const container = document.getElementById('catalogo-admin');
    if(!container) return;
    container.innerHTML = "";

    DB.obras.forEach(obra => {
        container.innerHTML += `
            <div class="card">
                <img src="${obra.img}">
                <div class="card-content">
                    <h3>${obra.titulo}</h3>
                    <button class="btn-acao" onclick="adicionarAoCarrinho(${obra.id})">Selecionar</button>
                </div>
            </div>`;
    });
}

function adicionarAoCarrinho(id) {
    const obra = DB.obras.find(o => o.id === id);
    if(DB.solicitacoes_exposicao.find(i => i.id === id)) {
        alert("Já selecionado!"); return;
    }
    DB.solicitacoes_exposicao.push(obra);
    atualizarCarrinhoUI();
}

function removerDoCarrinho(index) {
    DB.solicitacoes_exposicao.splice(index, 1);
    atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
    const container = document.getElementById('itens-carrinho');
    const total = document.getElementById('total-valor');
    if(!container) return;

    container.innerHTML = "";
    if(DB.solicitacoes_exposicao.length === 0) {
        container.innerHTML = "<p>Nenhuma obra selecionada.</p>";
        total.innerText = "0";
    } else {
        DB.solicitacoes_exposicao.forEach((item, idx) => {
            container.innerHTML += `
                <div class="item-lista">
                    <span>${item.titulo}</span>
                    <button onclick="removerDoCarrinho(${idx})" class="btn-acao btn-remover" style="padding:2px 8px; width:auto;">X</button>
                </div>`;
        });
        total.innerText = DB.solicitacoes_exposicao.length;
    }
}

function finalizarSolicitacao() {
    if(DB.solicitacoes_exposicao.length === 0) return alert("Selecione obras primeiro.");
    alert("Exposição criada com sucesso!");
    DB.solicitacoes_exposicao = [];
    atualizarCarrinhoUI();
}