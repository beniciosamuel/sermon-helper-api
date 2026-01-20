interface TranscribedInputProps {
  transcript: string;
}

function TranscribedInput({ transcript }: TranscribedInputProps) {
  // eslint-disable-next-line no-console
  console.log('Transcript:', transcript);

  return (
    <span className="TranscribedInput">{transcript || 'Transcribed text will appear here...'}</span>
  );
}

export default TranscribedInput;
