// Why the backend cannot reach the outside world, answered from inside the
// container that cannot reach it.
//
//   docker compose exec -T backend node /app/backend/src/diagnose-network.cjs
//
// Run this when calls to the AI provider fail with `TypeError: fetch failed`.
// That message is all Node gives the log — the reason lives in the error's
// `cause`, which describeError drops before writing — so without something like
// this the only way forward is guessing. It has cost this project several
// rounds of exactly that.
//
// This does two jobs, and the second is what makes it worth committing: it
// reports where a connection fails, AND it tries the candidate fixes so the
// answer comes back proven on the machine that has the problem, rather than
// assumed on one that does not.
//
// WHY IT LIVES IN src/. This is not application code and does not belong here
// on merit. It is here because `docker-compose.yml` bind-mounts three paths
// into the container — `backend/src`, `shared`, and `backend/data` — and this
// is the only one of the three that is committed source. Put anywhere else, a
// `git pull` on the server would not reach the running container and whoever is
// debugging would have to rebuild the image first.
//
// WHY .cjs. `backend/package.json` sets `"type": "module"`, so a plain `.js`
// file here is loaded as an ES module and `require` throws.
//
// It is never imported by the server, so `tsx watch` does not load it.

const dns = require("node:dns").promises;
const dnsCallback = require("node:dns");
const net = require("node:net");
const os = require("os");
const { execFile } = require("node:child_process");

// Everything the backend must be able to reach, and one control.
//
// Supabase is the control on purpose: it kept working while the AI providers
// did not, and any theory has to explain the difference. It also publishes no
// AAAA record, which turned out to be the whole story.
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
 * milliseconds; a dropped packet takes seconds. Those are different faults with
 * different fixes, and the number is what tells them apart.
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

/** What `dns.lookup` hands the connect logic, in the order it hands it over. */
function lookupOrder(host) {
  return new Promise((resolve) => {
    dnsCallback.lookup(host, { all: true }, (err, addrs) => {
      if (err || !addrs) return resolve(null);
      resolve(addrs.map((a) => a.family));
    });
  });
}

/**
 * A real `fetch`, in a child Node process, optionally with extra flags.
 *
 * The rest of this file exercises `net.connect`, and the application does not:
 * it calls `fetch`, which is undici, which has its own connection logic and its
 * own idea of how to pick an address family. A `net.connect` result is
 * suggestive, not conclusive, and the whole point of this script is to stop
 * shipping suggestive.
 *
 * A child process because `--dns-result-order` is a startup flag: it cannot be
 * turned on inside a process that is already running, so the only honest way to
 * ask "would that flag fix this" is to start a process that has it.
 */
function fetchTest(host, flags) {
  return new Promise((resolve) => {
    const code =
      "fetch('https://" +
      host +
      "',{signal:AbortSignal.timeout(8000)})" +
      ".then(r=>console.log('OK '+r.status))" +
      ".catch(e=>console.log('GAGAL '+((e.cause&&(e.cause.code||e.cause.message))||e.message)))";

    execFile(
      process.execPath,
      [...flags, "-e", code],
      { timeout: 20000 },
      (err, stdout) => {
        const out = String(stdout || "").trim();
        resolve(out || (err ? "ERROR " + err.message : "tidak ada keluaran"));
      },
    );
  });
}

const show = (label, r) => `  ${label.padEnd(22)} ${r.outcome} (${r.ms}ms)`;

async function main() {
  const v6 = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv6" && !i.internal)
    .map((i) => i.address);

  console.log("=".repeat(66));
  console.log("  Diagnosa jaringan container SASANA");
  console.log("=".repeat(66));
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

    // Which family dns.lookup puts first is the thing that decides what the
    // connect logic reaches for, and it differs between C libraries. Printing
    // it turns "why does it pick that one" from a guess into a fact.
    const order = await lookupOrder(host);
    console.log("  urutan lookup:", order ? order.join(",") : "gagal", order ? "(4=IPv4, 6=IPv6)" : "");

    const row = { name, host, v4: null, v6: null, byName: null, noAuto: null, forced4: null };

    // By address and by family: name resolution and family selection are out of
    // the picture, so whatever this reports is the network itself.
    if (a4[0]) {
      row.v4 = await attempt({ host: a4[0], port: PORT, family: 4 });
      console.log(show("IPv4 langsung:", row.v4));
    }
    if (a6[0]) {
      row.v6 = await attempt({ host: a6[0], port: PORT, family: 6 });
      console.log(show("IPv6 langsung:", row.v6));
    }

    // How the application actually connects today.
    row.byName = await attempt({ host, port: PORT });
    console.log(show("lewat nama:", row.byName));

    // The two candidate fixes, tried here so the answer is proven on this
    // machine rather than assumed on another.
    row.noAuto = await attempt({ host, port: PORT, autoSelectFamily: false });
    console.log(show("nama, autoselect off:", row.noAuto));

    row.forced4 = await attempt({ host, port: PORT, family: 4 });
    console.log(show("nama, dipaksa IPv4:", row.forced4));

    // And the thing the application actually does, which is the only result
    // that settles anything.
    row.fetchPlain = await fetchTest(host, []);
    console.log("  fetch apa adanya:      " + row.fetchPlain);

    row.fetchIpv4First = await fetchTest(host, ["--dns-result-order=ipv4first"]);
    console.log("  fetch + ipv4first:     " + row.fetchIpv4First);

    results.push(row);
  }

  verdict(results, v6);
}

/**
 * What the numbers mean, so the person running this does not have to ask.
 *
 * Deliberately cautious: it names the shape it recognises and what to do next,
 * and says plainly when it recognises nothing. Two confident wrong diagnoses
 * have already been paid for on this deployment; a fourth guess dressed as a
 * conclusion would cost more than an honest "unknown".
 */
function verdict(results, v6) {
  const ok = (r) => r && r.outcome === "OK";
  // Two different things mean "the packets went nowhere", and only one of them
  // is the word TIMEOUT. `TIMEOUT` is this script's own cap firing; the kernel
  // usually gives up first and raises `ETIMEDOUT` through the error handler.
  const hangs = (r) => r && (r.outcome === "TIMEOUT" || r.outcome === "ETIMEDOUT");

  const fetchOk = (s) => typeof s === "string" && s.startsWith("OK");
  const control = results.find((r) => r.name === "Supabase");

  console.log("");
  console.log("=".repeat(66));
  console.log("  Bacaan");
  console.log("=".repeat(66));

  // `fetch` is what the application calls, so its result outranks everything
  // else here. A net.connect that succeeds while fetch fails would mean the
  // fault is above the socket, and saying otherwise would send the next person
  // down the wrong path again.
  const fetchBroken = results.filter((r) => !fetchOk(r.fetchPlain));

  if (!fetchBroken.length) {
    console.log("Semua tujuan tersambung, termasuk lewat fetch - yang persis dipakai");
    console.log("aplikasi. Jaringan bukan penyebabnya: cari di kunci API, kuota,");
    console.log("atau konfigurasi provider.");
    console.log("");
    return;
  }

  if (fetchBroken.every((r) => fetchOk(r.fetchIpv4First))) {
    console.log("TERBUKTI DI MESIN INI. fetch gagal apa adanya, dan fetch yang sama");
    console.log("berhasil begitu Node dipaksa mendahulukan IPv4:");
    console.log("");
    for (const r of fetchBroken) {
      console.log("  " + r.name);
      console.log("    apa adanya : " + r.fetchPlain);
      console.log("    ipv4first  : " + r.fetchIpv4First);
    }
    console.log("");
    console.log("PERBAIKAN - tambahkan di docker-compose.yml, di bagian");
    console.log("environment: milik service backend:");
    console.log("");
    console.log("    NODE_OPTIONS: --dns-result-order=ipv4first");
    console.log("");
    console.log("Lalu jalankan:");
    console.log("    docker compose up -d --force-recreate backend");
    console.log("");
    console.log("Harus --force-recreate, bukan restart: env dibaca saat container dibuat.");
    console.log("");
    return;
  }

  const broken = results.filter((r) => !ok(r.byName));
  const reachableByAddress = broken.length && broken.every((r) => ok(r.v4));
  const forcedIpv4Works = broken.length && broken.every((r) => ok(r.forced4));
  const noAutoWorks = broken.length && broken.every((r) => ok(r.noAuto));

  if (reachableByAddress && forcedIpv4Works) {
    console.log("Jaringannya TIDAK diblokir: lewat alamat IPv4 semuanya tersambung,");
    console.log("dan penyambungan lewat nama berhasil begitu dipaksa IPv4.");
    console.log("Tetapi fetch tetap gagal, jadi memaksa IPv4 saja belum tentu cukup.");
    console.log("Kirimkan keluaran ini apa adanya - baris 'fetch' yang menentukan.");
    if (noAutoWorks) {
      console.log("");
      console.log("Yang bisa dicoba: --no-network-family-autoselection di NODE_OPTIONS.");
    }
  } else if (reachableByAddress && !forcedIpv4Works) {
    console.log("Lewat alamat IPv4 tersambung, tetapi lewat nama tetap gagal walau");
    console.log("dipaksa IPv4. Berarti masalahnya di resolusi nama, bukan di rute.");
    console.log("Bandingkan baris 'urutan lookup' dengan 'A' di atas.");
  } else if (!reachableByAddress && ok(control && control.v4)) {
    console.log("Alamat IPv4 penyedia AI tidak tersambung sementara Supabase bisa.");
    console.log("Penyaringannya per tujuan. Bandingkan dengan host: kalau host bisa");
    console.log("dan container tidak, yang bermasalah jalur keluar container.");
  } else {
    console.log("Pola ini belum dikenali. Kirimkan seluruh keluaran di atas apa adanya;");
    console.log("angka milidetik dan nama kesalahannya yang membedakan penyebabnya.");
  }

  if (!v6.length && results.some((r) => hangs(r.byName))) {
    console.log("");
    console.log("Catatan: container tidak punya alamat IPv6, tetapi penyambungan lewat");
    console.log("nama tetap menggantung. Itu wajar - daftar dari lookup masih memuat");
    console.log("alamat IPv6, dan mencobanya di jaringan tanpa IPv6 berakhir menunggu.");
  }
  console.log("");
}

main().catch((err) => {
  console.error("Diagnosa gagal dijalankan:", err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
