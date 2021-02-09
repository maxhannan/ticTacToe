const boxes = document.querySelectorAll('.box');

const displayControl =(()=>{
    const display = document.querySelector('.display');
    const game = document.querySelector('.gameBoard');
    const menu = document.querySelector('.menu');
    const render = function(gamestate){
        boxes.forEach((box,ix = 0) =>{
            // console.log(box.innerHTML);
            box.innerHTML = gamestate[ix];
        })
    };
    const formHandler = function (){
        menu.style.visibility = 'hidden';
        menu.style.opacity = '0';
        game.style.visibility = 'visible';
        game.style.opacity = '1';
    }
    const updateDisplay = function(marker,end = false){
        if(end){
            display.innerText = marker;
            return;
        }
        display.innerText = `${marker}'s turn`
    }
    return {
        render,
        updateDisplay,
        formHandler
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
    const getGameState = () => [...gamestate];
    const renderGameState = function(){
        displayControl.render(gamestate);
    }
    const validateMove = function(ix){
        let win = checkWin()
        // console.log(win)
        if(gamestate[ix]===''&& !win){
            return true;
        }return false;
    }
    const updateGameState = function(ix,marker){
            gamestate[ix]= marker;
            renderGameState();
    };
    const checkWin = function(state = gamestate){
        let win = false;
        winningConditions.forEach(condition =>{
            let ix1 = condition[0];
            let ix2 = condition[1];
            let ix3 = condition[2];
            let gs1 = state[ix1];
            let gs2 = state[ix2];
            let gs3 = state[ix3];
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
            // console.log({open});
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
        checkDraw,
        getGameState
    }
})();

const playerFactory = (name,marker)=>{
    const getMarker = () => marker;
    const getName = () => name;
    const getComp = () => false;
    return {
        getMarker,
        getName,
        getComp
    }
}
const computerFactory = (name,marker)=>{
    const getMarker = () => marker;
    const getName = () => name;
    const getComp = () => true;
    function getRandomArbitrary(min=0, max=9) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    const getValidMoves = function(){
        let valid = false;
        let validMoves = [];
        for(let i = 0; i<9; i++){
            valid = GameBoard.validateMove(i);
            if(valid){
                validMoves.push(i);
            }
        }
        return validMoves;
    }
    const makeMove = function(){
        posMoves = getValidMoves();
        let move;
        let winningMove = false;
        posMoves.forEach(choice =>{
            let state = GameBoard.getGameState();
            state[choice]=marker;
                if(GameBoard.checkWin(state)){
                    move =  choice;
                    winningMove = true;
                }
            })
            if(winningMove){
                return move;
            }
            // ELSE CHOOSE RANDOM MOVE
            console.log('nowins')
            let moveChoice = getRandomArbitrary(0,posMoves.length);
            move = posMoves[moveChoice];
            return move;
        
    }
    return {
        getMarker,
        getName,
        makeMove,
        getComp
    }
}

const gameMaster = (()=>{
    let player1
    let player2
    let currentPlayer;
    const resetBtn = document.querySelector('#reset')
    const init = function(p1, p2){
        player1 = p1;
        player2 = p2;
        currentPlayer = player1;
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
            // console.log(box);
            box.addEventListener('click', handleClicks);
        });
        resetBtn.addEventListener('click', reset);
    };
    const handleClicks = function(e){
        // console.log(e);
        let ix = e.target.dataset['ix'];
        playRound(ix);
    }
    const playRound = async function(ix){
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
            if(currentPlayer.getComp()){
                await new Promise(r => setTimeout(r, 500));
                playRound(currentPlayer.makeMove())
            }
        } 
    }  
    
    // init();
    return{
        init,
        reset
    }
})();

const formControl = (()=>{
    const startBtn = document.querySelector('#start');
    const inputs = document.querySelectorAll('.inputs')
    const handleClicks = function(){
        let p1 = inputs[0].value;
        let p1M = inputs[1].value;
        let p2 = inputs[2].value;
        let p2M = inputs[3].value;
        let compSel = inputs[4].value;
        let isComp = false;

        if(compSel === 'comp'){
            isComp = true;
        }
        let player1 = playerFactory(p1, p1M.toUpperCase());
        let player2;
        if(isComp){
            player2 = computerFactory(p2, p2M.toUpperCase());
        }else{
            player2 = playerFactory(p2, p2M.toUpperCase());
        }
        if(validateForm(p1,p1M,p2,p2M,compSel)){
            displayControl.formHandler();
            gameMaster.init(player1,player2);
        }
    }
    const validateForm = function(p1,p1M,p2,p2M,compSel){
        let validated = true;
        if(p1 === ""){
            validated = false;
        }
        if(p1 === p2){
            validated = false;
        }
        if(compSel === ''){
            validated = false;
        }
        if(p1M === p2M){
            validated = false;
        }
        if(p1M === "" || p1M.length > 1){
            validated = false;
        }
        if(p2 === ""){
            validated = false;
        }
        if(p2M === "" || p1M.length > 1){
            validated = false;
        }
        return validated;
    }
    startBtn.addEventListener('click',handleClicks);
    
})();

