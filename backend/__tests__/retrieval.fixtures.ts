/**
 * Questions whose answering rule is not in doubt, in both languages.
 *
 * This is the yardstick for narrowing the prompt. Sending only the rules
 * retrieval finds is cheaper than sending all of them, but it is only safe if
 * retrieval reliably finds the rule that answers - a miss turns a question the
 * knowledge base covers into a refusal, which is a far worse trade than any
 * number of tokens.
 *
 * Every rule appears at least once. The labels are the rule a careful reader
 * would cite, and several were confirmed against the live model, which cited
 * the same id when given the whole knowledge base.
 */
export interface RetrievalCase {
  question: string;
  /** The rule that answers. Retrieval has to surface this one. */
  expected: string;
}

export const RETRIEVAL_CASES: RetrievalCase[] = [
  // Confirmed live: the model cited exactly these when handed all 27 rules.
  { question: "Can I wear shorts at a temple?", expected: "temple-attire" },
  { question: "Boleh pakai celana pendek di pura?", expected: "temple-attire" },
  { question: "Apakah saya wajib pakai pemandu wisata berlisensi?", expected: "licensed-guide" },
  { question: "Perlu SIM internasional untuk sewa motor di Bali?", expected: "driving-licence" },
  { question: "Boleh bawa drone ke pura?", expected: "drone-restriction" },

  // Dress, access, behaviour at a sacred site.
  { question: "Harus pakai kamen dan selendang tidak?", expected: "temple-attire" },
  { question: "Boleh masuk utama mandala?", expected: "sacred-area-entry" },
  { question: "May I enter the inner courtyard of the temple?", expected: "sacred-area-entry" },
  { question: "Boleh memanjat pelinggih untuk foto?", expected: "climbing-sacred" },
  { question: "Can I climb the temple wall?", expected: "climbing-sacred" },
  { question: "Boleh melangkahi canang di jalan?", expected: "offerings-canang" },
  { question: "What should I do about offerings on the ground?", expected: "offerings-canang" },
  { question: "Boleh memotret orang yang sedang sembahyang?", expected: "photography" },
  { question: "Do I need permission to take photos of a ceremony?", expected: "photography" },
  { question: "Perempuan yang sedang haid boleh masuk pura?", expected: "menstruation-entry" },
  { question: "Boleh berteriak di dalam pura?", expected: "speaking-volume" },
  { question: "Harus melepas sepatu di pura?", expected: "shoe-removal" },
  { question: "Do I take my sandals off inside?", expected: "shoe-removal" },
  { question: "Boleh menyentuh patung di pura?", expected: "touching-sacred-objects" },
  { question: "Boleh duduk lebih tinggi dari pemangku?", expected: "head-level-respect" },
  { question: "Harus ikut aturan petugas pura?", expected: "general-conduct" },
  { question: "Boleh buang sampah plastik di area pura?", expected: "no-littering" },
  { question: "Boleh pakai sedotan plastik di tempat wisata?", expected: "no-littering" },
  { question: "Boleh berfoto tanpa baju di bangunan suci?", expected: "sacred-photo-attire" },

  // The rules added from the circular's wider clauses.
  { question: "Harus bayar pungutan wisatawan asing?", expected: "visitor-levy" },
  { question: "Do I have to pay the tourist levy?", expected: "visitor-levy" },
  { question: "Boleh bayar pakai mata uang asing?", expected: "pay-in-rupiah" },
  { question: "Di mana tukar uang yang resmi?", expected: "money-exchange" },
  { question: "Wajib pakai helm saat naik motor?", expected: "road-conduct" },
  { question: "Boleh berkendara setelah minum alkohol?", expected: "impaired-driving" },
  { question: "Harus pakai mobil travel resmi?", expected: "licensed-transport" },
  { question: "Boleh menginap di penginapan tanpa izin?", expected: "licensed-accommodation" },
  { question: "Boleh berkata kasar ke petugas?", expected: "respect-people" },
  { question: "Boleh menyebar hoaks tentang Bali di media sosial?", expected: "online-conduct" },
  { question: "Boleh bekerja di Bali tanpa dokumen resmi?", expected: "work-permits" },
  { question: "Boleh beli artefak budaya sebagai oleh-oleh?", expected: "protected-goods" },

  // Added with the second round of rules. A rule whose keywords do not reach it
  // passes its own sourcing test and then sits in the knowledge base unread, so
  // every new entry earns a line here.
  { question: "Boleh menyentuh pratima saat upacara?", expected: "honour-sacred-objects" },
  { question: "Harus menghormati adat dan tradisi setempat?", expected: "respect-adat-culture" },
  { question: "Tiap pura aturannya beda-beda ya?", expected: "site-specific-rules" },
  { question: "Boleh berenang di mata air suci?", expected: "protect-water" },
  { question: "Boleh keluar hotel saat Nyepi?", expected: "nyepi-stay-in" },
  { question: "Boleh nyalakan lampu terang saat Nyepi?", expected: "nyepi-quiet-dark" },
  { question: "Bandara tutup saat Nyepi?", expected: "nyepi-no-transport" },
  { question: "Boleh menawar harga di pasar?", expected: "bargaining-conduct" },
];
