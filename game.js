var gameUtilities = {
    selectCellWithCoordinates: function (x, y) {
        return document.getElementById(x + '-' + y);
    },
    getStatus: function (cell) {
        return cell.getAttribute('data-status');
    },
    setStatus: function (cell, status) {
        cell.className = status;
        cell.setAttribute('data-status', status);
    },
    toggleStatus: function (cell) {
        if (gameUtilities.getStatus(cell) === 'alive') {
            gameUtilities.setStatus(cell, 'dead');
        } else {
            gameUtilities.setStatus(cell, 'alive');
        }
    },
    getCellCoords: function (cell) {
        var idSplit = cell.id.split('-');
        return {
            x: parseInt(idSplit[0], 10),
            y: parseInt(idSplit[1], 10)
        };
    },
    getNeighbors: function (cell) {

        var neighbors = [];
        var cellCoords = gameUtilities.getCellCoords(cell);
        var cellX = cellCoords.x;
        var cellY = cellCoords.y;
        var sc = gameUtilities.selectCellWithCoordinates;

        // Same row adjacent
        neighbors.push(sc(cellX - 1, cellY)); // Same row, previous
        neighbors.push(sc(cellX + 1, cellY)); // Same row, next

        // Row above
        neighbors.push(sc(cellX - 1, cellY - 1)); // Up and to the left
        neighbors.push(sc(cellX + 1, cellY - 1)); // Up and to the right
        neighbors.push(sc(cellX, cellY - 1)); // Just up

        // Row above
        neighbors.push(sc(cellX - 1, cellY + 1)); // Down and to the left
        neighbors.push(sc(cellX + 1, cellY + 1)); // Down and to the right
        neighbors.push(sc(cellX, cellY + 1)); // Just down

        return neighbors.filter(function (cell) {
            return cell !== null;
        });

    },
    getAmountOfAliveCells: function (cells) {

        return cells.filter(function (cell) {
            return gameUtilities.getStatus(cell) === 'alive';
        }).length;

    },

};

var gameOfLife = {
    width: 60,
    height: 30,
    stepInterval: null,

    createAndShowBoard: function () {
        // create <table> element
        var goltable = document.createElement("tbody");

        // build Table HTML
        var tablehtml = '';
        for (var h = 0; h < this.height; h++) {
            tablehtml += "<tr id='row+" + h + "'>";
            for (var w = 0; w < this.width; w++) {
                tablehtml += "<td data-status='dead' id='" + w + "-" + h + "'></td>";
            }
            tablehtml += "</tr>";
        }
        goltable.innerHTML = tablehtml;

        // add table to the #board element
        var board = document.getElementById('board');
        board.appendChild(goltable);

        // once html elements are added to the page, attach events to them
        this.setupBoardEvents();
    },

    forEachCell: function (iteratorFunc) {
        /*
         Write forEachCell here. You will have to visit
         each cell on the board, call the "iteratorFunc" function,
         and pass into func, the cell and the cell's x & y
         coordinates. For example: iteratorFunc(cell, x, y)
         */
        var cellElements = document.getElementsByTagName('td');

        [].slice.call(cellElements).forEach(function (cellElement) {
            var idHalves = cellElement.id.split('-');
            iteratorFunc(cellElement, parseInt(idHalves[0], 10), parseInt(idHalves[1], 10));
        });
    },

    setupBoardEvents: function () {
        // each board cell has an CSS id in the format of: "x-y"
        // where x is the x-coordinate and y the y-coordinate
        // use this fact to loop through all the ids and assign
        // them "on-click" events that allow a user to click on
        // cells to setup the initial state of the game
        // before clicking "Step" or "Auto-Play"

        // clicking on a cell should toggle the cell between "alive" & "dead"
        // for ex: an "alive" cell be colored "blue", a dead cell could stay white

        // EXAMPLE FOR ONE CELL
        // Here is how we would catch a click event on just the 0-0 cell
        // You need to add the click event on EVERY cell on the board

        var onCellClick = function (e) {
            // QUESTION TO ASK YOURSELF: What is "this" equal to here?

            // how to set the style of the cell when it's clicked
            gameUtilities.toggleStatus(this);
        };

        this.forEachCell(function (cellElement) {
            cellElement.addEventListener('click', onCellClick);
        });

        document.getElementById('step_btn').addEventListener('click', this.step.bind(this));
        document.getElementById('clear_btn').addEventListener('click', this.clearBoard.bind(this));
        document.getElementById('play_btn').addEventListener('click', this.enableAutoPlay.bind(this));
        document.getElementById('reset_btn').addEventListener('click', this.randomizeBoard.bind(this));
        document.getElementById('cells_file_upload').addEventListener('change', this.receiveCellsFile.bind(this));

    },

    receiveCellsFile: function (e) {

        var file = e.target.files[0];
        var reader = new FileReader();
        var self = this;

        reader.onloadend = function () {
            self.parseAndPlaceCellsFile(reader.result);
        };

        reader.readAsText(file);

    },

    parseAndPlaceCellsFile: function (fileStr) {

        var cellRows = fileStr.split('\n').slice(2);
        var shapeWidth = cellRows[0].length;
        var shapeHeight = cellRows.length;
        var startingXCell, startingYCell;
        var sc = gameUtilities.selectCellWithCoordinates;

        if (shapeWidth > this.width || shapeHeight > this.height) {
            return;
        }

        startingXCell = Math.floor(this.width / 2) - Math.floor(shapeWidth / 2);
        startingYCell = Math.floor(this.height / 2) - Math.floor(shapeHeight / 2);

        cellRows.forEach(function (cellRow) {

            cellRow.split('').forEach(function (cellFromFile, indexInRow) {

                if (cellFromFile === 'O') {
                    gameUtilities.setStatus(sc(startingXCell + indexInRow, startingYCell), 'alive');
                }

            });

            startingYCell = startingYCell + 1;

        });

    },

    clearBoard: function () {

        this.stop();

        this.forEachCell(function (cell) {
            gameUtilities.setStatus(cell, 'dead');
        });

    },

    step: function () {
        // Here is where you want to loop through all the cells
        // on the board and determine, based on it's neighbors,
        // whether the cell should be dead or alive in the next
        // evolution of the game.
        //
        // You need to:
        // 1. Count alive neighbors for all cells
        // 2. Set the next state of all cells based on their alive neighbors
        var toggles = [];
        this.forEachCell(function (cell) {

            var neighbors = gameUtilities.getNeighbors(cell);
            var amountOfLiveNeighbors = gameUtilities.getAmountOfAliveCells(neighbors);

            if (gameUtilities.getStatus(cell) === 'alive') {
                if (amountOfLiveNeighbors > 3 || amountOfLiveNeighbors < 2) {
                    toggles.push(cell);
                }
            } else {
                if (amountOfLiveNeighbors === 3) {
                    toggles.push(cell);
                }
            }

        });
        toggles.forEach(gameUtilities.toggleStatus);
    },

    stepInterval: null,

    stop: function () {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
    },

    enableAutoPlay: function () {
        // Start Auto-Play by running the 'step' function
        // automatically repeatedly every fixed time interval
        if (!this.stepInterval) {
            this.stepInterval = setInterval(this.step.bind(this), 100);
        } else {
            this.stop();
        }
    },

    randomizeBoard: function () {

        this.forEachCell(function (cell) {
            gameUtilities.setStatus(cell, Math.random() < .5 ? 'alive' : 'dead');
        });

    }
};

gameOfLife.createAndShowBoard();
