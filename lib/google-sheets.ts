
import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

export async function getDataset() {
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEET_ID is missing");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Dataset!A1:Z",
  });

  return response.data.values ?? [];
}

export async function appendResponse(values: (string | number)[]) {
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEET_ID is missing");
  }

  return sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Responses!A:Z",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });
}
