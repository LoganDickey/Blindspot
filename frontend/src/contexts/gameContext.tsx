'use client';
// src/contexts/gameContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

type GameState = 'not_playing' | 'playing' | 'game_over';

interface GameContextType {
  uuid: string;
  gameState: GameState;
  selectedTopics: string[];
  gameDuration: number;
  score: number;
  articlesRead: number;
  streak: number;
  setGameState: (state: GameState) => void;
  setSelectedTopics: (topics: string[]) => void;
  setGameDuration: (duration: number) => void;
  updateGameStats: (
    score: number,
    articlesRead: number,
    streak: number
  ) => void;
  startNewGame: () => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [uuid, setUuid] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('not_playing');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [gameDuration, setGameDuration] = useState<number>(120); // 2 minutes default
  const [score, setScore] = useState<number>(0);
  const [articlesRead, setArticlesRead] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const storedUuid = localStorage.getItem('blindspot_uuid');
    if (storedUuid) {
      setUuid(storedUuid);
    } else {
      const newUuid = uuidv4();
      setUuid(newUuid);
      localStorage.setItem('blindspot_uuid', newUuid);
    }

    // Load stored topics from local storage
    const storedTopics = localStorage.getItem('blindspot_topics');
    if (storedTopics) {
      setSelectedTopics(JSON.parse(storedTopics));
    }
  }, []);

  const updateGameStats = (
    newScore: number,
    newArticlesRead: number,
    newStreak: number
  ) => {
    setScore(newScore);
    setArticlesRead(newArticlesRead);
    setStreak(newStreak);
  };

  const startNewGame = () => {
    setGameState('playing');
    setScore(0);
    setArticlesRead(0);
    setStreak(0);
  };

  const endGame = () => {
    setGameState('game_over');
  };

  // Update local storage when topics change
  useEffect(() => {
    localStorage.setItem('blindspot_topics', JSON.stringify(selectedTopics));
  }, [selectedTopics]);

  return (
    <GameContext.Provider
      value={{
        uuid,
        gameState,
        selectedTopics,
        gameDuration,
        score,
        articlesRead,
        streak,
        setGameState,
        setSelectedTopics,
        setGameDuration,
        updateGameStats,
        startNewGame,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
