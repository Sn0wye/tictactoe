import { ComponentProps, useEffect, useState } from 'react';
import './index.css';

type Player = 'X' | 'O';
type Square = Player | null;

const initialBoard: Array<Square> = Array(9).fill(null);

export function App() {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const checkWinner = () => {
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
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          setWinner(board[a] as Player);
          setIsGameOver(true);
          return board[a] as Player;
        }
      }

      if (board.every(tile => tile !== null)) {
        setIsDraw(true);
        setWinner(null);
        setIsGameOver(true);
        return null;
      }
    };

    checkWinner();
  }, [board]);

  const handleClick = (index: number) => {
    if (isGameOver) return;
    // tile already filled
    if (board[index]) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const handleReset = () => {
    setBoard(initialBoard);
    setIsGameOver(false);
    setWinner(null);
    setIsDraw(false);
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
          <h1 className='text-4xl text-zinc-100 flex items-center h-12  gap-2'>
            {winner === 'X' ? (
              <Cross className='w-12 h-12' />
            ) : (
              <Circle className='w-8 h-8' />
            )}
            Wins
          </h1>
        )}
        {!isGameOver && (
          <h1 className='text-4xl text-zinc-100 flex items-center h-12 '>
            {turn === 'X' ? (
              <Cross className='w-12 h-12' />
            ) : (
              <Circle className='w-8 h-8' />
            )}
            's turn
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

      <div className='grid grid-cols-3 gap-5'>
        {board.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className='w-[200px] h-[200px] border-2 border-zinc-100 rounded-xl flex items-center justify-center cursor-pointer'
          >
            {tile === 'X' ? <Cross /> : tile === 'O' ? <Circle /> : null}
          </div>
        ))}
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
