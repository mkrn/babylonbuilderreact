import { useParams } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";
import { useState } from "react";
import "./Home.css";
import { LanguageSelector } from "./components/LanguageSelector";

export default function Read() {
  let { streamId } = useParams();
  const [transcription, updateTranscription] = useState([]);
  const [language, setLanguage] = useState("");

  useChannel(streamId, (message) => {
    updateTranscription((prev) => [...prev, message.data]);
  });

  return (
    <main>
      <LanguageSelector
        value={language}
        onChange={(event) => {
          setLanguage(event.target.value);
        }}
      />

      <Results transcription={transcription} language={language} />
    </main>
  );
}
