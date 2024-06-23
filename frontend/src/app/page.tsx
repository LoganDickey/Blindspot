'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useGameContext } from '@/contexts/gameContext';
import { withHomeGuard } from '@/hocs/withGameGuard';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { setGameState } = useGameContext();

  const handleStartGame = () => {
    setGameState('not_playing');
    router.push('/topics');
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <h1 className='text-5xl font-serif font-bold text-gray-900 mb-4'>
            Blindspot
          </h1>
          <p className='text-xl text-gray-600'>
            Sharpen your critical thinking. Uncover the truth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className='mb-12'>
            <CardContent className='p-8 pl-12'>
              <div className='flex flex-col md:flex-row items-center gap-8'>
                <div className='flex-1'>
                  <h2 className='text-3xl font-semibold text-gray-800 mb-4'>
                    Test Your Fact-Checking Skills
                  </h2>
                  <p className='text-gray-600 mb-6'>
                    In an era of information overload, the ability to
                    distinguish fact from fiction is more crucial than ever.
                    Blindspot challenges you to analyze news articles, spotting
                    subtle clues that separate truth from deception.
                  </p>
                  <ul className='list-disc list-inside text-gray-600 mb-6'>
                    <li>Explore diverse topics</li>
                    <li>Analyze real and fabricated news</li>
                    <li>Learn to identify credible sources</li>
                    <li>Improve your critical thinking skills</li>
                  </ul>
                </div>
                <div className='flex-shrink-0'>
                  <Image
                    src='/images/logo.jpeg'
                    alt='Blindspot logo'
                    width={350}
                    height={350}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='text-center'
        >
          <Button
            size='lg'
            onClick={handleStartGame}
            className='px-8 py-3 text-lg text-white'
          >
            Start Your Investigation
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='mt-16 text-center text-gray-500'
        >
          <p>
            Developed with journalistic integrity in mind.
            <br />
            Not affiliated with any news organization.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default withHomeGuard(HomePage);
