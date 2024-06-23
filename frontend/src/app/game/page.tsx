'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PauseIcon } from '@radix-ui/react-icons';

import ArticleComponent from '@/components/ArticleComponent';
import { useGameContext } from '@/contexts/gameContext';
import { withGamePageGuard } from '@/hocs/withGameGuard';

// Types
interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  isReal: boolean;
  difficulty: number;
  topic: string;
}

// Constants
const MAX_DIFFICULTY = 10;
const STREAK_BONUS = 50;
const LOADING_DELAY = 1000; // 1 second delay

// Utility functions
const calculateScore = (
  isCorrect: boolean,
  difficulty: number,
  streak: number
): number => {
  if (!isCorrect) return 0;
  const baseScore = 100 * difficulty;
  const streakBonus = Math.min(streak * STREAK_BONUS, STREAK_BONUS * 5);
  return baseScore + streakBonus;
};

// Mock API call (replace with actual API call when ready)
const fetchArticles = async (
  topics: string[],
  difficulty: number
): Promise<Article[]> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock data generation
  return Array.from({ length: 20 }, (_, i) => {
    const isReal = Math.random() > 0.5;
    return {
      id: `article-${i}`,
      title: `Article ${i + 1}: ${topics[i % topics.length]} News`,
      content: `This is a ${
        difficulty > 5 ? 'complex' : 'simple'
      } article about ${topics[i % topics.length]}. ${
        isReal ? 'Real' : 'Fake'
      } news!`,
      author: `Author ${(i % 5) + 1}`,
      date: new Date().toISOString().split('T')[0],
      isReal: isReal,
      difficulty: Math.min(difficulty + i * 0.5, MAX_DIFFICULTY),
      topic: topics[i % topics.length],
    };
  });
};

const GamePage: React.FC = () => {
  const router = useRouter();
  const {
    selectedTopics,
    gameDuration,
    score,
    updateGameStats,
    endGame,
  } = useGameContext();

  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [difficulty, setDifficulty] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true);
      try {
        const fetchedArticles = await fetchArticles(selectedTopics, difficulty);
        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    };

    initGame();
  }, [selectedTopics, difficulty]);

  // Timer effect
  useEffect(() => {
    if (isLoading || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endGame();
          router.push('/game-over');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isPaused, router, endGame]);

  // Handle user's answer
  const handleAnswer = useCallback(
    (userAnswer: boolean) => {
      setIsPaused(true);
      setIsLoading(true);

      const currentArticle = articles[currentArticleIndex];
      const isCorrect = userAnswer === currentArticle.isReal;

      const newStreak = isCorrect ? streak + 1 : 0;
      const newScore =
        score + calculateScore(isCorrect, currentArticle.difficulty, newStreak);
      const newDifficulty = Math.min(
        difficulty + (isCorrect ? 0.5 : -0.25),
        MAX_DIFFICULTY
      );

      setStreak(newStreak);
      setDifficulty(newDifficulty);
      updateGameStats(newScore, currentArticleIndex + 1, newStreak);

      setFeedbackMessage(
        isCorrect ? 'Correct! Well done.' : 'Incorrect. Stay vigilant!'
      );
      setShowFeedback(true);

      // Fetch more articles if we're running low
      if (currentArticleIndex >= articles.length - 5) {
        fetchArticles(selectedTopics, newDifficulty).then((newArticles) => {
          setArticles((prevArticles) => [...prevArticles, ...newArticles]);
        });
      }

      // Simulate loading delay
      setTimeout(() => {
        setCurrentArticleIndex((prevIndex) => prevIndex + 1);
        setIsLoading(false);
        setIsPaused(false);
        setShowFeedback(false);
      }, LOADING_DELAY);
    },
    [
      articles,
      currentArticleIndex,
      difficulty,
      score,
      streak,
      selectedTopics,
      updateGameStats,
    ]
  );

  // Render current article
  const renderArticle = () => {
    if (isLoading) {
      return <div className='text-center'>Loading article...</div>;
    }

    const currentArticle = articles[currentArticleIndex];
    return (
      <ArticleComponent
        title={currentArticle.title}
        content={currentArticle.content}
        author={currentArticle.author}
        date={currentArticle.date}
      />
    );
  };

  // Render game stats
  const renderGameStats = () => (
    <div className='flex justify-between items-center mb-4'>
      <div className='flex items-center space-x-4'>
        <Badge variant='secondary'>Score: {score}</Badge>
        <AnimatePresence>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Badge variant='secondary'>Streak: {streak}</Badge>
            </motion.div>
          )}
        </AnimatePresence>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant='secondary'>
                Difficulty: {difficulty.toFixed(1)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Higher difficulty means more challenging articles.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className='flex items-center space-x-2'>
        <Badge variant='secondary'>
          Time: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </Badge>
        {isPaused && (
          <span className='text-gray-500'>
            <PauseIcon className='inline-block mr-1' /> Loading
          </span>
        )}
      </div>
    </div>
  );

  // Main render
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-serif font-bold text-gray-900 text-center mb-8'>
          Blindspot
        </h1>

        {renderGameStats()}

        <div className='flex gap-8'>
          <div className='flex-grow'>{renderArticle()}</div>
          <Card className='w-64 h-min'>
            <CardContent className='p-4 space-y-4'>
              <div className='flex flex-col gap-4'>
                <Button
                  onClick={() => handleAnswer(true)}
                  className='w-full'
                  disabled={isLoading}
                >
                  Real
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  className='w-full'
                  disabled={isLoading}
                >
                  Fake
                </Button>
              </div>
              {showFeedback && (
                <div
                  className={`text-center font-semibold ${
                    feedbackMessage.includes('Correct')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
              <Progress
                value={(timeLeft / gameDuration) * 100}
                className='w-full'
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default withGamePageGuard(GamePage);
