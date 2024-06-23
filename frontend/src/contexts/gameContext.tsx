'use client';
// src/contexts/gameContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type GameState = 'not_playing' | 'playing' | 'game_over';

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  real: boolean;
  topic: string;
}

interface TopicAccuracy {
  topic: string;
  correct: number;
  total: number;
}

interface GameContextType {
  uuid: string;
  gameState: GameState;
  topics: string[];
  articleMap: Map<string, Article[]>;
  currentTopicIndex: number;
  currentArticleIndex: number;
  score: number;
  articlesRead: number;
  streak: number;
  elapsedTime: number;
  topicAccuracies: TopicAccuracy[];
  setGameState: (state: GameState) => void;
  setTopics: (topics: string[]) => void;
  setArticlesForTopic: (topic: string, articles: Article[]) => void;
  getCurrentArticle: () => Article | null;
  moveToNextArticle: () => void;
  updateGameStats: (
    score: number,
    articlesRead: number,
    streak: number
  ) => void;
  updateElapsedTime: (time: number) => void;
  answerCurrentArticle: (userAnswer: boolean) => void;
  startNewGame: () => void;
  endGame: () => void;
  getNextTopicToFetch: () => string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [uuid, setUuid] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('not_playing');
  const [topics, setTopics] = useState<string[]>([]);
  const [articleMap, setArticleMap] = useState<Map<string, Article[]>>(
    new Map()
  );
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [currentArticleIndex, setCurrentArticleIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [articlesRead, setArticlesRead] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [topicAccuracies, setTopicAccuracies] = useState<TopicAccuracy[]>([]);

  useEffect(() => {
    const storedUuid = localStorage.getItem('blindspot_uuid');
    if (storedUuid) {
      setUuid(storedUuid);
    } else {
      const newUuid = uuidv4();
      setUuid(newUuid);
      localStorage.setItem('blindspot_uuid', newUuid);
    }
  }, []);

  const setArticlesForTopic = (topic: string, articles: Article[]) => {
    setArticleMap((prevMap) => new Map(prevMap).set(topic, articles));
  };

  const getCurrentArticle = (): Article | null => {
    const currentTopic = topics[currentTopicIndex];
    const topicArticles = articleMap.get(currentTopic);
    return topicArticles ? topicArticles[currentArticleIndex] : null;
  };

  const moveToNextArticle = () => {
    const currentTopic = topics[currentTopicIndex];
    const topicArticles = articleMap.get(currentTopic);

    if (topicArticles && currentArticleIndex < topicArticles.length - 1) {
      setCurrentArticleIndex((prevIndex) => prevIndex + 1);
    } else {
      // Move to next topic
      if (currentTopicIndex < topics.length - 1) {
        setCurrentTopicIndex((prevIndex) => prevIndex + 1);
        setCurrentArticleIndex(0);
      } else {
        // Game over condition
        endGame();
      }
    }
    setArticlesRead((prevCount) => prevCount + 1);
  };

  const updateGameStats = (
    newScore: number,
    newArticlesRead: number,
    newStreak: number
  ) => {
    setScore(newScore);
    setArticlesRead(newArticlesRead);
    setStreak(newStreak);
  };

  const updateElapsedTime = (time: number) => {
    setElapsedTime(time);
  };

  const answerCurrentArticle = (userAnswer: boolean) => {
    const currentArticle = getCurrentArticle();
    if (currentArticle) {
      const isCorrect = userAnswer === currentArticle.real;
      setTopicAccuracies((prevAccuracies) => {
        const topicIndex = prevAccuracies.findIndex(
          (a) => a.topic === currentArticle.topic
        );
        if (topicIndex >= 0) {
          const updatedAccuracies = [...prevAccuracies];
          updatedAccuracies[topicIndex] = {
            ...updatedAccuracies[topicIndex],
            correct:
              updatedAccuracies[topicIndex].correct + (isCorrect ? 1 : 0),
            total: updatedAccuracies[topicIndex].total + 1,
          };
          return updatedAccuracies;
        } else {
          return [
            ...prevAccuracies,
            {
              topic: currentArticle.topic,
              correct: isCorrect ? 1 : 0,
              total: 1,
            },
          ];
        }
      });

      setScore((prevScore) => prevScore + (isCorrect ? 100 : 0));
      setStreak((prevStreak) => (isCorrect ? prevStreak + 1 : 0));
    }
  };

  const startNewGame = () => {
    setGameState('playing');
    setScore(0);
    setArticlesRead(0);
    setStreak(0);
    setElapsedTime(0);
    setTopicAccuracies([]);
    setCurrentTopicIndex(0);
    setCurrentArticleIndex(0);
  };

  const endGame = () => {
    setGameState('game_over');
  };

  const getNextTopicToFetch = (): string | null => {
    return topics.find((topic) => !articleMap.has(topic)) || null;
  };

  return (
    <GameContext.Provider
      value={{
        uuid,
        gameState,
        topics,
        articleMap,
        currentTopicIndex,
        currentArticleIndex,
        score,
        articlesRead,
        streak,
        elapsedTime,
        topicAccuracies,
        setGameState,
        setTopics,
        setArticlesForTopic,
        getCurrentArticle,
        moveToNextArticle,
        updateGameStats,
        updateElapsedTime,
        answerCurrentArticle,
        startNewGame,
        endGame,
        getNextTopicToFetch,
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
