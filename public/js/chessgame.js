const { render } = require("ejs");

const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let playerRole = null;
let sourceSquare = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = '';
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement('div');
      squareElement.classList.add(
        'square',
        (rowindex + squareindex) % 2 === 0 ? 'light' : 'dark'
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add(
          'piece',
          square.color === 'w' ? 'white' : 'black'
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener('dragstart', (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData('text/plain', '');
          }
        });

        pieceElement.addEventListener('dragend', (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener('dragover', function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener('drop', function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSquare);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

if(playerRole === "B"){
    boardElement.classList.add("flipped");
}
else{
    boardElement.classList.remove("flipped");
}

};

const handleMove = (source, target) => {
  const move = {
    from: `${string.fromCharCode(97+source.col)}${8-source.row}`,
    to: `${string.fromCharCode(97+target.col)}${8-target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: '♟',
    r: '♜',
    n: '♞',
    b: '♝',
    q: '♛',
    k: '♚',
    P: '♙',
    R: '♖',
    N: '♘',
    B: '♗',
    Q: '♕',
    K: '♔',
  };

  return unicodePieces[piece.type] || '';
};


socket.io("playerRole", function (role){
    playerRole = role;
    renderBoard();
});

socket.io("spectatorRole", function (){
    playerRole = null;
    renderBoard();
});

socket.io("boardState", function (fen){
    chess.load(fen);
    renderBoard();
});

socket.io("move", function (move){
    chess.move(move);
    renderBoard();
});



renderBoard();