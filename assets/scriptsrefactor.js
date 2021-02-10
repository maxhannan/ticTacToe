const boxes = document.querySelectorAll('.box');

const viewController = (()=>{
    // DOM CACHE
    const display = document.querySelector('.display');
    const game = document.querySelector('.gameBoard');
    const menu = document.querySelector('.menu');

    const renderBoard = function(){
        let gamestate = GameBoard.getCurrentGameState()
        boxes.forEach((box,ix = 0) =>{
            if(gamestate[ix]==='X'||gamestate[ix]==='O'){
                box.innerHTML = gamestate[ix];
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
    
    const controlGameDisplay = function(){

    };

    return{
        renderBoard,
        revealBoard
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
        gameState = [0,1,2,3,0,5,6,7,8]
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
    const isComputer = () => true;
    
    return{
        getName,
        getMarker,
        isComputer
    }
};

const ComputerFactory = (name, marker)=>{
    const prototype = PlayerFactory(name, marker);
    const ai = marker
    const human = marker === 'X' ? 'O' : 'X';
    const isComputer = () => true;
    const makeDumbMove = function(){

    }
    const makeSmartMove = function (){
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
            for(var i = 0; i < moves.length; i++){
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
    const resetBtn = document.querySelector('#reset')
    const init = function(p1,p2){
        player1 = p1.getMarker() ==='X' ? p1:p2;
        player2 = p2.getMarker() ==='O' ? p2:p1;
        console.log({player1,player2})
        bindEvents();
    }
    const bindEvents = function(){
        console.log("BIND")
        boxes.forEach(box => {
            box.addEventListener('click', handleClicks);
        });
        resetBtn.addEventListener('click', reset);
    }
    const reset = function(){
        GameBoard.resetGameState();
    }
    const handleClicks = function(e){
        let ix = Number(e.target.dataset['ix']);
        console.log({ix})
        playRound(ix);
    }

    const playRound = function(ix){
        let pos = GameBoard.getPossibleMoves();
        console.log({pos,ix})
        if(pos.includes(ix)){
            console.log({ix})
            GameBoard.updateGameState(ix,player1.getMarker());
            viewController.renderBoard();
            let compMove = player2.makeSmartMove();
            console.log({compMove})
            GameBoard.updateGameState(compMove.index,player2.getMarker());
            viewController.renderBoard();
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
        let p2 = inputs[1].value;
        let isComp = inputs[2].value === 'comp' ? true: false;
        console.log({isComp})

        let player1 = PlayerFactory(p1, 'X');
        let player2;
        if(isComp){
            player2 = ComputerFactory(p2, 'O');
        }else{
            player2 = PlayerFactory(p2, 'O');
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

// const max = ComputerFactory("max",'O')

// console.log(max.makeSmartMove())