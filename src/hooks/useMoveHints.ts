import { Chess, type Square } from 'chess.js';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface UseMoveHintsOptions {
  fen: string;
  canMove: boolean;
  onMove: (from: string, to: string, promotion?: PromotionPiece) => boolean;
  lastMove?: { from: string; to: string } | null;
  inCheck?: boolean;
}

export interface PendingPromotion {
  from: string;
  to: string;
  color: 'w' | 'b';
}

const DOT: CSSProperties = {
  background: 'radial-gradient(circle, rgba(22, 21, 18, 0.45) 22%, transparent 24%)',
};

const RING: CSSProperties = {
  background: 'radial-gradient(circle, transparent 54%, rgba(201, 52, 52, 0.72) 56%)',
};

const SELECTED: CSSProperties = {
  backgroundColor: 'rgba(212, 160, 84, 0.42)',
};

const LAST_FROM: CSSProperties = {
  backgroundColor: 'rgba(212, 160, 84, 0.28)',
};

const LAST_TO: CSSProperties = {
  backgroundColor: 'rgba(212, 160, 84, 0.4)',
};

const CHECK: CSSProperties = {
  background:
    'radial-gradient(circle, rgba(201, 52, 52, 0.55) 0%, rgba(201, 52, 52, 0.18) 62%, transparent 68%)',
};

const CASTLE_DEST: CSSProperties = {
  background:
    'radial-gradient(circle, rgba(212, 160, 84, 0.95) 16%, rgba(212, 160, 84, 0.28) 18%, transparent 20%), radial-gradient(circle, transparent 38%, rgba(212, 160, 84, 0.7) 40%, rgba(212, 160, 84, 0.15) 52%, transparent 54%)',
  boxShadow: 'inset 0 0 0 2px rgba(212, 160, 84, 0.55)',
};

const CASTLE_ROOK: CSSProperties = {
  background:
    'radial-gradient(circle, transparent 46%, rgba(212, 160, 84, 0.85) 48%, rgba(212, 160, 84, 0.2) 62%, transparent 64%)',
  boxShadow: 'inset 0 0 0 2px rgba(212, 160, 84, 0.8)',
};

const isCastleMove = (move: { from: string; to: string; piece?: string; san?: string; flags?: string }) => {
  if (move.san === 'O-O' || move.san === 'O-O-O') return true;
  if (typeof move.flags === 'string' && (move.flags.includes('k') || move.flags.includes('q'))) return true;
  return move.piece === 'k' && Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0)) === 2;
};

const rookSquareForCastle = (move: { to: string; color?: string }): Square => {
  const rank = move.to[1];
  const kingside = move.to[0] === 'g';
  return `${kingside ? 'h' : 'a'}${rank}` as Square;
};

const findKingSquare = (chess: Chess, color: 'w' | 'b'): Square | null => {
  const board = chess.board();
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = board[rank][file];
      if (piece?.type === 'k' && piece.color === color) {
        return `${String.fromCharCode(97 + file)}${8 - rank}` as Square;
      }
    }
  }
  return null;
};

const needsPromotion = (chess: Chess, from: string, to: string) => {
  const piece = chess.get(from as Square);
  if (!piece || piece.type !== 'p') return false;
  const rank = to[1];
  return (piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1');
};

const resolveCastleTarget = (chess: Chess, from: string, to: string): string => {
  const piece = chess.get(from as Square);
  if (piece?.type !== 'k') return to;
  const legal = chess.moves({ square: from as Square, verbose: true });
  const castle = legal.find((move) => isCastleMove(move) && (move.to === to || rookSquareForCastle(move) === to));
  return castle ? castle.to : to;
};

export const useMoveHints = ({ fen, canMove, onMove, lastMove, inCheck }: UseMoveHintsOptions) => {
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  useEffect(() => {
    setSelected(null);
    setPendingPromotion(null);
  }, [fen]);

  useEffect(() => {
    if (!canMove) {
      setSelected(null);
      setPendingPromotion(null);
    }
  }, [canMove]);

  const legalMoves = useMemo(() => {
    if (!selected || !canMove) return [];
    try {
      return new Chess(fen).moves({ square: selected, verbose: true });
    } catch {
      return [];
    }
  }, [fen, selected, canMove]);

  const castleHints = useMemo(
    () =>
      legalMoves.filter(isCastleMove).map((move) => ({
        dest: move.to as Square,
        rook: rookSquareForCastle(move),
        kingFrom: move.from as Square,
      })),
    [legalMoves],
  );

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = LAST_FROM;
      styles[lastMove.to] = LAST_TO;
    }

    if (inCheck) {
      try {
        const chess = new Chess(fen);
        const king = findKingSquare(chess, chess.turn());
        if (king) styles[king] = { ...styles[king], ...CHECK };
      } catch {
        /* ignore invalid fen */
      }
    }

    if (selected) {
      styles[selected] = { ...styles[selected], ...SELECTED };
      for (const move of legalMoves) {
        const castle = isCastleMove(move);
        if (castle) {
          styles[move.to] = CASTLE_DEST;
          styles[rookSquareForCastle(move)] = CASTLE_ROOK;
        } else {
          const isCapture = move.flags.includes('c') || move.flags.includes('e') || move.isCapture?.() || move.isEnPassant?.();
          styles[move.to] = isCapture ? RING : DOT;
        }
      }
    }

    return styles;
  }, [selected, legalMoves, lastMove, inCheck, fen]);

  const customArrows = useMemo(
    () =>
      castleHints.flatMap((hint) => [
        [hint.kingFrom, hint.dest, '#d4a054'] as [Square, Square, string],
        [hint.kingFrom, hint.rook, '#c9a56a'] as [Square, Square, string],
      ]),
    [castleHints],
  );

  const attemptMove = useCallback(
    (from: string, to: string): boolean => {
      if (!canMove) return false;
      try {
        const chess = new Chess(fen);
        const target = resolveCastleTarget(chess, from, to);
        if (needsPromotion(chess, from, target)) {
          const piece = chess.get(from as Square);
          setPendingPromotion({ from, to: target, color: piece?.color ?? 'w' });
          return false;
        }
        return onMove(from, target);
      } catch {
        return false;
      }
    },
    [canMove, fen, onMove],
  );

  const onSquareClick = useCallback(
    (square: string) => {
      if (!canMove || pendingPromotion) return;

      if (selected) {
        const castleClick = castleHints.find((hint) => hint.dest === square || hint.rook === square);
        if (castleClick) {
          onMove(selected, castleClick.dest);
          setSelected(null);
          return;
        }
        if (legalMoves.some((move) => move.to === square)) {
          attemptMove(selected, square);
          setSelected(null);
          return;
        }
      }

      const chess = new Chess(fen);
      const piece = chess.get(square as Square);
      if (piece && piece.color === chess.turn() && square !== selected) {
        setSelected(square as Square);
      } else {
        setSelected(null);
      }
    },
    [canMove, pendingPromotion, selected, castleHints, legalMoves, attemptMove, fen, onMove],
  );

  const onPieceDragBegin = useCallback(
    (_piece: string, square: string) => {
      if (!canMove) return;
      const chess = new Chess(fen);
      const piece = chess.get(square as Square);
      setSelected(piece && piece.color === chess.turn() ? square as Square : null);
    },
    [canMove, fen],
  );

  const onPieceDrop = useCallback(
    (source: string, target: string): boolean => {
      setSelected(null);
      if (!canMove) return false;
      return attemptMove(source, target);
    },
    [canMove, attemptMove],
  );

  const confirmPromotion = useCallback(
    (piece: PromotionPiece) => {
      if (!pendingPromotion) return;
      onMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    },
    [pendingPromotion, onMove],
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
  }, []);

  return {
    onSquareClick,
    onPieceDragBegin,
    onPieceDrop,
    customSquareStyles,
    customArrows,
    pendingPromotion,
    confirmPromotion,
    cancelPromotion,
    castleAvailable: castleHints.length > 0,
  };
};
