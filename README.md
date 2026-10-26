#ProtonAI

**Live demo:** https://protonai.vercel.app

Proton AI is a prototype business-analytics tool. You upload a sales or operations report (CSV or Excel), and it ranks which customers, products, regions and people your results depend on most. It also charts trends, flags risks such as heavy reliance on one partner, and writes a plain-language briefing with an AI model.

The idea: dashboards sort by size, but the biggest item is not always the one the business depends on most. Proton tries to surface the difference, without the user needing a data team or the right question to ask.

> **Status:** early prototype built to test the idea and as a portfolio project. Not production software.

## Try it

Open the live demo and click **Try with sample data** (a fictional restaurant group, 12 months of sales). Or upload your own CSV/Excel file with at least two category columns (for example product, location, channel) and one numeric measure (for example revenue). A date column adds trend charts.

## How it works (architecture)

There are only three moving parts.

```
 Your browser                     Vercel                    Google
┌─────────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ index.html          │   │ api/chat.js      │   │ Gemini API       │
│ (static page)       │──▶│ (serverless      │──▶│ (language model) │
│ reads the file,     │   │  function)       │   │                  │
│ scores the data,    │◀──│ holds the API    │◀──│                  │
│ draws the charts    │   │ key, retries     │   │                  │
└─────────────────────┘   └──────────────────┘   └──────────────────┘
```

**1. A static page (`index.html`).** One HTML file with no build step. When you upload a file, the page reads it, works out which columns are categories, numbers and dates, scores every item, and draws the charts, all inside your browser. It uses two open-source libraries loaded from a CDN: SheetJS (to read Excel files) and Chart.js (for charts).

**2. A serverless function (`api/chat.js`).** When you click "Explain & advise" or use the chat, the page sends a short summary of the results to this function. The function is the only part that talks to the AI. It runs on Vercel's servers, and visitors never see its code.

**3. The Gemini call.** The function forwards the request to Google's Gemini API and returns the answer to the page. It retries when Gemini is busy, can fall back to a second model, and tells the page when the model is overloaded so the user sees a clear message instead of a generic error.

### Why the API key is safe

The Gemini API key is stored as an **environment variable** in Vercel, not in the code or in this repository. The browser never sees it. This is also why the page calls a function instead of calling Gemini directly: a key placed in a web page can be read by anyone who opens it.

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key (required) |
| `GEMINI_MODEL` | Model name (defaults to `gemini-3.8-flash`) |
| `GEMINI_FALLBACK_MODEL` | Optional second model used if the first is overloaded |

## What the AI does and doesn't do

- The **scoring and charts are computed in the browser**. The AI does not do the analysis.
- The AI receives only a **summary** (the top-ranked items with their scores, values, shares and flags), never the raw rows of your file. That summary does travel through Vercel to Google's Gemini service.
- The AI turns those results into a briefing and answers follow-up questions. It can make reasonable guesses beyond the data, so treat its advice as hypotheses to check, not proven findings.

The scoring method itself is intentionally not documented here.

## Run it yourself

1. Fork or clone this repo.
2. Import it into Vercel (framework preset: **Other**).
3. Add `GEMINI_API_KEY` under Settings → Environment Variables, then redeploy.
4. Open your deployment and test the chat and the "Explain & advise" button.

To run locally, use the [Vercel CLI](https://vercel.com/docs/cli) (`vercel dev`) with a `.env.local` file containing your key. `.env` files are ignored by Git.

## Repository structure

```
index.html      The whole front end: upload, scoring, charts, chat UI
api/chat.js     Serverless function that calls Gemini
.gitignore      Keeps .env files out of the repo
```

## Known limitations

- **Heuristic settings.** The score weights and the thresholds for risk flags were chosen by judgment, not tuned.
- **Small items are noisy.** Items with few rows can look more dependent or more important than they are.
- **Trends ignore seasonality.** A seasonal spike can look like growth.
- **The chat endpoint is public** and has no rate limiting yet.
- Works best on transaction-level tables, not pre-aggregated summaries.

## Roadmap

- Backtest the scoring against later data and report how much it adds over sorting by revenue
- Move the AI instructions server-side and add rate limiting
- Source citations: label each recommendation as "from your data" or "hypothesis to check"
- Connectors for CRM, accounting and spreadsheet tools

## What I learned building it

- Separating browser-side work from a server-side function keeps secrets safe and keeps the page simple.
- Public AI endpoints need defensive handling: retries, a fallback model, and clear user-facing errors when the provider is overloaded.
- A demo needs sample data, because most visitors won't upload their own files.
- Honest limits make a prototype more credible than overclaiming.

## Author

Built by Devaraj (Dave) Iyer. Background in Artificial Intelligence and Business Analysis, MBA. 
