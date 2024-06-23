import { motion } from 'framer-motion';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ArticleProps {
  title: string;
  content: string;
  author: string;
  date: string;
}

const ArticleComponent: React.FC<ArticleProps> = ({
  title,
  content,
  author,
  date,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='max-w-3xl mx-auto bg-white shadow-lg'>
        <CardHeader className='border-b border-gray-200'>
          <h2 className='text-3xl font-serif font-bold text-gray-900 mb-2'>
            {title}
          </h2>
          <div className='text-sm text-gray-500 font-sans'>
            <span className='font-medium'>{author || 'Unknown'}</span> •{' '}
            <span>{date}</span>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='prose prose-sm max-w-none font-serif'>
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className='mb-4 leading-relaxed'>
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ArticleComponent;
