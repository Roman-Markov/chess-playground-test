import type { GameState } from '../types/GameState';

interface GameInfoProps {
  gameState: GameState;
}

export const GameInfo = ({ gameState }: GameInfoProps) => {
  const getStatusMessage = () => {
    switch (gameState.status) {
      case 'CHECK':
        return `${gameState.currentPlayer} is in check!`;
      case 'CHECKMATE':
        const winner = gameState.currentPlayer === 'WHITE' ? 'Black' : 'White';
        return `Checkmate! ${winner} wins!`;
      case 'STALEMATE':
        return 'Stalemate - Draw!';
      default:
        return `${gameState.currentPlayer}'s turn`;
    }
  };

  return (
    <div className="game-info">
      <h2>Chess 6x6</h2>
      <div className="status-container">
        <div className={`status-badge ${gameState.status.toLowerCase()}`}>
          {getStatusMessage()}
        </div>
      </div>
      <div className="player-turn">
        <div className={`player-indicator ${gameState.currentPlayer.toLowerCase()}`}>
          <span className="color-box"></span>
          {gameState.currentPlayer}
        </div>
      </div>
    </div>
  );
};
