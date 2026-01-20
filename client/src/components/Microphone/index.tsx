import MicIcon from '@mui/icons-material/Mic';
import './Microphone.css';
import React from 'react';

interface MicrophoneProps {
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export function Microphone({ listening, startListening, stopListening }: MicrophoneProps) {
  const handleClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <MicIcon
      sx={{
        fontSize: 100,
      }}
      className="MicrophoneIcon"
      onClick={handleClick}
    />
  );
}

export default Microphone;
