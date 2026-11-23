# Decision Lab — GitHub + Vercel + Google Sheets

A playful Next.js participant-facing prototype. Vercel hosts the app; Google Sheets stores the scenario dataset and participant responses.

## Features
- Reads scenarios from the `Dataset` Google Sheets tab.
- Randomizes scenario order for each participant.
- Captures initial answer and confidence before AI advice.
- Displays AI advice, collects evidence-check responses, then captures final answer and confidence.
- Appends one row per completed scenario to `Responses`.

## A. Prepare your Google Sheet
1. Create a Google spreadsheet with tabs named exactly `Dataset` and `Responses`.
2. Import `data/sample-dataset.csv` into `Dataset` (File → Import → Upload). Keep the header row.
3. Import `data/response-headers.csv` into `Responses` (or paste its header row into A1).
4. Do not rename columns. JSON columns in Dataset must remain valid JSON.
5. Copy the spreadsheet ID from its URL: the text between `/d/` and `/edit`.

## B. Create Google credentials
1. Visit https://console.cloud.google.com/ and create/select a Google Cloud project.
2. Enable **Google Sheets API**.
3. Go to IAM & Admin → Service Accounts → Create Service Account.
4. Create and download a JSON key for the service account. Keep it private.
5. Copy its `client_email` and `private_key` values.
6. Share your spreadsheet with the service account email as **Editor**.

## C. Add files to GitHub
1. Download and unzip this project.
2. Add all files and folders to your existing repository, with `package.json` at the repository root.
3. Commit and push. Never upload your service-account JSON or `.env` file.

## D. Deploy on Vercel
1. Visit https://vercel.com/ and import your GitHub repository.
2. Vercel should detect Next.js.
3. Before/after first deploy, open Project → Settings → Environment Variables and add:
   - `GOOGLE_SHEET_ID`: spreadsheet ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: service account `client_email`
   - `GOOGLE_PRIVATE_KEY`: complete `private_key` value, including BEGIN/END lines. Preserve newline characters; if entered as one line, use `\n`.
   - `GOOGLE_DATASET_RANGE`: `Dataset!A:L`
   - `GOOGLE_RESPONSES_RANGE`: `Responses!A:K`
4. Apply variables to Production (and Preview if wanted), save, then redeploy.

## E. Test
1. Open your Vercel URL.
2. Enter a test code such as `TEST-001`.
3. Complete and submit a scenario.
4. Check the `Responses` tab for a new row.

## Dataset columns
`scenario_id, title, intro, background, evidence_json, question, options_json, condition, ai_advice, ai_recommendation, ai_confidence, claims_json`

The `evidence_json`, `options_json`, and `claims_json` columns contain JSON arrays. See the sample CSV for examples.

## Important
- All five sample cases and AI messages are fictional placeholders, not validated DetectBench items or approved research stimuli.
- Scenario order is shuffled. Experimental condition assignment is **not** randomized yet; each row's `condition` label is simply displayed/saved.
- This is a prototype. Before real participant data collection, obtain required IRB/ethics approval, consent language, access controls, and a data-retention plan.
- Do not collect names or sensitive identifiers in participant codes.
