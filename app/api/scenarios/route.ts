import { NextResponse } from "next/server";
import { getDataset } from "@/lib/google-sheets";

export const runtime = "nodejs";

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const rows = await getDataset();
    if (rows.length < 2) {
      return NextResponse.json({ error: "The Dataset tab has no scenario rows." }, { status: 404 });
    }

    const headers = rows[0].map((header) => String(header).trim());
    const records = rows.slice(1).filter((row) => row.some((cell) => String(cell ?? "").trim()));
    const scenarios = records.map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))
    );

    const selected = scenarios[Math.floor(Math.random() * scenarios.length)];
    const response = {
      scenario_id: String(selected.scenario_id ?? ""),
      title: String(selected.title ?? ""),
      intro: String(selected.intro ?? ""),
      background: String(selected.background ?? ""),
      // evidence_json is empty in the current workbook; claims_json supplies the three evidence statements.
      evidence: parseJson<string[]>(selected.evidence_json, []).length
        ? parseJson<Array<{ id?: string; source?: string; text?: string }>>(selected.evidence_json, [])
        : parseJson<string[]>(selected.claims_json, []).map((text, index) => ({
            id: `E${index + 1}`,
            source: "Information provided",
            text,
          })),
      question: String(selected.question ?? ""),
      options: parseJson<Array<{ key: string; label: string; description?: string }>>(selected.options_json, []),
      condition: String(selected.condition ?? ""),
      analysis: String(selected.ai_advice ?? ""),
      recommendation: String(selected.ai_recommendation ?? ""),
      ai_confidence: String(selected.ai_confidence ?? ""),
    };

    if (!response.scenario_id || !response.question || response.options.length === 0) {
      return NextResponse.json({ error: "The selected Dataset row is missing required fields." }, { status: 500 });
    }

    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Scenario fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load a scenario." },
      { status: 500 }
    );
  }
}
