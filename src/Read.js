import { useParams } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";
import { useState } from "react";
import "./Home.css";
export default function Read() {
  let { streamId } = useParams();
  const [transcription, updateTranscription] = useState([]);
  const [language, setLanguage] = useState("");

  useChannel(streamId, (message) => {
    updateTranscription((prev) => [...prev, message.data]);
  });

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <main>
      <select value={language} onChange={handleLanguageChange}>
        <option value="">English</option>
        <option value="ru">Russian</option>
        <option value="az">Azerbanjani</option>
      </select>
      <Results transcription={transcription} language={language} />
    </main>
  );
}
