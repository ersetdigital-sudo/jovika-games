"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COLORS,
  FAQ,
  GAMES,
  ICO,
  INFO,
  PAY,
  PPOB,
  PROMO,
  allServices,
  hsh,
  inquiry,
  itemsOf,
  rp,
} from "@/lib/data";
import type { NominalOption, PayItem, PpobService, Service, TxRecord } from "@/types";

const SECTIONS = ["beranda", "katalog", "ppob", "promo", "cek", "faq"] as const;
const SLIDES = 3;

function Ico({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICO[name] || ICO.RPG || "" }}
    />
  );
}

function isPpob(g: Service): g is PpobService {
  return g.cat === "PPOB";
}

type ModalState = {
  g: Service;
  step: 1 | 2 | 3 | 4;
  uid: string;
  zone: string;
  server: string;
  wa: string;
  item: NominalOption | null;
  pay: PayItem | null;
  promo: string;
  disc: number;
  inv?: string;
  inq?: [string, string][] | null;
  paid?: boolean;
  verifying?: boolean;
  timeLeft?: number;
};

const seedTx: Record<string, TxRecord> = {
  "JVK-240118": {
    game: "Mobile Legends",
    item: "172 Diamond",
    id: "12345678 (2011)",
    pay: "QRIS",
    total: 39777,
    status: "Sukses",
    time: "18 Nov 2026, 20.14",
  },
};

export default function JovikaApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("beranda");
  const [si, setSi] = useState(0);
  const [cat, setCat] = useState("Semua");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [invInput, setInvInput] = useState("");
  const [cekResult, setCekResult] = useState<{ inv: string; tx?: TxRecord } | null>(null);
  const [txMap, setTxMap] = useState<Record<string, TxRecord>>({ ...seedTx });
  const [modal, setModal] = useState<ModalState | null>(null);
  const [stepError, setStepError] = useState("");
  const [promoMsg, setPromoMsg] = useState("");

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    setToastOn(true);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToastOn(false), 2200);
  }, []);

  const cats = useMemo(() => ["Semua", ...Array.from(new Set(GAMES.map((g) => g.cat)))], []);
  const filteredGames = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GAMES.filter((g) => (cat === "Semua" || g.cat === cat) && g.name.toLowerCase().includes(q));
  }, [cat, search]);

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setSi((s) => (s + 1) % SLIDES), 5500);
  }, []);

  const go = useCallback((i: number) => {
    setSi(((i % SLIDES) + SLIDES) % SLIDES);
  }, []);

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [resetAuto]);

  useEffect(() => {
    const onScroll = () => {
      let cur: string = "beranda";
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 120) cur = id;
      });
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (modal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  useEffect(() => {
    if (!modal || modal.step !== 4 || modal.paid || modal.verifying) return;
    timerRef.current = setInterval(() => {
      setModal((m) => {
        if (!m || m.step !== 4 || m.paid) return m;
        const next = (m.timeLeft ?? 900) - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...m, timeLeft: 0 };
        }
        return { ...m, timeLeft: next };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [modal?.step, modal?.paid, modal?.verifying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modal) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const openModal = useCallback((id: string) => {
    const g = allServices().find((x) => x.id === id);
    if (!g) return;
    setStepError("");
    setPromoMsg("");
    setModal({
      g,
      step: 1,
      uid: "",
      zone: "",
      server: "Asia",
      wa: "",
      item: null,
      pay: PAY[0]!.items[0]!,
      promo: "",
      disc: 0,
      inq: null,
      timeLeft: 900,
    });
  }, []);

  const closeModal = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setModal(null);
    setStepError("");
    setPromoMsg("");
  }, []);

  const calc = useCallback((m: ModalState) => {
    const sub = m.item ? m.item.p : 0;
    const fee = m.pay ? m.pay.fee(sub) : 0;
    let disc = 0;
    if (m.promo && PROMO[m.promo] && sub) disc = PROMO[m.promo]!(sub);
    if (m.promo === "QRISHEMAT" && (!m.pay || m.pay.id !== "qris")) disc = 0;
    return { sub, fee, disc, total: Math.max(sub + fee - disc, 0) };
  }, []);

  const copyCode = (code: string) => {
    try { navigator.clipboard?.writeText(code).catch(() => {}); } catch {}
    toast("Kode " + code + " disalin");
  };

  const onCek = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invInput.trim().toUpperCase();
    const tx = txMap[inv];
    setCekResult(tx ? { inv, tx } : { inv });
  };

  const renderTxHtml = (inv: string, t: TxRecord) => {
    const cls = t.status === "Sukses" ? "ok" : "wait";
    const rows: [string, string, boolean?, string?][] = [
      ["Invoice", inv],
      ["Status", t.status, true, cls],
      ["Game", t.game],
      ["Item", t.item],
      ["ID Akun", t.id],
      ["Pembayaran", t.pay],
      ["Total", rp(t.total)],
      ["Waktu", t.time],
    ];
    return (
      <>
        {rows.map(([label, value, isStatus, scls]) => (
          <div className="row" key={label}>
            <span>{label}</span>
            {isStatus ? <b className={`status ${scls}`}>{value}</b> : <b>{value}</b>}
          </div>
        ))}
      </>
    );
  };

  const stepLabels = modal
    ? isPpob(modal.g)
      ? ["1. Data Pelanggan", "2. Produk", "3. Pembayaran", "4. Bayar"]
      : ["1. Data Akun", "2. Nominal", "3. Pembayaran", "4. Bayar"]
    : [];

  const m = modal;
  const totals = m ? calc(m) : { sub: 0, fee: 0, disc: 0, total: 0 };

  const setM = (patch: Partial<ModalState>) => setModal((cur) => (cur ? { ...cur, ...patch } : cur));

  const handleNext = () => {
    if (!m) return;
    setStepError("");
    if (m.step === 1) {
      const uid = m.uid.trim();
      const zone = m.zone.trim();
      const wa = m.wa.trim().replace(/[\s-]/g, "");
      const g = m.g;
      const ok = /^\d{5,}$/.test(uid) && (!("zone" in g && g.zone) || /^\d{3,5}$/.test(zone)) && /^08\d{8,11}$/.test(wa);
      if (!ok) {
        setStepError(`Lengkapi ${("label" in g ? g.label : "User ID") || "User ID"}${"zone" in g && g.zone ? ", Zone ID," : ""} dan nomor WhatsApp yang valid.`);
        return;
      }
      const inq = isPpob(g) && uid.replace(/\D/g, "").length >= 8 ? inquiry(g, uid.replace(/\D/g, "")) : m.inq || null;
      setM({ uid, zone, wa, inq, step: 2 });
      return;
    }
    if (m.step === 2) {
      if (!m.item) { setStepError("Pilih salah satu nominal dulu."); return; }
      setM({ step: 3 });
      return;
    }
    if (m.step === 3) {
      if (!m.pay) { setStepError("Pilih metode pembayaran."); return; }
      const inv = "JVK-" + String(Math.floor(100000 + Math.random() * 899999));
      const d = new Date();
      const time = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const c = calc(m);
      const tx: TxRecord = {
        game: m.g.name,
        item: m.item!.n,
        id: m.uid + (m.zone ? " (" + m.zone + ")" : ""),
        pay: m.pay.n,
        total: c.total,
        status: "Menunggu Pembayaran",
        time,
      };
      setTxMap((prev) => ({ ...prev, [inv]: tx }));
      setM({ inv, step: 4, timeLeft: 900, paid: false, verifying: false });
      return;
    }
  };

  const markPaid = () => {
    if (!m || !m.inv) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setM({ verifying: true });
    setTimeout(() => {
      setTxMap((prev) => {
        const cur = prev[m.inv!];
        if (!cur) return prev;
        return { ...prev, [m.inv!]: { ...cur, status: "Sukses" } };
      });
      setModal((cur) => (cur ? { ...cur, verifying: false, paid: true } : cur));
    }, 1400);
  };

  const formatTimer = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  const invTx = m?.inv ? txMap[m.inv] : undefined;

  return (
    <>
      <header>
        <div className="wrap nav">
          <a href="#beranda" className="logo"><b>J</b>Jovika<span>Games</span></a>
          <ul className={`menu${menuOpen ? " open" : ""}`} id="menu">
            {SECTIONS.map((id) => {
              const labels: Record<string, string> = { beranda: "Beranda", katalog: "Game", ppob: "Pulsa & Tagihan", promo: "Promo", cek: "Cek Transaksi", faq: "FAQ" };
              return (
                <li key={id}>
                  <a href={`#${id}`} className={active === id ? "on" : ""} onClick={() => setMenuOpen(false)}>{labels[id]}</a>
                </li>
              );
            })}
          </ul>
          <a href="#katalog" className="btn">Mulai Top Up</a>
          <button className="burger" id="burger" aria-label="Buka menu" onClick={() => setMenuOpen((v) => !v)}>=</button>
        </div>
      </header>

      <main>
        <section className="hero" id="beranda">
          <div className="wrap hgrid">
            <div className="hcopy">
              <span className="tag">Game, pulsa, tagihan. Satu tempat.</span>
              <h1>Top up kelar<br />sebelum <em>match</em> mulai.</h1>
              <p className="lead">Diamond, pulsa, sampai token listrik masuk dalam hitungan detik. Bayar pakai QRIS, e-wallet, atau transfer bank.</p>
              <div className="quick">
                <a href="#katalog" className="qk"><b style={{ background: "#5b3df5", color: "#fff" }}><Ico name="game" size={20} /></b>Top Up Game</a>
                <button className="qk" data-open="pulsa" onClick={() => openModal("pulsa")}><b style={{ background: "#ff5a36", color: "#fff" }}><Ico name="pulsa" size={20} /></b>Pulsa</button>
                <button className="qk" data-open="pln" onClick={() => openModal("pln")}><b style={{ background: "#ffd23f" }}><Ico name="pln" size={20} /></b>Token PLN</button>
                <button className="qk" data-open="ewallet" onClick={() => openModal("ewallet")}><b style={{ background: "#14152b", color: "#fff" }}><Ico name="ewallet" size={20} /></b>E-Wallet</button>
              </div>
              <div className="hstats">
                <div><strong>1–3 mnt</strong><small>Rata-rata proses</small></div>
                <div><strong>24/7</strong><small>Sistem otomatis</small></div>
                <div><strong>120rb+</strong><small>Transaksi sukses</small></div>
              </div>
            </div>
            <div className="hside">
              <div className="slider">
                <div className="track" id="track" style={{ transform: `translateX(-${si * 100}%)` }}
                  onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
                  onTouchEnd={(e) => {
                    if (touchX.current === null) return;
                    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
                    if (Math.abs(dx) > 40) { go(si + (dx < 0 ? 1 : -1)); resetAuto(); }
                    touchX.current = null;
                  }}>
                  <div className="slide" style={{ background: "#5b3df5", color: "#fff" }}><span className="stag">Pengguna baru</span><div className="sbig">-10%</div><p>Diskon top up pertama, maks. Rp15.000.</p><div className="scode">JOVIKA10</div></div>
                  <div className="slide" style={{ background: "#ff5a36", color: "#fff" }}><span className="stag">Setiap Jumat</span><div className="sbig">Rp5rb</div><p>Potongan buat transaksi minimal Rp50.000.</p><div className="scode">JUMATGG</div></div>
                  <div className="slide" style={{ background: "#ffd23f", color: "#14152b" }}><span className="stag">Bayar pakai QRIS</span><div className="sbig">Cashback</div><p>Rp3.000 buat Weekly Diamond Pass.</p><div className="scode">QRISHEMAT</div></div>
                </div>
              </div>
              <div className="ctrl">
                <div className="dots" id="dots">
                  {Array.from({ length: SLIDES }).map((_, i) => (
                    <button key={i} aria-label={`Slide ${i + 1}`} className={i === si ? "on" : ""} onClick={() => { go(i); resetAuto(); }} />
                  ))}
                </div>
                <div className="arrows">
                  <button id="prev" aria-label="Sebelumnya" onClick={() => { go(si - 1); resetAuto(); }}>&lt;</button>
                  <button id="next" aria-label="Berikutnya" onClick={() => { go(si + 1); resetAuto(); }}>&gt;</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="katalog">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="eyebrow">Katalog</div><h2>Hari ini main apa?</h2></div>
              <input className="search" id="search" name="search" type="search" aria-label="Cari nama game" autoComplete="off" placeholder="Cari nama game..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="filters" id="filters">
              {cats.map((c) => (
                <button key={c} className={`chip${c === cat ? " on" : ""}`} data-c={c} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            <div className="grid" id="grid">
              {filteredGames.map((g) => {
                const [bg, fg] = COLORS[g.col];
                return (
                  <button className="card" data-id={g.id} key={g.id} onClick={() => openModal(g.id)}>
                    <div className="poster" style={{ background: bg, color: fg }}>
                      <span className="ptop"><span className="pub">{g.pub}</span><span className="gico"><Ico name={g.cat} size={22} /></span></span>
                      <span className="nm">{g.name}</span>
                    </div>
                    <div className="meta"><b>{g.name}</b><small>Mulai {rp(g.items[0]![1])}</small></div>
                  </button>
                );
              })}
            </div>
            <p className="empty" id="empty" style={{ display: filteredGames.length ? "none" : "block" }}>Game-nya belum ada nih. Coba kata lain, atau request lewat WA.</p>
          </div>
        </section>

        <section id="ppob">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="eyebrow">Pulsa &amp; Tagihan</div><h2>Sekalian bayar yang lain</h2></div>
              <p>Pulsa habis, token listrik bunyi, tagihan BPJS nunggu. Beresin di sini juga, nggak perlu pindah aplikasi.</p>
            </div>
            <div className="ppob" id="ppobgrid">
              {PPOB.map((g) => {
                const [bg, fg] = COLORS[g.col];
                return (
                  <button className="ptile" data-id={g.id} key={g.id} onClick={() => openModal(g.id)}>
                    <span className="pico" style={{ background: bg, color: fg }}><Ico name={g.id} size={24} /></span>
                    <span><b>{g.name}</b><small>{g.desc}</small></span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="promo">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="eyebrow">Promo</div><h2>Promo yang lagi jalan</h2></div>
              <p>Salin kodenya, tempel pas checkout. Satu transaksi satu kode ya.</p>
            </div>
            <div className="promos">
              <div className="promo c"><div className="big">10%</div><b>Pengguna baru</b><p>Diskon 10% untuk transaksi pertama, maks. Rp15.000.</p><div className="code">JOVIKA10<button data-copy="JOVIKA10" onClick={() => copyCode("JOVIKA10")}>Salin</button></div></div>
              <div className="promo v"><div className="big">Rp5rb</div><b>Jumat Gajian</b><p>Potongan Rp5.000 minimal transaksi Rp50.000, setiap hari Jumat.</p><div className="code">JUMATGG<button data-copy="JUMATGG" onClick={() => copyCode("JUMATGG")}>Salin</button></div></div>
              <div className="promo"><div className="big">2x</div><b>Bonus Weekly Pass</b><p>Beli Weekly Diamond Pass pakai QRIS, dapat cashback Rp3.000.</p><div className="code">QRISHEMAT<button data-copy="QRISHEMAT" onClick={() => copyCode("QRISHEMAT")}>Salin</button></div></div>
            </div>
          </div>
        </section>

        <section id="bayar">
          <div className="wrap">
            <div className="sec-head">
              <div><div className="eyebrow">Metode Bayar</div><h2>Bayarnya pakai yang ada di HP</h2></div>
              <p>Konfirmasi otomatis. Nggak perlu screenshot bukti transfer ke siapa-siapa.</p>
            </div>
            <div className="pays">
              <div className="paybox"><h3>QRIS</h3><p>Scan dari aplikasi bank atau e-wallet apa pun. Biaya 0,7%.</p><div className="pills"><span>Semua bank</span><span>Semua e-wallet</span></div></div>
              <div className="paybox"><h3>E-Wallet</h3><p>Langsung diarahkan ke aplikasi. Biaya mulai Rp0.</p><div className="pills"><span>DANA</span><span>OVO</span><span>GoPay</span><span>ShopeePay</span></div></div>
              <div className="paybox"><h3>Transfer Bank (VA)</h3><p>Nomor Virtual Account unik per transaksi. Biaya Rp2.500.</p><div className="pills"><span>BCA</span><span>BRI</span><span>Mandiri</span><span>BNI</span></div></div>
            </div>
          </div>
        </section>

        <section id="cek">
          <div className="wrap cek">
            <div>
              <div className="eyebrow">Cek Transaksi</div>
              <h2>Pesananmu udah sampai mana?</h2>
              <p className="hint" style={{ fontSize: 15, marginTop: 12 }}>Ketik nomor invoice dari checkout tadi. Coba contoh <b style={{ color: "var(--text)" }}>JVK-240118</b> atau nomor dari pesananmu sendiri.</p>
            </div>
            <div>
              <form className="cekform" id="cekform" onSubmit={onCek}>
                <input id="inv" name="invoice" aria-label="Nomor invoice" autoComplete="off" spellCheck={false} placeholder="Contoh: JVK-240118" required value={invInput} onChange={(e) => setInvInput(e.target.value)} />
                <button className="btn" type="submit">Cek</button>
              </form>
              <div className={`result${cekResult ? " show" : ""}`} id="result">
                {cekResult && (cekResult.tx ? renderTxHtml(cekResult.inv, cekResult.tx) : (
                  <>
                    <b>Invoice tidak ditemukan.</b>
                    <p className="hint">Pastikan formatnya JVK-xxxxxx. Masih bingung? Chat CS di 0812-3456-7890.</p>
                  </>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="wrap">
            <div className="sec-head"><div><div className="eyebrow">FAQ</div><h2>Pertanyaan yang sering masuk</h2></div></div>
            <div className="faq" id="faqlist">
              {FAQ.map(([q, a], i) => (
                <div className={`qa${faqOpen === i ? " open" : ""}`} key={i}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}>{q}<i>+</i></button>
                  <div className="ans">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div>
              <a href="#beranda" className="logo"><b>J</b>Jovika<span>Games</span></a>
              <p style={{ color: "var(--muted)", marginTop: 12, maxWidth: 300 }}>Top up game tanpa drama. Kalau ada kendala, yang bales chat kamu orang beneran.</p>
            </div>
            <div><h4>Menu</h4><ul><li><a href="#katalog">Katalog Game</a></li><li><a href="#promo">Promo</a></li><li><a href="#cek">Cek Transaksi</a></li><li><a href="#faq">FAQ</a></li></ul></div>
            <div><h4>Jam Layanan CS</h4><ul><li>Senin–Jumat 08.00–23.00</li><li>Sabtu–Minggu 09.00–22.00</li><li>Sistem top up: 24 jam</li></ul></div>
            <div className="wa"><small>Ada yang nyangkut?</small><b>Chat kami di WhatsApp</b>0812-3456-7890<br /><a href="https://wa.me/6281234567890?text=Halo%20Jovika%20Games,%20saya%20mau%20tanya" target="_blank" rel="noopener">Hubungi CS</a></div>
          </div>
          <div className="legal"><span>© 2026 Jovika Games. Seluruh merek dagang milik pemiliknya masing-masing.</span><span>Syarat &amp; Ketentuan · Kebijakan Privasi</span></div>
        </div>
      </footer>

      {m && (
        <div className={`modal open`} id="modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="dialog">
            <div className="mhead">
              {(() => { const [bg, fg] = COLORS[m.g.col]; return <div className="mthumb" id="mthumb" style={{ background: bg, color: fg }}><Ico name={isPpob(m.g) ? m.g.id : m.g.cat} size={24} /></div>; })()}
              <div><h3 id="mtitle">{isPpob(m.g) ? "Bayar " : "Top Up "}{m.g.name}</h3><small id="mpub">{m.g.pub}</small></div>
              <button className="close" id="mclose" aria-label="Tutup" onClick={closeModal}>×</button>
            </div>
            <div className="steps" id="steps" aria-label="Langkah checkout">
              {stepLabels.map((label, i) => {
                const idx = i + 1;
                const cls = idx === m.step ? "on" : idx < m.step ? "done" : "";
                const text = label.replace(/^\d+\.\s*/, "");
                return (
                  <div key={i} className={`st ${cls}`.trim()}>
                    <span className="stn">{idx < m.step ? "✓" : idx}</span>
                    <span className="stl">{text}</span>
                  </div>
                );
              })}
            </div>
            <div className="mbody" id="mbody">
              {m.step === 1 && (
                <div className="block formstep">
                  {isPpob(m.g) && (
                    <div className="svcinfo">{(INFO[m.g.id] || []).map((t) => <span key={t}>{t}</span>)}</div>
                  )}
                  <div className="block-head">
                    <h4>{isPpob(m.g) ? "Data pelanggan" : "Data akun"}</h4>
                    <p className="hint" style={{ marginTop: 4 }}>{isPpob(m.g) ? "Isi nomor pelanggan, detail akan muncul otomatis." : "Pastikan ID sesuai agar pesanan masuk ke akun yang benar."}</p>
                  </div>
                  <div className="form-card">
                    <div className="two">
                      <div className="field">
                        <label htmlFor="f-uid">{("label" in m.g ? m.g.label : "User ID") || "User ID"}</label>
                        <input id="f-uid" name="uid" autoComplete="off" inputMode="numeric" placeholder={("ph" in m.g ? m.g.ph : "Contoh: 12345678") || "Contoh: 12345678"} value={m.uid}
                          onChange={(e) => {
                            const v = e.target.value;
                            let inq = m.inq;
                            if (isPpob(m.g)) {
                              const digits = v.replace(/\D/g, "");
                              inq = digits.length >= 8 ? inquiry(m.g, digits) : null;
                            }
                            setM({ uid: v, inq });
                            setStepError("");
                          }} />
                      </div>
                      {"zone" in m.g && m.g.zone ? (
                        <div className="field"><label htmlFor="f-zone">Zone ID</label><input id="f-zone" name="zone" autoComplete="off" inputMode="numeric" placeholder="Contoh: 2011" value={m.zone} onChange={(e) => { setM({ zone: e.target.value }); setStepError(""); }} /></div>
                      ) : "server" in m.g && m.g.server ? (
                        <div className="field"><label htmlFor="f-srv">Server</label><select id="f-srv" name="server" value={m.server} onChange={(e) => setM({ server: e.target.value })}>{["Asia", "America", "Europe", "TW/HK/MO"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                      ) : <div className="field field-empty" aria-hidden="true"></div>}
                    </div>
                    <div className="field" style={{ marginTop: 12 }}>
                      <label htmlFor="f-wa">Nomor WhatsApp</label>
                      <input id="f-wa" name="wa" autoComplete="tel" inputMode="tel" placeholder="08xxxxxxxxxx" value={m.wa} onChange={(e) => { setM({ wa: e.target.value }); setStepError(""); }} />
                      <span className="hint" style={{ marginTop: 6 }}>Untuk bukti dan info transaksi.</span>
                    </div>
                    {isPpob(m.g) && (
                      <div className={`inq${m.inq ? " show" : ""}`} id="inq">
                        {m.inq && (<><h5>Detail pelanggan</h5>{m.inq.map(([k, x]) => <div className="row" key={k}><span>{k}</span><b>{x}</b></div>)}</>)}
                      </div>
                    )}
                    <p className="err" id="err1" style={{ display: stepError ? "block" : "none" }}>{stepError}</p>
                  </div>
                  <p className="hint note-inline">{isPpob(m.g) ? "Periksa nama dan detail pelanggan sebelum lanjut." : "Kami tidak pernah meminta password akun game kamu."}</p>
                </div>
              )}

              {m.step === 2 && (() => {
                const its = itemsOf(m.g);
                return (
                  <div className="block formstep">
                    <div className="block-head">
                      <h4>Pilih {"list" in m.g && m.g.list ? "produk" : "nominal"}</h4>
                      {m.inq ? <p className="hint" style={{ marginTop: 4 }}>Untuk <b>{m.inq[0]?.[1]}</b> · {m.inq[1]?.[1]}</p> : <p className="hint" style={{ marginTop: 4 }}>Pilih nominal yang kamu butuhkan.</p>}
                    </div>
                    <div className="noms">
                      {its.map((it, i) => (
                        <button className={`opt${m.item && m.item.n === it.n ? " sel" : ""}`} data-i={i} key={it.n + i} onClick={() => { setM({ item: it }); setStepError(""); }}>
                          {it.hot ? <span className="hot">Laris</span> : null}
                          <b style={{ marginTop: it.hot ? 10 : 0 }}>{it.n}</b>
                          {it.old ? <s>{rp(it.old)}</s> : <span className="opt-spacer" />}
                          <span className="price">{rp(it.p)}</span>
                        </button>
                      ))}
                    </div>
                    <p className="err" id="err2" style={{ display: stepError ? "block" : "none" }}>{stepError}</p>
                  </div>
                );
              })()}

              {m.step === 3 && (
                <div className="step3-layout">
                  <div className="block formstep">
                    <div className="block-head">
                      <h4>Metode pembayaran</h4>
                      <p className="hint" style={{ marginTop: 4 }}>Pilih cara bayar yang paling nyaman.</p>
                    </div>
                    <div className="paygroups">
                      {PAY.map((grp) => (
                        <div className="paygroup" key={grp.g}>
                          <p>{grp.g}</p>
                          <div className="payopts">
                            {grp.items.map((p) => (
                              <button className={`opt payopt${m.pay && m.pay.id === p.id ? " sel" : ""}`} data-p={p.id} key={p.id} onClick={() => { setM({ pay: p }); setStepError(""); }}>
                                <span className="payopt-main">
                                  <b>{p.n}</b>
                                  <small>{p.fee(totals.sub) ? "Biaya " + rp(p.fee(totals.sub)) : "Tanpa biaya"}</small>
                                </span>
                                <span className="price">{rp(totals.sub + p.fee(totals.sub))}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="err" id="err3" style={{ display: stepError ? "block" : "none" }}>{stepError}</p>
                  </div>
                  <div className="block formstep">
                    <div className="block-head">
                      <h4>Kode promo</h4>
                      <p className="hint" style={{ marginTop: 4 }}>Opsional, satu kode per transaksi.</p>
                    </div>
                    <div className="promo-row">
                      <input id="f-promo" name="promo" aria-label="Kode promo" autoComplete="off" spellCheck={false} placeholder="Contoh: JOVIKA10" value={m.promo} onChange={(e) => setM({ promo: e.target.value })} />
                      <button className="btn ghost" id="applyp" type="button" onClick={() => {
                        const code = m.promo.trim().toUpperCase();
                        if (code && !PROMO[code]) toast("Kode promo tidak dikenal");
                        const next = { ...m, promo: code };
                        const c = calc(next);
                        setM({ promo: code, disc: c.disc });
                        setPromoMsg(code ? (c.disc ? "Promo aktif, hemat " + rp(c.disc) : "Kode tidak berlaku untuk pesanan ini.") : "");
                      }}>Pakai</button>
                    </div>
                    <p className={`promo-msg${promoMsg || (m.promo && totals.disc) ? " ok" : (m.promo && !totals.disc ? " warn" : "")}`} id="promomsg">{promoMsg || (m.promo && totals.disc ? "Promo aktif, hemat " + rp(totals.disc) : m.promo && !totals.disc ? "Kode tidak berlaku untuk pesanan ini." : "Belum ada kode promo dipakai.")}</p>
                  </div>
                  <div className="block confirm receipt">
                    <div className="block-head"><h4>Ringkasan pesanan</h4></div>
                    <div className="receipt-body">
                      {m.inq ? m.inq.map(([k, x]) => <div className="row" key={k}><span>{k}</span><b>{x}</b></div>) : <div className="row"><span>Akun</span><b>{m.uid}{m.zone ? " (" + m.zone + ")" : ""}{"server" in m.g && m.g.server ? " · " + m.server : ""}</b></div>}
                      <div className="row"><span>Item</span><b>{m.item?.n}</b></div>
                      <div className="row"><span>Harga</span><b>{rp(totals.sub)}</b></div>
                      <div className="row"><span>Biaya layanan</span><b>{rp(totals.fee)}</b></div>
                      {totals.disc ? <div className="row disc"><span>Diskon</span><b>-{rp(totals.disc)}</b></div> : null}
                      <div className="row total"><span>Total bayar</span><b>{rp(totals.total)}</b></div>
                    </div>
                  </div>
                </div>
              )}

              {m.step === 4 && m.inv && (
                <div className="paybox2 ty" id="paystate">
                  {!m.paid ? (
                    <>
                      <div className="pay-top">
                        <p className="eyebrow">Invoice {m.inv}</p>
                        <h3 className="tyh">Selesaikan pembayaran</h3>
                        <p className="hint" style={{ margin: 0 }}>{m.item?.n} · {m.inq ? m.inq[0]?.[1] : m.uid}</p>
                      </div>
                      <div className="pay-amount-card">
                        <span>Total bayar</span>
                        <b>{rp(totals.total)}</b>
                        <p className="pay-timer">Sisa waktu <span className="timer" id="timer">{formatTimer(m.timeLeft ?? 900)}</span></p>
                      </div>
                      {m.pay?.id === "qris" ? (
                        <>
                          <div className="qrwrap">
                            <div className="qrhead"><span>QRIS</span>JOVIKA GAMES</div>
                            <img src="/assets/images/payments/qris-baru.png" alt="Kode QRIS" style={{ width: 200, maxWidth: "100%", height: "auto", display: "block", margin: "0 auto", background: "#fff", borderRadius: 12 }} />
                            <div className="qrfoot">NMID: ID1026{m.inv.slice(4)}88 · A01</div>
                          </div>
                          <div className="howto"><b>Cara bayar</b><ol><li>Buka m-banking atau e-wallet apa pun.</li><li>Pilih Scan / QRIS dan arahkan ke kode di atas.</li><li>Pastikan nominal {rp(totals.total)}, lalu konfirmasi.</li></ol></div>
                          <button className="btn ghost" onClick={() => toast("QRIS disimpan")}>Simpan QRIS</button>
                        </>
                      ) : ["bca", "bri", "mandiri", "bni"].includes(m.pay?.id || "") ? (
                        <div className="va-block">
                          <p className="hint" style={{ margin: 0 }}>Transfer ke Virtual Account {m.pay?.n}</p>
                          <div className="va">8808 {m.inv.slice(4)} {String(Date.now()).slice(-4)}</div>
                          <button className="btn ghost" onClick={() => toast("Nomor VA disalin")}>Salin nomor VA</button>
                        </div>
                      ) : (
                        <div className="va-block">
                          <p className="hint" style={{ margin: 0 }}>Notifikasi pembayaran dikirim ke {m.pay?.n} ({m.wa}).</p>
                          <div className="va">{m.pay?.n}</div>
                        </div>
                      )}
                      <div className="pay-actions">
                        <button className="btn" id="paid" onClick={markPaid} disabled={m.verifying}>{m.verifying ? "Memverifikasi..." : "Saya sudah bayar"}</button>
                      </div>
                      <p className="hint" style={{ marginTop: 10 }}>Konfirmasi setelah pembayaran selesai untuk melihat status pesanan.</p>
                    </>
                  ) : (
                    (() => {
                      const t = invTx || txMap[m.inv];
                      return (
                        <>
                          <div className="done-badge">✓</div>
                          <h3 style={{ fontSize: 24 }}>{isPpob(m.g) ? "Pembayaran berhasil" : "Top up berhasil"}</h3>
                          <p className="hint" style={{ fontSize: 15 }}>
                            {m.g.id === "pln"
                              ? "Masukkan token ini ke meteran kamu:"
                              : isPpob(m.g)
                                ? ("list" in m.g && m.g.list
                                  ? `Tagihan sudah lunas. Struk resmi dikirim ke WhatsApp ${m.wa}.`
                                  : `${m.item?.n} sudah masuk ke ${m.uid}.`)
                                : `${m.item?.n} sudah dikirim ke akun ${m.uid}.`} {m.g.id === "pln" ? "" : `Bukti transaksi dikirim ke WhatsApp ${m.wa}.`}
                          </p>
                          {m.g.id === "pln" ? (
                            <div className="tokenbox">{String(hsh(m.inv) * 7919 + 1e19).slice(0, 20).replace(/(\d{4})(?=\d)/g, "$1-")}</div>
                          ) : null}
                          {"list" in m.g && m.g.list ? (
                            <div className="tokenbox" style={{ fontSize: 14 }}>No. Ref: {m.inv.slice(4)}{hsh(m.uid)}2611</div>
                          ) : null}
                          {t ? <div className="confirm" style={{ textAlign: "left", marginTop: 16 }}>{renderTxHtml(m.inv, t)}</div> : null}
                          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
                            <button className="btn" onClick={closeModal}>Selesai</button>
                            <a className="btn ghost" href="#cek" onClick={() => { setInvInput(m.inv!); closeModal(); }}>Cek transaksi</a>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
            {m.step < 4 && (
              <div className="mfoot" id="mfoot">
                <div className="sum"><small id="sumlabel">{m.item ? m.item.n : "Total bayar"}</small><b id="total">{rp(totals.total)}</b></div>
                <div style={{ display: "flex", gap: 8 }}>
                  {m.step > 1 ? <button className="btn ghost" id="back" onClick={() => { setStepError(""); setM({ step: (m.step - 1) as 1 | 2 | 3 }); }}>Kembali</button> : null}
                  <button className="btn" id="nextbtn" onClick={handleNext}>{m.step === 1 ? "Lanjut pilih nominal" : m.step === 2 ? "Lanjut pembayaran" : "Bayar sekarang"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`toast${toastOn ? "" : ""}`} id="toast" style={{ display: toastOn ? "block" : "none" }}>{toastMsg}</div>
    </>
  );
}
