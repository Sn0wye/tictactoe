import { ComponentProps, useEffect, useRef, useState } from 'react';
import './index.css';
import { io, Socket } from 'socket.io-client';
import {
  type ClientToServerEvents,
  type ServerToClientEvents
} from '../socket';

type Player = 'X' | 'O';
type Square = Player | null;
type MySocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const getSocket = () => {
  const socket: MySocket = io('http://localhost:8080');

  return socket;
};

const initialBoard: Array<Square> = Array(9).fill(null);

const cellBorders = [
  'border-r border-b',
  'border-l border-r border-b',
  'border-l border-b',
  'border-t border-r border-b',
  'border',
  'border-t border-b border-l',
  'border-t border-r',
  'border-t border-l border-r',
  'border-t border-l'
];

export function App() {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const socket = useRef<MySocket | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    socket.current = getSocket();

    socket.current.on('gameUpdate', game => {
      setBoard(game.board);
      setTurn(game.turn);
      setWinner(game.winner);
      setIsDraw(game.isDraw);
      setIsGameOver(game.isOver);
    });

    socket.current.on('assignPlayer', player => {
      setPlayer(player);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const handleClick = (index: number) => {
    if (isGameOver || board[index]) return;
    socket.current?.emit('makeMove', index);
  };

  const handleReset = () => {
    socket.current?.emit('resetGame');
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <header className='flex flex-col gap-2 mb-10'>
        {isGameOver && isDraw && (
          <h1 className='text-4xl text-zinc-100 flex items-center h-12 '>
            Draw
          </h1>
        )}
        {isGameOver && !isDraw && (
          <h1 className='text-4xl text-zinc-100 flex items-center h-12 gap-2'>
            {winner === player ? 'You won' : 'You lost'}
          </h1>
        )}
        {!isGameOver && (
          <h1 className='text-4xl text-zinc-100 flex items-center h-12 '>
            {player === turn ? "It's your turn" : "It's your opponent's turn"}
          </h1>
        )}
        {isGameOver && (
          <button
            onClick={handleReset}
            className='bg-zinc-100 text-zinc-900 px-3 h-10 rounded-md font-semibold'
          >
            Restart
          </button>
        )}
      </header>

      <div className='grid grid-cols-3'>
        {board.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className={`w-[200px] h-[200px] border-zinc-100 flex items-center justify-center cursor-pointer ${cellBorders[idx]}`}
          >
            {tile === 'X' ? <Cross /> : tile === 'O' ? <Circle /> : null}
          </div>
        ))}
      </div>
      <div className='absolute bottom-2 left-2 text-2xl'>
        You are playing as {player}
      </div>
    </div>
  );
}

const Cross = (props: ComponentProps<'svg'>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='w-40 h-40'
      {...props}
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  );
};

const Circle = (props: ComponentProps<'svg'>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='w-32 h-32'
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
    </svg>
  );
};
