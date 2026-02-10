import React, { useEffect, useState } from 'react';
import type { PieceColor } from '../types/Piece';

interface LobbyProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string, myColor: PieceColor) => void;
  createLoading: boolean;
  joinLoading: boolean;
  joinError: string | null;
  prefillGameId: string;
}

export const Lobby = ({
  onCreateGame,
  onJoinGame,
  createLoading,
  joinLoading,
  joinError,
  prefillGameId,
}: LobbyProps) => {
  const [joinId, setJoinId] = useState(prefillGameId);
  const [joinAs, setJoinAs] = useState<PieceColor>('BLACK');

  useEffect(() => {
    setJoinId(prefillGameId);
  }, [prefillGameId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = joinId.trim();
    if (id) onJoinGame(id, joinAs);
  };

  return (
    <div className="lobby">
      <h2>Chess 6x6</h2>
      <p className="lobby-subtitle">Create a new game or join with a game ID</p>

      <div className="lobby-actions">
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onCreateGame}
          disabled={createLoading}
        >
          {createLoading ? 'Creating…' : 'Create game (play solo or share link)'}
        </button>

        <div className="lobby-divider">or</div>

        <form className="lobby-join" onSubmit={handleJoin}>
          <input
            type="text"
            className="lobby-input"
            placeholder="Game ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            disabled={joinLoading}
          />
          <div className="lobby-join-as">
            <span>Join as:</span>
            <label className="lobby-radio">
              <input
                type="radio"
                name="joinAs"
                checked={joinAs === 'WHITE'}
                onChange={() => setJoinAs('WHITE')}
              />
              White
            </label>
            <label className="lobby-radio">
              <input
                type="radio"
                name="joinAs"
                checked={joinAs === 'BLACK'}
                onChange={() => setJoinAs('BLACK')}
              />
              Black
            </label>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={joinLoading || !joinId.trim()}>
            {joinLoading ? 'Joining…' : 'Join game'}
          </button>
          {joinError && <p className="lobby-error">{joinError}</p>}
        </form>
      </div>
    </div>
  );
};
