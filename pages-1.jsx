/* global React */
/* ============================================================
   GOOGLE SHEETS CMS
   URL Ihres als CSV veröffentlichten Google Sheets eintragen:
   Datei → Freigeben → Im Web veröffentlichen → CSV-Format
   Leer lassen = hartcodierte Produkte werden verwendet.
============================================================ */
const SHEETS_CSV_URL = '';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const vals = []; let inQ = false, cur = '';
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    return headers.reduce((o, h, i) => { o[h] = (vals[i] || '').replace(/^"|"$/g, ''); return o; }, {});
  }).filter(r => r.id && r.sichtbar !== 'NEIN');
}

/* ============================================================
   HOME PAGE
============================================================ */


function HomePage() {
  useEffect(() => {
    const items = [
      ['.hero-eyebrow',       0],
      ['.hero h1',          140],
      ['.hero .hero-sub',   290],
      ['.hero .hero-buttons', 430],
      ['.hero-bottom',      570],
    ];
    items.forEach(([sel, delay]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.classList.add('hero-entry');
      setTimeout(() => el.classList.add('hero-in'), delay);
    });
  }, []);

  return (
    <>
      <section className="hero">
        <canvas id="hero-canvas" aria-hidden="true"/>
        <div className="hero-overlay" aria-hidden="true"/>

        <div className="hero-content">
          <div className="container">
            <p className="hero-eyebrow">Poolchemie · Reinigung · Zubehör · Überdachungen</p>
            <h1>Alles für Ihren Pool –<br/><em>direkt vom Fachhandel.</em></h1>
            <p className="hero-sub">Über 200 Produkte, persönliche Beratung und schnelle Lieferung. Seit 30 Jahren Ihr Ansprechpartner in Niederösterreich, Wien und Burgenland.</p>
            <div className="hero-buttons">
              <a className="btn btn--primary btn--lg" href="#shop">Zum Shop <Icon.arrow style={{ width: 20, height: 20 }}/></a>
              <a className="btn btn--lg hero-btn-outline" href="#galerie">Beratung anfragen</a>
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <div className="container">
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>30</strong>
                <span>Jahre Erfahrung</span>
              </div>
              <div className="hero-stat">
                <strong>200+</strong>
                <span>Produkte im Sortiment</span>
              </div>
              <div className="hero-stat">
                <strong>NÖ · Wien · Bgld</strong>
                <span>Liefergebiet</span>
              </div>
              <div className="hero-stat">
                <strong><Icon.phone style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.32)' }}/> +43 677 634 05072</strong>
                <a href="tel:+436776340572">Jetzt anrufen</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="region-strip">
        <div className="container region-strip-inner">
          <div className="pill"><Icon.pin/> Südliches Niederösterreich</div>
          <div className="pill"><Icon.pin/> Wien & Umgebung</div>
          <div className="pill"><Icon.pin/> Burgenland</div>
          <div className="pill"><Icon.truck/> Persönliche Lieferung möglich</div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Unsere Leistungen</span>
            <h2>Vom Wasserwert bis zur Überdachung – alles aus einer Hand.</h2>
            <p className="lead">Wir kennen jeden Pool. Sie kommen mit Ihrer Frage – wir haben das passende Mittel, das richtige Gerät und einen klaren Tipp.</p>
          </div>

          <div className="services-grid">
            {[
              { id: 'chemie', t: 'Poolchemie', d: 'Chlor, pH, Algenschutz und alles für klares, gesundes Wasser.', tile: 'pool' },
              { id: 'reinigung', t: 'Reinigung & Zubehör', d: 'Bürsten, Kescher, Schwämme, Roboter – sauberer Pool ohne Mühe.', tile: 'sand' },
              { id: 'shop', t: 'Filter & Technik', d: 'Filteranlagen, Pumpen und Ersatzteile vom Fachhandel.', tile: 'pool' },
              { id: 'ueberdachung', t: 'Poolüberdachungen', d: 'WPS Premium-Überdachungen – mit 10 % Partnerrabatt.', tile: 'dark' },
              { id: 'shop', t: 'Abdeckungen', d: 'Solarfolien, Winterabdeckungen, Rollläden – passend zu Ihrem Pool.', tile: 'sand' },
              { id: 'galerie', t: 'Persönliche Beratung', d: 'Wasseranalyse, Problemlösung, Empfehlung – direkt vom Profi.', tile: 'pool' },
            ].map((s, i) => (
              <a key={i} className="service-card" href={`#${s.id}`}>
                <div className="tile"><div className={`placeholder ${s.tile}`}>{s.t.toUpperCase()}</div></div>
                <h3>{s.t}</h3>
                <p className="desc">{s.d}</p>
                <span className="arrow">Mehr ansehen <Icon.arrow style={{ width: 18, height: 18 }}/></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Warum coolpool</span>
            <h2>Damit Sie sich um Ihren Pool nicht sorgen müssen.</h2>
          </div>
          <div className="feature-grid">
            {[
              { i: <Icon.award/>, t: '30 Jahre Erfahrung', d: 'Wir bauen, pflegen und beraten rund um den Pool seit drei Jahrzehnten. Wir haben fast alles schon gesehen.' },
              { i: <Icon.chat/>, t: 'Persönlich beraten', d: 'Sie sprechen mit echten Menschen, die Pools verstehen. Keine Hotline, keine Warteschleifen.' },
              { i: <Icon.shield/>, t: 'Qualität vom Fachhandel', d: 'Wir führen nur Mittel und Geräte, die wir selbst empfehlen würden. Keine Massenware.' },
              { i: <Icon.drop/>, t: 'Schnelle Hilfe bei Wasserproblemen', d: 'Trübes Wasser, Algen, falscher pH? Schicken Sie uns ein Foto oder bringen Sie eine Wasserprobe vorbei.' },
              { i: <Icon.truck/>, t: 'Abholung oder Lieferung', d: 'Bestellen Sie online und holen Sie ab – oder lassen Sie sich persönlich liefern in Ihrer Region.' },
              { i: <Icon.cover/>, t: 'WPS-Partner', d: 'Autorisierter Händler für WPS Poolüberdachungen mit 10 % Partnerrabatt.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="icon">{f.i}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="amazon-teaser">
            <div>
              <h3>Bald auch auf Amazon erhältlich</h3>
              <p>Unsere Poolchemie und Reinigungsprodukte kommen demnächst auf Amazon.<br/>Melden Sie sich für eine Benachrichtigung an – oder bestellen Sie jetzt direkt bei uns.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <a className="btn btn--amz btn--lg" href="#galerie">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}><path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.5.13.109.174.078.33-.09.465-.459.374-1.016.706-1.658.995-2.422 1.068-5.015 1.602-7.78 1.602-3.79 0-7.197-.818-10.217-2.455a7.35 7.35 0 0 1-.706-.434c-.188-.156-.21-.323-.09-.486z"/><path d="M21.15 16.1a.637.637 0 0 0-.594-.13c-.364.1-.725.193-1.08.28-1.178.28-2.355.42-3.53.42-1.51 0-2.905-.294-4.185-.882a10.3 10.3 0 0 1-3.133-2.337c-.087-.096-.175-.116-.263-.058a.23.23 0 0 0-.117.22c.043.413.218.837.523 1.272.305.436.727.86 1.268 1.272.855.645 1.82 1.085 2.897 1.32.977.214 1.98.265 3.006.152a9.52 9.52 0 0 0 2.997-.882c.364-.18.71-.375 1.037-.586.285-.183.534-.378.746-.586.072-.07.11-.138.114-.205.004-.067-.022-.14-.08-.22z"/></svg>
                Update anfragen
              </a>
              <a className="btn btn--lg" href="#shop" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1.5px solid rgba(255,255,255,0.5)' }}>
                Jetzt direkt bestellen
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-block">
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>Wir helfen weiter</span>
            <h2>Fragen zu Produkten oder Lieferung? Rufen Sie uns einfach an.</h2>
            <p>Wir nehmen uns Zeit für jeden Pool. Lieber persönlich? Kommen Sie vorbei in Sommerein – wir freuen uns auf Ihren Besuch.</p>
            <div className="hero-buttons">
              <a className="btn btn--primary btn--lg" href="tel:+436776340572"><Icon.phone style={{ width: 20, height: 20 }}/> +43 677 634 05072</a>
              <a className="btn btn--ghost btn--lg" href="#galerie">Nachricht schreiben</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   SHOP PAGE
============================================================ */
const PRODUCTS = [
  { id: 'sauer-rot-5', name: 'Sauer Rot 5 Liter', cat: 'Poolchemie', desc: 'pH-Wert senken – flüssig dosierbar für klares Wasser.', price: '24,90', badge: 'Beliebt' },
  { id: 'multi-tab-5', name: 'Multi-Tabletten 5 kg', cat: 'Poolchemie', desc: '4-in-1 Tabletten: Desinfektion, Algen, Flockung, Härte.', price: '69,90', badge: 'Bestseller' },
  { id: 'ph-minus-8', name: 'pH minus 8 kg', cat: 'Poolchemie', desc: 'Granulat zur sicheren Reduktion des pH-Werts.', price: '32,50' },
  { id: 'chlor-65', name: 'Chlor Granulat 65 · 1 kg', cat: 'Poolchemie', desc: 'Schnell lösliches Chlorgranulat für die Stoßchlorung.', price: '18,90' },
  { id: 'metal-ex-1', name: 'Metal-Ex 1 Liter', cat: 'Poolchemie', desc: 'Bindet Eisen, Kupfer und Mangan im Poolwasser.', price: '21,50' },
  { id: 'skimmer-schwamm', name: 'Skimmer-Schwamm', cat: 'Reinigung', desc: 'Fängt Sonnenöl, Fette und Schmutz im Skimmer.', price: '4,90', badge: 'Neu' },
  { id: 'algen-schutz-5', name: 'Algen Schutz 5 Liter', cat: 'Poolchemie', desc: 'Verhindert Algenwachstum zuverlässig über die Saison.', price: '39,90' },
  { id: 'rand-reiniger-1', name: 'Randreiniger AL 1 Liter', cat: 'Reinigung', desc: 'Entfernt Fettränder und Verschmutzungen am Beckenrand.', price: '14,90' },
  { id: 'sandfilter-pro', name: 'Sandfilter Pro 400', cat: 'Filter & Technik', desc: 'Leiser, energiesparender Sandfilter für Pools bis 50 m³.', price: '489,–' },
  { id: 'poolroboter-x4', name: 'Poolroboter X4', cat: 'Reinigung', desc: 'Vollautomatischer Bodenroboter – Wand, Boden, Linie.', price: '799,–', badge: 'Empfehlung' },
  { id: 'solarfolie', name: 'Solarfolie 400μ', cat: 'Abdeckungen', desc: 'Heizt das Wasser auf – auf Maß zugeschnitten.', price: 'Auf Anfrage' },
  { id: 'winter-abdeckung', name: 'Winterabdeckung Premium', cat: 'Abdeckungen', desc: 'Reißfeste Plane mit Spannseil und Ablauföffnungen.', price: 'Auf Anfrage' },
];
const SHOP_CATS = ['Alle', 'Poolchemie', 'Reinigung', 'Zubehör', 'Filter & Technik', 'Abdeckungen'];
const SHOP_SORTS = ['Beliebteste', 'Neu eingetroffen', 'Name A–Z', 'Preis aufsteigend', 'Preis absteigend'];

function ShopPage({ cart, toggleCart }) {
  const [cat, setCat] = useState('Alle');
  const [sort, setSort] = useState('Beliebteste');
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    if (!SHEETS_CSV_URL) return;
    fetch(SHEETS_CSV_URL)
      .then(r => r.text())
      .then(text => {
        const rows = parseCSV(text);
        if (rows.length > 0) setProducts(rows.map(r => ({
          id: r.id, name: r.name, cat: r.kategorie,
          desc: r.beschreibung, price: r.preis,
          badge: r.badge || undefined,
          bild: r.bild_url, amazon: r.amazon_link,
        })));
      })
      .catch(() => {});
  }, []);

  const list = useMemo(() => {
    let r = cat === 'Alle' ? products : products.filter(p => p.cat === cat);
    if (sort === 'Name A–Z') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'Neu eingetroffen') r = [...r].sort((a, b) => (b.badge === 'Neu') - (a.badge === 'Neu'));
    if (sort === 'Beliebteste') r = [...r].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    return r;
  }, [cat, sort]);
  const counts = useMemo(() => {
    const c = { Alle: products.length };
    products.forEach(p => { c[p.cat] = (c[p.cat] || 0) + 1; });
    return c;
  }, [products]);
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="crumb"><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Shop</div>
          <h1>Poolprodukte & Shop</h1>
          <p>Über 200 Produkte vom Fachhandel – bestellen Sie online und holen Sie ab, oder lassen Sie sich persönlich beliefern.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="shop-layout">
            <aside className="filter-panel">
              <h4>Kategorie</h4>
              <ul className="filter-list">
                {SHOP_CATS.map(c => (
                  <li key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>
                    {c} <span className="count">{counts[c] || 0}</span>
                  </li>
                ))}
              </ul>
              <h4>Preis</h4>
              <ul className="filter-list">
                <li>Bis 25 €</li>
                <li>25–100 €</li>
                <li>100–500 €</li>
                <li>500 € +</li>
              </ul>
              <a className="btn btn--soft btn--block" href="#galerie">Beratung anfragen</a>
            </aside>
            <div>
              <div className="sort-bar">
                <div style={{ fontSize: 18, color: 'var(--ink-soft)' }}>
                  <b style={{ color: 'var(--ink)' }}>{list.length}</b> Produkte
                </div>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  {SHOP_SORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="product-grid">
                {list.map(p => (
                  <div key={p.id} className="product-card">
                    <div className="thumb">
                      {p.bild
                        ? <img src={p.bild} alt={p.name} loading="lazy"/>
                        : <div className="placeholder pool">{p.name.toUpperCase()}</div>}
                      {p.badge && <span className="badge">{p.badge}</span>}
                      {p.amazon && <a href={p.amazon} target="_blank" rel="noopener" className="badge" style={{ background: '#ff9900', right: 12, left: 'auto' }}>Amazon</a>}
                    </div>
                    <div className="body">
                      <div className="cat">{p.cat}</div>
                      <h4>{p.name}</h4>
                      <p className="desc">{p.desc}</p>
                      <div className="row">
                        <div className="price">{p.price.startsWith('Auf') ? <span style={{ fontSize: 17, color: 'var(--ink-soft)' }}>{p.price}</span> : `€ ${p.price}`}</div>
                        <button
                          className={`add ${cart[p.id] ? 'in-cart' : ''}`}
                          onClick={() => toggleCart(p.id)}
                        >
                          {cart[p.id] ? <><Icon.check style={{ width: 16, height: 16 }}/> Im Warenkorb</> : <><Icon.cart style={{ width: 16, height: 16 }}/> Anfragen</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   CHEMIE PAGE
============================================================ */
function ChemiePage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="crumb"><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Wasserpflege</div>
          <h1>Poolchemie & Wasserpflege</h1>
          <p>Klares, gesundes Poolwasser ist kein Hexenwerk. Wir erklären in einfacher Sprache, was Ihr Pool wirklich braucht.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">In 3 Schritten zum klaren Pool</span>
            <h2>Wasserpflege muss nicht kompliziert sein.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Wasser testen</h3>
              <p>Mit Teststreifen oder bringen Sie eine Wasserprobe bei uns vorbei – wir analysieren kostenlos.</p>
            </div>
            <div className="step">
              <h3>Wert einstellen</h3>
              <p>Wir empfehlen genau das Mittel und die Menge, die Ihr Pool gerade braucht. Klare Anweisung, kein Rätselraten.</p>
            </div>
            <div className="step">
              <h3>Pool genießen</h3>
              <p>Sauberes, glasklares Wasser – ohne brennende Augen, ohne Algen, ohne Sorgen.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Themen</span>
            <h2>Welches Mittel wofür?</h2>
            <p className="lead">Ein kurzer Überblick über die wichtigsten Bereiche der Poolpflege. Bei Fragen rufen Sie einfach an.</p>
          </div>
          <div className="topic-list">
            {[
              { i: <Icon.drop/>, t: 'Chlor & Desinfektion', d: 'Tabletten, Granulat oder flüssig – Chlor tötet Keime und sorgt für hygienisches Badewasser.' },
              { i: <Icon.flask/>, t: 'pH-Wert regulieren', d: 'Der pH-Wert sollte zwischen 7,0 und 7,4 liegen. pH minus oder pH plus bringen ihn schnell in den Idealbereich.' },
              { i: <Icon.leaf/>, t: 'Algenschutz', d: 'Algen verbreiten sich rasend schnell. Mit dem richtigen Algizid kommen sie gar nicht erst.' },
              { i: <Icon.shield/>, t: 'Metall- und Kalkprobleme', d: 'Braune Verfärbungen oder trübes Wasser? Metal-Ex und Härtestabilisatoren helfen zuverlässig.' },
              { i: <Icon.sun/>, t: 'Saisonstart', d: 'Im Frühjahr: Pool gründlich reinigen, Wasser auffüllen, Werte einstellen – wir haben das Komplettpaket.' },
              { i: <Icon.snow/>, t: 'Einwinterung', d: 'Im Herbst richtig einwintern schützt vor Frostschäden und spart im nächsten Frühjahr Arbeit und Geld.' },
            ].map((t, i) => (
              <div key={i} className="topic">
                <div className="ico">{t.i}</div>
                <div>
                  <h3>{t.t}</h3>
                  <p>{t.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-block">
            <h2>Nicht sicher, welches Mittel Sie brauchen?</h2>
            <p>Bringen Sie eine Wasserprobe vorbei oder schicken Sie uns ein Foto Ihres Pools. Wir empfehlen Ihnen das richtige Mittel – kostenlos und unverbindlich.</p>
            <div className="hero-buttons">
              <a className="btn btn--primary btn--lg" href="#galerie">Wasserpflege-Beratung anfragen</a>
              <a className="btn btn--ghost btn--lg" href="tel:+436776340572"><Icon.phone style={{ width: 20, height: 20 }}/> Anrufen</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   REINIGUNG PAGE
============================================================ */
function ReinigungPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="crumb"><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Reinigung & Zubehör</div>
          <h1>Poolreinigung & Zubehör</h1>
          <p>Sauberer Pool, weniger Arbeit. Wir führen alles vom einfachen Kescher bis zum vollautomatischen Roboter.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="icon-grid">
            {[
              { i: <Icon.robot/>, t: 'Reinigungsgeräte', d: 'Poolroboter, Bodensauger und Pumpen – die Technik macht die Arbeit für Sie.' },
              { i: <Icon.brush/>, t: 'Bürsten, Kescher & Schwämme', d: 'Klassische Helfer für Beckenrand, Boden und schwer zugängliche Stellen.' },
              { i: <Icon.net/>, t: 'Skimmer-Zubehör', d: 'Schwämme, Körbe, Klappen und Ersatzteile für alle gängigen Skimmer.' },
              { i: <Icon.flask/>, t: 'Randreiniger', d: 'Spezialreiniger gegen Fettränder, Kalk und hartnäckige Verschmutzungen.' },
              { i: <Icon.filter/>, t: 'Filterpflege', d: 'Filtersand, Filterkartuschen, Reinigungsmittel – damit Ihre Anlage Jahre lang läuft.' },
              { i: <Icon.cover/>, t: 'Abdeckungen & Zubehör', d: 'Solarfolien, Winterabdeckungen, Aufrollvorrichtungen und praktische Helfer.' },
            ].map((s, i) => (
              <div key={i} className="icon-tile">
                <div className="big-ico">{s.i}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>

          <div className="before-after">
            <div>
              <div className="placeholder" style={{ background: 'repeating-linear-gradient(45deg, oklch(0.55 0.06 130) 0 14px, oklch(0.50 0.06 130) 14px 28px)', color: 'rgba(255,255,255,0.8)' }}>VORHER · TRÜBES WASSER</div>
              <span className="label">Vorher</span>
            </div>
            <div>
              <div className="placeholder pool">NACHHER · GLASKLAR</div>
              <span className="label">Nachher</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Empfehlung</span>
            <h2>Welches Werkzeug passt zu Ihrem Pool?</h2>
            <p className="lead" style={{ margin: '0 auto' }}>Größe, Form und Material des Pools entscheiden. Wir helfen Ihnen, das passende Zubehör zu finden.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a className="btn btn--primary btn--lg" href="#galerie">Passendes Zubehör finden</a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   ÜBERDACHUNGEN PAGE
============================================================ */
const WPS_MODELS = [
  { name: 'Optic', d: 'Niedrige, fast unsichtbare Bauform. Maximale Eleganz.', height: 'flach', segs: '4–6', use: 'Designorientiert' },
  { name: 'Tropic', d: 'Mittelhoch, gemütlich begehbar – der Allrounder.', height: 'mittel', segs: '4–6', use: 'Familien' },
  { name: 'Relax', d: 'Hoch genug zum Stehen, perfekt für lange Saisons.', height: 'hoch', segs: '5–7', use: 'Komfort' },
  { name: 'Champion', d: 'Maximaler Innenraum – fast wie ein kleines Schwimmbad.', height: 'sehr hoch', segs: '5–7', use: 'Premium' },
  { name: 'Thermo', d: 'Beheizbar mit Sonnenkollektor-Effekt – verlängert die Saison enorm.', height: 'mittel-hoch', segs: '5–7', use: 'Energie' },
];

function UeberdachungPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="crumb"><a href="#home">Start</a> <Icon.arrow style={{ width: 14, height: 14 }}/> Poolüberdachungen</div>
          <h1>WPS Poolüberdachungen</h1>
          <p>Längere Badesaison, weniger Schmutz, mehr Sicherheit. Hochwertige österreichische Qualität – als autorisierter Partner mit 10 % Partnerrabatt.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="partner-banner">
            <div className="left">
              <div className="partner-mark">WPS</div>
              <div>
                <h3>Autorisierter Partner von WPS</h3>
                <p>coolpool berät, plant und liefert WPS Poolüberdachungen in ganz Ostösterreich.</p>
              </div>
            </div>
            <div className="discount-chip">−10 % Partnerrabatt</div>
          </div>

          <div className="feature-grid">
            {[
              { i: <Icon.sun/>, t: 'Längere Badesaison', d: 'Bis zu 3 Monate früher rein und später raus – das Wasser bleibt warm und sauber.' },
              { i: <Icon.leaf/>, t: 'Weniger Schmutz', d: 'Blätter, Insekten und Pollen bleiben draußen. Sie sparen Chemie und Reinigung.' },
              { i: <Icon.shield/>, t: 'Mehr Sicherheit', d: 'Schutz für Kinder und Haustiere. Abschließbar und stabil gegen Wind und Wetter.' },
              { i: <Icon.award/>, t: 'Österreichische Qualität', d: 'WPS produziert in Österreich – Materialien und Verarbeitung auf höchstem Niveau.' },
              { i: <Icon.filter/>, t: 'Modelle für jeden Pool', d: 'Von flach und kaum sichtbar bis hoch und begehbar – fünf Baureihen.' },
              { i: <Icon.truck/>, t: 'Montage inklusive', d: 'Wir messen, planen, liefern und montieren – Sie genießen ab dem ersten Tag.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="icon">{f.i}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Modelle</span>
            <h2>Fünf Baureihen – ein passendes Modell für jeden Pool.</h2>
          </div>
          <div className="model-grid">
            {WPS_MODELS.map((m, i) => (
              <div key={i} className="model-card">
                <div className="thumb"><div className="placeholder pool">WPS {m.name.toUpperCase()}</div></div>
                <div className="body">
                  <h3>WPS {m.name}</h3>
                  <p style={{ color: 'var(--ink-soft)', margin: 0 }}>{m.d}</p>
                  <div className="specs">
                    <span><b>Höhe</b> {m.height}</span>
                    <span><b>Segmente</b> {m.segs}</span>
                    <span><b>Eignung</b> {m.use}</span>
                    <span><b>Garantie</b> 10 Jahre</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">FAQ</span>
            <h2>Häufige Fragen zu Überdachungen</h2>
          </div>
          <div className="faq-list">
            {[
              { q: 'Wie viel kostet eine WPS Überdachung?', a: 'Der Preis hängt von Größe, Modell und Ausstattung ab. Als Partner gewähren wir Ihnen 10 % Rabatt auf die UVP. Für ein konkretes Angebot kontaktieren Sie uns mit den Pool-Maßen.' },
              { q: 'Wie lange dauert die Montage?', a: 'Je nach Modell zwischen einem und zwei Tagen. Vorbereitung des Untergrunds besprechen wir vorab.' },
              { q: 'Kann ich auch nachträglich überdachen?', a: 'Ja. Wir messen Ihren bestehenden Pool aus und finden das passende Modell.' },
              { q: 'Wie funktioniert das Öffnen und Schließen?', a: 'Die Segmente lassen sich von einer Person leicht verschieben. Optional auch motorisiert erhältlich.' },
              { q: 'Brauche ich eine Baugenehmigung?', a: 'Das hängt von Bundesland und Höhe ab. Wir helfen bei der Klärung mit Ihrer Gemeinde.' },
            ].map((f, i) => (
              <details key={i} className="faq" open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-block">
            <h2>Jetzt Angebot für Ihre Poolüberdachung einholen.</h2>
            <p>Schicken Sie uns die Maße Ihres Pools oder ein Foto – wir empfehlen Ihnen das passende WPS-Modell inklusive Rabatt und Montage.</p>
            <div className="hero-buttons">
              <a className="btn btn--primary btn--lg" href="#galerie">Angebot anfordern</a>
              <a className="btn btn--ghost btn--lg" href="tel:+436776340572"><Icon.phone style={{ width: 20, height: 20 }}/> +43 677 634 05072</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Object.assign(window, { HomePage, ShopPage, ChemiePage, ReinigungPage, UeberdachungPage });
