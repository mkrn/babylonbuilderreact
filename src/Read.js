import { useParams } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";
import { useState } from "react";
import "./Home.css";
export default function Read() {
  let { streamId } = useParams();

  const [transcription, updateTranscription] = useState([]);
  useChannel(streamId, (message) => {
    updateTranscription((prev) => [...prev, message.data]);
  });
  return (
    <main>
      <Results transcription={transcription} />
    </main>
  );
}
