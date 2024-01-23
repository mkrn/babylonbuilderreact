import { useParams } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";
import { useState } from "react";

export default function Read() {
  let { streamId } = useParams();

  const [transcription, updateTranscription] = useState([]);
  useChannel(streamId, (message) => {
    updateTranscription((prev) => [...prev, message.data]);
  });
  console.log(transcription);
  return (
    <div>
      <Results transcription={transcription} />
    </div>
  );
}
