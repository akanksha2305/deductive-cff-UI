
import { NextResponse } from "next/server";
import { getDataset } from "@/lib/google-sheets";

export async function GET() {
  try {
    const rows = await getDataset();

    return NextResponse.json({
      success: true,
      message: "Google Sheets connected successfully!",
      rowCount: rows.length,
      headers: rows[0] ?? [],
      sampleRow: rows[1] ?? [],
    });
  } catch (error) {
    console.error("Google Sheets error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not connect to Google Sheets",
      },
      { status: 500 }
    );
  }
}
