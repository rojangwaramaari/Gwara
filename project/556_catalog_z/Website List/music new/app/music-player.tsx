"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode, RefObject } from "react";
import type { Track } from "./music-data";
import { playlists } from "./music-data";

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

const API_SRC = "https://www.youtube.com/iframe_api";

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function trackKey(track: Track | undefined) {
  return track?.id ?? "empty";
}

function sendAnalytics(name: string, payload: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nostalgia:analytics", { detail: { name, ...payload } }));
  }
}

export default function MusicPlayer() {
  const [playlistName, setPlaylistName] = useState(Object.keys(playlists)[0]);
  const tracks = playlists[playlistName] ?? [];
  const [trackIndex, setTrackIndex] = useState(0);
  const track = tracks[trackIndex];

  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(track?.duration ?? 0);
  const playerRef = useRef<YTPlayer | null>(null);
  const desktopHostRef = useRef<HTMLDivElement | null>(null);
  const mobileHostRef = useRef<HTMLDivElement | null>(null);
  const activeHostRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const apiPromiseRef = useRef<Promise<void> | null>(null);
  const currentVideoRef = useRef<string | null>(null);
  const suppressAutoplayRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      try {
        const now = player.getCurrentTime();
        const actualDuration = player.getDuration();
        setElapsed(now || 0);
        if (actualDuration > 0) setDuration(actualDuration);
      } catch {}
    }, 400);

    return () => window.clearInterval(id);
  }, []);

  const loadYouTubeAPI = useCallback(() => {
    if (window.YT?.Player) return Promise.resolve();

    if (apiPromiseRef.current) return apiPromiseRef.current;

    apiPromiseRef.current = new Promise<void>((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };

      const existing = document.querySelector(`script[src="${API_SRC}"]`);
      if (!existing) {
        const script = document.createElement("script");
        script.src = API_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
    });

    return apiPromiseRef.current;
  }, []);

  const nextTrack = useCallback(() => {
    if (!tracks.length) return;
    const next = (trackIndex + 1) % tracks.length;
    setTrackIndex(next);
  }, [trackIndex, tracks.length]);

  const previousTrack = useCallback(() => {
    if (!tracks.length) return;
    setTrackIndex((index) => (index - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => {
      activeHostRef.current = media.matches ? desktopHostRef.current : mobileHostRef.current;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!track) {
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
      setPlaying(false);
      return;
    }

    let cancelled = false;

    loadYouTubeAPI().then(() => {
      if (cancelled || !activeHostRef.current || !window.YT?.Player) return;

      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
      setElapsed(0);
      setDuration(track.duration);
      currentVideoRef.current = track.videoId;

      playerRef.current = new window.YT.Player(activeHostRef.current, {
        videoId: track.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            setReady(true);
            const actual = event.target.getDuration();
            if (actual > 0) setDuration(actual);
          },
          onStateChange: (event) => {
            if (!window.YT) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setPlaying(false);
              nextTrack();
            }
          },
          onError: (event) => {
            sendAnalytics("youtube_track_error", {
              code: event.data,
              videoId: currentVideoRef.current,
              trackId: track.id,
            });
            nextTrack();
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [trackKey(track), loadYouTubeAPI, nextTrack]);

  useEffect(() => {
    if (!track) return;

    if (suppressAutoplayRef.current) {
      suppressAutoplayRef.current = false;
      return;
    }

    setPlaying(false);
  }, [trackKey(track)]);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player || !ready) return;

    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [playing, ready]);

  const seekFromPointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const player = playerRef.current;
    const rail = progressRef.current;
    if (!player || !rail || !duration) return;

    const rect = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    player.seekTo(ratio * duration, true);
    setElapsed(ratio * duration);
  }, [duration]);

  const progress = duration ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;

  const switchPlaylist = (name: string) => {
    suppressAutoplayRef.current = true;
    playerRef.current?.stopVideo();
    setPlaylistName(name);
    setTrackIndex(0);
    setElapsed(0);
    setPlaying(false);
  };

  const desktopVinylStyle = useMemo(
    () => ({ animationPlayState: playing ? "running" : "paused" as const }),
    [playing]
  );

  return (
    <section className="safe-bottom fixed inset-x-0 z-20 flex justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="mb-3 flex justify-center gap-2">
          {Object.keys(playlists).map((name) => (
            <button
              key={name}
              onClick={() => switchPlaylist(name)}
              className={`rounded-full border px-3 py-1 text-[10px] tracking-[0.12em] transition ${
                playlistName === name
                  ? "border-white/25 bg-white/15 text-white"
                  : "border-white/10 bg-black/15 text-white/55 hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {!track ? (
          <EmptyPlayer />
        ) : (
          <>
            <DesktopPlayer
              track={track}
              playing={playing}
              ready={ready}
              progress={progress}
              elapsed={elapsed}
              duration={duration}
              hostRef={desktopHostRef}
              desktopVinylStyle={desktopVinylStyle}
              progressRef={progressRef}
              onSeek={seekFromPointer}
              onToggle={togglePlayback}
              onPrevious={previousTrack}
              onNext={nextTrack}
            />

            <MobilePlayer
              track={track}
              playing={playing}
              ready={ready}
              progress={progress}
              elapsed={elapsed}
              duration={duration}
              hostRef={mobileHostRef}
              progressRef={progressRef}
              onSeek={seekFromPointer}
              onToggle={togglePlayback}
              onPrevious={previousTrack}
              onNext={nextTrack}
            />
          </>
        )}

        <div className="mt-2 text-center text-[9px] tracking-[0.16em] text-white/35">
          YOUTUBE PLAYER • RIGHTS-HOLDER UPLOADS ONLY
        </div>
      </div>
    </section>
  );
}

function EmptyPlayer() {
  return (
    <div className="glass rounded-[26px] p-6 text-center">
      <div className="text-sm font-semibold">Your nostalgia station is ready.</div>
      <p className="mt-1 text-xs text-white/55">
        Add a rights-cleared YouTube video to <code>app/music-data.ts</code>.
      </p>
    </div>
  );
}

type PlayerProps = {
  track: Track;
  playing: boolean;
  ready: boolean;
  progress: number;
  elapsed: number;
  duration: number;
  hostRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLDivElement | null>;
  desktopVinylStyle?: CSSProperties;
  onSeek: (event: PointerEvent<HTMLDivElement>) => void;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

function Artwork({ track, hostRef, mobile = false }: { track: Track; hostRef: RefObject<HTMLDivElement | null>; mobile?: boolean }) {
  return (
    <div className={mobile ? "mobile-yt relative shrink-0" : "yt-frame relative h-20 w-20 shrink-0"}>
      <div ref={hostRef} title={`${track.title} — ${track.artist}`} />
      <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/15" />
      {!mobile && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" />
      )}
    </div>
  );
}

function DesktopPlayer({
  track, playing, ready, progress, elapsed, duration, hostRef, desktopVinylStyle,
  progressRef, onSeek, onToggle, onPrevious, onNext,
}: PlayerProps) {
  return (
    <div className="glass hidden items-center rounded-full p-3 pr-5 sm:flex">
      <div className="relative">
        <div className={`vinyl-spin rounded-full ${playing ? "" : "paused"}`} style={desktopVinylStyle}>
          <Artwork track={track} hostRef={hostRef} />
        </div>
      </div>

      <div className="min-w-0 flex-1 px-4">
        <div className="truncate text-[15px] font-semibold">{track.title}</div>
        <div className="truncate text-[12.5px] text-white/70">{track.artist}</div>

        <SeekBar progress={progress} progressRef={progressRef} onSeek={onSeek} />

        <div className="mt-[-2px] flex justify-between text-[10.5px] tabular-nums text-white/50">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Transport ready={ready} playing={playing} onToggle={onToggle} onPrevious={onPrevious} onNext={onNext} />
    </div>
  );
}

function MobilePlayer({
  track, playing, ready, progress, elapsed, duration, hostRef, progressRef, onSeek, onToggle, onPrevious, onNext,
}: PlayerProps) {
  return (
    <div className="glass rounded-[26px] p-4 sm:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <div className="vinyl-spin shrink-0" style={{ animationPlayState: playing ? "running" : "paused" }}>
          <Artwork track={track} hostRef={hostRef} mobile />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold">{track.title}</div>
          <div className="truncate text-[12.5px] text-white/70">{track.artist}</div>
          <div className="mt-1 truncate text-[10px] text-white/40">{track.film} • {track.year}</div>
        </div>
      </div>

      <SeekBar progress={progress} progressRef={progressRef} onSeek={onSeek} />

      <div className="mt-1 flex items-center justify-between">
        <div className="text-[10.5px] tabular-nums text-white/50">
          {formatTime(elapsed)} / {formatTime(duration)}
        </div>
        <Transport ready={ready} playing={playing} onToggle={onToggle} onPrevious={onPrevious} onNext={onNext} />
      </div>
    </div>
  );
}

function SeekBar({
  progress,
  progressRef,
  onSeek,
}: {
  progress: number;
  progressRef: RefObject<HTMLDivElement | null>;
  onSeek: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      ref={progressRef}
      onPointerDown={onSeek}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      tabIndex={0}
      className="seek-track relative my-1 h-6 w-full select-none touch-none"
    >
      <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/15" />
      <div
        className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgba(244,179,94,0.75)]"
        style={{ width: `${progress}%` }}
      />
      <div
        className="seek-knob absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgba(244,179,94,0.9)]"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

function Transport({
  ready,
  playing,
  onToggle,
  onPrevious,
  onNext,
}: {
  ready: boolean;
  playing: boolean;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <IconButton label="Previous" onClick={onPrevious}>
        <PrevIcon />
      </IconButton>
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        disabled={!ready}
        onClick={onToggle}
        className="flex h-[52px] w-[52px] min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gradient-to-b from-accent-soft to-accent text-black ring-1 ring-white/25 shadow-[0_8px_24px_-5px_rgba(244,179,94,0.7)] transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <IconButton label="Next" onClick={onNext}>
        <NextIcon />
      </IconButton>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function PlayIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10-6.8c.6-.4.6-1.3 0-1.7l-10-6.8C8.9 4 8 4.4 8 5.2Z"/></svg>;
}
function PauseIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z"/></svg>;
}
function PrevIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 5v14M18 6l-8 6 8 6V6Z"/></svg>;
}
function NextIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 5v14M6 6l8 6-8 6V6Z"/></svg>;
}