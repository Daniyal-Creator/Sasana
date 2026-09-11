// All user-facing copy, EN + ID, from ui-spec §10. Copy rules: lead with the fix,
// no marketing filler, no em dashes (guardrails §9).

import type { Lang } from "@shared/contract";

// Re-exported so components can keep importing Lang alongside t() from here.
// The single definition lives in shared/contract.ts, because the backend needs
// the same type to read the `lang` field off a request.
export type { Lang };

type Entry = { en: string; id: string };

const dict = {
  "app.name": { en: "SASANA", id: "SASANA" },
  "app.tagline": {
    en: "Understand and respect Balinese customs, before you enter.",
    id: "Pahami dan hormati adat Bali, sebelum Anda masuk.",
  },
  "nav.back": { en: "Back", id: "Kembali" },
  "nav.home": { en: "Home", id: "Beranda" },
  "nav.features": { en: "Features", id: "Fitur" },
  "nav.sites": { en: "Sites", id: "Situs" },
  "nav.benefits": { en: "Benefits", id: "Manfaat" },
  "nav.how": { en: "How it works", id: "Cara kerja" },
  "nav.about": { en: "About", id: "Tentang" },
  "nav.about_sasana": { en: "About SASANA", id: "Tentang SASANA" },
  "nav.about_us": { en: "About Us", id: "Tentang Kami" },
  "nav.check": { en: "Situation Check", id: "Cek Situasi" },
  "nav.assistant": { en: "Ask Assistant", id: "Tanya Asisten" },
  "nav.explore": { en: "Explore Locations", id: "Jelajahi Lokasi" },
  "lang.label": { en: "Language", id: "Bahasa" },
  "cta.badge.ai_vision": { en: "AI VISION", id: "AI VISION" },
  "cta.badge.chatbot": { en: "CHATBOT", id: "CHATBOT" },
  "cta.badge.geofence": { en: "GEOFENCE", id: "GEOFENCE" },

  "landing.lead": {
    en: "Your friendly guide to sacred sites in Bali.",
    id: "Panduan ramah Anda untuk tempat suci di Bali.",
  },
  "landing.badge": {
    en: "Based on Bali Governor Circular No. 7/2025",
    id: "Berdasarkan SE Gubernur Bali No. 7/2025",
  },
  "cta.check.title": { en: "Situation Check", id: "Cek Situasi" },
  "cta.check.desc": {
    en: "Check a photo against local custom.",
    id: "Periksa foto sesuai adat setempat.",
  },
  "cta.assistant.title": { en: "Ask the Assistant", id: "Tanya Asisten" },
  "cta.assistant.desc": {
    en: "Questions about the rules, answered.",
    id: "Pertanyaan tentang aturan, terjawab.",
  },
  "cta.explore.title": { en: "Explore Locations", id: "Jelajahi Lokasi" },
  "cta.explore.desc": {
    en: "See the customs at a sacred site before you arrive.",
    id: "Lihat adat di situs suci sebelum Anda tiba.",
  },
  "about_section.badge": {
    en: "CAPABILITIES & PURPOSE",
    id: "KEMAMPUAN & TUJUAN",
  },
  "about_section.title": {
    en: "What SASANA does",
    id: "Apa yang SASANA lakukan",
  },
  "about_section.intro": {
    en: "Three tools to help you visit Bali\u2019s sacred sites with confidence.",
    id: "Tiga alat untuk membantu Anda mengunjungi tempat suci di Bali dengan percaya diri.",
  },
  "about_section.link_about": {
    en: "Read full philosophy and mission",
    id: "Pelajari filosofi dan misi selengkapnya",
  },
  "about_section.tag.vision": { en: "AI Vision", id: "AI Vision" },
  "about_section.tag.assistant": { en: "Chatbot", id: "Chatbot" },
  "about_section.tag.zones": { en: "Geofence", id: "Geofence" },
  "about_section.action.check": { en: "Check Situation →", id: "Cek Situasi →" },
  "about_section.action.assistant": { en: "Ask Assistant →", id: "Tanya Asisten →" },
  "about_section.action.explore": { en: "Explore Map →", id: "Jelajahi Peta →" },
  "about_section.check.title": { en: "Situation Check", id: "Cek Situasi" },
  "about_section.check.tagline": { en: "See • Check • Understand", id: "Lihat • Cek • Pahami" },
  "about_section.check.desc": {
    en: "Photograph your outfit or surroundings and learn whether they match the customs of the site you are visiting.",
    id: "Foto pakaian atau lingkungan Anda dan ketahui apakah sudah sesuai dengan adat di tempat yang Anda kunjungi.",
  },
  "about_section.assistant.title": { en: "Assistant", id: "Asisten" },
  "about_section.assistant.tagline": {
    en: "Ask about customs, etiquette and meaning.",
    id: "Tanyakan seputar adat, etika, dan maknanya.",
  },
  "about_section.assistant.desc": {
    en: "Ask any question about Balinese customs. Answers are drawn from the Governor Circular No.\u00a07/2025, not opinions.",
    id: "Tanyakan apa saja tentang adat Bali. Jawaban berasal dari Surat Edaran Gubernur No.\u00a07/2025, bukan opini.",
  },
  "about_section.zones.title": { en: "Zones and Notices", id: "Zona dan Pemberitahuan" },
  "about_section.zones.tagline": {
    en: "Get notified about sacred areas, dress codes & events.",
    id: "Dapatkan info area suci, tata busana & upacara.",
  },
  "about_section.zones.desc": {
    en: "Receive a notice when you approach a sacred site, so you know the customs before you arrive.",
    id: "Terima pemberitahuan saat Anda mendekati tempat suci, agar Anda mengetahui adatnya sebelum tiba.",
  },
  "about_section.dialog.user": {
    en: "Can I wear a yellow sash to the temple?",
    id: "Bolehkah memakai selendang kuning ke pura?",
  },
  "about_section.dialog.bot": {
    en: "Yes. Sashes (umpal) can be yellow, white, or red, tied at the left waist.",
    id: "Boleh. Selendang (umpal) dapat berwarna kuning, putih, atau merah, diikat di pinggang kiri.",
  },
  "about_section.dialog.source": {
    en: "Circular No. 7/2025 · Clause 3.2",
    id: "Surat Edaran No. 7/2025 · Poin 3.2",
  },
  "about_section.zones.outer_label": {
    en: "Approach · 500m (Notices triggered)",
    id: "Pendekatan · 500m (Notifikasi)",
  },
  "about_section.zones.inner_label": {
    en: "Sacred Zone · 100m (Customs active)",
    id: "Zona Sakral · 100m (Aturan Aktif)",
  },
  "about_section.zones.status_badge": {
    en: "Live Proximity Active",
    id: "Deteksi Jarak Aktif",
  },

  "sites_section.title": {
    en: "Bali\u2019s Famous Sites",
    id: "Situs Terkenal di Bali",
  },
  "sites_section.subtitle": {
    en: "Explore sacred sites across Bali and understand their customs before you arrive.",
    id: "Jelajahi berbagai tempat suci di Bali dan pahami adatnya sebelum Anda tiba.",
  },
  "sites_section.prev": { en: "Previous site", id: "Situs sebelumnya" },
  "sites_section.next": { en: "Next site", id: "Situs berikutnya" },
  "sites_section.slide_hint": {
    en: "Swipe or scroll to explore more sites",
    id: "Geser untuk melihat situs lainnya",
  },
  "sites_section.customs_count": {
    en: "{count} customs",
    id: "{count} adat",
  },
  "sites_section.view": { en: "Explore site", id: "Jelajahi situs" },

  "benefits_section.title": {
    en: "Impact & Benefits",
    id: "Dampak & Manfaat",
  },
  "benefits_section.subtitle": {
    en: "How SASANA supports visitors, local communities, and sustainable tourism across Bali.",
    id: "Bagaimana SASANA mendukung wisatawan, masyarakat lokal, dan pelestarian budaya Bali.",
  },
  "benefits.tab.visitors": {
    en: "For Visitors",
    id: "Untuk Wisatawan",
  },
  "benefits.tab.visitors.short": {
    en: "Visitors",
    id: "Wisatawan",
  },
  "benefits.visitors.headline": {
    en: "Visit sacred sites with peace of mind and cultural confidence.",
    id: "Kunjungan tenang dan percaya diri tanpa kekhawatiran melanggar adat.",
  },
  "benefits.visitors.p1_title": {
    en: "Clear dress code & boundaries",
    id: "Paham sebelum melangkah",
  },
  "benefits.visitors.p1_desc": {
    en: "Understand kamen, sash, and zone requirements before entering any sacred courtyard.",
    id: "Mengetahui tata busana dan batasan area sebelum memasuki kawasan suci.",
  },
  "benefits.visitors.p2_title": {
    en: "Bilingual on-site guidance",
    id: "Bebas kendala bahasa",
  },
  "benefits.visitors.p2_desc": {
    en: "Instant, friendly advice in English and Indonesian right at the temple gate.",
    id: "Panduan dwibahasa yang ramah dan mudah dipahami langsung di lokasi.",
  },
  "benefits.visitors.p3_title": {
    en: "Grounded & trustworthy answers",
    id: "Jawaban pasti & terpercaya",
  },
  "benefits.visitors.p3_desc": {
    en: "Answers drawn directly from official circulars, never guesswork or rumours.",
    id: "Informasi adat yang bersumber langsung dari acuan resmi, bukan opini atau tebakan.",
  },

  "benefits.tab.culture": {
    en: "Culture & Community",
    id: "Masyarakat & Budaya",
  },
  "benefits.tab.culture.short": {
    en: "Culture",
    id: "Budaya",
  },
  "benefits.culture.headline": {
    en: "Protecting the sanctity of active, living places of worship.",
    id: "Menjaga kesucian dan tatanan tempat peribadatan yang aktif.",
  },
  "benefits.culture.p1_title": {
    en: "Early prevention at approaches",
    id: "Pencegahan dini di area pendekatan",
  },
  "benefits.culture.p1_desc": {
    en: "Addresses misunderstandings outside the zone before violations occur.",
    id: "Mencegah kekeliruan sejak di area pendekatan sebelum pelanggaran terjadi.",
  },
  "benefits.culture.p2_title": {
    en: "Tri Hita Karana harmony",
    id: "Harmoni Tri Hita Karana",
  },
  "benefits.culture.p2_desc": {
    en: "Fosters mindful respect grounded in genuine understanding rather than fear.",
    id: "Wisatawan patuh berkat pemahaman budaya, bukan sekadar rasa takut.",
  },
  "benefits.culture.p3_title": {
    en: "Undisturbed local devotion",
    id: "Kekhidmatan ibadah terjaga",
  },
  "benefits.culture.p3_desc": {
    en: "Ensures ceremonies and daily prayers continue with dignity and peace.",
    id: "Upacara adat dan persembahyangan warga lokal dapat berlangsung hening tanpa gangguan.",
  },

  "benefits.tab.governance": {
    en: "Tourism & Governance",
    id: "Pariwisata & Regulasi",
  },
  "benefits.tab.governance.short": {
    en: "Governance",
    id: "Regulasi",
  },
  "benefits.governance.headline": {
    en: "Putting Bali Governor Circular No. 7/2025 into practical action.",
    id: "Menerapkan Surat Edaran Gubernur Bali No. 7/2025 secara nyata.",
  },
  "benefits.governance.p1_title": {
    en: "Practical field implementation",
    id: "Penegakan praktis di lapangan",
  },
  "benefits.governance.p1_desc": {
    en: "Connects regional governance directly into every visitor\u2019s pocket in real time.",
    id: "Menghubungkan regulasi resmi pemerintah daerah langsung ke genggaman wisatawan.",
  },
  "benefits.governance.p2_title": {
    en: "Civilized & orderly destination",
    id: "Pariwisata tertib & beradab",
  },
  "benefits.governance.p2_desc": {
    en: "Strengthens Bali\u2019s global reputation as a respectful, well-ordered cultural haven.",
    id: "Memperkuat citra Bali sebagai destinasi budaya berkelas dunia yang teratur.",
  },
  "benefits.governance.p3_title": {
    en: "Support for local stewards",
    id: "Membantu pengelola & pecalang",
  },
  "benefits.governance.p3_desc": {
    en: "Assists site managers and village stewards in sharing etiquette without friction.",
    id: "Membantu pengelola dan pecalang menyosialisasikan aturan tanpa friksi.",
  },

  "how.title": { en: "How it works", id: "Cara kerjanya" },
  "how.subtitle": {
    en: "Three simple steps before stepping into sacred grounds.",
    id: "Tiga langkah sederhana sebelum melangkah masuk ke kawasan suci.",
  },
  "how.feature.check": { en: "Situation Check", id: "Cek Situasi" },
  "how.feature.assistant": { en: "Assistant", id: "Asisten Adat" },
  "how.feature.zones": { en: "Zones & Notices", id: "Zona & Notifikasi" },
  "how.category.check": { en: "AI Vision", id: "AI Vision" },
  "how.category.assistant": { en: "Chatbot", id: "Chatbot" },
  "how.category.zones": { en: "Geofence", id: "Geofence" },
  "how.cta.check": { en: "Check situation now", id: "Cek situasi sekarang" },
  "how.cta.assistant": { en: "Ask the Assistant", id: "Tanya Asisten Adat" },
  "how.cta.zones": { en: "Explore sacred sites", id: "Jelajahi situs suci" },

  "how.check.step1": { en: "Take a photo or upload", id: "Ambil atau unggah foto" },
  "how.check.step1.desc": {
    en: "Take a quick photo of your attire or surroundings before entering.",
    id: "Ambil foto pakaian atau suasana sekitar sebelum Anda melangkah masuk.",
  },
  "how.check.step2": { en: "Get instant custom feedback", id: "Dapatkan analisis adat instan" },
  "how.check.step2.desc": {
    en: "SASANA analyzes your attire and surroundings against official rules.",
    id: "SASANA menganalisis busana dan situasi Anda berdasarkan aturan resmi SE No. 7/2025.",
  },
  "how.check.step3": { en: "Know what to adjust", id: "Ketahui apa yang perlu disesuaikan" },
  "how.check.step3.desc": {
    en: "Receive clear guidance on what to adjust or wrap before you enter.",
    id: "Dapatkan panduan jelas hal apa yang perlu disesuaikan sebelum berkunjung.",
  },

  "how.assistant.step1": { en: "Ask your question", id: "Ajukan pertanyaan Anda" },
  "how.assistant.step1.desc": {
    en: "Type any queries regarding local customs, dress codes, or etiquette.",
    id: "Tanyakan apa saja seputar tata krama, pakaian, atau adat setempat.",
  },
  "how.assistant.step2": { en: "Get cited answers", id: "Dapatkan jawaban bersumber resmi" },
  "how.assistant.step2.desc": {
    en: "Receive accurate responses grounded strictly in Circular No. 7/2025.",
    id: "Terima jawaban akurat yang bersumber langsung dari SE Gubernur No. 7/2025.",
  },
  "how.assistant.step3": { en: "Understand cultural ethos", id: "Pahami filosofi budaya" },
  "how.assistant.step3.desc": {
    en: "Learn the deeper philosophical meaning behind sacred Balinese customs.",
    id: "Pelajari makna filosofis luhur di balik setiap tata krama tempat suci.",
  },

  "how.zones.step1": { en: "Select or approach a site", id: "Pilih atau dekati situs suci" },
  "how.zones.step1.desc": {
    en: "Choose a sacred site in Explore Mode, or simply approach one in person.",
    id: "Pilih tempat suci di Mode Jelajah, atau dekati lokasinya secara langsung.",
  },
  "how.zones.step2": { en: "Receive proximity notices", id: "Terima pemberitahuan zona" },
  "how.zones.step2.desc": {
    en: "Get automatic guidance before crossing into the sacred temple zone.",
    id: "Dapatkan panduan adat otomatis sebelum Anda memasuki zona suci pura.",
  },
  "how.zones.step3": { en: "Enter with respect", id: "Berkunjung dengan hormat" },
  "how.zones.step3.desc": {
    en: "Experience the sacred grounds with cultural awareness and confidence.",
    id: "Masuki kawasan suci dengan penuh penghormatan dan rasa percaya diri.",
  },
  "footer.brand_statement": {
    en: "Visit sacred places with confidence and respect.",
    id: "Kunjungi tempat suci dengan percaya diri dan penuh rasa hormat.",
  },
  "footer.closing_copy": {
    en: "Travel prepared. Visit respectfully.",
    id: "Berperjalanan dengan persiapan. Berkunjung dengan santun.",
  },
  "footer.group.explore": { en: "Explore", id: "Jelajahi" },
  "footer.group.features": { en: "Features", id: "Fitur" },
  "footer.group.about": { en: "About", id: "Tentang" },
  "footer.nav.home": { en: "Home", id: "Beranda" },
  "footer.nav.sites": { en: "Sacred Sites", id: "Situs Suci" },
  "footer.nav.how": { en: "How It Works", id: "Cara Kerja" },
  "footer.nav.check": { en: "Situation Check", id: "Cek Situasi" },
  "footer.nav.assistant": { en: "Custom Assistant", id: "Asisten Adat" },
  "footer.nav.zones": { en: "Zones & Notices", id: "Zona & Pemberitahuan" },
  "footer.nav.about": { en: "About SASANA", id: "Tentang SASANA" },
  "footer.nav.circular": { en: "Governor Circular No. 7/2025", id: "SE Gubernur No. 7/2025" },
  "footer.nav.privacy": { en: "Privacy Assurance", id: "Jaminan Privasi" },
  "footer.nav.charter": {
    en: "Cultural Charter & Legal Integrity",
    id: "Piagam Integritas Budaya & Hukum",
  },
  "footer.disclaimer": {
    en: "Not affiliated with the Bali government. Reference: Governor Circular No. 7/2025.",
    id: "Tidak berafiliasi dengan pemerintah Bali. Rujukan: Surat Edaran Gubernur No. 7/2025.",
  },
  "footer.privacy": { en: "Photos are never stored.", id: "Foto tidak pernah disimpan." },

  "check.title": { en: "Situation Check", id: "Cek Situasi" },
  "check.subtitle": {
    en: "Check your photo against Balinese custom.",
    id: "Periksa foto Anda sesuai adat Bali.",
  },
  "check.context.label": { en: "Where are you?", id: "Anda sedang di mana?" },
  "check.context.temple": { en: "At a temple", id: "Di pura" },
  "check.context.general": { en: "General", id: "Umum" },
  "check.upload.prompt": { en: "Take or upload a photo", id: "Ambil atau unggah foto" },
  "check.upload.hint": { en: "JPG or PNG, up to 5 MB", id: "JPG atau PNG, maksimal 5 MB" },
  "check.upload.take": { en: "Take photo", id: "Ambil foto" },
  "check.upload.pick": { en: "Upload", id: "Unggah" },
  "check.upload.clear": { en: "Remove photo", id: "Hapus foto" },
  "check.upload.errorType": {
    en: "Please choose a JPG or PNG image.",
    id: "Silakan pilih gambar JPG atau PNG.",
  },
  "check.upload.errorSize": {
    en: "That image is over 5 MB. A smaller one will work.",
    id: "Gambar itu melebihi 5 MB. Gunakan yang lebih kecil.",
  },
  "check.photo.alt": { en: "Your uploaded photo", id: "Foto yang Anda unggah" },

  "check.camera.title": { en: "Take a photo", id: "Ambil foto" },
  "check.camera.preview": { en: "Camera preview", id: "Pratinjau kamera" },
  "check.camera.starting": { en: "Starting the camera", id: "Menyalakan kamera" },
  "check.camera.shutter": { en: "Capture photo", id: "Ambil gambar" },
  "check.camera.switch": { en: "Switch camera", id: "Ganti kamera" },
  "check.camera.close": { en: "Close the camera", id: "Tutup kamera" },
  "check.camera.fallback": { en: "Choose a file instead", id: "Pilih berkas saja" },
  "check.camera.denied": {
    en: "Allow camera access in your browser to use this, or choose a photo from your files.",
    id: "Izinkan akses kamera di peramban Anda untuk memakai ini, atau pilih foto dari berkas Anda.",
  },
  "check.camera.none": {
    en: "No camera was found on this device. Choose a photo from your files instead.",
    id: "Tidak ada kamera di perangkat ini. Pilih foto dari berkas Anda saja.",
  },
  "check.camera.insecure": {
    en: "The camera needs a secure connection (https). Choose a photo from your files instead.",
    id: "Kamera memerlukan koneksi aman (https). Pilih foto dari berkas Anda saja.",
  },
  "check.camera.failed": {
    en: "The camera could not be started. Close any other app using it, or choose a file.",
    id: "Kamera tidak bisa dinyalakan. Tutup aplikasi lain yang memakainya, atau pilih berkas.",
  },

  "check.meta.title": { en: "Sent with your photo", id: "Dikirim bersama foto Anda" },
  "check.meta.time": { en: "Taken {time}", id: "Diambil {time}" },
  "check.meta.timeApprox": { en: "(from the file date)", id: "(dari tanggal berkas)" },
  "check.meta.location": { en: "Location {lat}, {lng}", id: "Lokasi {lat}, {lng}" },
  "check.meta.site": { en: "At {name}", id: "Di {name}" },
  "check.meta.locating": { en: "Getting your location", id: "Mengambil lokasi Anda" },
  "check.meta.locationNone": { en: "No location.", id: "Tanpa lokasi." },
  "check.meta.locationUnavailable": {
    en: "Location unavailable.",
    id: "Lokasi tidak tersedia.",
  },
  "check.meta.locationAdd": { en: "Allow location", id: "Izinkan lokasi" },
  "check.meta.device": { en: "Taken on {device}", id: "Diambil dengan {device}" },
  "check.privacy": {
    en: "Your photo is never stored and analyzed only once. Time and location are only sent if permitted.",
    id: "Foto tidak pernah disimpan dan dianalisis sekali saja. Waktu & lokasi hanya terkirim jika Anda izinkan.",
  },
  "check.analyze": { en: "Analyze photo", id: "Analisis foto" },
  "check.loading": { en: "Analyzing your photo…", id: "Menganalisis foto Anda…" },
  "check.reset": { en: "Check another", id: "Cek yang lain" },
  "check.tts": { en: "Convert to Speech", id: "Ubah ke Suara" },
  "check.tts.stop": { en: "Stop", id: "Hentikan" },
  "check.followup.placeholder": {
    en: "Ask about this result…",
    id: "Tanyakan tentang hasil ini…",
  },
  // Follow-up chips under a photo check. Unlike the assistant's, these carry
  // the check's own result with them, so they are allowed to point at it: "this
  // result" means something here that it would not mean in a fresh chat.
  //
  // Three per outcome, because what a visitor needs next depends entirely on
  // what they were just told. `unclear` gets none: the card already offers
  // "Retake photo", and inviting questions about a result the system itself
  // could not read would be answering from nothing.
  "check.followup.compliant.1": {
    en: "Is there anything else I should prepare?",
    id: "Ada lagi yang perlu saya siapkan?",
  },
  "check.followup.compliant.2": {
    en: "What should I avoid once I am inside?",
    id: "Apa yang sebaiknya saya hindari setelah berada di dalam?",
  },
  "check.followup.compliant.3": {
    en: "Where does this rule come from?",
    id: "Aturan ini berasal dari mana?",
  },
  "check.followup.needs_attention.1": {
    en: "What exactly should I fix?",
    id: "Apa persisnya yang perlu saya perbaiki?",
  },
  "check.followup.needs_attention.2": {
    en: "Can I still enter like this?",
    id: "Apakah saya masih boleh masuk dengan kondisi ini?",
  },
  "check.followup.needs_attention.3": {
    en: "Why does this matter at a temple?",
    id: "Kenapa hal ini penting di pura?",
  },
  "check.followup.not_compliant.1": {
    en: "What should I wear instead?",
    id: "Lalu sebaiknya saya kenakan apa?",
  },
  "check.followup.not_compliant.2": {
    en: "Can I rent or borrow what I am missing?",
    id: "Bisakah saya menyewa atau meminjam yang kurang?",
  },
  "check.followup.not_compliant.3": {
    en: "Why is this taken seriously at a temple?",
    id: "Kenapa hal ini dianggap serius di pura?",
  },
  // The chip text for the same nine, short enough to sit three-across inside a
  // result card. The question each one sends is above.
  "check.followup.compliant.1.short": { en: "Anything else?", id: "Ada lagi?" },
  "check.followup.compliant.2.short": { en: "What should I avoid?", id: "Yang harus dihindari?" },
  "check.followup.compliant.3.short": { en: "Where is this from?", id: "Sumbernya?" },
  "check.followup.needs_attention.1.short": { en: "What do I fix?", id: "Perbaiki apa?" },
  "check.followup.needs_attention.2.short": { en: "Can I still enter?", id: "Masih boleh masuk?" },
  "check.followup.needs_attention.3.short": { en: "Why does it matter?", id: "Kenapa penting?" },
  "check.followup.not_compliant.1.short": { en: "What should I wear?", id: "Sebaiknya pakai apa?" },
  "check.followup.not_compliant.2.short": { en: "Can I rent one?", id: "Bisa sewa?" },
  "check.followup.not_compliant.3.short": { en: "Why is that?", id: "Kenapa begitu?" },
  "check.unclear.retake": { en: "Retake photo", id: "Ambil ulang foto" },
  "check.source": { en: "Reference: {source}", id: "Rujukan: {source}" },
  "check.error": {
    en: "Something went wrong analyzing your photo. Please try again.",
    id: "Terjadi masalah saat menganalisis foto Anda. Silakan coba lagi.",
  },
  "check.placeholder": {
    en: "Analysis results will appear here",
    id: "Hasil analisis bakal muncul di sini",
  },
  "check.scrollDown": {
    en: "Scroll down for more",
    id: "Gulir ke bawah untuk selengkapnya",
  },
  "common.retry": { en: "Try again", id: "Coba lagi" },

  "result.compliant": { en: "You're good to go", id: "Anda sudah sesuai" },
  "result.needs_attention": { en: "A small thing to check", id: "Ada hal kecil untuk diperiksa" },
  "result.not_compliant": { en: "Please adjust before entering", id: "Mohon sesuaikan sebelum masuk" },
  "result.unclear": {
    en: "I can't tell from this photo",
    id: "Saya belum bisa memastikan dari foto ini",
  },
  "result.tip.compliant": { en: "Tip", id: "Tips" },
  "result.tip.needs_attention": { en: "Suggestion", id: "Saran" },
  "result.tip.not_compliant": { en: "Suggestion", id: "Saran" },
  "result.tip.unclear": { en: "Try this", id: "Coba ini" },

  "assistant.welcome.title": { en: "Hi, I'm Sasana", id: "Hai, saya Sasana" },
  "assistant.welcome.body": {
    en: "Ask me anything about Balinese customs, sacred sites, and Bali itself.",
    id: "Tanyakan apa saja tentang adat Bali, tempat suci, dan Bali sendiri.",
  },
  "assistant.tryasking": { en: "Try asking:", id: "Coba tanyakan:" },
  "assistant.chip.shorts": {
    en: "Can I wear shorts at a temple?",
    id: "Boleh pakai celana pendek di pura?",
  },
  "assistant.chip.drone": {
    en: "Can I fly a drone at Tanah Lot?",
    id: "Boleh terbangkan drone di Tanah Lot?",
  },
  "assistant.chip.canang": { en: "What is a canang offering?", id: "Apa itu canang?" },
  "assistant.chip.shorts.short": { en: "Shorts?", id: "Celana pendek?" },
  "assistant.chip.drone.short": { en: "Drones?", id: "Soal drone?" },
  "assistant.chip.canang.short": { en: "What is canang?", id: "Apa itu canang?" },
  "assistant.chip.photo": {
    en: "Is it okay to take photos inside?",
    id: "Boleh memotret di dalam?",
  },
  // The context a visitor carries in from Explore, said on screen. Until this
  // existed the Site and the position travelled invisibly: the answer knew
  // where somebody was standing and the screen gave no sign of it, so nobody
  // thought to ask "here".
  "assistant.context.about": { en: "About {site}", id: "Tentang {site}" },
  "assistant.context.explain": {
    en: "Answers will be about this place.",
    id: "Jawaban akan mengacu ke tempat ini.",
  },
  "assistant.context.inside": {
    en: "You are inside this area.",
    id: "Anda berada di dalam kawasan ini.",
  },
  "assistant.context.approaching": {
    en: "You are about {distance} away, not inside yet.",
    id: "Anda sekitar {distance} dari sini, belum masuk kawasannya.",
  },
  "assistant.context.away": { en: "You are about {distance} away.", id: "Anda sekitar {distance} dari sini." },
  // Shown instead of a distance when the fix is no better than the distance
  // itself. The same rule the prompt follows: a number the device was never
  // sure of is arithmetic, not information.
  "assistant.context.unsure": {
    en: "Your position is not certain enough to give a distance.",
    id: "Posisi Anda belum cukup pasti untuk disebutkan jaraknya.",
  },
  "assistant.context.clear": { en: "Clear this place", id: "Lepaskan tempat ini" },
  "assistant.suggested.here": { en: "Ask about this place", id: "Tanya tentang tempat ini" },
  // One question per Custom the Site actually carries, named so the answer
  // lands on that Site's own rules. Never a question about something the Site
  // has no Custom for.
  "assistant.here.dress": {
    en: "What should I wear at {site}?",
    id: "Apa yang sebaiknya saya kenakan di {site}?",
  },
  "assistant.here.photography": {
    en: "Can I take photos at {site}?",
    id: "Boleh memotret di {site}?",
  },
  "assistant.here.offerings": {
    en: "What should I do about the offerings at {site}?",
    id: "Bagaimana menyikapi sesaji di {site}?",
  },
  "assistant.here.drones": {
    en: "Can I fly a drone at {site}?",
    id: "Boleh menerbangkan drone di {site}?",
  },
  "assistant.here.quiet": {
    en: "How quiet should I be at {site}?",
    id: "Seberapa tenang saya harus bersikap di {site}?",
  },
  // Follow-up chips, offered under an answer rather than under an empty screen.
  //
  // Every one of them is a whole question. That is not a style choice: a chip
  // is sent with no history so that the answer cache can serve it (chat.ts only
  // stores first-turn questions), and a question that leans on the previous
  // turn - "why is that?", "what about here?" - would be answered without the
  // turn it leans on. Whatever a chip asks, it asks in full.
  //
  // One per category, so the wording is shared by every Rule filed under it and
  // the cache warms on eleven keys instead of thirty-five.
  "assistant.followup.dress-code": {
    en: "What should I wear to enter a temple?",
    id: "Apa yang harus saya kenakan untuk masuk ke pura?",
  },
  "assistant.followup.access": {
    en: "Which parts of a temple may visitors enter?",
    id: "Bagian pura mana saja yang boleh dimasuki pengunjung?",
  },
  "assistant.followup.sacred-behavior": {
    en: "How should I behave inside a temple?",
    id: "Bagaimana sebaiknya saya bersikap di dalam pura?",
  },
  "assistant.followup.offerings": {
    en: "How should I treat offerings left on the ground?",
    id: "Bagaimana menyikapi sesaji yang diletakkan di tanah?",
  },
  "assistant.followup.photography": {
    en: "What are the rules for taking photos at sacred places?",
    id: "Apa aturan memotret di tempat suci?",
  },
  "assistant.followup.ritual-purity": {
    en: "Are there conditions that keep someone from entering a temple?",
    id: "Adakah kondisi yang membuat seseorang tidak boleh masuk pura?",
  },
  "assistant.followup.general-conduct": {
    en: "How should I behave respectfully around Balinese people?",
    id: "Bagaimana bersikap sopan terhadap masyarakat Bali?",
  },
  "assistant.followup.environment": {
    en: "What should I know about protecting Bali's environment?",
    id: "Apa yang perlu saya tahu soal menjaga lingkungan Bali?",
  },
  "assistant.followup.visitor-obligations": {
    en: "What is required of tourists visiting Bali?",
    id: "Apa saja kewajiban wisatawan selama berada di Bali?",
  },
  "assistant.followup.getting-around": {
    en: "What are the rules for driving or renting a vehicle in Bali?",
    id: "Apa aturan berkendara atau menyewa kendaraan di Bali?",
  },
  "assistant.followup.nyepi": {
    en: "What happens on Nyepi, and what am I expected to do?",
    id: "Apa yang terjadi saat Nyepi, dan apa yang harus saya lakukan?",
  },
  // The reason behind a category, asked in full for the same reason as above.
  // Each names the Custom it is about rather than pointing at one: the subject
  // has to survive being read on its own. What they ask about is always
  // something rules.json already holds, so the answer has somewhere to stand.
  "assistant.why.dress-code": {
    en: "Why must a kamen and sash be worn at a temple?",
    id: "Kenapa kamen dan selendang harus dikenakan di pura?",
  },
  "assistant.why.access": {
    en: "Why are parts of a temple closed to visitors?",
    id: "Kenapa sebagian area pura tertutup bagi pengunjung?",
  },
  "assistant.why.sacred-behavior": {
    en: "Why does conduct matter so much inside a temple?",
    id: "Kenapa sikap di dalam pura sangat diperhatikan?",
  },
  "assistant.why.offerings": {
    en: "Why is a canang left where it lies on the ground?",
    id: "Kenapa canang dibiarkan tergeletak di tanah?",
  },
  "assistant.why.photography": {
    en: "Why is photography restricted at sacred places?",
    id: "Kenapa memotret dibatasi di tempat suci?",
  },
  "assistant.why.ritual-purity": {
    en: "Why does ritual purity decide who may enter a temple?",
    id: "Kenapa kesucian ritual menentukan siapa yang boleh masuk pura?",
  },
  "assistant.why.general-conduct": {
    en: "Why does respecting adat matter so much in Bali?",
    id: "Kenapa menghormati adat begitu penting di Bali?",
  },
  "assistant.why.environment": {
    en: "Why does Bali protect its water and natural sites?",
    id: "Kenapa Bali menjaga air dan situs alamnya?",
  },
  "assistant.why.visitor-obligations": {
    en: "Why does Bali ask visitors to pay a tourist levy?",
    id: "Kenapa Bali menetapkan pungutan bagi wisatawan?",
  },
  "assistant.why.getting-around": {
    en: "Why must visitors hold a valid licence to ride in Bali?",
    id: "Kenapa wisatawan wajib memiliki SIM yang sah untuk berkendara di Bali?",
  },
  "assistant.why.nyepi": {
    en: "Why does Bali fall completely silent on Nyepi?",
    id: "Kenapa Bali sunyi total saat Nyepi?",
  },
  // What a chip SAYS, as opposed to what it sends.
  //
  // The two are allowed to differ, and the difference is the point. A chip sits
  // directly under the answer it belongs to, so it can be as short as speech is:
  // "Kenapa begitu?" is unambiguous with the answer above it. What travels to
  // the server has no answer above it - it is sent with no history so the cache
  // can serve it - so that one stays a whole question. Short where it is read,
  // complete where it is understood.
  "assistant.why.short": { en: "Why is that?", id: "Kenapa begitu?" },
  "assistant.followup.dress-code.short": { en: "What do I wear?", id: "Harus pakai apa?" },
  "assistant.followup.access.short": { en: "Where can I go?", id: "Boleh masuk ke mana?" },
  "assistant.followup.sacred-behavior.short": { en: "How should I act?", id: "Bagaimana bersikap?" },
  "assistant.followup.offerings.short": { en: "What about offerings?", id: "Sesaji bagaimana?" },
  "assistant.followup.photography.short": { en: "Can I take photos?", id: "Boleh memotret?" },
  "assistant.followup.ritual-purity.short": { en: "Who may enter?", id: "Siapa yang boleh masuk?" },
  "assistant.followup.general-conduct.short": { en: "How do I show respect?", id: "Bagaimana bersikap sopan?" },
  "assistant.followup.environment.short": { en: "What about the environment?", id: "Soal lingkungan?" },
  "assistant.followup.visitor-obligations.short": { en: "What is required of me?", id: "Apa kewajiban saya?" },
  "assistant.followup.getting-around.short": { en: "What about driving?", id: "Soal berkendara?" },
  "assistant.followup.nyepi.short": { en: "What about Nyepi?", id: "Saat Nyepi bagaimana?" },
  "assistant.followup.group": { en: "Follow-up questions", id: "Pertanyaan lanjutan" },
  "assistant.input.placeholder": { en: "Ask about a custom…", id: "Tanya tentang adat…" },
  "assistant.send": { en: "Send", id: "Kirim" },
  // These four lines used to promise that every answer came from an official
  // rule. Since the assistant also explains customs and Bali's background with
  // no rule behind them, that promise became an overclaim, and ADR-0014 is
  // explicit that the difference has to reach the visitor. They now promise
  // what is actually true: the official answers carry a source, and the rest
  // says so.
  "assistant.helper": {
    en: "Official rules carry their source. The rest is background.",
    id: "Aturan resmi menyertakan sumbernya. Sisanya penjelasan umum.",
  },
  "assistant.source": { en: "Source: {source}", id: "Sumber: {source}" },
  "assistant.source.map": { en: "Map data: {source}", id: "Data peta: {source}" },
  "assistant.tier.context": {
    en: "Cultural background, not an official rule",
    id: "Penjelasan adat, bukan aturan resmi",
  },
  "assistant.tier.general": {
    en: "General knowledge about Bali, not an official rule",
    id: "Pengetahuan umum tentang Bali, bukan aturan resmi",
  },
  "assistant.typing": { en: "Sasana is typing…", id: "Sasana sedang mengetik…" },
  "assistant.error": {
    en: "I couldn't reach the assistant just now. Please try again.",
    id: "Saya belum bisa menghubungi asisten saat ini. Silakan coba lagi.",
  },
  "assistant.nosource": {
    en: "No official rule found for this",
    id: "Tidak ada aturan resmi yang ditemukan untuk ini",
  },
  // The map results, listed under the answer they were written from. The
  // heading says where they came from rather than what they are: "hotels"
  // would be a claim about them, and the map only records that they exist.
  "assistant.amenities.title": { en: "Found on the map", id: "Ditemukan di peta" },
  "assistant.amenities.open": {
    en: "Show {name} on the map",
    id: "Tampilkan {name} di peta",
  },
  "assistant.photo.preview": { en: "Photo preview", id: "Pratinjau foto" },
  "assistant.photo.view": { en: "View photo", id: "Lihat foto" },
  "assistant.photo.close": { en: "Close photo preview", id: "Tutup pratinjau foto" },
  "assistant.eyebrow": { en: "BALI \u2022 CUSTOMS \u2022 RESPECT", id: "BALI \u2022 ADAT \u2022 HORMAT" },
  "assistant.trust": {
    en: "Every official rule shows its source",
    id: "Setiap aturan resmi menyebutkan sumbernya",
  },
  "assistant.explore.heading": {
    en: "What would you like to explore?",
    id: "Apa yang ingin Anda ketahui?",
  },
  "assistant.topic.etiquette": { en: "Temple Etiquette", id: "Etika di Pura" },
  "assistant.topic.etiquette.desc": {
    en: "Dress, behavior, and temple customs",
    id: "Pakaian, perilaku, dan adat pura",
  },
  "assistant.topic.etiquette.prompt": {
    en: "What should I wear when visiting a temple?",
    id: "Apa yang harus saya pakai saat ke pura?",
  },
  "assistant.topic.customs": { en: "Balinese Customs", id: "Adat Bali" },
  "assistant.topic.customs.desc": {
    en: "Traditions and daily practices",
    id: "Tradisi dan kebiasaan sehari-hari",
  },
  "assistant.topic.customs.prompt": {
    en: "What are the main Balinese customs I should know?",
    id: "Apa adat Bali utama yang perlu saya ketahui?",
  },
  "assistant.topic.sites": { en: "Sacred Sites", id: "Tempat Suci" },
  "assistant.topic.sites.desc": {
    en: "Places, access, and local information",
    id: "Tempat, akses, dan informasi lokal",
  },
  "assistant.topic.sites.prompt": {
    en: "How do I respectfully visit a sacred site?",
    id: "Bagaimana mengunjungi tempat suci dengan hormat?",
  },
  "assistant.topic.photo": { en: "Photography", id: "Fotografi" },
  "assistant.topic.photo.desc": {
    en: "What visitors should know",
    id: "Yang perlu diketahui pengunjung",
  },
  "assistant.topic.photo.prompt": {
    en: "Where am I allowed to take photos?",
    id: "Di mana saya boleh memotret?",
  },
  "assistant.suggested.heading": {
    en: "Suggested questions",
    id: "Pertanyaan yang disarankan",
  },
  "assistant.input.placeholder.long": {
    en: "Ask Sasana about Balinese customs\u2026",
    id: "Tanya Sasana tentang adat Bali\u2026",
  },
  "assistant.chatheader.title": { en: "Sasana Guide", id: "Panduan Sasana" },
  "assistant.chatheader.subtitle": {
    en: "Customs, official rules, and Bali background",
    id: "Adat, aturan resmi, dan latar Bali",
  },
  // The answer cache's reading, on /stats. Not linked from the header: it is a
  // maintenance number, not something a visitor came for.
  "stats.title": { en: "Answer cache", id: "Cache jawaban" },
  "stats.body": {
    en: "What the cache has saved by answering a repeated question without asking the model again.",
    id: "Yang dihemat cache dengan menjawab pertanyaan berulang tanpa bertanya lagi ke model.",
  },
  "stats.tokens": { en: "Tokens saved", id: "Token dihemat" },
  "stats.hitrate": { en: "Served from cache", id: "Dilayani dari cache" },
  "stats.answered": { en: "Cached / asked", id: "Dari cache / ditanya" },
  "stats.entries": { en: "Answers stored", id: "Jawaban tersimpan" },
  "stats.on": {
    en: "The cache is on. Repeated questions are answered without calling the model.",
    id: "Cache aktif. Pertanyaan berulang dijawab tanpa memanggil model.",
  },
  "stats.off": {
    en: "The cache is off. Every question reaches the model, and misses are still counted, which is what makes this reading comparable with a run where it is on.",
    id: "Cache mati. Setiap pertanyaan sampai ke model, dan miss tetap dihitung, sehingga angka ini bisa dibandingkan dengan run saat cache aktif.",
  },
  "stats.kb": { en: "Knowledge base {hash}", id: "Basis pengetahuan {hash}" },
  "stats.refresh": { en: "Refresh", id: "Muat ulang" },
  "stats.error": {
    en: "Could not read the cache figures.",
    id: "Tidak bisa membaca angka cache.",
  },
  "sr.you": { en: "You said", id: "Anda berkata" },
  "sr.assistant": { en: "Sasana said", id: "Sasana berkata" },

  "about.eyebrow": {
    en: "ABOUT SASANA",
    id: "TENTANG SASANA",
  },
  "about.title": {
    en: "Understanding Bali\nwith respect.",
    id: "Memahami Bali\ndengan rasa hormat.",
  },
  "about.tagline": {
    en: "SASANA is a digital guide that helps visitors understand the customs, etiquette, and sacred spaces of Bali with clear, contextual, and accessible information.",
    id: "SASANA adalah panduan digital yang membantu wisatawan memahami adat, etika, dan ruang sakral Bali dengan informasi yang jelas, kontekstual, dan mudah dipahami.",
  },
  "about.meta": { en: "SASANA \u00b7 Cultural Guide", id: "SASANA \u00b7 Cultural Guide" },
  "about.nav.about": { en: "About", id: "Tentang" },
  "about.nav.story": { en: "Story", id: "Linimasa" },
  "about.nav.principles": { en: "Principles", id: "Prinsip" },
  "about.nav.source": { en: "Charter", id: "Piagam" },
  "about.nav.team": { en: "Team", id: "Tim" },

  // Hero & Impact Ribbon
  "about.hero.badge": {
    en: "Cultural Initiative & Ethics",
    id: "Inisiatif Budaya & Etika",
  },
  "about.hero.image_caption": {
    en: "Pura Besakih \u00b7 Mother Temple of Bali",
    id: "Pura Besakih \u00b7 Ibu dari Seluruh Pura di Bali",
  },
  "about.hero.image_sub": {
    en: "Preserving sacred spaces through awareness",
    id: "Menjaga ruang sakral melalui kesadaran",
  },
  "about.impact.sites_count": { en: "10+", id: "10+" },
  "about.impact.sites_label": {
    en: "Sacred Sites Mapped",
    id: "Ruang Sakral Terpetakan",
  },
  "about.impact.sites_sub": {
    en: "Verified cultural zones",
    id: "Zonasi adat terverifikasi",
  },
  "about.impact.rules_count": { en: "SE No. 7", id: "SE No. 7" },
  "about.impact.rules_label": {
    en: "Official Governance",
    id: "Regulasi Resmi 2025",
  },
  "about.impact.rules_sub": {
    en: "Bali Governor Circular",
    id: "Edaran Gubernur Bali",
  },
  "about.impact.privacy_count": { en: "100%", id: "100%" },
  "about.impact.privacy_label": {
    en: "On-Device Privacy",
    id: "Privasi Tanpa Jejak",
  },
  "about.impact.privacy_sub": {
    en: "Zero image persistence",
    id: "Foto langsung dihapus",
  },

  // Story & Timeline
  "about.story.eyebrow": { en: "01 \u00b7 FOUNDATION", id: "01 \u00b7 LATAR BELAKANG" },
  "about.story.title": {
    en: "Why SASANA exists",
    id: "Mengapa SASANA hadir",
  },
  "about.story.lead": {
    en: "Bridging visitors with Balinese living culture.",
    id: "Menjembatani wisatawan dengan tradisi hidup Bali.",
  },
  "about.story.body1": {
    en: "SASANA was born from a simple need: making information about Balinese customs easier for visitors to understand before they interact with sacred spaces and local communities.",
    id: "SASANA hadir untuk membantu wisatawan memahami tata krama dan nilai budaya Bali sebelum berinteraksi dengan ruang dan masyarakat setempat.",
  },
  "about.story.body2": {
    en: "Rather than simply telling visitors what they can and cannot do, SASANA provides context so that every visit can be made with greater awareness and respect.",
    id: "Pendekatannya bukan sekadar memberi tahu apa yang boleh dan tidak boleh dilakukan, tetapi menjelaskan konteks di baliknya agar setiap kunjungan dapat dilakukan dengan lebih sadar dan penuh penghormatan.",
  },
  "about.story.body_compact": {
    en: "SASANA was born to bridge visitors with Balinese customs through contextual, preventive education — empowering every visit to sacred spaces with deep awareness and mutual respect.",
    id: "SASANA hadir untuk menjembatani wisatawan dengan tradisi hidup Bali melalui pemahaman konteks sebelum kunjungan, memastikan setiap interaksi di ruang sakral dilandasi kesadaran dan rasa hormat.",
  },
  "about.story.quote": {
    en: "Education before violation.",
    id: "Edukasi sebelum pelanggaran.",
  },
  "about.story.quote_author": {
    en: "Core tenet of the SASANA Cultural Initiative",
    id: "Prinsip utama Inisiatif Budaya SASANA",
  },
  "about.story.card_caption": {
    en: "Canang Sari \u00b7 Living daily offerings embodying gratitude, harmony, and cosmic balance across Bali.",
    id: "Canang Sari \u00b7 Persembahan harian lambang rasa syukur, harmoni, dan keseimbangan semesta di Bali.",
  },

  // Timeline
  "about.timeline.eyebrow": { en: "CHRONOLOGY", id: "KRONOLOGI" },
  "about.timeline.title": { en: "The Journey of Sasana", id: "Linimasa Filosofis Berdirinya Sasana" },
  "about.timeline.tap_hint": {
    en: "Tap cards to change chapter",
    id: "Ketuk kartu untuk mengganti babak",
  },
  "about.timeline.next_phase": {
    en: "Next Chapter →",
    id: "Lanjut ke Babak Berikutnya →",
  },
  "about.timeline.prev_phase": {
    en: "← Previous Chapter",
    id: "← Babak Sebelumnya",
  },

  "about.timeline.phase1.period": { en: "Phase 01 · 2023–2024", id: "Babak 01 · 2023–2024" },
  "about.timeline.phase1.title": { en: "Tourism Surge & Context Gaps", id: "Dinamika Wisata & Kesenjangan Konteks" },
  "about.timeline.phase1.desc": {
    en: "As international tourism flourished, unintentional violations of sacred spaces occurred primarily due to scattered, hard-to-find etiquette information.",
    id: "Lonjakan wisatawan global membawa keindahan sekaligus ketidaksengajaan pelanggaran tata krama di pura, yang dipicu minimnya informasi kontekstual yang mudah diakses.",
  },
  "about.timeline.phase1.h1": {
    en: "Post-pandemic surge in international tourist arrivals",
    id: "Peningkatan pesat kunjungan wisatawan internasional pasca-pandemi",
  },
  "about.timeline.phase1.h2": {
    en: "Frequent unintentional missteps due to scattered etiquette context",
    id: "Kesenjangan pemahaman tata krama dan batas kesucian pura",
  },
  "about.timeline.phase1.h3": {
    en: "Urgent need for accessible, respectful cultural guidance",
    id: "Kebutuhan mendesak panduan budaya kontekstual yang ramah dan mudah diakses",
  },

  "about.timeline.phase2.period": { en: "Phase 02 · Early 2025", id: "Babak 02 · Awal 2025" },
  "about.timeline.phase2.title": { en: "Official Governance: Circular No. 7/2025", id: "Momentum Regulasi: SE Gubernur No. 7/2025" },
  "about.timeline.phase2.desc": {
    en: "The Provincial Government of Bali enacted Circular No. 7 of 2025, establishing clear legal guidelines for sacred site boundaries and respectful tourist conduct.",
    id: "Pemerintah Provinsi Bali menerbitkan Surat Edaran No. 7 Tahun 2025 untuk menegaskan aturan tata perilaku wisatawan, batas zonasi pura, dan tata busana sakral.",
  },
  "about.timeline.phase2.h1": {
    en: "Enactment of Bali Governor Circular No. 7 of 2025",
    id: "Penerbitan resmi Surat Edaran Gubernur Bali No. 7 Tahun 2025",
  },
  "about.timeline.phase2.h2": {
    en: "Formalization of traditional kamen and sash dress requirements",
    id: "Kewajiban tata busana adat sopan kamen dan selendang",
  },
  "about.timeline.phase2.h3": {
    en: "Clear demarcation of Utama, Madya, and Nista Mandala zones",
    id: "Penegasan batas zonasi Utama, Madya, dan Nista Mandala di pura",
  },

  "about.timeline.phase3.period": { en: "Phase 03 · 2025–Present", id: "Babak 03 · 2025–Sekarang" },
  "about.timeline.phase3.title": { en: "The Birth of Sasana: Thoughtful Technology", id: "Kelahiran Sasana: Teknologi yang Beradab" },
  "about.timeline.phase3.desc": {
    en: "Sasana was crafted to bridge visitors with Balinese heritage via respectful on-device AI and accurate cultural zoning—empowering mindful exploration without friction.",
    id: "Sasana hadir sebagai jembatan santun antara wisatawan dan kearifan Bali melalui AI kamera privat dan panduan zona suci—mewujudkan kunjungan berkesadaran tanpa friksi.",
  },
  "about.timeline.phase3.h1": {
    en: "Launch of Sasana: ethical on-device AI for sacred spaces",
    id: "Kelahiran Sasana berbasis teknologi santun dan AI on-device privat",
  },
  "about.timeline.phase3.h2": {
    en: "Zero-trace camera checks protecting visitor and local privacy",
    id: "Pemeriksaan kamera tanpa jejak menjamin privasi warga dan pengunjung",
  },
  "about.timeline.phase3.h3": {
    en: "Preventive awareness empowering visitors before missteps occur",
    id: "Edukasi preventif aktif membimbing sebelum pelanggaran terjadi",
  },

  // Principles
  "about.principles.eyebrow": { en: "02 \u00b7 CORE VALUES", id: "02 \u00b7 NILAI UTAMA" },
  "about.principles.title": { en: "What we stand for", id: "Prinsip utama" },
  "about.principles.swipe_hint": {
    en: "\u2190 Swipe to explore principles",
    id: "\u2190 Geser untuk prinsip berikutnya",
  },
  "about.p1.title": { en: "Respect for Sacred Space", id: "Penghormatan Ruang Suci" },
  "about.p1.tag": { en: "Tri Mandala Zonation", id: "Zonasi Tri Mandala" },
  "about.p1.desc": {
    en: "Every sacred space has its own rules and spatial sanctity. SASANA helps visitors understand and honor them before entering.",
    id: "Setiap ruang sakral memiliki aturan dan kesucian zonanya sendiri. SASANA membantu wisatawan memahaminya sebelum berkunjung.",
  },
  "about.p1.footer": { en: "Rooted in Balinese spatial philosophy", id: "Berakar pada filosofi tata ruang suci" },

  "about.p2.title": { en: "Guidance Before Violation", id: "Edukasi Sebelum Pelanggaran" },
  "about.p2.tag": { en: "Preventive Care", id: "Pendekatan Preventif" },
  "about.p2.desc": {
    en: "Information is provided as gentle, contextual prevention rather than reprimands after unintentional missteps occur.",
    id: "Informasi diberikan sebagai panduan preventif yang bersahabat, bukan sebagai teguran setelah pelanggaran terjadi.",
  },
  "about.p2.footer": { en: "Cultivating mindful awareness", id: "Menumbuhkan kesadaran yang santun" },

  "about.p3.title": { en: "Trustworthy Sources", id: "Sumber yang Dapat Dipercaya" },
  "about.p3.tag": { en: "Verified Knowledge", id: "Kebenaran Terverifikasi" },
  "about.p3.desc": {
    en: "Guidelines trace directly to official regulations and verified Balinese customs so insights are never based on guesswork.",
    id: "Panduan mengutamakan regulasi resmi dan sumber terverifikasi agar informasi tidak pernah sekadar berdasar asumsi.",
  },
  "about.p3.footer": { en: "Strictly aligned with official decrees", id: "Bebas asumsi, berpijak pada hukum" },

  // Cultural Charter & Official Foundation
  "about.charter.eyebrow": { en: "03 \u00b7 COMMITMENT & LEGALITY", id: "03 \u00b7 KOMITMEN & LEGALITAS" },
  "about.charter.title": { en: "Cultural Charter & Legal Integrity", id: "Piagam Integritas Budaya & Hukum" },
  "about.charter.subtitle": {
    en: "A unified pact of verified cultural authority and unwavering privacy.",
    id: "Kesatuan landasan otoritas budaya resmi dan perlindungan privasi mutlak.",
  },
  "about.rules.eyebrow": { en: "OFFICIAL REGULATION", id: "REGULASI RESMI" },
  "about.rules.title": { en: "Legal basis and official regulations", id: "Dasar hukum dan aturan resmi" },
  "about.rules.subtitle": {
    en: "Bali Governor Circular No. 7 of 2025",
    id: "Surat Edaran Gubernur Bali No. 7 Tahun 2025",
  },
  "about.rules.body": {
    en: "Code of conduct and behavioral guidelines for foreign tourists in Bali, establishing sacred area protections and attire etiquette.",
    id: "Tata krama dan pedoman perilaku bagi wisatawan di Bali, menegaskan pelindungan kawasan pura dan etika busana adat.",
  },
  "about.rules.link": { en: "Bali Provincial Government Portal", id: "Portal Resmi Pemprov Bali" },
  "about.rules.view_doc": {
    en: "Read Official SE No. 7/2025 Document",
    id: "Baca Dokumen Resmi SE No. 7/2025",
  },
  "about.modal.doc_title": {
    en: "Bali Governor Circular No. 7/2025",
    id: "Surat Edaran Gubernur Bali No. 7 Tahun 2025",
  },
  "about.modal.doc_subtitle": {
    en: "SASANA Team's Analytical Review of Bali Governor Circular No. 7/2025",
    id: "Hasil Analisis & Telaah Tim SASANA terhadap SE Gubernur Bali No. 7/2025",
  },
  "about.modal.open_new_tab": {
    en: "Open in New Tab / Download",
    id: "Buka Tab Baru / Unduh PDF",
  },
  "about.modal.visit_portal": {
    en: "Bali Gov Portal",
    id: "Portal Pemprov Bali",
  },
  "about.modal.close": {
    en: "Close document",
    id: "Tutup dokumen",
  },
  "about.modal.mobile_hint": {
    en: "If the PDF preview is limited on your mobile device, use the button above to open or download the full document.",
    id: "Jika tampilan PDF terbatas di perangkat Anda, gunakan tombol di atas untuk membuka atau mengunduh dokumen lengkap.",
  },

  "about.privacy.eyebrow": { en: "DATA INTEGRITY", id: "INTEGRITAS DATA" },
  "about.privacy.title": { en: "100% On-Device Photo Privacy", id: "Privasi Foto 100% On-Device" },
  "about.privacy.body": {
    en: "Photos analyzed for attire or context checks are evaluated in volatile memory and immediately discarded. Never stored, logged, or used for model training.",
    id: "Foto yang Anda periksa diproses dalam memori sementara dan langsung dihapus. Tidak pernah disimpan di server, dicatat, atau digunakan untuk pelatihan model.",
  },
  "about.privacy.badge": { en: "Ephemeral Analysis Only", id: "Pemrosesan Instan Tanpa Log" },

  // Team
  "about.team.eyebrow": { en: "04 \u00b7 ARCHITECTS", id: "04 \u00b7 PENGEMBANG & KURATOR" },
  "about.team.title": {
    en: "The people behind SASANA",
    id: "Para pengembang di balik SASANA",
  },
  "about.team.subtitle": {
    en: "An interdisciplinary team combining ethical AI, responsive Balinese interface craft, and verified cultural scholarship.",
    id: "Kolaborasi antardisiplin yang menyatukan etika AI, estetika antarmuka khas Bali, dan verifikasi adat istiadat.",
  },
  "about.team.member1.role": { en: "Lead & AI Architecture", id: "Lead & Arsitektur AI" },
  "about.team.member1.focus": { en: "Gemini Vision \u00b7 System Core", id: "Gemini Vision \u00b7 System Core" },
  "about.team.member1.desc": {
    en: "Spearheading multimodal intelligence, strict ethical guardrails, and seamless architectural flow.",
    id: "Memimpin integrasi multimodal, sistem guardrail etis, dan fondasi arsitektur sistem Sasana.",
  },
  "about.team.member2.role": { en: "Frontend & Interface Craft", id: "Frontend & UI/UX Craft" },
  "about.team.member2.focus": { en: "Design System \u00b7 Balinese Aesthetics", id: "Design System \u00b7 Estetika Bali" },
  "about.team.member2.desc": {
    en: "Shaping an authentic, warm, and highly accessible digital experience honoring Balinese design roots.",
    id: "Merancang pengalaman antarmuka yang hangat, presisi, dan sarat identitas estetika tradisional Bali.",
  },
  "about.team.member3.role": { en: "Knowledge Base & Cultural QA", id: "Basis Budaya & QA" },
  "about.team.member3.focus": { en: "Customs KB \u00b7 Verification", id: "KB Adat Bali \u00b7 Verifikasi" },
  "about.team.member3.desc": {
    en: "Auditing customs against regional decrees and sacred tradition to prevent unsubstantiated claims.",
    id: "Memverifikasi setiap adat dan panduan agar selalu berpijak pada regulasi resmi serta tradisi murni.",
  },
  "about.team.org": {
    en: "SMK Wikrama Bogor \u00b7 SASANA Initiative",
    id: "SMK Wikrama Bogor \u00b7 SASANA Initiative",
  },

  // Closing & Call to Action
  "about.closing.eyebrow": { en: "SUKSEMA & COMMUNION", id: "SUKSMA & HARMONI" },
  "about.closing.title": { en: "Matur Suksma", id: "Matur Suksma" },
  "about.closing.line1": {
    en: "Arrive with curiosity.",
    id: "Datang dengan rasa ingin tahu.",
  },
  "about.closing.line2": {
    en: "Leave with respect.",
    id: "Tinggalkan tempat dengan rasa hormat.",
  },
  "about.closing.body": {
    en: "By understanding the customs of Bali, you become a guardian of its living culture. Explore the sacred sites or ask our cultural assistant whenever in doubt.",
    id: "Dengan memahami adat Bali, Anda menjadi bagian dari penjaga tradisi luhur ini. Jelajahi ruang sakral atau hubungi asisten budaya kami setiap saat.",
  },
  "about.closing.cta_explore": {
    en: "Explore Sacred Sites",
    id: "Jelajahi Ruang Sakral",
  },
  "about.closing.cta_check": {
    en: "Check Situation (Camera)",
    id: "Cek Situasi (Kamera)",
  },
  "about.version": { en: "SASANA v1.0 (MVP)", id: "SASANA v1.0 (MVP)" },
} satisfies Record<string, Entry>;

export type CopyKey = keyof typeof dict;

export function t(lang: Lang, key: CopyKey, params?: Record<string, string>): string {
  let text = dict[key][lang];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, value);
    }
  }
  return text;
}

