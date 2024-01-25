import { useEffect, useState } from "react";
import RecordButton from "./components/RecordButton";
import "./Home.css";
import { useParams, useNavigate } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";
import { LanguageSelector } from "./components/LanguageSelector";

export default function Home() {
  let { streamId } = useParams();
  const navigate = useNavigate();

  // Create random channel and go there if not set (home page / visit)
  useEffect(() => {
    if (!streamId) {
      const randomStreamId = Math.random().toString(36).substring(2, 15);
      navigate(`/${randomStreamId}`);
    }
  }, [streamId, navigate]);

  const { channel } = useChannel(streamId);
  const [audioDevices, setAudioDevices] = useState([]);
  const [transcription, setTranscription] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [translationHint, setTranslationHint] = useState(
    localStorage.getItem("translationHint") || ""
  );

  const [inputlanguage, setinputlanguage] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    async function listAudioDevices() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        console.error("MediaDevices are not supported in this environment.");
        return;
      }

      try {
        // Request microphone permission before listing devices
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const filteredDevices = devices.filter((d) => d.kind === "audioinput");
        setAudioDevices(filteredDevices);
        if (filteredDevices.length > 0) {
          setSelectedDevice(filteredDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error listing audio devices:", error);
        alert("No audio input device found");
      }
    }

    listAudioDevices();
  }, []);

  const translate = async (text, target) => {
    try {
      // Translate data.transcription to Azerbanjani with Google Translate API
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${
          process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY
        }&q=${encodeURI(text)}&target=${target}`
      );
      const translatedData = await response.json();
      return translatedData.data.translations[0].translatedText;
    } catch (err) {
      console.error(err);
    }
  };

  const onTranscriptionData = async (data) => {
    console.log(data);

    // Translate to az and ru in parallel
    const [translatedTextAz, translatedTextRu] = await Promise.all([
      translate(data.transcription, "az"),
      translate(data.transcription, "ru"),
    ]);

    const enrichedData = {
      ...data,
      transcription_az: translatedTextAz,
      transcription_ru: translatedTextRu,
    };

    channel.publish("transcription", enrichedData);

    // append to the end of results
    setTranscription((prev) => [...prev, enrichedData]);
  };

  const handleTranslationHintChange = (e) => {
    setTranslationHint(e.target.value);
    localStorage.setItem("translationHint", e.target.value);
  };

  return (
    <>
      <main>
        <div id="toolbox">
          <div>
            {/* <label htmlFor="input_device">Audio input device</label> */}
            <select
              id="input_device"
              name="input_device"
              required
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              disabled={audioDevices.length === 0}
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Default"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Input Language:</label>
            <LanguageSelector
              value={inputlanguage}
              onChange={(event) => {
                setinputlanguage(event.target.value);
              }}
            />
          </div>
          <div>
            <label htmlFor="translation_hint">
              Custom vocabulary to improve accuracy of transcribing context
              specific words, technical terms, names, etc:
            </label>
            <textarea
              id="translation_hint"
              name="translation_hint"
              value={translationHint}
              onChange={handleTranslationHintChange}
            />
          </div>
          <RecordButton
            selectedDevice={selectedDevice}
            translationHint={translationHint}
            onTranscriptionData={onTranscriptionData}
            inputlanguage={inputlanguage}
            onStart={() => {
              setTranscription([]);
            }}
          />

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a
              href={`/read/${streamId}`}
              target="_blank"
              rel="noreferrer"
              id="sharelink"
              onClick={(e) => {
                if (navigator.canShare) {
                  e.preventDefault();
                  const shareData = {
                    title: "Share Link to Read",
                    url: window.location.origin + `/read/${streamId}`,
                  };
                  navigator.share(shareData).catch(console.error);
                }
              }}
            >
              📤 Share Link to Read Subtitles
            </a>
          </div>
        </div>
        <LanguageSelector
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value);
          }}
          style={{ margin: 20, width: "calc(100% - 40px)" }}
        />
        <Results transcription={transcription} language={language} />
      </main>
    </>
  );
}
