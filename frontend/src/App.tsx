import { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { GameInfo } from './components/GameInfo';
import { useGame } from './hooks/useGame';
import './App.css';

function App() {
  const [gameId, setGameId] = useState<string>('');
  const { gameState, connected, handleCellClick, updateGameState } = useGame({ gameId });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create a new game on mount
    const createGame = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const gameData = await response.json();
          setGameId(gameData.gameId);
          updateGameState(gameData);
        }
      } catch (error) {
        console.error('Failed to create game:', error);
      } finally {
        setLoading(false);
      }
    };

    createGame();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading Chess Game...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>♔ Chess 6x6 ♚</h1>
        <div className="connection-status">
          {connected ? (
            <span className="connected">● Connected</span>
          ) : (
            <span className="disconnected">● Disconnected</span>
          )}
        </div>
      </header>

      <div className="game-container">
        <div className="board-container">
          <Board gameState={gameState} onCellClick={handleCellClick} />
        </div>
        
        <div className="info-container">
          <GameInfo gameState={gameState} />
          
          <div className="game-controls">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              New Game
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
