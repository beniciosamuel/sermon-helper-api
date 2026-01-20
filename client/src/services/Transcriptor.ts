import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export function Transcriptor() {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  };
}
