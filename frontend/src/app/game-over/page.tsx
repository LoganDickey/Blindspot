'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

import { useGameContext } from '@/contexts/gameContext';
import { withGameOverGuard } from '@/hocs/withGameGuard';

// Types
interface ScoreEntry {
  rank: number;
  username: string;
  score: number;
  date: string;
}

// Mock API call for fetching scoreboard
const fetchScoreboard = async (userScore: number): Promise<ScoreEntry[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate mock data
  const mockScoreboard: ScoreEntry[] = [
    { rank: 1, username: 'NewsNinja', score: 5000, date: '2024-06-21' },
    { rank: 2, username: 'FactChecker42', score: 4800, date: '2024-06-20' },
    { rank: 3, username: 'TruthSeeker', score: 4600, date: '2024-06-19' },
    { rank: 4, username: 'MediaMaverick', score: 4400, date: '2024-06-18' },
    { rank: 5, username: 'InfoHunter', score: 4200, date: '2024-06-17' },
  ];

  // Insert user's score into the correct position
  const userEntry: ScoreEntry = {
    rank: 0,
    username: 'You',
    score: userScore,
    date: new Date().toISOString().split('T')[0],
  };

  const updatedScoreboard = [...mockScoreboard, userEntry]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    .slice(0, 10); // Keep top 10

  return updatedScoreboard;
};

const GameOverPage: React.FC = () => {
  const router = useRouter();
  const { score, articlesRead, setGameState } = useGameContext();
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScoreboard = async () => {
      setIsLoading(true);
      try {
        const data = await fetchScoreboard(score);
        setScoreboard(data);
      } catch (error) {
        console.error('Failed to fetch scoreboard:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    };

    loadScoreboard();
  }, [score]);

  const renderGameStats = () => (
    <Card className='mb-8'>
      <CardHeader>
        <CardTitle>Your Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='font-semibold'>Final Score</p>
            <p className='text-2xl font-bold'>{score}</p>
          </div>
          <div>
            <p className='font-semibold'>Articles Read</p>
            <p className='text-2xl'>{articlesRead}</p>
          </div>
          <div>
            <p className='font-semibold'>Topics Covered</p>
            <div className='flex flex-wrap gap-2 mt-2'>
              {/* {selectedTopics.map((topic, index) => (
                <Badge key={index} variant='secondary'>
                  {topic}
                </Badge>
              ))} */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderScoreboard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Global Leaderboard</CardTitle>
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
                  className={entry.username === 'You' ? 'font-bold' : ''}
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

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl font-serif font-bold text-gray-900 text-center mb-8'>
            Game Over
          </h1>

          {renderGameStats()}
          {renderScoreboard()}

          <div className='mt-8 flex justify-center space-x-4'>
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
