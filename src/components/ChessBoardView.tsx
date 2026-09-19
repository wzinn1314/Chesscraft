import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { PendingPromotion } from '../hooks/useMoveHints';

type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface ChessBoardViewProps {
  fen: string;
  orientation?: 'white' | 'black';
  arePiecesDraggable?: boolean;
  onPieceDrop: (source: string, target: string) => boolean;
  onSquareClick: (square: string) => void;
  onPieceDragBegin: (piece: string, square: string) => void;
  customSquareStyles: Record<string, React.CSSProperties>;
  customArrows?: Array<[string, string, string]>;
  pendingPromotion?: PendingPromotion | null;
  onPromote?: (piece: PromotionPiece) => void;
  onCancelPromotion?: () => void;
}

const PROMOTIONS: { id: PromotionPiece; label: string }[] = [
  { id: 'q', label: 'Dama' },
  { id: 'r', label: 'Torre' },
  { id: 'b', label: 'Bispo' },
  { id: 'n', label: 'Cavalo' },
];

export const ChessBoardView: React.FC<ChessBoardViewProps> = ({
  fen,
  orientation = 'white',
  arePiecesDraggable = true,
  onPieceDrop,
  onSquareClick,
  onPieceDragBegin,
  customSquareStyles,
  customArrows = [],
  pendingPromotion,
  onPromote,
  onCancelPromotion,
}) => {
  return (
    <div className="board-shell" role="region" aria-label="Tabuleiro de xadrez">
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        customSquareStyles={customSquareStyles}
        customArrows={customArrows as any}
        boardOrientation={orientation}
        arePiecesDraggable={arePiecesDraggable && !pendingPromotion}
        showBoardNotation
        animationDuration={180}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      />

      {pendingPromotion && onPromote && (
        <div className="promotion-overlay" role="dialog" aria-label="Escolher peça da promoção" aria-modal="true">
          <div className="promotion-card">
            <p>Promover peão</p>
            <div className="promotion-grid" role="group" aria-label="Opções de promoção">
              {PROMOTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="promotion-option"
                  onClick={() => onPromote(option.id)}
                  aria-label={`Promover para ${option.label}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {onCancelPromotion && (
              <button type="button" className="btn btn-ghost" onClick={onCancelPromotion} aria-label="Cancelar promoção">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoardView;
