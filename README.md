# AI Hunter-News

AI Hunter-News is a phone-first reader for brief, original summaries of public AI reporting. It links readers to the publisher for each full article; it does not host full article text, use a backend, or send story text to a model or service.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, or serve that build locally with `npm run preview`.

The Vite development and preview servers proxy the eight publisher feeds through `/feeds/{source}` to avoid browser CORS restrictions. A static host without this Node proxy is expected to show the cached edition or bundled fallback when feed requests fail.

## Reading experience

- Browse the home feed, six topic editions, publisher sources, and device-only saved stories.
- Search headlines, summaries, and publisher names; topic filters work together with search.
- Read a concise briefing, then follow a clearly labeled link to the publisher's article.
- Revisit a bundled edition if publishers are temporarily unavailable.

The local edition is derived from public RSS, Atom, and Anthropic news-page metadata. Feed images are displayed only when a source provides one; otherwise the reader uses the publisher's source plate.
