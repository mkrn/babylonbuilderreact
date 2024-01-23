export default function Results({ transcription }) {
  return (
    <div id="result">
      <span id="finals">
        {transcription
          .filter((data) => data.type === "final")
          .map((data) => data.transcription)
          .join(" ")}
      </span>
      <span style={{ color: "red" }} id="partials">
        {transcription.filter((data) => data.type === "partial").slice(-1)[0]
          ?.transcription || ""}
      </span>
    </div>
  );
}
