'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import ArticleComponent from '@/components/ArticleComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useGameContext } from '@/contexts/gameContext';
import { withGamePageGuard } from '@/hocs/withGameGuard';

const TOTAL_ARTICLES = 10;
const EXPECTED_GAME_DURATION = 180; // 3 minutes in seconds
const BASE_SCORE = 2000;
const TIME_FACTOR = 300;
const DIFFICULTY_FACTOR = 100;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

// Types
interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  real: boolean;
  topic: string;
  url?: string;
  difficulty: number;
}

// Function to fetch articles for a topic from the backend
export const fetchArticlesForTopic = async (
  topic: string,
  diff?: number
): Promise<Article[]> => {
  const response = await fetch('http://localhost:8080/fetch_articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topic,
      amount: 2,
      difficulty: diff || 5,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  const res = response.json();
  // console.log(res);
  return res;
};

const GamePage: React.FC = () => {
  const router = useRouter();
  const {
    score,
    articlesRead,
    streak,
    elapsedTime,
    updateElapsedTime,
    getCurrentArticle,
    moveToNextArticle,
    answerCurrentArticle,
    endGame,
    updateGameStats,
    articleMap,
  } = useGameContext();

  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFireEmoji, setShowFireEmoji] = useState(false);
  const [difficulty, setDifficulty] = useState(5); // Starting difficulty

  useEffect(() => {
    const timer = setInterval(() => {
      updateElapsedTime(elapsedTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [elapsedTime, updateElapsedTime]);

  const calculateScore = (isCorrect: boolean, timeSpent: number) => {
    if (!isCorrect) return 0;
    const timeScore = Math.max(
      0,
      BASE_SCORE - TIME_FACTOR * Math.log(timeSpent + 1)
    );
    const difficultyBonus = DIFFICULTY_FACTOR * difficulty;
    return Math.round(timeScore + difficultyBonus);
  };

  const updateDifficulty = (isCorrect: boolean) => {
    setDifficulty((prevDifficulty) => {
      const change = isCorrect ? 0.5 : -0.25;
      return Math.min(
        MAX_DIFFICULTY,
        Math.max(MIN_DIFFICULTY, prevDifficulty + change)
      );
    });
  };

  const handleAnswer = useCallback(
    async (userAnswer: boolean) => {
      const currentArticle = getCurrentArticle();
      if (!currentArticle) return;

      setIsLoading(true);
      const isCorrect = userAnswer === currentArticle.real;

      const newScore = calculateScore(
        isCorrect,
        elapsedTime / (articlesRead + 1)
      );
      const newStreak = isCorrect ? streak + 1 : 0;
      // const newArticlesRead = articlesRead + 1;

      updateGameStats(score + newScore, articlesRead, newStreak);
      answerCurrentArticle(userAnswer);
      updateDifficulty(isCorrect);

      setFeedbackMessage(
        isCorrect ? 'Correct! Well done.' : 'Incorrect. Stay vigilant!'
      );
      setShowFeedback(true);

      if (isCorrect && newStreak > 1) {
        setShowFireEmoji(true);
        setTimeout(() => setShowFireEmoji(false), 2000);
      }

      setTimeout(() => {
        if (articlesRead >= TOTAL_ARTICLES - 1) {
          endGame();
          router.push('/game-over');
        } else {
          moveToNextArticle();
          setIsLoading(false);
          setShowFeedback(false);
        }
      }, 1000);
    },
    [
      getCurrentArticle,
      answerCurrentArticle,
      updateGameStats,
      streak,
      articlesRead,
      score,
      elapsedTime,
      endGame,
      router,
      moveToNextArticle,
    ]
  );

  const currentArticle = getCurrentArticle();
  // console.log(currentArticle, articleMap);

  // Render current article
  const renderArticle = () => {
    if (!currentArticle) {
      return <div className='text-center'>Loading article...</div>;
    }

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
        <Badge variant='secondary'>
          Score: {score}
          {showFireEmoji && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className='ml-1'
            >
              🔥
            </motion.span>
          )}
        </Badge>
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
                Topic: {currentArticle?.topic || 'Loading...'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current article topic</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant='secondary'>
                Difficulty: {difficulty.toFixed(1)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current game difficulty</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className='flex items-center space-x-2'>
        <Badge variant='secondary'>
          Time: {Math.floor(elapsedTime / 60)}:
          {(elapsedTime % 60).toString().padStart(2, '0')}
        </Badge>
        <Badge variant='secondary'>
          Articles: {articlesRead + 1} / {TOTAL_ARTICLES}
        </Badge>
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
                  disabled={isLoading || !currentArticle}
                >
                  Real
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  className='w-full'
                  disabled={isLoading || !currentArticle}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default withGamePageGuard(GamePage);
