import he from "he";

export default function Results({ transcription, language = "" }) {
  const key = language ? `transcription_${language}` : `transcription`;
  const lastElement = transcription[transcription.length - 1];
  const partialTranscription =
    lastElement && lastElement.type === "partial"
      ? he.decode(lastElement[key])
      : "";

  const finalTranscriptions = transcription
    .filter((data) => data.type === "final")
    .map((data) => data[key])
    .map((transcription) => he.decode(transcription));

  const lastThreeFinals = finalTranscriptions.slice(
    Math.max(finalTranscriptions.length - 3, 0)
  );

  return (
    <div id="result">
      <span id="finals">{lastThreeFinals.join(" ")}</span>
      <span style={{ color: "#999" }} id="partials">
        {partialTranscription}
      </span>
    </div>
  );
}
