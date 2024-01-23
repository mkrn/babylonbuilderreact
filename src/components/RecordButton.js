import { useState, useCallback, useRef } from "react";
import RecordRTC from "recordrtc";

const SAMPLE_RATE = 48000;
const GLADIA_KEY = process.env.REACT_APP_GLADIA_KEY;

export default function RecordButton({
  selectedDevice,
  onTranscriptionData,
  translationHint = "",
  onStart,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useRef(null);
  const socket = useRef(null);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recorder.current) {
      recorder.current.stopRecording(() => {
        if (recorder.current) {
          recorder.current.destroy();
          recorder.current = null;
        }
      });
    }
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    if (onStart) {
      onStart();
    }
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
      });

      const newRecorder = new RecordRTC(audioStream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 1000,
        ondataavailable: function (blob) {
          if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(blob);
          }
        },
        sampleRate: SAMPLE_RATE,
        desiredSampRate: SAMPLE_RATE,
        numberOfAudioChannels: 1,
      });

      recorder.current = newRecorder;

      const newSocket = new WebSocket(
        "wss://api.gladia.io/audio/text/audio-transcription"
      );
      newSocket.onopen = () => {
        const configuration = {
          x_gladia_key: GLADIA_KEY,
          frames_format: "bytes",
          language_behaviour: "manual",
          language: "english",
          reinject_context: true,
          model_type: "fast",
          prosody: false,
          transcription_hint: translationHint, // Pass translationHint from props to socket
          word_timestamps: false,
          sample_rate: SAMPLE_RATE,
        };
        newSocket.send(JSON.stringify(configuration));
      };
      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (
          data?.event === "transcript" &&
          data.transcription &&
          onTranscriptionData
        ) {
          onTranscriptionData(data);
        }
      };
      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        stopRecording();
      };
      newSocket.onclose = (event) => {
        console.warn(`WebSocket closed: [${event.code}] ${event.reason}`);
        stopRecording();
      };

      socket.current = newSocket;

      newRecorder.startRecording();
    } catch (error) {
      console.error("Error during the initialization:", error);
      stopRecording();
    }
  }, [
    selectedDevice,
    onTranscriptionData,
    stopRecording,
    onStart,
    translationHint,
  ]); // Add translationHint to the dependency array

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      style={{
        color: isRecording ? "red" : "black",
        padding: 20,
        WebkitAppearance: "none",
      }}
    >
      {isRecording ? "🛑 Stop" : "🎤 Start"}
    </button>
  );
}
