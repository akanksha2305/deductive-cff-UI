"use client";

import { useEffect, useMemo, useState } from "react";

type Choice = { key: string; label: string; description?: string };
type Evidence = { id: string; source: string; text: string };
type Scenario = {
  scenario_id: string;
  title: string;
  intro: string;
  background: string;
  evidence: Evidence[];
  question: string;
  options: Choice[];
  condition: string;
  analysis: string;
  recommendation: string;
  ai_confidence?: string;
};
type Screen = "home" | "scenario" | "analysis" | "complete";

const ASSIGNMENT_KEY = "decision-lab-assignment-v1";
const PARTICIPANT_KEY = "decision-lab-participant-v1";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [participantId, setParticipantId] = useState("");
  const [initial, setInitial] = useState("");
  const [final, setFinal] = useState("");
  const [initialConfidence, setInitialConfidence] = useState(55);
  const [finalConfidence, setFinalConfidence] = useState(55);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAssignment() {
      try {
        const existingParticipant = sessionStorage.getItem(PARTICIPANT_KEY) || crypto.randomUUID();
        sessionStorage.setItem(PARTICIPANT_KEY, existingParticipant);
        setParticipantId(existingParticipant);

        const cached = sessionStorage.getItem(ASSIGNMENT_KEY);
        if (cached) {
          if (active) setScenario(JSON.parse(cached) as Scenario);
          return;
        }

        const response = await fetch("/api/scenarios", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load the activity.");
        sessionStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(data));
        if (active) setScenario(data as Scenario);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load the activity.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAssignment();
    return () => { active = false; };
  }, []);

  const initialLabel = useMemo(() => scenario?.options.find((o) => o.key === initial)?.label, [scenario, initial]);
  const finalLabel = useMemo(() => scenario?.options.find((o) => o.key === final)?.label, [scenario, final]);

  function reset() {
    sessionStorage.removeItem(ASSIGNMENT_KEY);
    sessionStorage.removeItem(PARTICIPANT_KEY);
    window.location.reload();
  }

  function choices(value: string, onChange: (value: string) => void, name: string) {
    return (
      <div className="options">
        {(scenario?.options ?? []).map((option) => (
          <label className={`option ${value === option.key ? "selected" : ""}`} key={option.key}>
            <input type="radio" name={name} value={option.key} checked={value === option.key} onChange={() => onChange(option.key)} />
            <i />
            <span><b>{option.key}. {option.label}</b></span>
          </label>
        ))}
      </div>
    );
  }

  function confidence(label: string, value: number, onChange: (n: number) => void) {
    return (
      <div className="confidence">
        <div className="sliderHead"><label>{label}</label><b>{value}%</b></div>
        <input className="range" type="range" min="0" max="100" step="5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <div className="rangeEnds"><span>NOT VERY SURE</span><span>VERY SURE</span></div>
      </div>
    );
  }

  async function submitResponse() {
    if (!scenario || !initial || !final || !participantId) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: participantId,
          scenario_id: scenario.scenario_id,
          scenario_order: 1,
          condition: scenario.condition,
          initial_answer: initial,
          initial_confidence: initialConfidence,
          ai_recommendation: scenario.recommendation,
          verification_responses: {},
          final_answer: final,
          final_confidence: finalConfidence,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your response could not be saved.");
      setScreen("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your response could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="shell"><p>Preparing your activity…</p></main>;
  if (!scenario) return <main className="shell"><h2>Unable to load the activity</h2><p>{error || "Please refresh the page or contact the study team."}</p></main>;

  return (
    <main className="shell">
      <header>
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); reset(); }}><span>✳</span> DECISION<span className="green">LAB</span></a>
        <div className="topmeta"><i /> DECISION-MAKING ACTIVITY</div>
      </header>
      <div className="progress"><span style={{ width: screen === "home" ? "0%" : screen === "complete" ? "100%" : screen === "analysis" ? "72%" : "35%" }} /></div>

      {screen === "home" && (
        <section className="hero">
          <div className="heroText">
            <div className="eyebrow">✦ A short decision-making activity</div>
            <h1>Take a look.<br /><em>Make the call.</em></h1>
            <p className="lead">You’ll review a situation, consider the information provided, and make a decision. Take your time and use your own judgment.</p>
            <div className="startrow"><button className="btn" onClick={() => setScreen("scenario")}>Get started ↗</button><small>~5 min · one scenario</small></div>
            <small className="asterisk">Please read the situation carefully before answering.</small>
          </div>
          <div className="art">
            <div className="orbit one" /><div className="orbit two" /><div className="sticker top">A MOMENT TO THINK</div>
            <div className="brain"><div className="brainbar">YOUR THINKING SPACE <span>● ● ●</span></div><div className="emoji">🧠</div><strong>“Let me<br />think this through.”</strong><label>ONE STEP AT A TIME</label></div>
            <div className="bubble"><small>✳ ANOTHER PERSPECTIVE</small><b>New information.</b><span>Consider the details</span></div>
            <div className="sticker bottom">DETAILS MATTER ✦</div><div className="hmm">hmm…</div>
          </div>
          <div className="steps">
            <div><b>01</b><span><strong>Review the situation</strong><small>Read the context and evidence.</small></span></div>
            <div><b>02</b><span><strong>Consider an analysis</strong><small>Review an additional perspective.</small></span></div>
            <div><b>03</b><span><strong>Make your decision</strong><small>Choose the answer that fits best.</small></span></div>
          </div>
        </section>
      )}

      {screen === "scenario" && (
        <section className="study">
          <div className="studyhead"><div><div className="eyebrow">CASE FILE · 01 / 01</div><h2>{scenario.title}</h2><p>{scenario.intro}</p></div><div className="stamp">CASE<br />{scenario.scenario_id.replace("CASE-", "")}</div></div>
          <div className="panel">
            <div className="kicker">THE SITUATION</div><p>{scenario.background}</p>
            <div className="receipts">INFORMATION PROVIDED <small>{scenario.evidence.length} DETAILS</small></div>
            <div className="evidence">{scenario.evidence.map((item) => <article key={item.id}><div><b>{item.id}</b><small>{item.source}</small></div><p>{item.text}</p></article>)}</div>
          </div>
          <div className="panel">
            <div className="kicker">STEP 1 · YOUR INITIAL DECISION</div><h3>{scenario.question}</h3>
            {choices(initial, setInitial, "initial")}
            {confidence("HOW SURE ARE YOU?", initialConfidence, setInitialConfidence)}
            <div className="panelFoot"><small>Your first answer will be recorded before you see the additional analysis.</small><button className="btn" disabled={!initial} onClick={() => setScreen("analysis")}>Continue →</button></div>
          </div>
        </section>
      )}

      {screen === "analysis" && (
        <section className="study">
          <div className="studyhead"><div><div className="eyebrow">STEP 2 · ADDITIONAL ANALYSIS</div><h2>Consider another perspective.</h2><p>Your initial answer: <b>{initial}. {initialLabel}</b></p></div><div className="stamp purple">ANALYSIS<br />02</div></div>
          <div className="aiPanel">
            <div className="aihead"><span>✳</span><div><b>Additional analysis</b><small>Another perspective on the situation</small></div></div>
            <p>“{scenario.analysis}”</p>
            <div className="verdict"><small>RECOMMENDED OPTION</small><b>{scenario.recommendation}. {scenario.options.find((o) => o.key === scenario.recommendation)?.label}</b></div>
          </div>
          <div className="panel">
            <div className="kicker">STEP 3 · YOUR FINAL DECISION</div><h3>What is your answer now?</h3>
            {choices(final, setFinal, "final")}
            {confidence("HOW SURE ARE YOU NOW?", finalConfidence, setFinalConfidence)}
            {error && <p role="alert">{error}</p>}
            <div className="panelFoot"><small>Choose the answer that best reflects your judgment after reviewing the information.</small><button className="btn" disabled={!final || saving} onClick={submitResponse}>{saving ? "Saving…" : "Finish activity ↗"}</button></div>
          </div>
        </section>
      )}

      {screen === "complete" && (
        <section className="done">
          <div className="donebadge">ACTIVITY COMPLETE ✦</div><div className="doneemoji">🎉</div><div className="eyebrow">THANK YOU FOR PARTICIPATING</div>
          <h1>All done.<br /><em>Thank you!</em></h1><p>Your responses have been recorded.</p>
          <div className="summary"><div><small>INITIAL ANSWER</small><b>{initial || "—"}</b><span>{initialLabel || "Not selected"}</span></div><div><small>FINAL ANSWER</small><b>{final || "—"}</b><span>{finalLabel || "Not selected"}</span></div></div>
          <div className="disclaimer">Your response has been submitted to the study spreadsheet.</div>
          <button className="btn" onClick={reset}>Return to start ↺</button>
        </section>
      )}
      <footer><span>DECISION LAB © 2026</span><span>THOUGHTFUL DECISIONS, ONE SCENARIO AT A TIME.</span><span>BUILT FOR CURIOUS MINDS ✳</span></footer>
    </main>
  );
}
