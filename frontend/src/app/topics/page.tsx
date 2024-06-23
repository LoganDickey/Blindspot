'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { fetchArticlesForTopic } from '@/app/game/page';
import { useGameContext } from '@/contexts/gameContext';
import { withTopicSelectionGuard } from '@/hocs/withGameGuard';

const PREDEFINED_TOPICS = [
  'Politics',
  'Technology',
  'Health',
  'Science',
  'Entertainment',
  'Sports',
  'Business',
  'Environment',
  'Education',
  'Travel',
];

const PLACEHOLDER_TOPICS = [
  'Fortnite dance moves',
  'Time travel etiquette',
  'Quantum knitting',
  'Alien conspiracy theories',
  'Unicorn breeding',
  'Interstellar cuisine',
];

// Function to generate similar topics
const generateSimilarTopics = async (topic: string) => {
  const response = await fetch('http://localhost:8080/generate_topics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate similar topics');
  }

  return response.json();
};

const TopicSelectionPage: React.FC = () => {
  const router = useRouter();
  const {
    setTopics,
    setArticlesForTopic,
    startNewGame,
    setGameState,
  } = useGameContext();
  const [localSelectedTopic, setLocalSelectedTopic] = useState<string | null>(
    null
  );
  const [customTopic, setCustomTopic] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(
        (prevIndex) => (prevIndex + 1) % PLACEHOLDER_TOPICS.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleTopic = (topic: string) => {
    setLocalSelectedTopic((prevTopic) => (prevTopic === topic ? null : topic));
  };

  const addCustomTopic = () => {
    if (customTopic && localSelectedTopic !== customTopic) {
      setLocalSelectedTopic(customTopic);
      setCustomTopic('');
    }
  };

  const handleStartGame = async () => {
    if (localSelectedTopic && !isStarting) {
      setIsStarting(true);
      try {
        // Generate similar topics
        const similarTopics = await generateSimilarTopics(localSelectedTopic);
        setGeneratedTopics(similarTopics);

        setTopics(similarTopics);

        // Fetch initial articles for the first topic
        const initialArticles = await fetchArticlesForTopic(similarTopics[0]);
        setArticlesForTopic(localSelectedTopic, initialArticles);

        setIsDialogOpen(true);
      } catch (error) {
        console.error('Failed to start game:', error);
        setIsStarting(false);
      }
    }
  };

  const handleConfirm = () => {
    startNewGame();
    setGameState('playing');
    router.push('/game');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'
    >
      <div className='max-w-3xl mx-auto'>
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl font-serif font-bold text-gray-900 text-center mb-8'>
            Choose Your Topic
          </h1>
          <p className='text-xl text-gray-600 text-center mb-12'>
            Select a subject you'd like to explore in your fact-checking
            journey.
          </p>
        </motion.div>

        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Predefined Topics
            </h2>
            <div className='flex flex-wrap gap-2'>
              {PREDEFINED_TOPICS.map((topic) => (
                <motion.div
                  key={topic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={
                      localSelectedTopic === topic ? 'default' : 'secondary'
                    }
                    className='cursor-pointer text-sm px-3 py-1'
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Custom Topic
            </h2>
            <div className='flex gap-2'>
              <Input
                type='text'
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={`Try "${PLACEHOLDER_TOPICS[placeholderIndex]}"`}
                className='flex-grow'
              />
              <Button
                onClick={addCustomTopic}
                disabled={Boolean(localSelectedTopic)}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
            Selected Topic
          </h2>
          <div className='flex flex-wrap gap-2'>
            {localSelectedTopic ? (
              <motion.div
                key={localSelectedTopic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Badge
                  variant='default'
                  className='cursor-pointer text-sm px-3 py-1'
                  onClick={() => toggleTopic(localSelectedTopic)}
                >
                  {localSelectedTopic} ✕
                </Badge>
              </motion.div>
            ) : (
              <p className='text-gray-500'>No topic selected</p>
            )}
          </div>
        </div>

        <div className='text-center'>
          <Button
            size='lg'
            onClick={handleStartGame}
            disabled={!localSelectedTopic || isStarting}
            className='px-8 py-3 text-lg'
          >
            {isStarting ? 'Starting Game...' : 'Start Game'}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Topic Progression</DialogTitle>
          </DialogHeader>
          <div className='mt-4'>
            {generatedTopics.map((topic, index) => (
              <p key={index} className='text-lg text-gray-700'>
                Topic {index + 1}: {topic}
              </p>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleConfirm} className='mt-4'>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default withTopicSelectionGuard(TopicSelectionPage);
