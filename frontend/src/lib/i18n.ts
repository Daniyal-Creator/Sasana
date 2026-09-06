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
  "nav.about_sasana": { en: "About SASANA", id: "About SASANA" },
  "nav.about_us": { en: "About Us", id: "About Us" },
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
  "about_section.action.check": { en: "Check Outfit & Surroundings", id: "Cek Pakaian & Situasi" },
  "about_section.action.assistant": { en: "Ask Custom Assistant", id: "Tanya Asisten Adat" },
  "about_section.action.explore": { en: "Explore Sacred Sites", id: "Jelajahi Situs Suci" },
  "about_section.check.title": { en: "Situation Check", id: "Cek Situasi" },
  "about_section.check.desc": {
    en: "Photograph your outfit or surroundings and learn whether they match the customs of the site you are visiting.",
    id: "Foto pakaian atau lingkungan Anda dan ketahui apakah sudah sesuai dengan adat di tempat yang Anda kunjungi.",
  },
  "about_section.assistant.title": { en: "Assistant", id: "Asisten" },
  "about_section.assistant.desc": {
    en: "Ask any question about Balinese customs. Answers are drawn from the Governor Circular No.\u00a07/2025, not opinions.",
    id: "Tanyakan apa saja tentang adat Bali. Jawaban berasal dari Surat Edaran Gubernur No.\u00a07/2025, bukan opini.",
  },
  "about_section.zones.title": { en: "Zones and Notices", id: "Zona dan Pemberitahuan" },
  "about_section.zones.desc": {
    en: "Receive a notice when you approach a sacred site, so you know the customs before you arrive.",
    id: "Terima pemberitahuan saat Anda mendekati tempat suci, agar Anda mengetahui adatnya sebelum tiba.",
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
  "check.meta.locationAdd": { en: "Add location", id: "Tambahkan lokasi" },
  "check.meta.device": { en: "Taken on {device}", id: "Diambil dengan {device}" },
  "check.privacy": {
    en: "Your photo is analyzed once and never stored. The time it was taken travels with it, and the location too when you allow it. On the free AI tier, Google may use submitted data to improve its products.",
    id: "Foto Anda dianalisis sekali saja dan tidak pernah disimpan. Waktu pengambilan ikut terkirim, begitu juga lokasi bila Anda mengizinkannya. Pada layanan AI gratis, Google dapat memakai data yang dikirim untuk meningkatkan produknya.",
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
  "assistant.chip.photo": {
    en: "Is it okay to take photos inside?",
    id: "Boleh memotret di dalam?",
  },
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
  "assistant.sidebar.title": { en: "Sasana Guide", id: "Panduan Sasana" },
  "assistant.sidebar.explore": { en: "Explore", id: "Jelajahi" },
  "assistant.sidebar.about.title": { en: "About sources", id: "Tentang sumber" },
  "assistant.sidebar.about.body": {
    en: "Official rules cite their source. Cultural background and history do not, and are marked as such.",
    id: "Aturan resmi mengutip sumbernya. Penjelasan budaya dan sejarah tidak, dan ditandai begitu.",
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
  "sr.you": { en: "You said", id: "Anda berkata" },
  "sr.assistant": { en: "Sasana said", id: "Sasana berkata" },

  "about.eyebrow": {
    en: "OFFICIAL ETHOS & GUIDANCE",
    id: "PEDOMAN RESMI & ETIKA",
  },
  "about.title": { en: "About SASANA", id: "Tentang SASANA" },
  "about.tagline": {
    en: "Preserving sanctity, guiding visitors with cultural respect.",
    id: "Menjaga kesucian, memandu wisatawan dengan rasa hormat.",
  },
  "about.mission.title": { en: "Our Mission", id: "Misi Kami" },
  "about.mission.body": {
    en: "SASANA helps visitors understand and respect Bali's customs in real time and in their own language, so that violations are prevented with dignity before they happen.",
    id: "SASANA membantu wisatawan memahami dan menghormati adat Bali secara langsung dan dalam bahasa mereka sendiri, agar pelanggaran dapat dicegah dengan santun sebelum terjadi.",
  },
  "about.etymology.title": { en: "The Meaning of Sasana", id: "Makna Sasana" },
  "about.etymology.body": {
    en: "Derived from Sanskrit and Old Javanese, 'Sasana' signifies a noble code of conduct, moral instruction, and sacred guidance. SASANA exists to uphold the harmony of Tri Hita Karana by bridging visitors with authentic Balinese customs.",
    id: "Berasal dari bahasa Sanskerta dan Jawa Kuno, 'Sasana' bermakna tuntunan laku luhur, tata krama, dan pedoman suci. SASANA hadir untuk menjaga keharmonisan Tri Hita Karana dengan menjembatani wisatawan dan adat Bali yang sakral.",
  },
  "about.principles.title": { en: "Guiding Principles", id: "Prinsip Utama" },
  "about.p1.title": { en: "Respect for Sacred Space", id: "Penghormatan Ruang Suci" },
  "about.p1.desc": {
    en: "Every site in Bali is living heritage. We help visitors understand sacred boundaries and traditional etiquette before stepping onto temple grounds.",
    id: "Setiap tempat suci di Bali adalah warisan hidup. Kami membantu wisatawan memahami batasan kesucian dan etika adat sebelum memasuki area pura.",
  },
  "about.p2.title": { en: "Guidance Before Violation", id: "Edukasi Sebelum Pelanggaran" },
  "about.p2.desc": {
    en: "We provide clear, actionable suggestions rather than blame, empowering visitors to dress and behave appropriately with confidence.",
    id: "Kami memberikan arahan yang jelas dan solutif alih-alih teguran, sehingga wisatawan dapat berbusana dan bersikap pantas dengan percaya diri.",
  },
  "about.p3.title": { en: "Grounded in Official Authority", id: "Berakar pada Sumber Resmi" },
  "about.p3.desc": {
    en: "Every guideline is sourced directly from Governor Circular No. 7/2025 and validated site data, never from assumptions or opinions.",
    id: "Setiap panduan bersumber langsung dari Surat Edaran Gubernur No. 7/2025 dan data situs terverifikasi, bukan asumsi atau opini.",
  },
  "about.rules.title": { en: "The Rules We Reference", id: "Dasar Hukum & Aturan Resmi" },
  "about.rules.badge": { en: "PROVINCIAL REGULATION", id: "PERATURAN PROVINSI" },
  "about.rules.body": {
    en: "Bali Governor Circular (SE) No. 7 of 2025 on the code of conduct for foreign tourists visiting Bali.",
    id: "Surat Edaran Gubernur Bali (SE) No. 7 Tahun 2025 tentang tata krama dan pedoman perilaku bagi wisatawan asing di Bali.",
  },
  "about.rules.link": { en: "Read the official source", id: "Baca sumber resmi" },
  "about.privacy.title": { en: "Privacy by Design", id: "Jaminan Privasi Foto" },
  "about.privacy.body": {
    en: "Your uploaded photos are analyzed in memory and immediately discarded. Photos are never stored, logged, or used for model training.",
    id: "Foto yang Anda unggah dianalisis secara instan dalam memori dan langsung dihapus. Foto tidak pernah disimpan, dicatat, atau digunakan untuk pelatihan model.",
  },
  "about.team.title": { en: "The Engineering Team", id: "Tim Pengembang" },
  "about.team.subtitle": {
    en: "Built with dedication by the SASANA team at SMK Wikrama Bogor.",
    id: "Dikembangkan dengan dedikasi oleh tim pengembang SASANA di SMK Wikrama Bogor.",
  },
  "about.team.org": {
    en: "SMK Wikrama Bogor · SASANA Group",
    id: "SMK Wikrama Bogor · SASANA Group",
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

