'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle, XCircle, Award, Brain, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useGameContext } from '@/contexts/gameContext';
import { withGameOverGuard } from '@/hocs/withGameGuard';

// Types
interface ScoreEntry {
  rank: number;
  username: string;
  score: number;
  date: string;
}

interface BlindspotScore {
  topic: string;
  score: number;
}

// Mock API call for fetching scoreboard
const fetchScoreboard = async (userScore: number): Promise<ScoreEntry[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const mockScoreboard: ScoreEntry[] = [
    { rank: 1, username: 'NewsNinja', score: 24240, date: '2024-06-23' },
    { rank: 2, username: 'FactChecker42', score: 21910, date: '2024-06-23' },
    { rank: 3, username: 'TruthSeeker', score: 18900, date: '2024-06-23' },
    { rank: 4, username: 'MediaMaverick', score: 15740, date: '2024-06-23' },
    { rank: 5, username: 'InfoHunter', score: 1858, date: '2024-06-23' },
  ];

  const userEntry: ScoreEntry = {
    rank: 0,
    username: 'You',
    score: userScore,
    date: new Date().toISOString().split('T')[0],
  };

  return [...mockScoreboard, userEntry]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    .slice(0, 10);
};

const GameOverPage: React.FC = () => {
  const router = useRouter();
  const {
    topics,
    score,
    articlesRead,
    articleMap,
    setGameState,
    topicAccuracies,
    userAnswers,
  } = useGameContext();
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'stats' | 'articles' | 'leaderboard'
  >('stats');

  useEffect(() => {
    const loadScoreboard = async () => {
      setIsLoading(true);
      try {
        const data = await fetchScoreboard(score);
        setScoreboard(data);
      } catch (error) {
        console.error('Failed to fetch scoreboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScoreboard();
  }, [score]);

  const calculateBlindspots = useMemo(() => {
    const blindspots: BlindspotScore[] = topics.map((topic, index) => {
      const topicArticles = articleMap.get(topic) || [];
      const topicAnswers = userAnswers.filter((answer) =>
        topicArticles.some((article) => article.id === answer.articleId)
      );

      const weightedScore = topicAnswers.reduce((acc, answer, answerIndex) => {
        const article = topicArticles.find((a) => a.id === answer.articleId);
        if (!article) return acc;

        const difficultyWeight = article.difficulty / 10;
        const positionWeight = (index + 1) / topics.length;
        const correctnessScore = answer.isCorrect ? 1 : 0;

        return acc + correctnessScore * difficultyWeight * positionWeight;
      }, 0);

      const maxPossibleScore =
        topicAnswers.length * (1 * ((index + 1) / topics.length));
      const blindspotScore = (1 - weightedScore / maxPossibleScore) * 100;

      return { topic, score: blindspotScore };
    });

    return blindspots.sort((a, b) => b.score - a.score);
  }, [topics, articleMap, userAnswers]);

  const renderGameStats = () => (
    <Card className='mb-8 overflow-hidden'>
      <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white'>
        <CardTitle className='flex items-center'>
          <Award className='mr-2' /> Your Game Stats
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <p className='text-xl font-semibold text-gray-600'>Final Score</p>
            <p className='text-4xl font-bold text-blue-600'>{score}</p>
          </div>
          <div className='text-center'>
            <p className='text-xl font-semibold text-gray-600'>Articles Read</p>
            <p className='text-4xl font-bold text-green-600'>{articlesRead}</p>
          </div>
          <div className='text-center'>
            <p className='text-xl font-semibold text-gray-600'>Accuracy</p>
            <p className='text-4xl font-bold text-purple-600'>
              {(
                (userAnswers.filter((a) => a.isCorrect).length /
                  userAnswers.length) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
        <div className='mt-6'>
          <p className='text-lg font-semibold text-gray-700 mb-2'>
            Topics Covered
          </p>
          <div className='flex flex-wrap gap-2'>
            {topics.map((topic, index) => (
              <Badge key={index} variant='secondary' className='text-sm'>
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBlindspots = () => (
    <Card className='mb-8 overflow-hidden'>
      <CardHeader className='bg-gradient-to-r from-yellow-400 to-red-500 text-white'>
        <CardTitle className='flex items-center'>
          <Brain className='mr-2' /> My Blindspots
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6'>
        {calculateBlindspots.map((blindspot, index) => (
          <div key={index} className='mb-4'>
            <div className='flex justify-between items-center mb-1'>
              <span className='text-sm font-medium text-gray-700'>
                {blindspot.topic}
              </span>
              <span className='text-sm font-medium text-gray-700'>
                {blindspot.score.toFixed(1)}%
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className='w-full'>
                  <Progress
                    value={blindspot.score}
                    className={`h-2 w-full [&>*]:bg-${getBlindspotColor(
                      score
                    )}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blindspot score: {blindspot.score.toFixed(1)}%</p>
                  <p>Higher score indicates more room for improvement</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderArticleSummary = () => {
    const topicKeys = Array.from(articleMap.keys());

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='space-y-8 mb-6 overflow-hidden'
      >
        <h2 className='text-3xl font-bold text-gray-800 mt-6 flex items-center'>
          <TrendingUp className='mr-2' /> Article Performance
        </h2>
        {topicKeys.map((topic, topicIndex) => {
          const articles = articleMap.get(topic) || [];
          return (
            <motion.div
              key={topicIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: topicIndex * 0.1 }}
              className='bg-white rounded-lg shadow-md p-6'
            >
              <h3 className='text-xl font-semibold text-indigo-700 mb-4'>
                {topic}
              </h3>
              <ul className='space-y-3'>
                {articles.map((article, articleIndex) => {
                  const userAnswer = userAnswers.find(
                    (a) => a.articleId === article.id
                  );
                  return (
                    <motion.li
                      key={articleIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: articleIndex * 0.05 }}
                      className='flex items-start'
                    >
                      {userAnswer?.isCorrect ? (
                        <CheckCircle
                          className='text-green-500 mr-2 flex-shrink-0 mt-1'
                          size={20}
                        />
                      ) : (
                        <XCircle
                          className='text-red-500 mr-2 flex-shrink-0 mt-1'
                          size={20}
                        />
                      )}
                      <div>
                        {article.real ? (
                          <a
                            href={article.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:underline font-medium'
                          >
                            {article.title}
                          </a>
                        ) : (
                          <span className='text-gray-800 font-medium'>
                            {article.title}
                          </span>
                        )}
                        <span
                          className={`ml-2 text-sm ${
                            article.real ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ({article.real ? 'Real' : 'Fake'})
                        </span>
                        {userAnswer && (
                          <span
                            className={`ml-2 text-sm ${
                              userAnswer.isCorrect
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {userAnswer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderScoreboard = () => (
    <Card className='overflow-hidden'>
      <CardHeader className='bg-gradient-to-r from-green-400 to-blue-500 text-white'>
        <CardTitle className='flex items-center'>
          <Award className='mr-2' /> Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className='text-center'>Loading scoreboard...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[100px]'>Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className='text-right'>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoreboard.map((entry) => (
                <TableRow
                  key={entry.rank}
                  className={
                    entry.username === 'You' ? 'font-bold bg-blue-50' : ''
                  }
                >
                  <TableCell>{entry.rank}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell>{entry.score}</TableCell>
                  <TableCell className='text-right'>{entry.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const handlePlayAgain = () => {
    setGameState('not_playing');
    router.push('/topics');
  };

  const handleBackToHome = () => {
    setGameState('not_playing');
    router.push('/');
  };

  const getBlindspotColor = (score: number) => {
    if (score < 33) return 'from-green-400 to-green-600';
    if (score < 66) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-5xl font-serif font-bold text-gray-900 text-center mb-8'>
            Game Over
          </h1>

          <div className='mb-6 flex justify-center space-x-2'>
            <Button
              variant={selectedTab === 'stats' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('stats')}
            >
              Stats
            </Button>
            <Button
              variant={selectedTab === 'articles' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('articles')}
            >
              Articles
            </Button>
            <Button
              variant={selectedTab === 'leaderboard' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('leaderboard')}
            >
              Leaderboard
            </Button>
          </div>

          <AnimatePresence mode='wait'>
            {selectedTab === 'stats' && (
              <motion.div
                key='stats'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {renderGameStats()}
                {renderBlindspots()}
              </motion.div>
            )}
            {selectedTab === 'articles' && (
              <motion.div
                key='articles'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {renderArticleSummary()}
              </motion.div>
            )}
            {selectedTab === 'leaderboard' && (
              <motion.div
                key='leaderboard'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {renderScoreboard()}
              </motion.div>
            )}
          </AnimatePresence>
          <div className='flex justify-center space-x-4 mt-8'>
            <Button onClick={handlePlayAgain}>Play Again</Button>
            <Button variant='outline' onClick={handleBackToHome}>
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default withGameOverGuard(GameOverPage);
