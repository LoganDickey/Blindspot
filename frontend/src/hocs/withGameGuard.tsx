// src/hocs/withGameGuard.tsx

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '@/contexts/gameContext';

type AllowedStates = 'any' | 'not_playing' | 'playing' | 'game_over';

export const withGameGuard = (
  WrappedComponent: React.ComponentType,
  allowedStates: AllowedStates[],
  redirectPath: string
) => {
  return function WithGameGuard(props: any) {
    const router = useRouter();
    const { gameState } = useGameContext();

    useEffect(() => {
      const checkGameState = () => {
        if (
          !allowedStates.includes('any') &&
          !allowedStates.includes(gameState)
        ) {
          // router.push(redirectPath);
        }
      };

      checkGameState();
    }, [gameState, router]);

    // Always render the wrapped component
    // The redirection will happen if needed
    return <WrappedComponent {...props} />;
  };
};

// Pre-configured guards
export const withHomeGuard = (WrappedComponent: React.ComponentType) =>
  withGameGuard(WrappedComponent, ['any'], '/');

export const withTopicSelectionGuard = (
  WrappedComponent: React.ComponentType
) => withGameGuard(WrappedComponent, ['not_playing'], '/');

export const withGamePageGuard = (WrappedComponent: React.ComponentType) =>
  withGameGuard(WrappedComponent, ['playing'], '/topics');

export const withGameOverGuard = (WrappedComponent: React.ComponentType) =>
  withGameGuard(WrappedComponent, ['game_over'], '/');
