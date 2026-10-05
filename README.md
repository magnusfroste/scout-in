# Scout-In — AI prospect research

> **Now part of [Flowwink](https://www.flowwink.com).** Scout-In was the prototype that proved the concept; it lives on as the **Sales Intelligence** module in Flowwink, the open-source Business Operating System — operable by any agent. New work happens there: [github.com/magnusfroste/flowwink](https://github.com/magnusfroste/flowwink).

Scout-In tested whether AI can do the homework before a sales conversation — in minutes instead of hours:

- **Company analysis** — what the prospect does, where it is heading, and where it hurts
- **Decision-maker insights** — who to talk to, and what they care about
- **Outreach strategy** — a personalized angle grounded in the research

What worked became the Sales Intelligence module in Flowwink, where research feeds directly into the CRM and the agents that act on it.

## Run the prototype

React · TypeScript · Vite · Supabase

```bash
npm install
# .env.local: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for your Supabase project
npx supabase db push   # apply the migrations
npm run dev
```

## License

MIT
