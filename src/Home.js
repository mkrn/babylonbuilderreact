import { useEffect, useState } from "react";
import RecordButton from "./components/RecordButton";
import "./Home.css";
import { useParams, useNavigate } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";

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

  const onTranscriptionData = async (data) => {
    console.log(data);

    // append to the end of results
    setTranscription((prev) => [...prev, data]);

    try {
      // Translate data.transcription to Azerbanjani with Google Translate API
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${
          process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY
        }&q=${encodeURI(data.transcription)}&target=az`
      );
      const translatedData = await response.json();
      const translatedText = translatedData.data.translations[0].translatedText;
      channel.publish("transcription", {
        ...data,
        transcription: translatedText,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <main>
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
        <RecordButton
          selectedDevice={selectedDevice}
          onTranscriptionData={onTranscriptionData}
          onStart={() => {
            setTranscription([]);
          }}
        />

        <Results transcription={transcription} />

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a
            href={`/read/${streamId}`}
            target="_blank"
            rel="noreferrer"
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
      </main>
    </>
  );
}
