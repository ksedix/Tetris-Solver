function GameManager(){
    var gridCanvas = document.getElementById('grid-canvas');
    var nextCanvas = document.getElementById('next-canvas');
    var scoreContainer = document.getElementById("score-container");
    var resetButton = document.getElementById('reset-button');
    var aiButton = document.getElementById('ai-button');
    var gridContext = gridCanvas.getContext('2d');
    var nextContext = nextCanvas.getContext('2d');
    document.addEventListener('keydown', onKeyDown);

    var grid = new Grid(22, 10);
    var rpg = new RandomPieceGenerator();
    var ai = new AI({
        heightWeight: 0.510066,
        linesWeight: 0.760666,
        holesWeight: 0.35663,
        bumpinessWeight: 0.184483
    });
    
    //My code
    //ask the user to select the starting piece
    var startPiece = window.prompt("Please select your starting piece")
    while (pieceToIndex(startPiece) == null){
        startPiece = window.prompt("Invalid starting piece. Please select your start piece. Valid pieces: i, j, l, z, s, o ")
    }
    var workingPieces = [null, Piece.fromIndex(pieceToIndex(startPiece))];
    
    var workingPiece = null;
    var isAiActive = true;
    var isKeyEnabled = false;
    var gravityTimer = new Timer(onGravityTimerTick, 500);
    var score = 0;
    
    //My code
    //function for converting text representation of piece to an int representation of a piece. This is necessary because the function that returns a piece, "Piece.fromIndex()", takes an int as parameter
    function pieceToIndex(piece){

        if (piece == "o"){
            return 0
        }
        if (piece == "j"){
            return 1
        }
        if (piece == "l"){
            return 2
        }
        if (piece == "z"){
            return 3
        }
        if (piece == "s"){
            return 4
        }
        if (piece == "t"){
            return 5
        }
        if (piece == "i"){
            return 6
        }
        return null
    }

    // Graphics
    function intToRGBHexString(v){
        return 'rgb(' + ((v >> 16) & 0xFF) + ',' + ((v >> 8) & 0xFF) + ',' + (v & 0xFF) + ')';
    }

    function redrawGridCanvas(workingPieceVerticalOffset = 0){
        gridContext.save();

        // Clear
        gridContext.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

        // Draw grid
        for(var r = 2; r < grid.rows; r++){
            for(var c = 0; c < grid.columns; c++){
                if (grid.cells[r][c] != 0){
                    gridContext.fillStyle= intToRGBHexString(grid.cells[r][c]);
                    gridContext.fillRect(20 * c, 20 * (r - 2), 20, 20);
                    gridContext.strokeStyle="#FFFFFF";
                    gridContext.strokeRect(20 * c, 20 * (r - 2), 20, 20);
                }
            }
        }

        // Draw working piece
        for(var r = 0; r < workingPiece.dimension; r++){
            for(var c = 0; c < workingPiece.dimension; c++){
                if (workingPiece.cells[r][c] != 0){
                    gridContext.fillStyle = intToRGBHexString(workingPiece.cells[r][c]);
                    gridContext.fillRect(20 * (c + workingPiece.column), 20 * ((r + workingPiece.row) - 2) + workingPieceVerticalOffset, 20, 20);
                    gridContext.strokeStyle="#FFFFFF";
                    gridContext.strokeRect(20 * (c + workingPiece.column), 20 * ((r + workingPiece.row) - 2) + workingPieceVerticalOffset, 20, 20);
                }
            }
        }

        gridContext.restore();
    }

    function redrawNextCanvas(){
        nextContext.save();

        nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        var next = workingPieces[1];
        var xOffset = next.dimension == 2 ? 20 : next.dimension == 3 ? 10 : next.dimension == 4 ? 0 : null;
        var yOffset = next.dimension == 2 ? 20 : next.dimension == 3 ? 20 : next.dimension == 4 ? 10 : null;
        for(var r = 0; r < next.dimension; r++){
            for(var c = 0; c < next.dimension; c++){
                if (next.cells[r][c] != 0){
                    nextContext.fillStyle = intToRGBHexString(next.cells[r][c]);
                    nextContext.fillRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                    nextContext.strokeStyle = "#FFFFFF";
                    nextContext.strokeRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                }
            }
        }

        nextContext.restore();
    }

    function updateScoreContainer(){
        scoreContainer.innerHTML = score.toString();
    }

    // Drop animation
    var workingPieceDropAnimationStopwatch = null;

    function startWorkingPieceDropAnimation(callback = function(){}){
        // Calculate animation height
        animationHeight = 0;
        _workingPiece = workingPiece.clone();
        while(_workingPiece.moveDown(grid)){
            animationHeight++;
        }

        var stopwatch = new Stopwatch(function(elapsed){
            if(elapsed >= animationHeight * 20){
                stopwatch.stop();
                redrawGridCanvas(20 * animationHeight);
                callback();
                return;
            }

            redrawGridCanvas(20 * elapsed / 20);
        });

        workingPieceDropAnimationStopwatch = stopwatch;
    }

    function cancelWorkingPieceDropAnimation(){
        if(workingPieceDropAnimationStopwatch === null){
            return;
        }
        workingPieceDropAnimationStopwatch.stop();
        workingPieceDropAnimationStopwatch = null;
    }

    // Process start of turn
    function startTurn(piece){
        // Shift working pieces
        for(var i = 0; i < workingPieces.length - 1; i++){
            workingPieces[i] = workingPieces[i + 1];
        }
        
        //My Code
        //we have to provide startTurn with an argument. This is so that we can set the next piece to the piece provided in the argument to startTurn() function
        workingPieces[workingPieces.length - 1] = Piece.fromIndex(pieceToIndex(piece))
        //this is commented out, because it selects the next piece randomly using rpg.nextPiece()
        //workingPieces[workingPieces.length - 1] = rpg.nextPiece();
        workingPiece = workingPieces[0];

        // Refresh Graphics
        redrawGridCanvas();
        redrawNextCanvas();

        if(isAiActive){
            isKeyEnabled = false;
            workingPiece = ai.best(grid, workingPieces);
            startWorkingPieceDropAnimation(function(){
                while(workingPiece.moveDown(grid)); // Drop working piece
                if(!endTurn()){
                    alert('Game Over!');
                    return;
                }
                //My code
                //This piece of code is for selecting the next piece when ai-driven piece hits the ground
                var nextPiece = window.prompt("Please select your next piece")
                while (pieceToIndex(nextPiece) == null){
                    nextPiece = window.prompt("Invalid next piece. Please select your next piece")
                }
                startTurn(nextPiece);
            })
        }else{
            isKeyEnabled = true;
            gravityTimer.resetForward(500);
        }
    }

    // Process end of turn
    function endTurn(){
        // Add working piece
        grid.addPiece(workingPiece);

        // Clear lines
        score += grid.clearLines();

        // Refresh graphics
        redrawGridCanvas();
        updateScoreContainer();

        return !grid.exceeded();
    }

    // Process gravity tick
    function onGravityTimerTick(){
        // If working piece has not reached bottom
        if(workingPiece.canMoveDown(grid)){
            workingPiece.moveDown(grid);
            redrawGridCanvas();
            return;
        }

        // Stop gravity if working piece has reached bottom
        gravityTimer.stop();

        // If working piece has reached bottom, end of turn has been processed
        // and game cannot continue because grid has been exceeded
        if(!endTurn()){
            isKeyEnabled = false;
            alert('Game Over!');
            return;
        }

        // If working piece has reached bottom, end of turn has been processed
        // and game can still continue.
        
        
        
        // If working piece has reached bottom, end of turn has been processed
        // and game can still continue.

        //My Code
        //This piece of code is for selecting the next piece when it is manual mode and the piece hit the ground
        var nextPiece = window.prompt("Please select your next piece")
        while (pieceToIndex(nextPiece) == null){
            nextPiece = window.prompt("Invalid next piece. Please select your next piece")
        }
        startTurn(nextPiece);
    }

    // Process keys
    function onKeyDown(event){
        if(!isKeyEnabled){
            return;
        }
        switch(event.which){
            case 32: // spacebar
                isKeyEnabled = false;
                gravityTimer.stop(); // Stop gravity
                startWorkingPieceDropAnimation(function(){ // Start drop animation
                    while(workingPiece.moveDown(grid)); // Drop working piece
                    if(!endTurn()){
                        alert('Game Over!');
                        return;
                    }
                    //My code
                    //This is for selecting the next piece when the piece has hit the ground after user pressed space bar(instant descend)
                    var nextPiece = window.prompt("Please select your next piece")
                    while (pieceToIndex(nextPiece) == null){
                        nextPiece = window.prompt("Invalid next piece. Please select your next piece")
                    }
                    startTurn(nextPiece);
                });
                break;
            case 40: // down
                gravityTimer.resetForward(500);
                break;
            case 37: //left
                if(workingPiece.canMoveLeft(grid)){
                    workingPiece.moveLeft(grid);
                    redrawGridCanvas();
                }
                break;
            case 39: //right
                if(workingPiece.canMoveRight(grid)){
                    workingPiece.moveRight(grid);
                    redrawGridCanvas();
                }
                break;
            case 38: //up
                workingPiece.rotate(grid);
                redrawGridCanvas();
                break;
        }
    }

    aiButton.onclick = function(){
        if (isAiActive){
            isAiActive = false;
            aiButton.style.backgroundColor = "#f9f9f9";
        }else{
            isAiActive = true;
            aiButton.style.backgroundColor = "#e9e9ff";

            isKeyEnabled = false;
            gravityTimer.stop();
            startWorkingPieceDropAnimation(function(){ // Start drop animation
                while(workingPiece.moveDown(grid)); // Drop working piece
                if(!endTurn()){
                    alert('Game Over!');
                    return;
                }
            //My code
            //this piece of code is for selecting the next piece when ai was enabled and the ai-driven piece hit the ground
            var nextPiece = window.prompt("Please select your next piece")
            while (pieceToIndex(nextPiece) == null){
            nextPiece = window.prompt("Invalid next piece. Please select your next piece")
            }
            startTurn(nextPiece);
            });
        }
    }

    resetButton.onclick = function(){
        gravityTimer.stop();
        cancelWorkingPieceDropAnimation();
        grid = new Grid(22, 10);
        rpg = new RandomPieceGenerator();
        
        //My code
        //this piece of code is for selecting the first piece when the game was reset
        var firstPiece = window.prompt("Please select your first piece (Game was reset)")
        while (pieceToIndex(firstPiece) == null){
            firstPiece = window.prompt("Invalid first piece. Please select your first piece")
        }
        workingPieces = [null, Piece.fromIndex(pieceToIndex(firstPiece))];
        workingPiece = null;
        score = 0;
        isKeyEnabled = true;
        updateScoreContainer();
        
        //My code
        //this piece of code is for selecting the next piece when the game was reset
        var nextPiece = window.prompt("Please select your next piece")
        while (pieceToIndex(nextPiece) == null){
            nextPiece = window.prompt("Invalid next piece. Please select your next piece")
        }
        startTurn(nextPiece);
    }

    aiButton.style.backgroundColor = "#e9e9ff";
    
    //My code
    //this piece of code is for selecting the next piece in the beginning of the game
    var nextPiece = window.prompt("Please select your next piece")
    while (pieceToIndex(nextPiece) == null){
        nextPiece = window.prompt("Invalid next piece. Please select your next piece. Valid pieces: i, j, l, z, s, o ")
    }
    startTurn(nextPiece);
}
