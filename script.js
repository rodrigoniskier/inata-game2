// --- DOCUMENTAÇÃO ---
// Este script gerencia o ranking do jogo.
// 1. Configura a conexão com o banco de dados (JSONBin.io).
// 2. carregarRanking(): Busca os dados atuais do ranking na internet.
// 3. atualizarTelaRanking(): Exibe os dados do ranking na página.
// 4. salvarPontuacao(): Adiciona uma nova pontuação, ordena e envia a lista atualizada para o banco de dados.

// --- ETAPA 1: CONFIGURAÇÃO ---
// SUBSTITUA COM SUAS INFORMAÇÕES DO JSONBIN.IO
const BIN_ID = '68b0e74bae596e708fda76c6'; 
const API_KEY = '$2a$10$YxVa67ymPOGpsYta2mXakOPG1rbu605uVJemRqFmJR.8nqkVlhlLS'; // Geralmente começa com $2a$10$

const URL_BASE = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Selecionando os elementos do HTML
const listaRankingEl = document.getElementById('lista-ranking');
const nomeJogadorEl = document.getElementById('nome-jogador');
const pontuacaoJogadorEl = document.getElementById('pontuacao-jogador');
const salvarPontuacaoBtn = document.getElementById('salvar-pontuacao');


// --- ETAPA 2: FUNÇÕES DE COMUNICAÇÃO COM O RANKING ---

// Função para CARREGAR os dados do ranking
async function carregarRanking() {
    listaRankingEl.innerHTML = '<li>Carregando...</li>';
    const response = await fetch(`${URL_BASE}/latest`); // '/latest' pega a versão mais recente
    const data = await response.json();
    atualizarTelaRanking(data.record.ranking);
    return data.record.ranking; // Retorna a lista para ser usada por outras funções
}

// Função para SALVAR os dados do ranking
async function salvarRanking(dadosDoRanking) {
    try {
        await fetch(URL_BASE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ ranking: dadosDoRanking }) // Envia o objeto completo
        });
        // Após salvar, recarrega o ranking para garantir que está tudo atualizado
        carregarRanking();
    } catch (error) {
        console.error("Erro ao salvar o ranking:", error);
        alert("Não foi possível salvar sua pontuação. Tente novamente.");
    }
}

// --- ETAPA 3: FUNÇÕES DE INTERAÇÃO COM A TELA ---

// Função para exibir o ranking na tela
function atualizarTelaRanking(ranking) {
    listaRankingEl.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens

    if (ranking.length === 0) {
        listaRankingEl.innerHTML = '<li>Nenhuma pontuação registrada ainda. Seja o primeiro!</li>';
        return;
    }

    // Ordena o ranking por pontuação (do maior para o menor)
    ranking.sort((a, b) => b.pontuacao - a.pontuacao);

    ranking.forEach((jogador, index) => {
        const item = document.createElement('li');
        item.textContent = `${index + 1}. ${jogador.nome} - ${jogador.pontuacao} pontos`;
        listaRankingEl.appendChild(item);
    });
}

// --- ETAPA 4: EVENTOS (AÇÕES DO JOGADOR) ---

// Adiciona o evento de clique ao botão de salvar
salvarPontuacaoBtn.addEventListener('click', async () => {
    const nome = nomeJogadorEl.value;
    const pontuacao = parseInt(pontuacaoJogadorEl.value, 10);

    if (!nome || isNaN(pontuacao)) {
        alert('Por favor, preencha seu nome e uma pontuação válida.');
        return;
    }

    alert('Enviando sua pontuação...');

    // 1. Carrega o ranking atual
    const rankingAtual = await carregarRanking();
    
    // 2. Adiciona a nova pontuação
    rankingAtual.push({ nome, pontuacao });

    // 3. Salva a lista atualizada
    await salvarRanking(rankingAtual);

    // Limpa os campos de input
    nomeJogadorEl.value = '';
    pontuacaoJogadorEl.value = '';
});


// --- INICIALIZAÇÃO ---
// Carrega o ranking assim que a página é aberta
carregarRanking();
