import { useEffect, useState } from "react";
import RecordButton from "./components/RecordButton";

export default function Home() {
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [finalTranscription, setFinalTranscription] = useState("");
  const [partialTranscription, setPartialTranscription] = useState("");

  useEffect(() => {
    async function listAudioDevices() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        console.error("MediaDevices are not supported in this environment.");
        return;
      }

      try {
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
      <style>{`
        body {
          margin: 1rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        form > div {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        form,
        #result {
          box-sizing: border-box;
          max-width: 500px;
          margin: 0 auto;
        }
        #result {
          margin-top: 1rem;
          border-top: 1px solid #333;
          padding-top: 1rem;
          text-align: justify;
        }
      `}</style>
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
        {/* <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          style={{ color: isRecording ? "white" : "black" }}
        >
          {isRecording ? "Stop recording" : "Start recording"}
        </button> */}
        <RecordButton
          selectedDevice={selectedDevice}
          onTranscriptionData={(data) => {
            console.log(data);
            if (data.type === "final") {
              setFinalTranscription((prev) => prev + data.transcription);
              setPartialTranscription("");
            } else {
              setPartialTranscription(data.transcription);
            }
          }}
          onStart={() => {
            setFinalTranscription("");
            setPartialTranscription("...");
          }}
        />
      </form>

      <div id="result">
        <span id="finals">{finalTranscription}</span>
        <span style={{ color: "red" }} id="partials">
          {partialTranscription}
        </span>
      </div>
    </>
  );
}
