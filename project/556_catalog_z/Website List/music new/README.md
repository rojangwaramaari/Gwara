# Nostalgia Music

A single-page Next.js nostalgia music site using the YouTube IFrame Player API.

## Setup

```bash
npm install
npm run dev
```

Put your supplied background assets here:

- `public/bg/scene-wide.png`
- `public/bg/scene-tall.png`

## Add music

Edit `app/music-data.ts`.

Each song is one line:

```ts
{ id: "gm-01", title: "Your licensed track", artist: "Artist", film: "Film", year: 2000, duration: 240, videoId: "YOUR_VIDEO_ID" },
```

Only add videos you have the right to use, or videos uploaded by the rights holder with embedding enabled.

The player intentionally keeps the YouTube video visible in the artwork slot. It does not download/re-host thumbnails or hide the YouTube player.

## Notes

- `app/page.tsx` is a server component.
- `app/music-player.tsx` is the client component for YouTube/API state.
- Desktop and mobile players are separate blocks.
- YouTube `PLAYING`/`PAUSED` state controls the vinyl animation.
- `ENDED` advances to the next track.
- YouTube errors automatically skip the track and emit a `nostalgia:analytics` browser event.
