interface TranscribedInputProps {
	transcript: string;
}

function TranscribedInput({ transcript }: TranscribedInputProps) {
	return (
		<span className="TranscribedInput">
			{transcript || "Transcribed text will appear here..."}
		</span>
	);
}

export default TranscribedInput;
