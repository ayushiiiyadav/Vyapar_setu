# Vyapar Setu (व्यापार सेतु)

A voice-enabled inventory, billing and udhaar (credit) app for small Indian kirana stores. The owner can ask questions by voice in **Hindi, English, Marathi or Telugu** and get a spoken answer from the shop's real data.

> Live link: _(add here once deployed)_

## Why this project

In the kirana stores I visited, the owner or a family member runs everything, tracks stock and credit in notebooks, and is often more comfortable in their own language than in English-only software. Vyapar Setu is built for that one person at the counter: big buttons, icons, their own language on every screen, and a voice assistant that answers questions like "how much rice is left?" without reading any menu.

## Features

**Voice assistant**
- Tap the mic and speak in Hindi, English, Marathi or Telugu
- Answers stock, low-stock, expiring-soon, today's sales, udhaar-total and per-customer questions
- Opens pages ("how do I make a bill?") and explains what to tap
- Add stock by voice, with a read-back and a Yes/No confirmation before anything is saved
- Replies are shown as text and spoken aloud; spoken replies can be turned off in Settings

**Shop management**
- **Billing:** tap items, choose cash or udhaar, and stock reduces automatically; sales larger than the available stock are refused
- **Stock and catalog:** search-as-you-type from a built-in catalog of common items and brands, with icons and names in four languages; custom items can be added too
- **Purchases:** record stock arriving, with supplier, purchase price and an optional expiry date
- **Udhaar ledger:** who owes how much, partial payments, and a payment reminder that opens WhatsApp with a ready-written message in the selected language
- **Dashboard and reports:** sales totals, 7-day trend, stock health, alerts for low, out and expiring items, best sellers, cash vs udhaar split, and estimated profit
- **Settings:** language, text size, spoken replies on or off; **Report an issue** form that saves to the database

## How the voice assistant works

```
Mic (browser) → /api/assistant/transcribe → Whisper (Groq)  → text
text → /api/assistant/ask → AI model picks the intent (what is being asked)
       → code matches the item by its names in all four languages
       → code reads the real numbers from MongoDB
       → a fixed sentence template for the chosen language builds the reply
reply → /api/assistant/speak → Gemini text-to-speech → audio played in the browser
        (falls back to the browser's own voice if the service is unavailable)
```

The AI model only decides **what the question is about**. The numbers always come from the database and the sentences from fixed templates, so the assistant cannot invent a stock figure.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken), passwords hashed with bcryptjs |
| Charts | Recharts |
| Speech to text | Whisper (`whisper-large-v3`) via Groq |
| Understanding | Groq-hosted chat model (`openai/gpt-oss-20b`, with fallback) |
| Text to speech | Google Gemini TTS |

## Languages

Hindi, English, Marathi and Telugu, on every screen and in the voice assistant. Example questions:

| Language | Example |
|---|---|
| Hindi | चावल कितना बचा है? |
| Marathi | तांदूळ किती शिल्लक आहे? |
| Telugu | బియ్యం ఎంత మిగిలి ఉన్నాయి? |
| English | How much rice is left? |

Hindi and English are tested. The Marathi and Telugu wording was written for this project and is pending review by native speakers, so those two are best treated as beta.

## Getting started

**Requirements:** a recent Node.js (20 or newer), MongoDB (local or a hosted cluster), and a Chrome or Edge browser with microphone permission.

```bash
git clone https://github.com/ayushiiiyadav/Vyapar_setu.git
cd Vyapar_setu
npm install
```

Create a file named `.env.local` in the project root (see the table below), then:

```bash
npm run dev
```

Open http://localhost:3000, create an account, and start adding items.

**Demo data:** in development mode, Settings → *Load demo data* fills the shop with about 25 items, 45 sales over 14 days, sample udhaar customers and purchases. It replaces the shop's current data and is disabled in production.

### Environment variables

Never commit real values. `.env.local` is ignored by Git.

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/vyapar-setu` |
| `JWT_SECRET` | Yes | Long random string used to sign login tokens |
| `GROQ_API_KEY` | Yes | Speech to text and question understanding |
| `GEMINI_API_KEY` | Yes | Spoken replies |
| `GROQ_CHAT_MODEL` | No | Overrides the default chat model |
| `GEMINI_VOICE` | No | Voice name (default `Kore`) |
| `GEMINI_TTS_MODEL` | No | Overrides the default speech model |
| `MONGO_DNS_FIX` | No | Set to `1` if your network blocks the DNS lookup used by Atlas `mongodb+srv` addresses |

## Project structure

```
app/
  api/            auth, products, sales, customers, payments, purchases,
                  reports, issues, assistant (transcribe, ask, speak), dev/seed
  billing/  dashboard/  feedback/  login/  products/  reports/  settings/  udhaar/
components/       AppShell, BottomNav, VoiceAssistant, LanguageProvider,
                  LangSwitch, Modal, Tilt, CountUp
lib/              auth, db, groq, gemini, catalog, categories, languages,
                  i18n, replies, text/ (screen text per language)
models/           user, product, sale, customer, payment, purchase, issue
```

## API overview

| Route | Purpose |
|---|---|
| `POST /api/auth/signup`, `/login` | Create account, log in |
| `GET, POST /api/products`, `PUT, DELETE /api/products/[id]` | Items |
| `GET, POST /api/sales` | Billing (reduces stock, adds udhaar for credit sales) |
| `GET /api/customers`, `POST /api/payments` | Udhaar ledger and payments |
| `GET, POST /api/purchases` | Stock arriving, with supplier, cost and expiry |
| `GET /api/reports` | Sales, trend, best sellers, profit |
| `GET, POST /api/issues` | Report an issue |
| `POST /api/assistant/transcribe`, `/ask`, `/speak` | Voice assistant pipeline |
| `POST /api/dev/seed` | Demo data (development only) |

## Quality checks

```bash
npx tsc --noEmit    # type check
npx eslint app components lib models
npm run build       # production build
```

Testing so far has been manual: test cases for billing, stock, udhaar and the voice assistant (including voice accuracy per language), plus the checks above. Automated tests are listed under future scope.

## Security notes

- Passwords are hashed with bcrypt; logins use JWT tokens that last 7 days
- Every database query is limited to the logged-in owner's shop
- Inputs are validated on the server, and secrets live only in environment variables
- Voice features send the spoken text, and item and customer names used to understand it, to the Groq and Google services

## Known limitations

- Each item holds one expiry date (the latest delivery); batch-wise tracking is not built
- Voice features need an internet connection and use free-tier limits; when the spoken-reply quota runs out, the written answer still appears and the app falls back to the browser's own voice
- WhatsApp reminders are prepared by the app and the owner taps Send (no automatic sending)
- Marathi and Telugu wording is awaiting native-speaker review
- Custom items the owner types in have no translated names
- Logins cannot be revoked before their 7 days end

## Future scope

- Batch-wise expiry tracking
- Barcode scanning to fill in product details
- Automatic WhatsApp reminders through the WhatsApp Business API, in each customer's language
- A phone-number field in billing for new udhaar customers
- Automated tests and fully typed database models
- Voice commands for more actions, always with a confirmation step
- More Indian languages, added with native-speaker review
- Hosted deployment

## Notes

Brand names in the catalog are common examples for demonstration, with no affiliation to the brands. Built by Ayushi ([@ayushiiiyadav](https://github.com/ayushiiiyadav)) as a final-year B.Tech Computer Science project .
