import "./style.css";
import {
  BLOCK_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  EVENT_MOVEMNETS,
} from "./const";
// 1. inicializar el canvas
const canvas = document.querySelector("canvas"); // nos traemos el canvas
const context = canvas.getContext("2d"); // recuperamos el contexto  del canvas
const $score = document.querySelector("span");
const $section = document.querySelector("section");

let score = 0;

// tablero del tetris
canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

//3. board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

// refactorizamos
function createBoard(width, height) {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0));
}

// 4. pieza player
const piece = {
  position: { x: 5, y: 5 },
  shape: [
    [1, 1],
    [1, 1],
  ],
  color: "red",
};

// random pieces
const PIECES = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  [
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [0, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 0],
    [0, 0, 1],
  ],
  [
    [0, 0, 1],
    [0, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 0, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
  ],
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
  ],
  [
    [0, 1, 1],
    [1, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [0, 0, 0],
  ],
  [
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 0],
    [0, 1, 1],
    [0, 0, 1],
  ],
  [[1, 1, 1, 1]],
];
// 2. game loop

// function update() {
//   // cada vez que actualicemos el juego vamos a actualizar
//   draw();
//   window.requestAnimationFrame(update);
// }

// auto drop
let dropCounter = 0;
let lastTime = 0;
function update(time = 0) {
  console.log(time);
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > 1000) {
    piece.position.y++;
    dropCounter = 0;
  }
  if (checkCollision()) {
    piece.position.y--;
    solidifyPiece();
    removeRows();
  }
  draw();
  window.requestAnimationFrame(update);
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = "yellow";
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  // pintamos la pieza
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = piece.color;
        context.fillRect(piece.position.x + x, piece.position.y + y, 1, 1);
      }
    });
  });

  $score.innerText = score;
}

document.addEventListener("keydown", (event) => {
  if (event.key === EVENT_MOVEMNETS.DOWN) {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }
  if (event.key === EVENT_MOVEMNETS.LEFT) {
    piece.position.x--;
    if (checkCollision()) {
      piece.position.x++;
    }
  }
  if (event.key === EVENT_MOVEMNETS.RIGHT) {
    piece.position.x++;
    if (checkCollision()) {
      piece.position.x--;
    }
  }
  if (event.key === "ArrowUp") {
    const rotated = [];
    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }
      rotated.push(row);
    }
    const previousShape = piece.shape;
    piece.shape = rotated;
    if (checkCollision()) {
      piece.shape = previousShape; // para evitar que pueda rotarse en los laterales
    }
  }
});

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  // reset position
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2); // para que las piezas aparezcan desde el centro
  piece.position.y = 0;
  // get random shape
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
  // game over
  if (checkCollision()) {
    window.alert("¡Game over!");
    board.forEach((row) => row.fill(0)); // cuando termine rellenamos el tablero con 0
  }
}

function removeRows() {
  let rowsToRemove = [];
  board.forEach((row, y) => {
    if (row.every((value) => value === 1)) {
      rowsToRemove.push(y);
    }
  });
  rowsToRemove.forEach((y) => {
    board.splice(y, 1);
    let newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
    score += 10;
  });
}

$section.addEventListener("click", () => {
  update();

  $section.remove();
  const audio = new Audio("./tetris.mp3");
  audio.volume = 0.5;
  audio.play();
});
