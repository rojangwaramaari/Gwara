import MusicPlayer from "./music-player";
import Header from "./header";

export default function Page() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden text-white">
      <div aria-hidden="true" className="hero-bg fixed inset-0 -z-20" />
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-black/35 via-transparent to-black/80"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E\")",
        }}
      />

      <Header />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-72 bg-gradient-to-t from-black/55 to-transparent" />
      <MusicPlayer />
    </main>
  );
}