import { useEffect, useState } from "react";
import RecordButton from "./components/RecordButton";
import "./Home.css";
import { useParams, useNavigate } from "react-router-dom";
import { useChannel } from "ably/react";
import Results from "./components/Results";

export default function Home() {
  let { streamId } = useParams();
  const navigate = useNavigate();

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

  return (
    <>
      <form id="form">
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
          onTranscriptionData={(data) => {
            console.log(data);
            channel.publish("transcription", data);
            setTranscription((prev) => [...prev, data]); // append to the end
          }}
          onStart={() => {
            setTranscription([]);
          }}
        />
      </form>

      <Results transcription={transcription} />

      <div>
        <a href={`/read/${streamId}`}>Share Link to Read</a>
      </div>
    </>
  );
}
