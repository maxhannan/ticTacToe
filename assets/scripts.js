const boxes = document.querySelectorAll('.box');

const viewController = (()=>{
    // DOM CACHE
    const display = document.querySelector('.display');
    const scoreBoard = document.querySelector('.scoreboard')
    const game = document.querySelector('.gameBoard');
    const menu = document.querySelector('.menu');
    let xWins = 0;
    let yWins = 0;
    let draws = 0;

    const renderBoard = function(){
        let gamestate = GameBoard.getCurrentGameState()
        
        boxes.forEach((box,ix = 0) =>{
            if(gamestate[ix]==='X'||gamestate[ix]==='O'){
                box.innerHTML = gamestate[ix];
            }else{
                box.innerHTML = ''; 
            }
        })
    };

    const revealBoard = function(){
        menu.style.visibility = 'hidden';
        menu.style.opacity = '0';
        game.style.visibility = 'visible';
        game.style.opacity = '1';
        renderBoard();
    };
    
    const controlGameDisplay = function(msg){
        display.innerText = msg;
    };
    const updateScores = function(player,draw = false){

        if(draw){
            draws++
            return;
        }else if(player.getMarker() === 'X'){
            xWins ++
            return;
        }else{
            yWins++
            return;
        }

    }
    const controlScoreBoard = function(p1,p2){
        scoreBoard.innerText = `${p1.getName()}: ${xWins}   ${p2.getName()}: ${yWins}   Draws: ${draws} `
    };

    return{
        renderBoard,
        revealBoard,
        controlGameDisplay ,
        updateScores,
        controlScoreBoard   
    }
})();

const GameBoard = (()=>{
    let gameState = [0,1 ,2,3,4,5,6,7,8];
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    const getCurrentGameState = () => [...gameState];

    const getPossibleMoves = function(state = gameState){
        return  state.filter(s => s != "O" && s != "X");
    }

    const updateGameState = function(pos,marker){
        gameState[pos] = marker;  
    }

    const checkWin = function(player,state = gameState){
        let win = false;
        winningConditions.forEach(c =>{
            if(state[c[0]] === player && state[c[1]] === player 
                && state[c[2]] === player ){
                   win = true;
            }
        })
        return win;
    }

    const checkDraw = function(state = gameState){
        let movesLeft = getPossibleMoves().length > 1
        let xWIN = checkWin('X')
        let oWin = checkWin('O')
        
        if(!xWIN && !oWin && !movesLeft){
            return true;
        }
        return false;
    }
    
    const resetGameState = function(){
        gameState = [0,1,2,3,4,5,6,7,8]
    }

    return{
        getCurrentGameState,
        getPossibleMoves,
        updateGameState,
        resetGameState,
        checkDraw,
        checkWin
    };

})();
const PlayerFactory = (name, marker)=>{
    const getName = () => name;
    const getMarker = () => marker;
    const isComputer = () => false;
    
    return{
        getName,
        getMarker,
        isComputer
    }
};

const ComputerFactory = (name, marker,level)=>{
    const prototype = PlayerFactory(name, marker);
    const ai = marker
    const lvl = level;
    const human = ai === 'X' ? 'O':'X';
    const isComputer = () => true;
    function getRandomArbitrary(min=0, max=9) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    const makeDumbMove = function(){
        let availSpots = GameBoard.getPossibleMoves();
        let move = {}
        let ix = getRandomArbitrary(0,availSpots.length);
        move.index = availSpots[ix];
        return move;
    }

    const makeSmartMove = function (){
        if(lvl === 0){
            return makeDumbMove()
        }else if(lvl === 1){
            let roll = getRandomArbitrary(1,100) 
            if(roll>60){
                return minimax(GameBoard.getCurrentGameState(), ai);
            }else{
                return makeDumbMove();
            }
        }else if(lvl === 2){
            let roll = getRandomArbitrary(1,100) 
            if(roll>20){
                return minimax(GameBoard.getCurrentGameState(), ai);
            }else{
                return makeDumbMove();
            }
        }
        return minimax(GameBoard.getCurrentGameState(), ai);
    }

    const minimax = function (newBoard, player){
        let availSpots = GameBoard.getPossibleMoves(newBoard);
        if (GameBoard.checkWin(human, newBoard)){
            return {score:-10};
        }else if (GameBoard.checkWin(ai,newBoard)){
            return {score:10};
        }else if (availSpots.length === 0){
             return {score:0};
        };

        let moves = [];
        for (let i = 0; i < availSpots.length; i++){
            let move = {};
  	        move.index = newBoard[availSpots[i]];
            newBoard[availSpots[i]] = player;
            if(player == ai){
                let result = minimax(newBoard, human);
                move.score = result.score;
            }else{
                let result = minimax(newBoard, ai);
                move.score = result.score;
            }
            newBoard[availSpots[i]] = move.index;
            
            moves.push(move);

        }
        let bestMove;
        if(player === ai){
            let bestSoFar = -10000;
            for(let i = 0; i < moves.length; i++){
                if(moves[i].score > bestSoFar){
                    bestSoFar = moves[i].score;
                    bestMove = i;
                }
            }
        }else{
            let bestSoFar = 10000;
            for(let i = 0; i < moves.length; i++){
                if(moves[i].score < bestSoFar){
                    bestSoFar = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    }
    
    return Object.assign({}, prototype, 
        {
        makeDumbMove,
        makeSmartMove,
        isComputer
    })
};

const gameMaster = (()=>{
    let player1;
    let player2;
    let currentPlayer;
    let gameOn;
    const resetBtn = document.querySelector('#reset')
    const computerMove = async function (){
        await new Promise(r => setTimeout(r, 600));
        let compMove = currentPlayer.makeSmartMove();
        playRound(compMove.index);
        viewController.renderBoard();

    }
    const init =  function(p1,p2){
        player1 = p1
        player2 = p2
        currentPlayer = player1;
        viewController.controlGameDisplay(`${currentPlayer.getName()}'s turn.`)
        viewController.controlScoreBoard(player1,player2)
        gameOn = true;
        bindEvents();
        if(currentPlayer.isComputer()){
            computerMove();
        }
        
    }

    const bindEvents = function(){
        boxes.forEach(box => {
            box.addEventListener('click', handleClicks);
        });
        resetBtn.addEventListener('click', reset);
    }

    const reset =  function(){
        GameBoard.resetGameState();
        viewController.renderBoard();
        gameOn = true;
        currentPlayer = player1
        viewController.controlGameDisplay(`${currentPlayer.getName()}'s turn.`)
        if(currentPlayer.isComputer()){
            computerMove();
        }

    }

    const handleClicks = function(e){
        let ix = Number(e.target.dataset['ix']);
        playRound(ix);
    }

    const playRound = async function(ix){
        let pos = GameBoard.getPossibleMoves();
        if(pos.includes(ix)&& gameOn){
            GameBoard.updateGameState(ix,currentPlayer.getMarker());
            viewController.renderBoard();
            if(GameBoard.checkWin('X')||GameBoard.checkWin('O')){
                viewController.controlGameDisplay(`${currentPlayer.getName()} Wins.`);
                viewController.updateScores(currentPlayer);
                viewController.controlScoreBoard(player1,player2);
                gameOn = false;
                return;
            }else if(GameBoard.checkDraw()){
                viewController.controlGameDisplay('Draw.');
                viewController.updateScores(currentPlayer,true);
                viewController.controlScoreBoard(player1,player2);
                gameOn = false;
                return;
            }
            currentPlayer = currentPlayer === player1 ? player2:player1;
            viewController.controlGameDisplay(`${currentPlayer.getName()}'s turn.`);
            if(currentPlayer.isComputer()){
                computerMove();
            }
        }
    }
    return{
        init
    }
})();

const formMaster = (()=>{
    const startBtn = document.querySelector('#start');
    const inputs = document.querySelectorAll('.inputs')
    
    const validateForm = () => true;
    const handleSubmit = function(e){
        let p1 = inputs[0].value;
        let p2 = inputs[2].value; 
        let p1Mode = inputs[1].value 
        let p2Mode = inputs[3].value 

        let player1;
        let player2;
        if(p1Mode === 'human'){
            player1 = PlayerFactory(p1, 'X'); 
        }else{
            player1 = ComputerFactory(p1, 'X', Number(p1Mode));
        }
        if(p2Mode === 'human'){
            player2 = PlayerFactory(p2, 'O'); 
        }else{
            player2 = ComputerFactory(p2, 'O', Number(p2Mode));
        }
        
        if(validateForm()){
            viewController.revealBoard();
            gameMaster.init(player1, player2);
        }
    }
    startBtn.addEventListener('click',handleSubmit);
    return{
        validateForm
    }
})();

