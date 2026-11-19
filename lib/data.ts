import type { ColorKey, Game, NominalOption, PayGroup, PpobService, Service } from "@/types";

export const COLORS: Record<ColorKey, [string, string]> = {
  c: ["#5b3df5", "#ffffff"],
  v: ["#ff5a36", "#ffffff"],
  w: ["#ffd23f", "#14152b"],
  d: ["#14152b", "#ffffff"],
};

export const GAMES: Game[] = [
  { id: "ml", name: "Mobile Legends", pub: "Moonton", cat: "MOBA", unit: "Diamond", zone: true, col: "c", items: [[86, 19900], [172, 39500], [257, 58900], [344, 78500], [514, 117000], [706, 158000], [1412, 315000], [2195, 489000]], pass: true },
  { id: "ff", name: "Free Fire", pub: "Garena", cat: "Battle Royale", unit: "Diamond", col: "v", items: [[70, 9500], [140, 18900], [355, 47000], [720, 94000], [1450, 188000], [2180, 282000], [3640, 470000], [7290, 935000]] },
  { id: "pubg", name: "PUBG Mobile", pub: "Level Infinite", cat: "Battle Royale", unit: "UC", col: "w", items: [[60, 14500], [325, 72000], [660, 145000], [1800, 360000], [3850, 720000], [8100, 1440000]] },
  { id: "gi", name: "Genshin Impact", pub: "HoYoverse", cat: "RPG", unit: "Genesis Crystal", server: true, col: "d", items: [[60, 15000], [330, 75000], [1090, 239000], [2240, 479000], [3880, 799000], [8080, 1599000]] },
  { id: "val", name: "Valorant", pub: "Riot Games", cat: "FPS", unit: "VP", col: "c", items: [[475, 55000], [1000, 110000], [2050, 220000], [3650, 385000], [5350, 550000], [11000, 1100000]] },
  { id: "hok", name: "Honor of Kings", pub: "Level Infinite", cat: "MOBA", unit: "Token", col: "d", items: [[16, 4000], [80, 16000], [240, 48000], [400, 79000], [800, 158000], [1200, 237000]] },
];

export const PPOB: PpobService[] = [
  { id: "pulsa", name: "Pulsa", pub: "Telkomsel, XL, Indosat, Tri, Smartfren", cat: "PPOB", unit: "Pulsa", col: "c", label: "Nomor HP", ph: "08xxxxxxxxxx", desc: "Semua operator", items: [[5000, 6500], [10000, 11500], [20000, 21000], [25000, 26000], [50000, 50500], [100000, 99500]], fmt: "rp" },
  { id: "data", name: "Paket Data", pub: "Semua operator", cat: "PPOB", unit: "", col: "v", label: "Nomor HP", ph: "08xxxxxxxxxx", desc: "Kuota harian sampai bulanan", list: [["3 GB / 7 hari", 15000], ["8 GB / 30 hari", 35000], ["15 GB / 30 hari", 55000], ["25 GB / 30 hari", 79000], ["50 GB / 30 hari", 119000], ["Unlimited Harian 1 hari", 7000]] },
  { id: "pln", name: "Token PLN", pub: "PLN Prabayar", cat: "PPOB", unit: "Token", col: "w", label: "Nomor Meter / ID Pelanggan", ph: "Contoh: 14234567890", desc: "Token langsung keluar", items: [[20000, 21500], [50000, 51500], [100000, 101500], [200000, 201500], [500000, 501500], [1000000, 1001500]], fmt: "rp" },
  { id: "plnpasca", name: "PLN Pascabayar", pub: "Tagihan listrik", cat: "PPOB", unit: "", col: "d", label: "ID Pelanggan", ph: "Contoh: 532110987654", desc: "Cek & bayar tagihan bulanan", list: [["Tagihan Nov 2026 · 900 VA", 187400], ["Tagihan Nov 2026 · 1300 VA", 312650]] },
  { id: "bpjs", name: "BPJS Kesehatan", pub: "Iuran bulanan", cat: "PPOB", unit: "", col: "c", label: "Nomor VA Keluarga", ph: "88888xxxxxxxxxxx", desc: "Bayar 1 sampai 12 bulan", list: [["Kelas 3 · 1 bulan", 42000], ["Kelas 2 · 1 bulan", 100000], ["Kelas 1 · 1 bulan", 150000], ["Kelas 3 · 3 bulan", 126000]] },
  { id: "pdam", name: "PDAM", pub: "Air minum daerah", cat: "PPOB", unit: "", col: "v", label: "Nomor Pelanggan", ph: "Contoh: 0102030405", desc: "Tersedia 100+ wilayah", list: [["Tagihan Nov 2026 · Rumah tangga", 98500], ["Tagihan Nov 2026 · Niaga", 214000]] },
  { id: "ewallet", name: "Saldo E-Wallet", pub: "DANA, OVO, GoPay, ShopeePay", cat: "PPOB", unit: "Saldo", col: "w", label: "Nomor HP terdaftar", ph: "08xxxxxxxxxx", desc: "Isi saldo tanpa ke minimarket", items: [[20000, 21000], [50000, 51000], [100000, 101000], [200000, 201000], [500000, 501000]], fmt: "rp" },
  { id: "internet", name: "Internet & TV", pub: "IndiHome, Biznet, First Media", cat: "PPOB", unit: "", col: "d", label: "Nomor Pelanggan", ph: "Contoh: 122334455667", desc: "Tagihan WiFi rumah", list: [["Tagihan Nov 2026 · 30 Mbps", 315000], ["Tagihan Nov 2026 · 50 Mbps", 385000]] },
];

export const INFO: Record<string, string[]> = {
  pulsa: ["Masuk 1-3 menit", "Semua operator", "Masa aktif ikut operator"],
  data: ["Kuota langsung aktif", "Bisa untuk semua jaringan 4G/5G", "Cek kuota via *888# atau app operator"],
  pln: ["Token dikirim via WA", "20 digit, langsung input ke meteran", "Cek kWh sebelum bayar"],
  plnpasca: ["Cek tagihan otomatis", "Denda dihitung sistem PLN", "Struk resmi dikirim via WA"],
  bpjs: ["Bayar untuk seluruh anggota keluarga", "Status aktif setelah 1x24 jam", "Bisa bayar sampai 12 bulan"],
  pdam: ["100+ PDAM daerah", "Tagihan terbaru otomatis", "Bukti bayar sah dari PDAM"],
  ewallet: ["Saldo masuk instan", "DANA, OVO, GoPay, ShopeePay", "Pastikan nomor sudah terdaftar"],
  internet: ["IndiHome, Biznet, First Media", "Bayar sebelum tgl 20 bebas denda", "Layanan tetap aktif"],
};

export const ICO: Record<string, string> = {
  MOBA: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2"/>',
  "Battle Royale": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  RPG: '<path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z"/>',
  FPS: '<path d="M3 10h14l2-2h2v4h-3l-1 2h-4l-1 3H8l1-3H5l-2-2z"/>',
  pulsa: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  data: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
  pln: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  plnpasca: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M13 6l-3 5h4l-2 4"/>',
  bpjs: '<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11z"/><path d="M12 9v5M9.5 11.5h5"/>',
  pdam: '<path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>',
  ewallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M7 6l9-3 1 3"/>',
  internet: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="14" r="1"/>',
};

export const NAMES = ["BUDI SANTOSO", "SITI RAHAYU", "AGUS PRASETYO", "DEWI LESTARI", "RIZKY PRATAMA", "NURUL HIDAYAH", "ANDI WIJAYA", "PUTRI MAHARANI"];
export const OPS = [["0811", "0812", "0813", "0821", "0822", "0852", "0853", "Telkomsel"], ["0817", "0818", "0819", "0859", "0877", "0878", "XL"], ["0814", "0815", "0816", "0855", "0856", "0857", "0858", "Indosat"], ["0895", "0896", "0897", "0898", "0899", "Tri"], ["0881", "0882", "0883", "0887", "0888", "0889", "Smartfren"]];

export function hsh(t: string) { return t.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 99991, 7); }

export function inquiry(g: PpobService, num: string): [string, string][] {
  const h = hsh(num), nm = NAMES[h % NAMES.length]!;
  if (["pulsa", "data"].includes(g.id)) { const op = OPS.find((o) => o.slice(0, -1).includes(num.slice(0, 4))); return [["Operator", op ? String(op[op.length - 1]) : "Operator tidak dikenali"], ["Nomor", num]]; }
  if (g.id === "ewallet") return [["Nama akun", nm], ["Nomor", num], ["Status", "Terverifikasi"]];
  if (g.id === "pln") return [["Nama", nm], ["No. Meter", num], ["Tarif/Daya", ["R1/900 VA", "R1/1300 VA", "R1/2200 VA"][h % 3]!]];
  if (g.id === "plnpasca") return [["Nama", nm], ["ID Pelanggan", num], ["Periode", "NOV 2026"], ["Pemakaian", (150 + h % 200) + " kWh"], ["Denda", "Rp0"]];
  if (g.id === "bpjs") return [["Nama", nm], ["No. VA", num], ["Anggota keluarga", (1 + h % 4) + " orang"], ["Cabang", ["Jakarta Pusat", "Bandung", "Surabaya", "Medan"][h % 4]!]];
  if (g.id === "pdam") return [["Nama", nm], ["No. Pelanggan", num], ["Wilayah", ["PDAM Tirta Pakuan", "PDAM Surya Sembada", "PDAM Tirtawening"][h % 3]!], ["Pemakaian", (12 + h % 25) + " m³"]];
  if (g.id === "internet") return [["Nama", nm], ["No. Pelanggan", num], ["Provider", ["IndiHome", "Biznet", "First Media"][h % 3]!], ["Jatuh tempo", "20 Nov 2026"]];
  return [];
}

export const PAY: PayGroup[] = [
  { g: "QRIS", items: [{ id: "qris", n: "QRIS", fee: (t) => Math.ceil(t * 0.007) }] },
  { g: "E-Wallet", items: [{ id: "dana", n: "DANA", fee: () => 0 }, { id: "ovo", n: "OVO", fee: (t) => Math.ceil(t * 0.015) }, { id: "gopay", n: "GoPay", fee: (t) => Math.ceil(t * 0.01) }, { id: "spay", n: "ShopeePay", fee: (t) => Math.ceil(t * 0.01) }] },
  { g: "Transfer Bank (Virtual Account)", items: [{ id: "bca", n: "BCA", fee: () => 2500 }, { id: "bri", n: "BRI", fee: () => 2500 }, { id: "mandiri", n: "Mandiri", fee: () => 2500 }, { id: "bni", n: "BNI", fee: () => 2500 }] },
];

export const PROMO: Record<string, (t: number) => number> = {
  JOVIKA10: (t) => Math.min(t * 0.1, 15000),
  JUMATGG: (t) => (t >= 50000 ? 5000 : 0),
  QRISHEMAT: () => 3000,
};

export const FAQ: [string, string][] = [
  ["Berapa lama proses top up?", "Umumnya 1–3 menit setelah pembayaran terverifikasi. Kalau lewat 15 menit belum masuk, langsung chat CS kami lewat WhatsApp dengan menyertakan nomor invoice."],
  ["Di mana saya bisa lihat ID dan Server?", "Biasanya ada di menu profil di dalam game. Untuk Mobile Legends, angka di dalam kurung adalah Zone ID."],
  ["Saya salah memasukkan ID, bisa dibatalkan?", "Item yang sudah terkirim tidak bisa ditarik kembali. Karena itu, cek ulang ID sebelum membayar. Kalau pesanan belum diproses, CS bisa bantu koreksi."],
  ["Apakah harus daftar akun dulu?", "Tidak perlu. Cukup isi ID game dan nomor WhatsApp untuk menerima bukti transaksi."],
  ["Pembayaran berhasil tapi status masih menunggu?", "Kadang bank butuh beberapa menit untuk konfirmasi. Muat ulang halaman Cek Transaksi. Jika lebih dari 30 menit, hubungi CS."],
  ["Apakah Jovika Games resmi dan aman?", "Kami bekerja sama dengan distributor voucher resmi. Kami tidak pernah meminta password akun game kamu."],
];

export function rp(n: number) { return "Rp" + Math.round(n).toLocaleString("id-ID"); }

export function itemsOf(g: Service): NominalOption[] {
  if ("list" in g && g.list) return g.list.map(([n, p]) => ({ n, p }));
  if ("fmt" in g && g.fmt === "rp" && "items" in g && g.items) return g.items.map(([q, p]) => ({ n: g.unit + " " + rp(q), p }));
  const items = "items" in g && g.items ? g.items : [];
  const arr: NominalOption[] = items.map(([q, p], i) => ({ n: `${q.toLocaleString("id-ID")} ${g.unit}`, p, old: i % 3 === 1 ? Math.round(p * 1.08 / 100) * 100 : 0, hot: i === 1 }));
  if ("pass" in g && g.pass) arr.unshift({ n: "Weekly Diamond Pass", p: 27500, old: 30000, hot: true });
  return arr;
}

export function allServices(): Service[] { return [...GAMES, ...PPOB]; }
