/** @type {import('next').NextConfig} */
const nextConfig = {
  // A static export: `npm run build` writes a self-contained `out/` — real HTML
  // per route, plus the CSS, JS and images those pages reference — instead of a
  // bundle that only a Next.js server can serve (ADR-0019).
  output: "export",

  // Every route is written as a directory with an `index.html` inside it —
  // `out/check/index.html`, not `out/check.html`. The static host in front of
  // production resolves a directory but never tries a bare `.html`, so without
  // this a reload of `/check` fell through to `out/index.html` and served the
  // landing page under a 200 (README, "How nginx must serve the frontend
  // export"). The nginx block written there is still the right fix; this makes
  // the export survive a host that has not had it applied yet.
  trailingSlash: true,

  // The export has no server, so there is nothing to resize an image on demand.
  // Without this, `next/image` fails the build rather than at run time, which is
  // the right moment to find out.
  images: { unoptimized: true },

  // `out/` is committed (ADR-0019), so the build has to be reproducible or every
  // rebuild would churn the diff for no reason. Next.js otherwise generates a
  // random build id per run and stamps it into a directory name and into every
  // page's HTML, which alone rewrote 15 files on a build with no code change.
  //
  // Cache correctness does not rest on this id: every chunk filename already
  // carries a content hash, so changed code still lands on a new URL.
  generateBuildId: () => "sasana",
};

export default nextConfig;
