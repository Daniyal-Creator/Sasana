// The serverless entry point (ADR-0018, whose hosting decision ADR-0023
// superseded).
//
// A serverless host - Vercel's Hono preset is the one this was written for -
// looks for `src/index.ts` and expects the app itself as a default export,
// which it then invokes per request. That is the whole file: importing it must
// have no side effect, or such an invocation would try to bind a port.
//
// Nothing in this repository points a deployment at it any more. Production is
// one school server behind nginx, and ADR-0023 deliberately does not claim how
// the backend is started there. The file is kept rather than deleted because it
// costs one re-export, and because the shape it requires - an app that binds no
// port - is the one `src/app.ts` is built to anyway.
//
// Running the server as a long-lived process - locally, or in the development
// container - is `src/server.ts` instead, which is what `npm run dev` and
// `npm run start` point at.

export { default } from "@/app";
