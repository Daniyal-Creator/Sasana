// Why the backend cannot reach the outside world, answered from inside the
// container that cannot reach it.
//
//   docker compose exec -T backend node /app/backend/src/diagnose-network.cjs
//
// Run this when calls to the AI provider fail with `TypeError: fetch failed`.
// That message is all Node gives the log — the reason lives in the error's
// `cause`, which is thrown away before it is written — so without something
// like this the only way forward is guessing. It has cost this project several
// rounds of exactly that.
//
// WHY IT LIVES IN src/. This is not application code and does not belong here
// on merit. It is here because `docker-compose.yml` bind-mounts three paths
// into the container — `backend/src`, `shared`, and `backend/data` — and this
// is the only one of the three that is committed source. Put anywhere else, a
// `git pull` on the server would not reach the running container and whoever is
// debugging would have to rebuild the image first. Two steps instead of four,
// for someone working under pressure on a machine that is already misbehaving.
//
// WHY .cjs. `backend/package.json` sets `"type": "module"`, so a plain `.js`
// file here is loaded as an ES module and `require` throws. Nothing is imported
// from the app, so there is no reason to make this a module.
//
// It is never imported by the server, so `tsx watch` does not load it and it
// costs the running process nothing.

const dns = require("node:dns").promises;
const net = require("node:net");
const os = require("os");

// Everything the backend must be able to reach, and one control.
//
// Supabase is the control on purpose: it is the host that kept working while
// the AI providers did not, and the difference between them is what any theory
// has to explain. It also has no AAAA record, which is itself a clue.
const HOSTS = [
  ["Google AI", "generativelanguage.googleapis.com"],
  ["KoboiLLM", "lite.koboillm.com"],
  ["Supabase", "aws-0-ap-northeast-2.pooler.supabase.com"],
];

const PORT = 443;
const TIMEOUT_MS = 8000;

/**
 * One TCP connection attempt, reported with how long it took.
 *
 * The duration is not decoration. A refused connection comes back in
 * milliseconds; a dropped packet takes the full timeout. Those are different
 * faults with different fixes, and the number is what tells them apart.
 */
function attempt(options) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = net.connect(options);
    const finish = (outcome) => {
      socket.destroy();
      resolve({ outcome, ms: Date.now() - started });
    };
    socket.setTimeout(TIMEOUT_MS);
    socket.on("connect", () => finish("OK"));
    socket.on("timeout", () => finish("TIMEOUT"));
    socket.on("error", (err) => finish(err.code || err.message));
  });
}

const show = (label, r) => `  ${label.padEnd(15)} ${r.outcome} (${r.ms}ms)`;

async function main() {
  const v6 = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv6" && !i.internal)
    .map((i) => i.address);

  console.log("=".repeat(64));
  console.log("  Diagnosa jaringan container SASANA");
  console.log("=".repeat(64));
  console.log("IPv6 di container :", v6.length ? v6.join(", ") : "TIDAK ADA");
  console.log("Batas waktu       :", TIMEOUT_MS + "ms per percobaan");

  const results = [];

  for (const [name, host] of HOSTS) {
    console.log("");
    console.log(`--- ${name}  (${host})`);

    let a4 = [];
    let a6 = [];
    try {
      a4 = await dns.resolve4(host);
    } catch (err) {
      console.log("  A     : GAGAL", err.code || err.message);
    }
    try {
      a6 = await dns.resolve6(host);
    } catch {
      // No AAAA is a normal, informative answer, not a failure.
    }

    if (a4.length) console.log("  A     :", a4[0]);
    console.log("  AAAA  :", a6[0] || "tidak ada");

    const row = { name, v4: null, v6: null, byName: null };

    // By address and by family, so name resolution and family selection are out
    // of the picture: whatever this reports is the network itself.
    if (a4[0]) {
      row.v4 = await attempt({ host: a4[0], port: PORT, family: 4 });
      console.log(show("IPv4 langsung:", row.v4));
    }
    if (a6[0]) {
      row.v6 = await attempt({ host: a6[0], port: PORT, family: 6 });
      console.log(show("IPv6 langsung:", row.v6));
    }

    // And the way the application actually connects, for comparison.
    row.byName = await attempt({ host, port: PORT });
    console.log(show("lewat nama   :", row.byName));

    results.push(row);
  }

  verdict(results, v6);
}

/**
 * What the numbers mean, so the person running this does not have to ask.
 *
 * Deliberately conservative: it names the shape it recognises and says what to
 * check next, rather than declaring a cause. Two confident wrong diagnoses have
 * already been paid for on this deployment.
 */
function verdict(results, v6) {
  const providers = results.filter((r) => r.name !== "Supabase");
  const control = results.find((r) => r.name === "Supabase");

  const ok = (r) => r && r.outcome === "OK";

  // Two different things mean "the packets went nowhere", and only one of them
  // is the word TIMEOUT. `TIMEOUT` is this script's own 8s cap firing; the
  // kernel usually gives up first and raises `ETIMEDOUT`, which arrives through
  // the error handler instead. The affected server reports the second one, so
  // matching only the first would have made this verdict miss the very case it
  // was written for.
  const hangs = (r) => r && (r.outcome === "TIMEOUT" || r.outcome === "ETIMEDOUT");

  console.log("");
  console.log("=".repeat(64));
  console.log("  Bacaan");
  console.log("=".repeat(64));

  const v4Fine = providers.every((r) => ok(r.v4));
  const v6Hangs = providers.some((r) => hangs(r.v6));
  const v4Hangs = providers.some((r) => hangs(r.v4));

  if (v4Fine && v6Hangs) {
    console.log("IPv4 tersambung, IPv6 menggantung sampai batas waktu.");
    console.log("Ini cocok dengan container yang punya alamat IPv6 tanpa rute keluar:");
    console.log("koneksi mencoba IPv6 lebih dulu lalu mentok. Perbaikannya memaksa");
    console.log("Node mendahulukan IPv4, atau mencabut IPv6 dari container.");
  } else if (v4Hangs && ok(control && control.v4)) {
    console.log("IPv4 ke penyedia AI menggantung, tetapi ke Supabase tersambung.");
    console.log("Bukan IPv6, dan bukan port 443 secara umum - penyaringannya per tujuan.");
    console.log("Bandingkan dengan host: kalau host bisa dan container tidak, yang");
    console.log("bermasalah jalur keluar container, bukan servernya.");
  } else if (results.every((r) => ok(r.byName))) {
    console.log("Semua tujuan terjangkau. Jaringan bukan penyebabnya - cari di");
    console.log("kunci API, kuota, atau konfigurasi provider.");
  } else {
    console.log("Pola ini belum dikenali. Kirimkan seluruh keluaran di atas apa adanya;");
    console.log("angka milidetik dan nama kesalahannya yang membedakan penyebabnya.");
  }

  if (!v6.length) {
    console.log("");
    console.log("Catatan: container ini tidak punya IPv6 sama sekali, jadi percobaan");
    console.log("IPv6 gagal seketika (ENETUNREACH) dan tidak pernah menggantung.");
  }
  console.log("");
}

main().catch((err) => {
  console.error("Diagnosa gagal dijalankan:", err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
