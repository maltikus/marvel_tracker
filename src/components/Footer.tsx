export default function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl leading-relaxed">
          This product uses the TMDB API but is not endorsed or certified by TMDB. An unofficial fan
          project with no affiliation to Marvel, Disney or TMDB. Timeline order is a defensible
          curation, not an official ordering.
        </p>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 font-semibold text-accent-soft hover:underline"
        >
          Data & images: TMDB ↗
        </a>
      </div>
    </footer>
  );
}
