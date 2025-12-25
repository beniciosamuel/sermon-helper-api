import { Websocket } from "../../services/Websocket";

interface TranscribedInputProps {
	transcript: string;
}

function TranscribedInput({ transcript }: TranscribedInputProps) {
	// const websocket = Websocket.getInstance();

	// websocket.emit('transcript', transcript);

	console.log('Transcript:', transcript);

	return (
		<span className="TranscribedInput">
			{transcript || "Transcribed text will appear here..."}
		</span>
	);
}

export default TranscribedInput;
