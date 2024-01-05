import { Server } from 'socket.io';

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: '*'
  }
});

type Player = 'X' | 'O';

type GameState = {
  board: Array<Player | null>;
  turn: Player;
  winner: Player | null;
  isDraw: boolean;
  isOver: boolean;
};

// Define initial game state
const game: GameState = {
  board: Array(9).fill(null),
  turn: 'X' as Player,
  winner: null as Player | null,
  isDraw: false,
  isOver: false
};

const connectedPlayers = new Map<string, Player>();

const updateGameState = (index: number) => {
  if (game.isOver) return;
  // tile already filled
  if (game.board[index]) return;

  const newBoard = [...game.board];
  newBoard[index] = game.turn;
  game.board = newBoard;
  game.turn = game.turn === 'X' ? 'O' : 'X';
};

const checkForWinner = () => {
  const winningPositions = [
    // horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // diagonal
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const positions of winningPositions) {
    const [a, b, c] = positions;
    if (
      game.board[a] &&
      game.board[a] === game.board[b] &&
      game.board[a] === game.board[c]
    ) {
      game.winner = game.board[a];
      game.isOver = true;
      return;
    }
  }

  if (game.board.every(tile => tile !== null)) {
    game.isDraw = true;
    game.winner = null;
    game.isOver = true;
    return;
  }
};

const resetGameState = () => {
  game.board = Array(9).fill(null);
  game.turn = 'X';
  game.winner = null;
  game.isDraw = false;
  game.isOver = false;
};

io.on('connection', socket => {
  // assign player to X or O
  if (connectedPlayers.size === 0) {
    connectedPlayers.set(socket.id, 'X');
    socket.emit('assignPlayer', 'X');
  } else if (connectedPlayers.size === 1) {
    connectedPlayers.set(socket.id, 'O');
    socket.emit('assignPlayer', 'O');
  }

  // Send the current game state to the newly connected player
  socket.emit('gameUpdate', game);

  socket.on('makeMove', (index: number) => {
    if (game.isOver) return;
    const player = connectedPlayers.get(socket.id);

    if (!player || player !== game.turn) return;

    updateGameState(index);
    checkForWinner();

    io.emit('gameUpdate', game);
  });

  socket.on('resetGame', () => {
    resetGameState();
    io.emit('gameUpdate', game);
  });

  socket.on('disconnect', () => {
    connectedPlayers.delete(socket.id);
  });
});

io.listen(8080);
console.log('Listening on port 8080');

export interface ServerToClientEvents {
  gameUpdate: (game: GameState) => void;
  assignPlayer: (player: Player) => void;
}

export interface ClientToServerEvents {
  makeMove: (index: number) => void;
  resetGame: () => void;
}

export interface InterServerEvents {}

export interface SocketData {}
