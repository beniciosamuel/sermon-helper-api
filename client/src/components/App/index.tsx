import './App.css';
import Microphone from '../Microphone';
import TranscribedInput from '../TranscribedInput';
import { LogsOutput } from '../LogsOutput';
import { Transcriptor } from '../../services/Transcriptor';
import React from 'react';

function App() {
  const { 
    transcript, 
    listening, 
    startListening,
    stopListening,
  } = Transcriptor();

  React.useEffect(() => {
    if (transcript) {
      console.log('Real-time transcript:', transcript);
    }
  }, [transcript]);

  return (
    <div className="App">
      <div className='MicrophoneContainer'>
        <Microphone 
          listening={listening}
          startListening={startListening}
          stopListening={stopListening}
        />
      </div>
      <div className='LogsOutputContainer'>
        <LogsOutput />
      </div>
      <div className='TranscribedInputContainer'>
        <TranscribedInput transcript={transcript} />
      </div>
    </div>
  );
}

export default App;
