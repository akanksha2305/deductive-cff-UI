import { NextRequest, NextResponse } from "next/server";
import { appendResponse } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const required = ["participant_id", "scenario_id", "condition", "initial_answer", "final_answer"];
    const missing = required.filter((key) => !String(body[key] ?? "").trim());
    if (missing.length) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const values = [
      new Date().toISOString(),
      String(body.participant_id),
      String(body.scenario_id),
      Number(body.scenario_order ?? 1),
      String(body.condition),
      String(body.initial_answer),
      Number(body.initial_confidence),
      String(body.ai_recommendation ?? ""),
      JSON.stringify(body.verification_responses ?? {}),
      String(body.final_answer),
      Number(body.final_confidence),
    ];

    await appendResponse(values);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Response save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the response." },
      { status: 500 }
    );
  }
}
