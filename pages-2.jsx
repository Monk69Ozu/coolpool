/* global React */

/* ============================================================
   FORMSPREE ENDPOINT
   1. Kostenlos registrieren auf formspree.io
   2. Neues Formular erstellen → ID kopieren (z.B. "xpwzabcd")
   3. Hier eintragen:
============================================================ */
const FORMSPREE_ID = 'IHRE_FORMSPREE_ID';

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
  const [sending, setSending] = useState(false);
  const items = filter === 'Alle' ? GALLERY : GALLERY.filter(g => g.cat === filter);

  // ESC-Taste schließt Lightbox
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (FORMSPREE_ID === 'IHRE_FORMSPREE_ID') {
      // Demo-Modus: Formspree noch nicht eingerichtet
      setSent(true);
      setTimeout(() => setSent(false), 6000);
      form.reset();
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 8000);
        form.reset();
      }
    } catch (_) {}
    setSending(false);
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

      <section className="section section--alt" id="kontakt-section">
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
                    <div className="val">Alex Mück</div>
                  </div>
                </div>
              </div>

            </div>

            <div className="contact-card">
              <h3>Schreiben Sie uns eine Nachricht</h3>
              <p style={{ color: 'var(--ink-soft)' }}>Felder mit <span style={{color:'var(--accent-coral)',fontWeight:700}}>*</span> sind Pflichtfelder.</p>

              <div className={`form-success ${sent ? 'show' : ''}`}>
                <Icon.check style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 8 }}/>
                Danke! Ihre Nachricht ist bei uns angekommen. Wir melden uns bald.
              </div>

              <form onSubmit={onSubmit}>
                <div>
                  <label htmlFor="f-name">Name <span style={{color:'var(--accent-coral)'}}>*</span></label>
                  <input id="f-name" name="name" required placeholder="Vor- und Nachname"/>
                </div>
                <div className="form-grid-2">
                  <div>
                    <label htmlFor="f-mail">E-Mail <span style={{color:'var(--accent-coral)'}}>*</span></label>
                    <input id="f-mail" name="email" type="email" required placeholder="ihre@email.at"/>
                  </div>
                  <div>
                    <label htmlFor="f-phone">Telefonnummer</label>
                    <input id="f-phone" name="phone" type="tel" placeholder="z. B. 0677 …"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="f-subject">Betreff</label>
                  <select id="f-subject" name="subject">
                    <option>Allgemeine Anfrage</option>
                    <option>Wasserpflege-Beratung</option>
                    <option>Produkt bestellen</option>
                    <option>WPS Poolüberdachung Angebot</option>
                    <option>Amazon-Update anfragen</option>
                    <option>Service / Reparatur</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-msg">Nachricht <span style={{color:'var(--accent-coral)'}}>*</span></label>
                  <textarea id="f-msg" name="message" required placeholder="Erzählen Sie uns, wobei wir helfen können …"/>
                </div>
                <button className="btn btn--primary btn--lg" type="submit" disabled={sending}
                  style={sending ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
                  {sending
                    ? 'Wird gesendet…'
                    : <><span>Absenden</span> <Icon.arrow style={{ width: 20, height: 20 }}/></>}
                </button>
              </form>
            </div>
          </div>

          {/* Map — full width below contact grid */}
          <div className="map-card" aria-label="Karte Standort Sommerein" style={{ marginTop: 40, aspectRatio: '21/6' }}>
            <svg viewBox="0 0 1050 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
              <defs>
                <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0v40" fill="none" stroke="#d4dee6" strokeWidth="0.8"/>
                </pattern>
                <radialGradient id="mapglow" cx="50%" cy="50%" r="40%">
                  <stop offset="0%" stopColor="#c8e8f5" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#e8f2f6" stopOpacity="0"/>
                </radialGradient>
              </defs>
              {/* Background */}
              <rect width="1050" height="300" fill="#e8f2f6"/>
              <rect width="1050" height="300" fill="url(#mapgrid)"/>
              <rect width="1050" height="300" fill="url(#mapglow)"/>
              {/* Donau — wide blue river */}
              <path d="M0 80 Q260 60 420 90 T700 75 T1050 88" stroke="#a8d8ee" strokeWidth="28" fill="none" opacity="0.7"/>
              {/* Autobahn A3 */}
              <path d="M0 200 Q300 185 525 190 T1050 178" stroke="#c8b870" strokeWidth="5" fill="none" opacity="0.7"/>
              <path d="M0 200 Q300 185 525 190 T1050 178" stroke="white" strokeWidth="2" strokeDasharray="18 10" fill="none" opacity="0.8"/>
              {/* Landstraße */}
              <path d="M320 0 Q410 100 525 190 T680 300" stroke="#bbb" strokeWidth="3" fill="none" opacity="0.6"/>
              {/* Wien dot */}
              <circle cx="180" cy="95" r="5" fill="#3a4a5c" opacity="0.7"/>
              <text x="192" y="99" fontFamily="Outfit,sans-serif" fontSize="15" fill="#3a4a5c" opacity="0.8">Wien</text>
              {/* Eisenstadt dot */}
              <circle cx="820" cy="210" r="4" fill="#3a4a5c" opacity="0.6"/>
              <text x="830" y="214" fontFamily="Outfit,sans-serif" fontSize="13" fill="#3a4a5c" opacity="0.7">Eisenstadt</text>
              {/* Bruck/Leitha dot */}
              <circle cx="525" cy="195" r="3.5" fill="#3a4a5c" opacity="0.6"/>
              <text x="535" y="199" fontFamily="Outfit,sans-serif" fontSize="12" fill="#3a4a5c" opacity="0.7">Bruck/L.</text>
              {/* Sommerein pin */}
              <circle cx="525" cy="148" r="14" fill="#1e4f8c" opacity="0.15"/>
              <circle cx="525" cy="148" r="8" fill="#1e4f8c"/>
              <circle cx="525" cy="148" r="3.5" fill="white"/>
            </svg>
            <div className="map-pin">📍 Sommerein, NÖ</div>
          </div>
        </div>
      </section>

      <div className={`lightbox ${lightbox ? 'open' : ''}`} onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
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
   IMPRESSUM
============================================================ */
function ImpressumPage() {
  return (
    <div className="legal-page">
      <div className="crumb" style={{ marginBottom: 24 }}><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Impressum</div>
      <h1>Impressum</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 40 }}>Angaben gemäß § 5 ECG (E-Commerce-Gesetz)</p>

      <div className="lead-box">
        <p>Diese Website wird betrieben von Alex Mück, Inhaber von coolpool, einem Pool-Fachhandel mit Sitz in Sommerein, Niederösterreich.</p>
      </div>

      <h2>Unternehmensangaben</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 18 }}>
        <tbody>
        {[
          ['Unternehmensname', 'coolpool'],
          ['Inhaber', 'Alex Mück'],
          ['Adresse', 'Sarasdorferweg 3A, 2453 Sommerein, Niederösterreich, Österreich'],
          ['Telefon', '+43 677 634 05072'],
          ['E-Mail', 'Coolpool@gmx.at'],
          ['Unternehmensform', 'Einzelunternehmen'],
          ['Tätigkeitsbereich', 'Handel mit Poolchemie, Poolzubehör, Reinigungsgeräten und Poolüberdachungen'],
        ].map(([k, v]) => (
          <tr key={k} style={{ borderBottom: '1px solid var(--line)' }}>
            <td style={{ padding: '14px 16px 14px 0', fontWeight: 600, color: 'var(--ink)', width: '36%', verticalAlign: 'top' }}>{k}</td>
            <td style={{ padding: '14px 0', color: 'var(--ink-soft)', verticalAlign: 'top' }}>{v}</td>
          </tr>
        ))}
        </tbody>
      </table>

      <h2>Aufsichtsbehörde</h2>
      <p>Bezirkshauptmannschaft Bruck an der Leitha<br/>Gewerbeordnung: <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener">www.ris.bka.gv.at</a></p>

      <h2>EU-Streitschlichtung</h2>
      <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>. Wir sind nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <h2>Haftung für Inhalte</h2>
      <p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr. Für externe Links sind die jeweiligen Betreiber verantwortlich.</p>

      <h2>Urheberrecht</h2>
      <p>Die durch den Seitenbetreiber erstellten Inhalte unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.</p>

      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 16 }}>
        Stand: Mai 2026
      </div>
    </div>
  );
}

/* ============================================================
   DATENSCHUTZ
============================================================ */
function DatenschutzPage() {
  return (
    <div className="legal-page">
      <div className="crumb" style={{ marginBottom: 24 }}><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Datenschutz</div>
      <h1>Datenschutzerklärung</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 40 }}>Gemäß DSGVO (EU) 2016/679 und österreichischem DSG</p>

      <div className="lead-box">
        <p>Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir verarbeiten Ihre Daten ausschließlich auf Basis der gesetzlichen Bestimmungen.</p>
      </div>

      <h2>1. Verantwortlicher</h2>
      <p>Alex Mück · coolpool · Sarasdorferweg 3A, 2453 Sommerein<br/>Tel: <a href="tel:+436776340572">+43 677 634 05072</a> · E-Mail: <a href="mailto:Coolpool@gmx.at">Coolpool@gmx.at</a></p>

      <h2>2. Verarbeitete Daten</h2>
      <h3>Kontaktformular</h3>
      <p>Wenn Sie unser Kontaktformular nutzen, verarbeiten wir: Name, E-Mail-Adresse, optionale Telefonnummer, Nachrichteninhalt.<br/><strong>Zweck:</strong> Bearbeitung Ihrer Anfrage · <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO · <strong>Speicherdauer:</strong> bis zu 3 Jahre nach Abschluss der Anfrage.</p>

      <h3>Server-Logs</h3>
      <p>Beim Websitebesuch werden automatisch IP-Adresse, Datum/Uhrzeit, aufgerufene Seite und Browsertyp gespeichert. Löschung nach 7 Tagen.</p>

      <h2>3. Weitergabe von Daten</h2>
      <p>Keine Weitergabe an Dritte, ausgenommen Formspree Inc. (Formularübermittlung, USA – Standardvertragsklauseln gem. Art. 46 DSGVO) und Behörden soweit gesetzlich vorgeschrieben.</p>

      <h2>4. Ihre Rechte (DSGVO)</h2>
      <ul>
        <li>Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17)</li>
        <li>Einschränkung (Art. 18), Widerspruch (Art. 21)</li>
        <li>Beschwerde bei der Datenschutzbehörde: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener">www.dsb.gv.at</a></li>
      </ul>
      <p>Anfragen an: <a href="mailto:Coolpool@gmx.at">Coolpool@gmx.at</a></p>

      <h2>5. Cookies</h2>
      <p>Diese Website verwendet keine Tracking-Cookies. Es werden technisch notwendige Ressourcen (Google Fonts, Three.js CDN) geladen, die Ihre IP-Adresse an externe Server übertragen können.</p>

      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 16 }}>
        Stand: Mai 2026
      </div>
    </div>
  );
}

/* ============================================================
   AGB
============================================================ */
function AGBPage() {
  return (
    <div className="legal-page">
      <div className="crumb" style={{ marginBottom: 24 }}><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> AGB</div>
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 40 }}>Gültig für alle Bestellungen und Anfragen über coolpool</p>

      <div className="lead-box">
        <p>Diese AGB gelten für alle Verträge zwischen Alex Mück (coolpool) und unseren Kundinnen und Kunden.</p>
      </div>

      <h2>§ 1 Geltungsbereich</h2>
      <p>Diese AGB gelten für alle Verträge, die zwischen coolpool (Alex Mück, Sarasdorferweg 3A, 2453 Sommerein) und dem Kunden über diese Website, per Telefon oder E-Mail geschlossen werden.</p>

      <h2>§ 2 Vertragsabschluss</h2>
      <p>Produktdarstellungen auf dieser Website sind unverbindliche Einladungen zur Bestellung. Ein verbindlicher Kaufvertrag kommt erst durch unsere ausdrückliche Auftragsbestätigung zustande.</p>

      <h2>§ 3 Preise und Zahlung</h2>
      <p>Alle Preise sind Endpreise in Euro inkl. gesetzlicher MwSt. Zahlungsmöglichkeiten: Barzahlung bei Abholung, Überweisung, Barzahlung bei Lieferung (nach Vereinbarung).</p>

      <h2>§ 4 Lieferung und Abholung</h2>
      <p>Abholung in Sommerein nach Vereinbarung. Persönliche Lieferung in NÖ, Wien und Burgenland möglich. Lieferzeiten werden individuell abgestimmt.</p>

      <h2>§ 5 Widerrufsrecht</h2>
      <p>Für Verbraucher gilt ein 14-tägiges Widerrufsrecht gemäß §§ 11–16 FAGG. Ausgenommen sind bereits geöffnete Chemikalien und verderbliche Waren. Widerruf bitte per E-Mail an <a href="mailto:Coolpool@gmx.at">Coolpool@gmx.at</a>.</p>

      <h2>§ 6 Gewährleistung</h2>
      <p>Es gelten die gesetzlichen Gewährleistungsbestimmungen des österreichischen ABGB und KSchG. Für Schäden durch unsachgemäße Verwendung von Poolchemikalien wird keine Haftung übernommen.</p>

      <h2>§ 7 Gerichtsstand</h2>
      <p>Es gilt österreichisches Recht. Gerichtsstand ist Bruck an der Leitha. Für Verbraucher mit EU-Wohnsitz gilt vorrangig das Recht des Wohnsitzstaates.</p>

      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 16 }}>
        Stand: Mai 2026 · Alex Mück · coolpool · Sommerein
      </div>
    </div>
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

  // Page transition state
  const [displayedRoute, setDisplayedRoute] = useState(route);
  const [transClass, setTransClass] = useState('');
  const transTimer = useRef();

  useEffect(() => {
    if (route === displayedRoute) return;
    clearTimeout(transTimer.current);
    setTransClass('page-exit');
    transTimer.current = setTimeout(() => {
      setDisplayedRoute(route);
      setTransClass('page-enter');
      transTimer.current = setTimeout(() => setTransClass(''), 460);
    }, 260);
  }, [route]);

  useEffect(() => {
    if (displayedRoute !== 'home') return;
    const s = document.createElement('script');
    s.src = 'hero3d.js';
    document.body.appendChild(s);
    return () => {
      if (window.__heroStop) { window.__heroStop(); }
      try { document.body.removeChild(s); } catch (_) {}
    };
  }, [displayedRoute]);

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

  let page;
  if (displayedRoute === 'shop')              page = <ShopPage cart={cart} toggleCart={toggleCart}/>;
  else if (displayedRoute === 'chemie')       page = <ChemiePage/>;
  else if (displayedRoute === 'reinigung')    page = <ReinigungPage/>;
  else if (displayedRoute === 'ueberdachung') page = <UeberdachungPage/>;
  else if (displayedRoute === 'galerie')      page = <GalleryKontaktPage/>;
  else if (displayedRoute === 'impressum')    page = <ImpressumPage/>;
  else if (displayedRoute === 'datenschutz')  page = <DatenschutzPage/>;
  else if (displayedRoute === 'agb')          page = <AGBPage/>;
  else                                        page = <HomePage/>;

  return (
    <>
      <Header route={route} openMenu={() => setMenuOpen(o => !o)} menuOpen={menuOpen}/>
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} route={route} go={go}/>
      <main data-screen-label={displayedRoute}>
        <div className={`page-wrap ${transClass}`}>
          {page}
        </div>
      </main>
      <Footer/>
      <div className={`cart-toast ${toast ? 'show' : ''}`}>
        <Icon.check style={{ width: 20, height: 20, color: '#5cc87a' }}/> {toast}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
