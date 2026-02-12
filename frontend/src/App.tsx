import { useEffect, useState, useRef, useCallback } from 'react';
import { Board } from './components/Board';
import { Lobby } from './components/Lobby';
import { PromotionDialog } from './components/PromotionDialog';
import { PiecePalette } from './components/PiecePalette';
import { EditorControls } from './components/EditorControls';
import { AnnotationsOverlay, type ArrowPreview } from './components/AnnotationsOverlay';
import { useGame } from './hooks/useGame';
import { useGameEditor } from './hooks/useGameEditor';
import { useAnnotations } from './hooks/useAnnotations';
import { useIsDesktop } from './hooks/useIsDesktop';
import type { PieceColor } from './types/Piece';
import type { AnnotationColor } from './types/Annotation';
import { positionEquals } from './types/Position';
import { formatAppError } from './utils/appError';
import './App.css';

function getClientId(): string {
  const key = 'chess_client_id';
  let id = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
  if (!id) {
    id = crypto.randomUUID?.() ?? `client-${Date.now()}`;
    sessionStorage?.setItem(key, id);
  }
  return id;
}

function getAnnotationColor(e: React.MouseEvent): AnnotationColor {
  if (e.shiftKey) return 'RED';
  if (e.ctrlKey || e.metaKey) return 'BLUE';
  if (e.altKey) return 'ORANGE';
  return 'GREEN';
}

function App() {
  const clientId = getClientId();
  const [gameId, setGameId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('gameId') || '';
  });
  const [myColor, setMyColor] = useState<PieceColor | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);

  const { gameState, connected, handleCellClick, updateGameState, promotionPending, completePromotion } = useGame({
    gameId,
    myColor,
  });

  const editor = useGameEditor(gameId, gameState.creatorId === clientId, gameState, updateGameState);
  const annotations = useAnnotations(gameId);
  const isDesktop = useIsDesktop();

  const rightClickRef = useRef<{ pos: { row: number; col: number }; modifier: AnnotationColor; time: number } | null>(null);
  const [arrowPreview, setArrowPreview] = useState<ArrowPreview | null>(null);
  const overlayWrapperRef = useRef<HTMLDivElement>(null);
  const DOUBLE_CLICK_MS = 500;

  useEffect(() => {
    const onDocMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setArrowPreview(null);
        rightClickRef.current = null;
      }
    };
    document.addEventListener('mouseup', onDocMouseUp);
    return () => document.removeEventListener('mouseup', onDocMouseUp);
  }, []);

  const commitAnnotation = useCallback(
    (toPosition: { row: number; col: number }) => {
      const ref = rightClickRef.current;
      rightClickRef.current = null;
      setArrowPreview(null);
      if (!ref || !isDesktop || editor.editMode) return;
      if (positionEquals(ref.pos, toPosition)) {
        annotations.addAnnotation({ type: 'CIRCLE', to: toPosition, color: ref.modifier }).catch((e) => setAppError(formatAppError('ANNOTATION_ADD', e instanceof Error ? e.message : String(e))));
      } else {
        annotations.addAnnotation({ type: 'ARROW', from: ref.pos, to: toPosition, color: ref.modifier }).catch((e) => setAppError(formatAppError('ANNOTATION_ADD', e instanceof Error ? e.message : String(e))));
      }
    },
    [isDesktop, editor.editMode, annotations.addAnnotation]
  );

  const createGame = async () => {
    setCreateLoading(true);
    setJoinError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/games?creatorId=${encodeURIComponent(clientId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const gameData = await response.json();
        setGameId(gameData.gameId);
        setMyColor(null);
        updateGameState({ ...gameData, creatorId: gameData.creatorId ?? clientId });
        const url = new URL(window.location.href);
        url.searchParams.set('gameId', gameData.gameId);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create game';
      setJoinError(formatAppError('CREATE_GAME', msg));
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
        setJoinError(formatAppError('GAME_NOT_FOUND', 'Game not found'));
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
      const msg = error instanceof Error ? error.message : 'Failed to join game';
      setJoinError(formatAppError('JOIN_GAME', msg));
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    if (gameId && gameState.gameId !== gameId) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      fetch(`${apiUrl}/api/games/${gameId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) updateGameState({ ...data, mode: data.mode, creatorId: data.creatorId });
        })
        .catch(() => {});
    }
  }, [gameId]);

  const onBoardCellClick = useCallback(
    (position: { row: number; col: number }) => {
      if (editor.editMode) {
        if (editor.selectedPieceForPlacement) {
          editor.addPiece(editor.selectedPieceForPlacement, position).catch((e) => setAppError(formatAppError('EDIT_ADD_PIECE', e instanceof Error ? e.message : String(e))));
          return;
        }
        const piece = gameState.board[position.row]?.[position.col];
        if (editor.selectedCellOnBoard !== null) {
          if (!positionEquals(editor.selectedCellOnBoard, position)) {
            editor.movePieceEditor(editor.selectedCellOnBoard, position).catch((e) => setAppError(formatAppError('EDIT_MOVE_PIECE', e instanceof Error ? e.message : String(e))));
          } else {
            editor.setSelectedCellOnBoard(null);
          }
          return;
        }
        if (piece) editor.setSelectedCellOnBoard(position);
        else editor.setSelectedCellOnBoard(null);
        return;
      }
      handleCellClick(position);
    },
    [editor.editMode, editor.selectedPieceForPlacement, editor.selectedCellOnBoard, editor.addPiece, editor.movePieceEditor, editor.setSelectedCellOnBoard, gameState.board, handleCellClick]
  );

  const onBoardCellDoubleClick = useCallback(
    (position: { row: number; col: number }) => {
      if (!editor.editMode) return;
      const piece = gameState.board[position.row]?.[position.col];
      if (piece) editor.removePiece(position).catch((e) => setAppError(formatAppError('EDIT_REMOVE_PIECE', e instanceof Error ? e.message : String(e))));
    },
    [editor.editMode, editor.removePiece, gameState.board]
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent, position: { row: number; col: number }) => {
      e.preventDefault();
      if (!isDesktop || editor.editMode) return;
      const modifier = getAnnotationColor(e);
      const now = Date.now();
      const prev = rightClickRef.current;
      if (prev && positionEquals(prev.pos, position) && now - prev.time < DOUBLE_CLICK_MS) {
        annotations.removeAnnotation(position).catch((e) => setAppError(formatAppError('ANNOTATION_REMOVE', e instanceof Error ? e.message : String(e))));
        rightClickRef.current = null;
        setArrowPreview(null);
        return;
      }
      rightClickRef.current = { pos: position, modifier, time: now };
      setArrowPreview({ from: position, to: position, color: modifier });
    },
    [isDesktop, editor.editMode, annotations.removeAnnotation]
  );

  const onRightMouseUp = useCallback(
    (position: { row: number; col: number }) => {
      commitAnnotation(position);
    },
    [commitAnnotation]
  );

  const onBoardMouseMove = useCallback((position: { row: number; col: number }) => {
    setArrowPreview((prev) => (prev ? { ...prev, to: position } : null));
  }, []);

  const onAnnotationCaptureMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = overlayWrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 6;
    const y = ((e.clientY - rect.top) / rect.height) * 6;
    setArrowPreview((prev) => (prev ? { ...prev, pointerCoord: { x, y } } : null));
  }, []);

  const onAnnotationCaptureMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 2) return;
      const el = overlayWrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 6;
      const y = ((e.clientY - rect.top) / rect.height) * 6;
      const col = Math.max(0, Math.min(5, Math.floor(x)));
      const row = Math.max(0, Math.min(5, 5 - Math.floor(y)));
      commitAnnotation({ row, col });
    },
    [commitAnnotation]
  );

  const prefillGameId =
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('gameId') || '';

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?gameId=${gameId}` : '';
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch {
      // fallback: select so user can Cmd+C
      const input = document.querySelector<HTMLInputElement>('.share-input');
      input?.select();
    }
  };

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

  const copyAppError = async () => {
    if (!appError) return;
    try {
      await navigator.clipboard.writeText(appError);
    } catch {
      // ignore
    }
  };

  return (
    <div className="app">
      {appError && (
        <div className="app-error-banner" role="alert">
          <span className="app-error-text">{appError}</span>
          <button type="button" className="btn btn-secondary app-error-copy" onClick={copyAppError}>
            Copy
          </button>
          <button type="button" className="btn btn-secondary app-error-dismiss" onClick={() => setAppError(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <header className="app-header">
        <h1 className="app-title">
          ♔ Chess 6x6 ♚
          <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} aria-label={connected ? 'Connected' : 'Disconnected'} />
        </h1>
        <div className="header-row">
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
            <div className="share-field">
              <span className="share-prefix">Share link:</span>
              <input type="text" readOnly value={shareUrl} className="share-input" onFocus={(e) => e.target.select()} />
              <button type="button" className="share-copy-btn" onClick={handleCopyLink} title="Copy link">
                {copyFeedback ? '✓ Copied' : 'Copy'}
              </button>
            </div>
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
          {editor.editMode && (
            <PiecePalette
              color="BLACK"
              selectedPiece={editor.selectedPieceForPlacement}
              onSelectPiece={editor.setSelectedPieceForPlacement}
              position="top"
            />
          )}
          <div className="turn-bar">
            {gameState.mode === 'CUSTOM' && <span className="turn-bar-custom">Custom position</span>}
            <span
              className={`turn-bar-color ${
                gameState.status === 'CHECKMATE'
                  ? gameState.currentPlayer === 'WHITE'
                    ? 'black'
                    : 'white'
                  : gameState.status === 'STALEMATE'
                    ? 'stalemate'
                    : gameState.currentPlayer.toLowerCase()
              }`}
              aria-hidden
            />
            <span className="turn-bar-text">
              {gameState.status === 'CHECK'
                ? `${gameState.currentPlayer === 'WHITE' ? 'White' : 'Black'} is in check!`
                : gameState.status === 'CHECKMATE'
                  ? `Checkmate! ${gameState.currentPlayer === 'WHITE' ? 'Black' : 'White'} wins!`
                  : gameState.status === 'STALEMATE'
                    ? 'Stalemate - Draw!'
                    : `${gameState.currentPlayer === 'WHITE' ? 'White' : 'Black'}'s turn`}
            </span>
          </div>
          <div className="board-with-overlay">
            <Board
              gameState={gameState}
              onCellClick={onBoardCellClick}
              editMode={editor.editMode}
              selectedCellOnBoard={editor.selectedCellOnBoard}
              onCellDoubleClick={onBoardCellDoubleClick}
              onContextMenu={isDesktop && !editor.editMode ? onContextMenu : undefined}
              onRightMouseUp={isDesktop && !editor.editMode ? onRightMouseUp : undefined}
              onMouseMove={isDesktop && !editor.editMode ? onBoardMouseMove : undefined}
            />
            {isDesktop && !editor.editMode && (annotations.annotations.length > 0 || arrowPreview) && (
              <>
                <div ref={overlayWrapperRef} className="annotations-overlay-wrapper">
                  <AnnotationsOverlay annotations={annotations.annotations} previewArrow={arrowPreview} />
                </div>
                {arrowPreview && (
                  <div
                    className="annotations-overlay-wrapper annotations-capture"
                    onMouseMove={onAnnotationCaptureMouseMove}
                    onMouseUp={onAnnotationCaptureMouseUp}
                    onContextMenu={(e) => e.preventDefault()}
                    aria-hidden
                  />
                )}
              </>
            )}
          </div>
          {editor.editMode && (
            <PiecePalette
              color="WHITE"
              selectedPiece={editor.selectedPieceForPlacement}
              onSelectPiece={editor.setSelectedPieceForPlacement}
              position="bottom"
            />
          )}
        </div>

        <div className="info-container">
          <EditorControls
            editMode={editor.editMode}
            isCustom={editor.isCustom}
            isCreator={gameState.creatorId === clientId}
            currentPlayer={gameState.currentPlayer}
            onStartEdit={() => editor.startEditing().catch((e) => setAppError(formatAppError('EDIT_START', e instanceof Error ? e.message : String(e))))}
            onStopEdit={(color) => editor.stopEditing(color).catch((e) => setAppError(formatAppError('EDIT_STOP', e instanceof Error ? e.message : String(e))))}
            onClearBoard={() => editor.clearBoard().catch((e) => setAppError(formatAppError('EDIT_CLEAR', e instanceof Error ? e.message : String(e))))}
            onResetStandard={() => editor.resetToStandard().catch((e) => setAppError(formatAppError('EDIT_RESET_STANDARD', e instanceof Error ? e.message : String(e))))}
            onResetCustom={() => editor.resetToCustom().catch((e) => setAppError(formatAppError('EDIT_RESET_CUSTOM', e instanceof Error ? e.message : String(e))))}
            onUndo={() => editor.undoMove().catch((e) => setAppError(formatAppError('EDIT_UNDO', e instanceof Error ? e.message : String(e))))}
            onClearAnnotations={() => annotations.clearAll().catch((e) => setAppError(formatAppError('ANNOTATION_CLEAR_ALL', e instanceof Error ? e.message : String(e))))}
            hasAnnotations={annotations.annotations.length > 0}
          />
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
