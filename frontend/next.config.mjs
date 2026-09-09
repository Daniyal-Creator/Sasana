/** @type {import('next').NextConfig} */
const nextConfig = {
  // A static export: `npm run build` writes a self-contained `out/` — real HTML
  // per route, plus the CSS, JS and images those pages reference — instead of a
  // bundle that only a Next.js server can serve (ADR-0019).
  output: "export",

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
