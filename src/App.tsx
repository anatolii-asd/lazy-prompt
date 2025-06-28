import React from 'react';
import SlothPromptBoost from './SlothPromptBoost';
import AuthWrapper from './components/AuthWrapper';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <SlothPromptBoost />
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;