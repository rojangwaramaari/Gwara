export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: number;
  videoId: string;
};

/*
  Add a song with ONE line to one of these arrays.

  IMPORTANT:
  Only use YouTube videos you have the right to use, or uploads from
  the rights holder with embedding enabled. Do not use unofficial copies.

  duration is the expected duration in seconds and is used as a fallback
  until the YouTube player reports its actual duration.
*/

export const playlists: Record<string, Track[]> = {
  "Golden Memories": [
    // { id: "gm-01", title: "Your licensed track", artist: "Artist", film: "Film", year: 2000, duration: 240, videoId: "YOUR_VIDEO_ID" },
  ],
  "Roadside Radio": [
    // { id: "rr-01", title: "Your licensed track", artist: "Artist", film: "Film", year: 2001, duration: 230, videoId: "YOUR_VIDEO_ID" },
  ],
  "Late Night": [
    // { id: "ln-01", title: "Your licensed track", artist: "Artist", film: "Film", year: 2002, duration: 250, videoId: "YOUR_VIDEO_ID" },
  ],
};