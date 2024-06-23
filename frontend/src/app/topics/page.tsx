'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const TopicSelectionPage: React.FC = () => {
  const router = useRouter();
  const {
    selectedTopics,
    setSelectedTopics,
    setGameDuration,
    startNewGame,
    setGameState,
  } = useGameContext();
  const [localSelectedTopics, setLocalSelectedTopics] = useState<string[]>(
    selectedTopics
  );
  const [customTopic, setCustomTopic] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(120); // Default to 2 minutes

  useEffect(() => {
    // Update local state if context selectedTopics changes
    setLocalSelectedTopics(selectedTopics);
  }, [selectedTopics]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(
        (prevIndex) => (prevIndex + 1) % PLACEHOLDER_TOPICS.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleTopic = (topic: string) => {
    setLocalSelectedTopics((prevTopics) => {
      const newTopics = prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic)
        : [...prevTopics, topic];
      setSelectedTopics(newTopics); // Update context
      return newTopics;
    });
  };

  const addCustomTopic = () => {
    if (customTopic && !localSelectedTopics.includes(customTopic)) {
      setLocalSelectedTopics((prevTopics) => {
        const newTopics = [...prevTopics, customTopic];
        setSelectedTopics(newTopics); // Update context
        return newTopics;
      });
      setCustomTopic('');
    }
  };

  const handleStartGame = () => {
    if (localSelectedTopics.length > 0) {
      setSelectedTopics(localSelectedTopics);
      setGameDuration(selectedDuration);
      startNewGame();
      setGameState('playing');
      router.push('/game');
    }
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
            Choose Your Topics
          </h1>
          <p className='text-xl text-gray-600 text-center mb-12'>
            Select the subjects you'd like to explore in your fact-checking
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
                      localSelectedTopics.includes(topic)
                        ? 'default'
                        : 'secondary'
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
              <Button onClick={addCustomTopic}>Add</Button>
            </div>
          </CardContent>
        </Card>

        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
            Selected Topics
          </h2>
          <div className='flex flex-wrap gap-2'>
            {localSelectedTopics.map((topic) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Badge
                  variant='default'
                  className='cursor-pointer text-sm px-3 py-1'
                  onClick={() => toggleTopic(topic)}
                >
                  {topic} ✕
                </Badge>
              </motion.div>
            ))}
            {localSelectedTopics.length === 0 && (
              <p className='text-gray-500'>No topics selected</p>
            )}
          </div>
        </div>

        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Game Duration
            </h2>
            <div className='flex justify-around'>
              {[2, 5, 10].map((minutes) => (
                <Button
                  key={minutes}
                  variant={
                    selectedDuration === minutes * 60 ? 'default' : 'outline'
                  }
                  onClick={() => setSelectedDuration(minutes * 60)}
                >
                  {minutes} minutes
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className='text-center'>
          <Button
            size='lg'
            onClick={handleStartGame}
            disabled={localSelectedTopics.length === 0}
            className='px-8 py-3 text-lg'
          >
            Start Game
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default withTopicSelectionGuard(TopicSelectionPage);
