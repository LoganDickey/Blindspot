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

// Types
interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  real: boolean;
  topic: string;
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
      amount: 2, // You can adjust the amount as needed
      difficulty: 10, // You can adjust the difficulty as needed
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
};

const GamePage: React.FC = () => {
  const router = useRouter();
  const {
    topics,
    articleMap,
    currentTopicIndex,
    currentArticleIndex,
    score,
    articlesRead,
    streak,
    elapsedTime,
    updateElapsedTime,
    getCurrentArticle,
    moveToNextArticle,
    answerCurrentArticle,
    setArticlesForTopic,
    getNextTopicToFetch,
    endGame,
  } = useGameContext();

  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFireEmoji, setShowFireEmoji] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      updateElapsedTime(elapsedTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [elapsedTime, updateElapsedTime]);

  const fetchArticlesIfNeeded = useCallback(async () => {
    const topicToFetch = getNextTopicToFetch();
    if (topicToFetch && !isLoading) {
      setIsLoading(true);
      try {
        const articles = await fetchArticlesForTopic(
          topicToFetch,
          articlesRead + 1
        );
        setArticlesForTopic(topicToFetch, articles);
        console.log(`Fetched articles for topic: ${topicToFetch}`);
        console.log(articles);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [getNextTopicToFetch, setArticlesForTopic]);

  useEffect(() => {
    if (!articleMap.has(topics[currentTopicIndex])) {
      fetchArticlesIfNeeded();
    }
  }, [fetchArticlesIfNeeded, currentTopicIndex, articleMap, topics]);

  const handleAnswer = useCallback(
    async (userAnswer: boolean) => {
      const currentArticle = getCurrentArticle();
      if (!currentArticle) return;

      setIsLoading(true);
      const isCorrect = userAnswer === currentArticle.real;

      answerCurrentArticle(userAnswer);

      setFeedbackMessage(
        isCorrect ? 'Correct! Well done.' : 'Incorrect. Stay vigilant!'
      );
      setShowFeedback(true);

      if (isCorrect && streak > 0) {
        setShowFireEmoji(true);
        setTimeout(() => setShowFireEmoji(false), 2000);
      }

      setTimeout(() => {
        if (articlesRead + 1 >= TOTAL_ARTICLES) {
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
      streak,
      articlesRead,
      endGame,
      router,
      moveToNextArticle,
    ]
  );

  const currentArticle = getCurrentArticle();

  // Render current article
  const renderArticle = () => {
    if (isLoading || !currentArticle) {
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
