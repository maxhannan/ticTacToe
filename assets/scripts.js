const boxes = document.querySelectorAll('.box');

const viewController = (()=>{
    // DOM CACHE
    const display = document.querySelector('.display');
    const scoreBoard = document.querySelector('.scoreboard')
    const game = document.querySelector('.gameBoard');
    const menu = document.querySelector('.menu');
    // Running Scores
    let xWins = 0;
    let yWins = 0;
    let draws = 0;
    // renders gamestate to boxes 
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
    // hides form, shows game, renders board
    const hideForm = function(){
        menu.style.visibility = 'hidden';
        menu.style.opacity = '0';
        game.style.visibility = 'visible';
        game.style.opacity = '1';
        renderBoard();
    };
    // controls game status display
    const controlGameDisplay = function(msg){
        display.innerText = msg;
    };
    // updates running totals
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
    // controls ScoreBoard display
    const controlScoreBoard = function(p1,p2){
        scoreBoard.innerText = `${p1.getName()}: ${xWins}   ${p2.getName()}: ${yWins}   Draws: ${draws} `
    };

    return{
        renderBoard,
        hideForm,
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
    const getLevel = () => level;
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
        isComputer,
        getLevel
    })
};

const gameMaster = (()=>{
    let player1;
    let player2;
    let currentPlayer;
    let gameOn;
    let vc = viewController
    const resetBtn = document.querySelector('#reset')
    const computerMove = async function (){
        await new Promise(r => setTimeout(r, 600));
        let compMove = currentPlayer.makeSmartMove();
        playRound(compMove.index);
        vc.renderBoard();

    }
    const init =  function(p1,p2){
        player1 = p1
        player2 = p2
        currentPlayer = player1;
        vc.controlGameDisplay(`${currentPlayer.getName()}'s turn.`)
        vc.controlScoreBoard(player1,player2)
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
        vc.renderBoard();
        gameOn = true;
        currentPlayer = player1
        vc.controlGameDisplay(`${currentPlayer.getName()}'s turn.`)
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
            vc.renderBoard();
            if(GameBoard.checkWin('X')||GameBoard.checkWin('O')){
                vc.controlGameDisplay(`${currentPlayer.getName()} Wins.`);
                vc.updateScores(currentPlayer);
                vc.controlScoreBoard(player1,player2);
                gameOn = false;
                return;
            }else if(GameBoard.checkDraw()){
                vc.controlGameDisplay('Draw.');
                vc.updateScores(currentPlayer,true);
                vc.controlScoreBoard(player1,player2);
                gameOn = false;
                return;
            }
            currentPlayer = currentPlayer === player1 ? player2:player1;
            vc.controlGameDisplay(`${currentPlayer.getName()}'s turn.`);
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
    
    const validateForm = function(p1,p2){
        let validated = true;
        if(p1.value === ''){
            p1.style.backgroundColor = 'red'
            validated = false;
        }else{
            p1.style.backgroundColor = 'transparent'
        }
        if(p2.value === ''){
            p2.style.backgroundColor = 'red'
            validated = false;
        }else{
            p2.style.backgroundColor = 'transparent'
        }
        return validated;
    }
    const handleSubmit = function(e){
        let p1 = inputs[0];
        let p2 = inputs[2]; 
        let p1Mode = inputs[1].value 
        let p2Mode = inputs[3].value 

        let player1;
        let player2;
        if(p1Mode === 'human'){
            player1 = PlayerFactory(p1.value, 'X'); 
        }else{
            player1 = ComputerFactory(p1.value, 'X', Number(p1Mode));
        }
        if(p2Mode === 'human'){
            player2 = PlayerFactory(p2.value, 'O'); 
        }else{
            player2 = ComputerFactory(p2.value, 'O', Number(p2Mode));
        }
        if(validateForm(p1,p2)){
            viewController.hideForm();
            gameMaster.init(player1, player2);
        }
    }
    startBtn.addEventListener('click',handleSubmit);
    return{
        validateForm
    }
})();

