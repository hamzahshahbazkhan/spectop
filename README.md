# SPECTOP

Paste two laptop links from Amazon.in or Flipkart, tell it what you care about (gaming, battery, value for money…), and get back a spec-by-spec comparison with an AI verdict on which one to buy.

Live at [spectop.vercel.app](https://spectop.vercel.app/)

## How it works

```
You → Form → /api/fetch-laptop-data → /compare → /api/compare-laptops → Verdict
              (scrape both pages)       (reads both      (Gemini compares
               with headless             products from     them for your
               Chromium)                 context)          use case)
```

1. **Scrape** — each product page is loaded in headless Chromium and parsed (Amazon by page selectors, Flipkart by its embedded JSON-LD data plus the spec grid). One shared browser per request, both pages in parallel.
2. **Compare** — both spec sheets go into Gemini 2.5 Flash with a strict prompt that returns one JSON object: a standardized spec table, a 9-category comparison, and a written verdict.
3. **Render** — the compare page shows the verdict first, then the full spec table and expandable comparison cards.

## Tech

Next.js 14 (App Router) · React 18 · Tailwind · Puppeteer + serverless Chromium · Cheerio · Gemini 2.5 Flash · Vercel

## Run it locally

```bash
npm install
```

Get a key at [Google AI Studio](https://aistudio.google.com/apikey), then:

```bash
echo "API_KEY=paste-your-key-here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A comparison takes around a minute — scraping two full product pages plus the AI call is the bulk of that.

## Deploy

Push to `main` — Vercel auto-deploys. Set `API_KEY` in the project environment variables or comparisons will fail.

## Author

Built by [Hamzah Shahbaz Khan](https://github.com/hamzahshahbazkhan).
