import { createContext, useContext, useState, ReactNode } from 'react';
import { Group } from '@/types/community';

interface CommunityContextType {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
}

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toError(maybeError: unknown): Error {
  if (maybeError instanceof Error) return maybeError;

  try {
    return new Error(
      isErrorWithMessage(maybeError) 
        ? maybeError.message 
        : JSON.stringify(maybeError)
    );
  } catch {
    return new Error(String(maybeError));
  }
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const value = {
    selectedGroup,
    setSelectedGroup,
    isLoading,
    setIsLoading,
    error,
    setError: (error: unknown) => {
      if (error === null) {
        setError(null);
      } else {
        setError(toError(error));
      }
    },
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
