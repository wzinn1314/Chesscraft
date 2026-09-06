import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { database } from '../service/firebase';
import { ref, set, onValue, update } from 'firebase/database';

interface MovePayload {
  from: string;
  to: string;
  promotion?: string;
}

export const useOnlineGame = (
  roomId: string,
  isCreator: boolean = false,
  creatorColor: 'w' | 'b' = 'w',
  customInitialTime: number = 300
) => {
  const [fen, setFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [inCheck, setInCheck] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  
  const [myColor, setMyColor] = useState<'w' | 'b'>(isCreator ? creatorColor : (creatorColor === 'w' ? 'b' : 'w'));
  const [whiteTime, setWhiteTime] = useState<number>(customInitialTime);
  const [blackTime, setBlackTime] = useState<number>(customInitialTime);

  const chessRef = useRef<Chess>(new Chess());

  // Atualiza estado local de xeque / fim de jogo
  const updateGameFlags = (chess: Chess, statusOverride?: string) => {
    const isCheck = chess.inCheck();
    setInCheck(isCheck);

    if (chess.isCheckmate()) {
      setIsGameOver(true);
      const winner = chess.turn() === 'w' ? 'Pretas' : 'Brancas';
      setGameOverReason(`Xeque-Mate! As ${winner} venceram.`);
    } else if (chess.isDraw()) {
      setIsGameOver(true);
      setGameOverReason('Empate!');
    } else if (statusOverride === 'ended') {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }
  };

  useEffect(() => {
    if (!roomId || !database) {
      setGameStatus('playing');
      return;
    }

    const gameRef = ref(database, `rooms/${roomId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();

      if (data && data.fen) {
        try {
          chessRef.current.load(data.fen);
        } catch (e) {
          console.error('Erro FEN:', e);
        }
        
        setFen(data.fen);
        setTurn(data.turn || chessRef.current.turn());
        setGameStatus(data.status || 'playing');

        if (data.gameOverReason) {
          setGameOverReason(data.gameOverReason);
        }

        updateGameFlags(chessRef.current, data.status);

        if (!isCreator && data.creatorColor) {
          setMyColor(data.creatorColor === 'w' ? 'b' : 'w');
        }

        if (data.whiteTime !== undefined) setWhiteTime(data.whiteTime);
        if (data.blackTime !== undefined) setBlackTime(data.blackTime);

        if (!isCreator && data.status === 'waiting') {
          update(gameRef, { status: 'playing' });
        }
      } else if (isCreator) {
        set(gameRef, {
          fen: chessRef.current.fen(),
          turn: 'w',
          status: 'waiting',
          creatorColor,
          whiteTime: customInitialTime,
          blackTime: customInitialTime,
          updatedAt: Date.now(),
        }).catch((err) => console.error('Erro ao criar:', err));
      }
    });

    return () => unsubscribe();
  }, [roomId, isCreator, creatorColor, customInitialTime]);

  // Cronômetro
  useEffect(() => {
    if (gameStatus !== 'playing' || isGameOver || !roomId) return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setGameOverReason('Tempo esgotado! As Pretas venceram.');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setGameOverReason('Tempo esgotado! As Brancas venceram.');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameStatus, isGameOver, roomId]);

  const makeMove = useCallback(
    (move: MovePayload): boolean => {
      if (!roomId || isGameOver || !database) return false;

      const currentGame = chessRef.current;

      if (currentGame.turn() !== myColor) return false;

      try {
        const result = currentGame.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q',
        });

        if (result) {
          const newFen = currentGame.fen();
          const nextTurn = currentGame.turn();

          let reason = '';
          let isEnded = false;

          if (currentGame.isCheckmate()) {
            isEnded = true;
            const winner = nextTurn === 'w' ? 'Pretas' : 'Brancas';
            reason = `Xeque-Mate! As ${winner} venceram.`;
          } else if (currentGame.isDraw()) {
            isEnded = true;
            reason = 'Empate!';
          }

          setFen(newFen);
          setTurn(nextTurn);
          updateGameFlags(currentGame);

          set(ref(database, `rooms/${roomId}`), {
            fen: newFen,
            turn: nextTurn,
            status: isEnded ? 'ended' : 'playing',
            gameOverReason: reason,
            creatorColor,
            whiteTime,
            blackTime,
            lastMove: move,
            updatedAt: Date.now(),
          });

          return true;
        }
      } catch (e) {
        return false;
      }

      return false;
    },
    [roomId, myColor, creatorColor, whiteTime, blackTime, isGameOver]
  );

  return {
    fen,
    turn,
    myColor,
    inCheck,
    gameStatus,
    isGameOver,
    gameOverReason,
    whiteTime,
    blackTime,
    makeMove,
  };
};

export default useOnlineGame;