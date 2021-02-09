const boxes = document.querySelectorAll('.box');

const displayControl =(()=>{
    const display = document.querySelector('.display')
    const render = function(gamestate){
        boxes.forEach((box,ix = 0) =>{
            box.innerText = gamestate[ix];
        })
    };
    const updateDisplay = function(marker,end = false){
        if(end){
            display.innerText = marker;
            return;
        }
        display.innerText = `${marker}'s turn`
    }
    return {
        render,
        updateDisplay
    }
})();

const GameBoard = (()=>{
    let gamestate = ['','','','','','','','',''];
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
    const init = function(){
        renderGameState();
    }
    const renderGameState = function(){
        displayControl.render(gamestate);
    }
    const validateMove = function(ix){
        let win = checkWin()
        console.log(win)
        if(gamestate[ix]===''&& !win){
            return true;
        }
    }
    const updateGameState = function(ix,marker){
            gamestate[ix]= marker;
            renderGameState();
    };
    const checkWin = function(){
        let win = false;
        winningConditions.forEach(condition =>{
            let ix1 = condition[0];
            let ix2 = condition[1];
            let ix3 = condition[2];
            let gs1 = gamestate[ix1];
            let gs2 = gamestate[ix2];
            let gs3 = gamestate[ix3];
            if(gs1 === gs2 && gs2 === gs3 && gs1 != ''){
                win = true;
            }  
        })
        return win;
    }
    const checkDraw = function(){
        let draw = false;
        let open = false;
        gamestate.forEach(box =>{
            if(box === ''){
                open = true;
            } 
            console.log({open});
        })
        if(!open && !checkWin()){
            draw = true;
        } 
        return draw;
    }
    const clearGameState = function(){
        gamestate = ['','','','','','','','',''];
        renderGameState();
    };
    init();
    return {
        updateGameState,
        clearGameState,
        validateMove,
        checkWin,
        checkDraw
    }
})();

const playerFactory = (name,marker)=>{
    const getMarker = () => marker;
    const getName = () => name;
    return {
        getMarker,
        getName
    }
}

const gameMaster = (()=>{
    let player1 = playerFactory('Max', 'X');
    let player2 = playerFactory('Miranda', 'O');
    let currentPlayer = player1;
    const resetBtn = document.querySelector('#reset')
    
    const init = function(){
        bindEvents();
        displayControl.updateDisplay(currentPlayer.getName());
    }
    
    const reset = function(){
        GameBoard.clearGameState();
        currentPlayer = player1;
        displayControl.updateDisplay(currentPlayer.getName());
    }
    const bindEvents = function(){
        boxes.forEach(box => {
            console.log(box);
            box.addEventListener('click', handleClicks);
        });
        resetBtn.addEventListener('click', reset);
    };

    const handleClicks = function(e){
        console.log(e);
        let ix = e.target.dataset['ix'];
        playRound(ix);
    }
    const playRound = function(ix){
        if(GameBoard.validateMove(ix)){
            let marker = currentPlayer.getMarker();
            GameBoard.updateGameState(ix, marker);
        
            if(GameBoard.checkWin()){
                displayControl.updateDisplay(`${currentPlayer.getName()} wins`,true) 
                return;
            }else if(GameBoard.checkDraw()){
                displayControl.updateDisplay('Draw',true)
                return;
            }
            currentPlayer = currentPlayer === player1 ? player2:player1;
            displayControl.updateDisplay(currentPlayer.getName());
        } 
    }  
    
    init();
    return{
        reset
    }
})()
