import { aiFacade } from '@/app/container';
import { useEffect } from 'react';
import { Main } from './Main';

export function App() {
  useEffect(() => {
    async function initialize() {
      const response = await aiFacade.initialize();
      console.log('response', response);
      const transcript = await aiFacade.getTranscript();
      console.log('transcript', transcript);
    }
    initialize();
  }, []);
  
  return (
    <Main />
  );
}