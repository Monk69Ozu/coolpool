/* global React */

const GALLERY = [
  { cat: 'Pools', label: 'Garten-Pool · Bruck/Leitha', tile: 'pool' },
  { cat: 'Überdachungen', label: 'WPS Tropic · Eisenstadt', tile: 'sand' },
  { cat: 'Produkte', label: 'Chemie-Set für die Saison', tile: 'dark' },
  { cat: 'Pools', label: 'Folienpool · Sommerein', tile: 'pool' },
  { cat: 'Zubehör', label: 'Poolroboter im Einsatz', tile: 'pool' },
  { cat: 'Überdachungen', label: 'WPS Relax · Niederösterreich', tile: 'sand' },
  { cat: 'Pools', label: 'Naturpool · Burgenland', tile: 'pool' },
  { cat: 'Zubehör', label: 'Filter & Sandfilter-Anlage', tile: 'dark' },
  { cat: 'Produkte', label: 'Multi-Tabletten Lieferung', tile: 'pool' },
  { cat: 'Pools', label: 'Edelstahlpool · Wien Umgebung', tile: 'sand' },
  { cat: 'Überdachungen', label: 'WPS Champion · Pannonien', tile: 'dark' },
  { cat: 'Zubehör', label: 'Kescher und Bürsten', tile: 'pool' },
];

function GalleryKontaktPage() {
  const [filter, setFilter] = useState('Alle');
  const [lightbox, setLightbox] = useState(null);
  const [sent, setSent] = useState(false);
  const items = filter === 'Alle' ? GALLERY : GALLERY.filter(g => g.cat === filter);

  function onSubmit(e) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 6000);
    e.target.reset();
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="crumb"><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Galerie & Kontakt</div>
          <h1>Galerie & Kontakt</h1>
          <p>Eindrücke aus 30 Jahren Poolbau, Wasserpflege und Beratung – und der direkte Draht zu uns.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Galerie</span>
            <h2>Pools, Produkte und Projekte</h2>
          </div>
          <div className="gallery-filters">
            {['Alle', 'Pools', 'Produkte', 'Überdachungen', 'Zubehör'].map(f => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="gallery-grid">
            {items.map((g, i) => (
              <a key={i} onClick={(e) => { e.preventDefault(); setLightbox(g); }} href="#">
                <div className={`placeholder ${g.tile}`}>{g.label.toUpperCase()}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="contact-grid">
            <div>
              <span className="eyebrow">Kontakt</span>
              <h2>Schreiben Sie uns – wir melden uns schnell zurück.</h2>
              <p className="lead">Fragen zu Produkten, Wasserpflege oder einem Angebot für eine WPS-Überdachung? Wir antworten in der Regel innerhalb von 24 Stunden – oder rufen Sie uns einfach direkt an.</p>

              <div className="contact-card" style={{ marginTop: 32 }}>
                <div className="contact-row">
                  <div className="ico"><Icon.pin/></div>
                  <div>
                    <div className="label">Adresse</div>
                    <div className="val">Sarasdorferweg 3A<br/>2453 Sommerein, Österreich</div>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="ico"><Icon.phone/></div>
                  <div>
                    <div className="label">Telefon</div>
                    <div className="val"><a href="tel:+436776340572">+43 677 634 05072</a></div>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="ico"><Icon.mail/></div>
                  <div>
                    <div className="label">E-Mail</div>
                    <div className="val"><a href="mailto:Coolpool@gmx.at">Coolpool@gmx.at</a></div>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="ico"><Icon.chat/></div>
                  <div>
                    <div className="label">Ansprechpartner</div>
                    <div className="val">Mück Alex</div>
                  </div>
                </div>
              </div>

              <div className="map-card" aria-label="Karte Standort Sommerein">
                <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M40 0H0v40" fill="none" stroke="oklch(0.84 0.02 230)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="500" fill="oklch(0.93 0.02 200)"/>
                  <rect width="800" height="500" fill="url(#grid)"/>
                  <path d="M0 280 Q200 240 400 270 T800 250" stroke="oklch(0.78 0.10 195)" strokeWidth="40" fill="none" opacity="0.5"/>
                  <path d="M120 50 Q220 200 350 250 T700 460" stroke="oklch(0.55 0.04 80)" strokeWidth="6" fill="none" opacity="0.6"/>
                  <path d="M40 400 L760 380" stroke="oklch(0.55 0.04 80)" strokeWidth="4" fill="none" opacity="0.6"/>
                  <circle cx="160" cy="120" r="3" fill="oklch(0.40 0.04 240)"/>
                  <text x="170" y="115" fontFamily="Outfit" fontSize="14" fill="oklch(0.40 0.04 240)">Wien</text>
                  <circle cx="600" cy="380" r="3" fill="oklch(0.40 0.04 240)"/>
                  <text x="610" y="376" fontFamily="Outfit" fontSize="14" fill="oklch(0.40 0.04 240)">Eisenstadt</text>
                </svg>
                <div className="map-pin">📍 Sommerein</div>
              </div>
            </div>

            <div className="contact-card">
              <h3>Schreiben Sie uns eine Nachricht</h3>
              <p style={{ color: 'var(--ink-soft)' }}>Felder mit * sind Pflichtfelder. Wir melden uns so schnell wie möglich bei Ihnen zurück.</p>

              <div className={`form-success ${sent ? 'show' : ''}`}>
                <Icon.check style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 8 }}/>
                Danke! Ihre Nachricht ist bei uns angekommen.
              </div>

              <form onSubmit={onSubmit}>
                <div>
                  <label htmlFor="f-name">Name *</label>
                  <input id="f-name" name="name" required placeholder="Vor- und Nachname"/>
                </div>
                <div className="form-grid-2">
                  <div>
                    <label htmlFor="f-phone">Telefonnummer *</label>
                    <input id="f-phone" name="phone" type="tel" required placeholder="z. B. 0677 …"/>
                  </div>
                  <div>
                    <label htmlFor="f-mail">E-Mail</label>
                    <input id="f-mail" name="email" type="email" placeholder="ihre@email.at"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="f-subject">Betreff</label>
                  <select id="f-subject" name="subject">
                    <option>Allgemeine Anfrage</option>
                    <option>Wasserpflege-Beratung</option>
                    <option>Produkt bestellen</option>
                    <option>WPS Poolüberdachung Angebot</option>
                    <option>Service / Reparatur</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-msg">Nachricht *</label>
                  <textarea id="f-msg" name="message" required placeholder="Erzählen Sie uns, wobei wir helfen können …"/>
                </div>
                <button className="btn btn--primary btn--lg" type="submit">Absenden <Icon.arrow style={{ width: 20, height: 20 }}/></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className={`lightbox ${lightbox ? 'open' : ''}`} onClick={() => setLightbox(null)}>
        {lightbox && (
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setLightbox(null)} aria-label="Schließen">✕</button>
            <div className={`placeholder ${lightbox.tile}`} style={{ height: '100%', fontSize: 18 }}>{lightbox.label.toUpperCase()}</div>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================================
   APP ROOT
============================================================ */
function App() {
  const [route, go] = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  function toggleCart(id) {
    setCart(c => {
      const next = { ...c };
      if (next[id]) { delete next[id]; setToast('Aus dem Warenkorb entfernt'); }
      else { next[id] = 1; setToast('Zum Warenkorb hinzugefügt'); }
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
      return next;
    });
  }

  // initialise hero on home – wait one frame so canvas is in DOM
  useEffect(() => {
    if (route !== 'home') return;
    let s;
    const id = requestAnimationFrame(() => {
      // avoid double-init when navigating back
      if (window.__heroRunning) return;
      window.__heroRunning = true;
      s = document.createElement('script');
      s.src = 'hero3d.js';
      document.body.appendChild(s);
    });
    return () => {
      cancelAnimationFrame(id);
      window.__heroRunning = false;
      try { if (s) document.body.removeChild(s); } catch (_) {}
    };
  }, [route]);

  let page;
  if (route === 'shop') page = <ShopPage cart={cart} toggleCart={toggleCart}/>;
  else if (route === 'chemie') page = <ChemiePage/>;
  else if (route === 'reinigung') page = <ReinigungPage/>;
  else if (route === 'ueberdachung') page = <UeberdachungPage/>;
  else if (route === 'galerie') page = <GalleryKontaktPage/>;
  else page = <HomePage/>;

  return (
    <>
      <Header route={route} openMenu={() => setMenuOpen(true)}/>
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} route={route} go={go}/>
      <main data-screen-label={route}>{page}</main>
      <Footer/>
      <div className={`cart-toast ${toast ? 'show' : ''}`}>
        <Icon.check style={{ width: 20, height: 20, color: 'oklch(0.8 0.15 145)' }}/> {toast}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
