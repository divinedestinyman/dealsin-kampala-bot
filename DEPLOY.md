# DealsInKampala Bot — Deployment Notes

## Production URL
https://dealsinkampala.vercel.app

## Webhook Endpoint
https://dealsinkampala.vercel.app/api/webhook

## Vercel Project
- Project name: `dealsinkampala`
- Team: `divinedestinyman-9481s-projects`

## Required Environment Variables (set in Vercel dashboard)
| Variable | Description |
|---|---|
| `BOT_TOKEN` | Telegram bot token from @BotFather |
| `WEBHOOK_SECRET` | Random hex string for webhook auth |
| `WEBHOOK_URL` | This deployment's base URL |

## Re-registering the Webhook
After any domain change, run locally with `.env.local` set:
```bash
npx tsx scripts/setup-webhook.ts
```

## Local Development
Copy `.env.example` → `.env.local`, fill values, then:
```bash
npm run dev
```
