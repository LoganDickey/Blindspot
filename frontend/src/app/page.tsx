'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const HomePage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col justify-center items-center p-4'>
      <motion.div
        className='max-w-4xl w-full'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div variants={itemVariants} className='text-center mb-8'>
          <h1 className='text-4xl md:text-6xl font-bold text-blue-900 mb-4'>
            Fake News Detective
          </h1>
          <p className='text-xl md:text-2xl text-blue-700'>
            Test your skills in spotting misinformation!
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className='mb-12'>
          <Card className='bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                <div>
                  <h2 className='text-2xl font-semibold text-blue-800 mb-4'>
                    How to Play
                  </h2>
                  <ul className='list-disc list-inside text-blue-700 space-y-2'>
                    <li>Read news articles presented to you</li>
                    <li>Analyze the content carefully</li>
                    <li>Decide if the news is real or fake</li>
                    <li>Score points for correct answers</li>
                    <li>Race against time to improve your score</li>
                  </ul>
                </div>
                <div className='flex justify-center'>
                  <Image
                    src='/detective.svg'
                    alt='Detective illustration'
                    width={200}
                    height={200}
                    className='drop-shadow-md'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className='text-center'>
          <Button
            size='lg'
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105'
            onClick={() => console.log('Start Game clicked')}
          >
            Start Game
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;
