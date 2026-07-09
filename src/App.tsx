import { track } from "./lib/analytics";

export default function App() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 640,
        margin: "4rem auto",
        padding: "0 1rem",
        lineHeight: 1.5,
      }}
    >
      <h1>00-lab experiment</h1>
      <p>
        Scaffolded from the studio template. Analytics is wired in — the button
        below fires a tracked event.
      </p>
      <button
        type="button"
        onClick={() => track("cta_click", { source: "starter" })}
      >
        Track a test event
      </button>
      <p style={{ marginTop: "2rem", color: "#666", fontSize: 14 }}>
        Edit <code>src/App.tsx</code> and fill in <code>EXPERIMENT.md</code> with
        your hypothesis and kill criteria before you build.
      </p>
    </main>
  );
}
