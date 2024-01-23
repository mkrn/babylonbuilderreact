export default function Results({ transcription }) {
  const lastElement = transcription[transcription.length - 1];
  const partialTranscription =
    lastElement && lastElement.type === "partial"
      ? lastElement.transcription
      : "";

  const finalTranscriptions = transcription
    .filter((data) => data.type === "final")
    .map((data) => data.transcription);
  const lastThreeFinals = finalTranscriptions.slice(
    Math.max(finalTranscriptions.length - 3, 0)
  );

  return (
    <div id="result">
      <span id="finals">{lastThreeFinals.join(" ")}</span>
      <span style={{ color: "red" }} id="partials">
        {partialTranscription}
      </span>
    </div>
  );
}

// export default function Results({ transcription }) {
//   const lastElement = transcription[transcription.length - 1];
//   const partialTranscription =
//     lastElement && lastElement.type === "partial"
//       ? lastElement.transcription
//       : "";
//   return (
//     <div id="result">
//       <span id="finals">
//         {transcription
//           .filter((data) => data.type === "final")
//           .map((data) => data.transcription)
//           .join(" ")}
//       </span>
//       <span style={{ color: "red" }} id="partials">
//         {partialTranscription}
//       </span>
//     </div>
//   );
// }
