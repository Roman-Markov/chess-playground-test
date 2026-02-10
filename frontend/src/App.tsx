import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { GameInfo } from './components/GameInfo';
import { Lobby } from './components/Lobby';
import { PromotionDialog } from './components/PromotionDialog';
import { useGame } from './hooks/useGame';
import type { PieceColor } from './types/Piece';
import './App.css';

function App() {
  const [gameId, setGameId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('gameId') || '';
  });
  const [myColor, setMyColor] = useState<PieceColor | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const { gameState, connected, handleCellClick, updateGameState, promotionPending, completePromotion } = useGame({
    gameId,
    myColor,
  });

  const createGame = async () => {
    setCreateLoading(true);
    setJoinError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const gameData = await response.json();
        setGameId(gameData.gameId);
        setMyColor(null);
        updateGameState(gameData);
        const url = new URL(window.location.href);
        url.searchParams.set('gameId', gameData.gameId);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      console.error('Failed to create game', error);
      setJoinError('Failed to create game');
    } finally {
      setCreateLoading(false);
    }
  };

  const joinGame = async (id: string, color: PieceColor) => {
    setJoinLoading(true);
    setJoinError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/games/${id}`);
      if (!response.ok) {
        setJoinError('Game not found');
        return;
      }
      const gameData = await response.json();
      setGameId(id);
      setMyColor(color);
      updateGameState(gameData);
      const url = new URL(window.location.href);
      url.searchParams.set('gameId', id);
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Failed to join game', error);
      setJoinError('Failed to join game');
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    if (gameId && gameState.gameId !== gameId) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      fetch(`${apiUrl}/api/games/${gameId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) updateGameState(data);
        })
        .catch(() => {});
    }
  }, [gameId]);

  const prefillGameId = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('gameId') || '';

  if (!gameId) {
    return (
      <div className="app">
        <div className="lobby-wrap">
          <Lobby
            onCreateGame={createGame}
            onJoinGame={joinGame}
            createLoading={createLoading}
            joinLoading={joinLoading}
            joinError={joinError}
            prefillGameId={prefillGameId}
          />
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?gameId=${gameId}` : '';

  return (
    <div className="app">
      <header className="app-header">
        <h1>♔ Chess 6x6 ♚</h1>
        <div className="header-row">
          <div className="connection-status">
            {connected ? (
              <span className="connected">● Connected</span>
            ) : (
              <span className="disconnected">● Disconnected</span>
            )}
          </div>
          <div className="you-play-as">
            <span>You play:</span>
            <select
              value={myColor ?? 'BOTH'}
              onChange={(e) => setMyColor(e.target.value === 'BOTH' ? null : (e.target.value as PieceColor))}
              className="color-select"
              aria-label="Your color"
            >
              <option value="BOTH">Both (solo)</option>
              <option value="WHITE">White</option>
              <option value="BLACK">Black</option>
            </select>
          </div>
        </div>
        {shareUrl && (
          <div className="share-link">
            <label className="share-label">Share link:</label>
            <input type="text" readOnly value={shareUrl} className="share-input" onFocus={(e) => e.target.select()} />
          </div>
        )}
      </header>

      {promotionPending && (
        <PromotionDialog
          from={promotionPending.from}
          to={promotionPending.to}
          onChoose={(pieceType) => completePromotion(pieceType)}
        />
      )}

      <div className="game-container">
        <div className="board-container">
          <Board gameState={gameState} onCellClick={handleCellClick} />
        </div>

        <div className="info-container">
          <GameInfo gameState={gameState} />

          <div className="game-controls">
            <button
              className="btn btn-primary"
              onClick={() => {
                setGameId('');
                setMyColor(null);
              }}
            >
              Back to lobby
            </button>
          </div>

          <div className="instructions">
            <h3>How to Play</h3>
            <ul>
              <li>Click a piece to select it</li>
              <li>Valid moves will be highlighted</li>
              <li>Click a highlighted square to move</li>
              <li>Win by checkmate!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
