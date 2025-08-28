// --- DOCUMENTAÇÃO ---
// Este script controla o fluxo completo do jogo, desde o início até o salvamento no ranking.
// 1. Gerencia a troca entre as telas (inicial, jogo, final).
// 2. Controla a movimentação do jogador.
// 3. Ativa um desafio (pergunta) quando o jogador atinge um ponto.
// 4. Calcula a pontuação baseada em tempo e acerto do desafio.
// 5. Comunica-se com o JSONBin.io para carregar e salvar o ranking.

// --- ETAPA 1: CONFIGURAÇÃO E VARIÁVEIS GLOBAIS ---

// SUBSTITUA COM SUAS INFORMAÇÕES DO JSONBIN.IO
const BIN_ID = '68b0e74bae596e708fda76c6'; 
const API_KEY = '$2a$10$YxVa67ymPOGpsYta2mXakOPG1rbu605uVJemRqFmJR.8nqkVlhlLS';
const URL_BASE = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Elementos das Telas
const telaInicial = document.getElementById('tela-inicial');
const telaJogo = document.getElementById('tela-jogo');
const telaFinal = document.getElementById('tela-final');

// Elementos do Jogo
const jogadorEl = document.getElementById('jogador');
const nomeJogadorDisplay = document.getElementById('nome-jogador-display');
const objetivoEl = document.getElementById('objetivo');
const pontuacaoEl = document.getElementById('pontuacao');
const tempoEl = document.getElementById('tempo');

// Elementos do Desafio
const modalDesafio = document.getElementById('modal-desafio');
const perguntaEl = document.getElementById('pergunta');
const respostasBotoes = document.querySelectorAll('.resposta');

// Elementos de Interação
const nomeJogadorInput = document.getElementById('nome-jogador-input');
const botaoIniciar = document.getElementById('botao-iniciar');
const botaoSalvar = document.getElementById('salvar-pontuacao');
const botaoJogarNovamente = document.getElementById('botao-jogar-novamente');
const listaRankingEl = document.getElementById('lista-ranking');
const pontuacaoFinalEl = document.getElementById('pontuacao-final');

// Variáveis de Estado do Jogo
let nomeJogador = '';
let pontuacao = 0;
let posicaoX = 10, posicaoY = 340; // Posição inicial do jogador
let jogoAtivo = false;
let desafioFoiAtivado = false;
let timerInterval;
let startTime;

// Conteúdo do Desafio
const desafio = {
    pergunta: "Qual tag HTML é usada para criar um link?",
    respostas: ["<a>", "<h1>", "<img>"],
    correta: 0 // Índice da resposta correta
};

// --- ETAPA 2: FUNÇÕES DO FLUXO DO JOGO ---

function iniciarJogo() {
    nomeJogador = nomeJogadorInput.value;
    if (nomeJogador.trim() === '') {
        alert('Por favor, digite um nome!');
        return;
    }
    nomeJogadorDisplay.textContent = nomeJogador;

    // Resetar estado do jogo
    pontuacao = 0;
    desafioFoiAtivado = false;
    posicaoX = 10;
    posicaoY = 340;
    atualizarPosicaoJogador();
    atualizarHUD();
    
    mudarTela('tela-jogo');
    jogoAtivo = true;
    iniciarTimer();
}

function finalizarJogo() {
    jogoAtivo = false;
    pararTimer();
    
    // Cálculo da pontuação final (ex: bônus de tempo)
    const tempoFinal = Math.floor((Date.now() - startTime) / 1000);
    const bonusTempo = Math.max(0, 100 - tempoFinal); // Ganha mais pontos se for rápido
    pontuacao += bonusTempo;

    pontuacaoFinalEl.textContent = pontuacao;
    mudarTela('tela-final');
    carregarRanking();
}

function resetarJogo() {
    nomeJogadorInput.value = '';
    mudarTela('tela-inicial');
}

function mudarTela(idTelaAtiva) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.getElementById(idTelaAtiva).classList.add('ativa');
}

// --- ETAPA 3: MECÂNICAS DO JOGO (MOVIMENTO, DESAFIO, TIMER) ---

function atualizarPosicaoJogador() {
    jogadorEl.style.left = posicaoX + 'px';
    jogadorEl.style.top = posicaoY + 'px';
}

function atualizarHUD() {
    pontuacaoEl.textContent = pontuacao;
    const tempoDecorrido = Math.floor((Date.now() - startTime) / 1000);
    tempoEl.textContent = tempoDecorrido;
}

function iniciarTimer() {
    startTime = Date.now();
    timerInterval = setInterval(atualizarHUD, 1000);
}

function pararTimer() {
    clearInterval(timerInterval);
}

function verificarCondicoes() {
    // 1. Verificar se chegou no objetivo
    if (posicaoX + 50 > objetivoEl.offsetLeft) {
        finalizarJogo();
    }

    // 2. Verificar se ativou o desafio (ex: na metade do caminho)
    if (!desafioFoiAtivado && posicaoX > 400) {
        desafioFoiAtivado = true;
        jogoAtivo = false; // Pausa o jogo
        pararTimer();
        mostrarDesafio();
    }
}

function mostrarDesafio() {
    perguntaEl.textContent = desafio.pergunta;
    respostasBotoes.forEach((botao, index) => {
        botao.textContent = desafio.respostas[index];
    });
    modalDesafio.style.display = 'block';
}

function responderDesafio(indexResposta) {
    if (indexResposta === desafio.correta) {
        pontuacao += 150; // Bônus por acertar
        alert("Resposta Correta! +150 pontos!");
    } else {
        alert("Resposta Incorreta!");
    }
    modalDesafio.style.display = 'none';
    jogoAtivo = true; // Despausa o jogo
    iniciarTimer(); // Reinicia o timer de onde parou
}

document.addEventListener('keydown', (e) => {
    if (!jogoAtivo) return;

    const velocidade = 15;
    if (e.key === 'ArrowRight') posicaoX += velocidade;
    if (e.key === 'ArrowLeft') posicaoX -= velocidade;
    
    // Limites para não sair da tela
    if (posicaoX < 0) posicaoX = 0;
    if (posicaoX > 750) posicaoX = 750;

    atualizarPosicaoJogador();
    verificarCondicoes();
});


// --- ETAPA 4: LÓGICA DO RANKING (Igual ao exemplo anterior) ---

async function carregarRanking() {
    listaRankingEl.innerHTML = '<li>Carregando...</li>';
    try {
        const response = await fetch(`${URL_BASE}/latest`);
        const data = await response.json();
        atualizarTelaRanking(data.record.ranking);
        return data.record.ranking;
    } catch (e) {
        listaRankingEl.innerHTML = '<li>Não foi possível carregar o ranking.</li>';
        return [];
    }
}

async function salvarRanking(dadosDoRanking) {
    try {
        await fetch(URL_BASE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ ranking: dadosDoRanking })
        });
        botaoSalvar.textContent = "Salvo com Sucesso!";
        botaoSalvar.disabled = true;
        carregarRanking();
    } catch (e) {
        alert("Erro ao salvar a pontuação.");
    }
}

function atualizarTelaRanking(ranking) {
    listaRankingEl.innerHTML = '';
    if (ranking.length === 0) {
        listaRankingEl.innerHTML = '<li>Seja o primeiro a pontuar!</li>';
        return;
    }
    ranking.sort((a, b) => b.pontuacao - a.pontuacao);
    ranking.slice(0, 10).forEach((jogador, index) => { // Mostra só os 10 primeiros
        const item = document.createElement('li');
        item.textContent = `#${index + 1} ${jogador.nome} - ${jogador.pontuacao} pontos`;
        listaRankingEl.appendChild(item);
    });
}

// --- ETAPA 5: ADICIONAR OS EVENTOS AOS BOTÕES ---
botaoIniciar.addEventListener('click', iniciarJogo);
botaoJogarNovamente.addEventListener('click', resetarJogo);
respostasBotoes.forEach(botao => {
    botao.addEventListener('click', () => responderDesafio(parseInt(botao.dataset.index)));
});
botaoSalvar.addEventListener('click', async () => {
    botaoSalvar.textContent = "Salvando...";
    botaoSalvar.disabled = true;
    const rankingAtual = await carregarRanking();
    rankingAtual.push({ nome: nomeJogador, pontuacao });
    await salvarRanking(rankingAtual);
});

// --- INICIALIZAÇÃO ---
mudarTela('tela-inicial');
