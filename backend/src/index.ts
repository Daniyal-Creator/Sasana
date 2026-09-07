// The Vercel entry point (ADR-0018).
//
// Vercel's Hono preset looks for `src/index.ts` and expects the app itself as a
// default export, which it then invokes per request. That is the whole file:
// importing it must have no side effect, or a serverless invocation would try
// to bind a port.
//
// Running the server as a long-lived process - locally, or in the development
// container - is `src/server.ts` instead, which is what `npm run dev` and
// `npm run start` point at.

export { default } from "@/app";
