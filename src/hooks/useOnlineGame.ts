import { Chess } from 'chess.js';
import { onValue, ref, set, update } from 'firebase/database';
import { useCallback, useEffect, useRef, useState } from 'react';
import { database } from '../service/firebase';

interface MovePayload {
  from: string;
  to: string;
  promotion?: string;
}

const oppositeColor = (color: 'w' | 'b'): 'w' | 'b' => (color === 'w' ? 'b' : 'w');

export const useOnlineGame = (
  roomId: string,
  isCreator: boolean = false,
  creatorColor: 'w' | 'b' = 'w',
  customInitialTime: number = 300,
  playerName: string = 'Jogador',
) => {
  const [fen, setFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [inCheck, setInCheck] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'ended'>('waiting');

  const [myColor, setMyColor] = useState<'w' | 'b' | null>(isCreator ? creatorColor : null);
  const [colorReady, setColorReady] = useState<boolean>(isCreator);
  const [whiteTime, setWhiteTime] = useState<number>(customInitialTime);
  const [blackTime, setBlackTime] = useState<number>(customInitialTime);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [whitePlayerName, setWhitePlayerName] = useState('Brancas');
  const [blackPlayerName, setBlackPlayerName] = useState('Pretas');

  const chessRef = useRef<Chess>(new Chess());
  const myColorRef = useRef<'w' | 'b' | null>(isCreator ? creatorColor : null);
  const colorLockedRef = useRef<boolean>(isCreator);
  const whiteTimeRef = useRef(customInitialTime);
  const blackTimeRef = useRef(customInitialTime);
  const createdRoomRef = useRef(false);

  const lockColor = (color: 'w' | 'b') => {
    if (colorLockedRef.current && myColorRef.current === color) return;
    if (colorLockedRef.current) return;
    myColorRef.current = color;
    colorLockedRef.current = true;
    setMyColor(color);
    setColorReady(true);
  };

  const updateGameFlags = (chess: Chess, statusOverride?: string) => {
    setInCheck(chess.inCheck());

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
    if (!roomId) return;

    const gameRef = ref(database, `rooms/${roomId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();

      if (data && data.fen) {
        try {
          chessRef.current.load(data.fen);
        } catch {
          console.error('Erro FEN');
        }

        setFen(data.fen);
        setTurn(data.turn || chessRef.current.turn());
        setGameStatus(data.status || 'playing');

        if (data.gameOverReason) {
          setGameOverReason(data.gameOverReason);
        }

        updateGameFlags(chessRef.current, data.status);

        const roomCreatorColor: 'w' | 'b' | undefined =
          data.creatorColor === 'w' || data.creatorColor === 'b' ? data.creatorColor : undefined;

        if (roomCreatorColor) {
          lockColor(isCreator ? roomCreatorColor : oppositeColor(roomCreatorColor));
        }

        if (typeof data.players?.w === 'string') setWhitePlayerName(data.players.w);
        if (typeof data.players?.b === 'string') setBlackPlayerName(data.players.b);

        if (typeof data.whiteTime === 'number') {
          whiteTimeRef.current = data.whiteTime;
          setWhiteTime(data.whiteTime);
        }
        if (typeof data.blackTime === 'number') {
          blackTimeRef.current = data.blackTime;
          setBlackTime(data.blackTime);
        }

        if (data.lastMove?.from && data.lastMove?.to) {
          setLastMove({ from: data.lastMove.from, to: data.lastMove.to });
        }

        if (!isCreator && data.status === 'waiting') {
          const joiningColor = oppositeColor(roomCreatorColor ?? creatorColor);
          update(gameRef, { status: 'playing', [`players/${joiningColor}`]: playerName });
        }
      } else if (isCreator && !createdRoomRef.current) {
        createdRoomRef.current = true;
        set(gameRef, {
          fen: chessRef.current.fen(),
          turn: 'w',
          status: 'waiting',
          creatorColor,
          players: { [creatorColor]: playerName },
          whiteTime: customInitialTime,
          blackTime: customInitialTime,
          updatedAt: Date.now(),
        }).catch((err) => {
          createdRoomRef.current = false;
          console.error('Erro ao criar:', err);
        });
      }
    });

    return () => unsubscribe();
  }, [roomId, isCreator, creatorColor, customInitialTime, playerName]);

  useEffect(() => {
    if (gameStatus !== 'playing' || isGameOver || !roomId) return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          const next = prev <= 1 ? 0 : prev - 1;
          whiteTimeRef.current = next;
          if (next === 0) {
            setIsGameOver(true);
            setGameOverReason('Tempo esgotado! As Pretas venceram.');
          }
          return next;
        });
      } else {
        setBlackTime((prev) => {
          const next = prev <= 1 ? 0 : prev - 1;
          blackTimeRef.current = next;
          if (next === 0) {
            setIsGameOver(true);
            setGameOverReason('Tempo esgotado! As Brancas venceram.');
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameStatus, isGameOver, roomId]);

  const makeMove = useCallback(
    (move: MovePayload): boolean => {
      const assignedColor = myColorRef.current;
      if (!roomId || isGameOver || !assignedColor) return false;

      const currentGame = chessRef.current;
      if (currentGame.turn() !== assignedColor) return false;

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
          setLastMove({ from: move.from, to: move.to });
          updateGameFlags(currentGame);

          const patch: Record<string, unknown> = {
            fen: newFen,
            turn: nextTurn,
            status: isEnded ? 'ended' : 'playing',
            lastMove: move,
            whiteTime: whiteTimeRef.current,
            blackTime: blackTimeRef.current,
            updatedAt: Date.now(),
          };

          if (isEnded) {
            patch.gameOverReason = reason;
          }

          update(ref(database, `rooms/${roomId}`), patch);

          return true;
        }
      } catch {
        return false;
      }

      return false;
    },
    [roomId, isGameOver]
  );

  return {
    fen,
    turn,
    myColor: myColor ?? (isCreator ? creatorColor : 'w'),
    colorReady,
    inCheck,
    gameStatus,
    isGameOver,
    gameOverReason,
    whiteTime,
    blackTime,
    lastMove,
    whitePlayerName,
    blackPlayerName,
    makeMove,
  };
};

export default useOnlineGame;
