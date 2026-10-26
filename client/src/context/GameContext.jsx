import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext(null);

const initialState = {
  currentLevel: null,
  score: 0,
  coins: 0,
  lives: 3,
  budget: 0,
  decisions: [],
  isPaused: false,
  isGameOver: false,
  levelComplete: false,
  checkpoints: [],
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_LEVEL':
      return { ...initialState, currentLevel: action.payload.level, budget: action.payload.budget || 2000 };
    case 'ADD_SCORE':
      return { ...state, score: state.score + action.payload };
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };
    case 'REMOVE_LIFE':
      return { ...state, lives: Math.max(0, state.lives - 1), isGameOver: state.lives <= 1 };
    case 'UPDATE_BUDGET':
      return { ...state, budget: state.budget + action.payload };
    case 'RECORD_DECISION':
      return { ...state, decisions: [...state.decisions, action.payload] };
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    case 'LEVEL_COMPLETE':
      return { ...state, levelComplete: true };
    case 'GAME_OVER':
      return { ...state, isGameOver: true };
    case 'SAVE_CHECKPOINT':
      return { ...state, checkpoints: [...state.checkpoints, action.payload] };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
