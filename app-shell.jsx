/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   ICONS
============================================================ */
const Icon = {
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>,
  mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m4 12 5 5L20 6"/></svg>,
  cart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l3 12h12l2-8H6"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 2 3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7Z"/></svg>,
  drop: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3s-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12Z"/></svg>,
  flask: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 3h6M10 3v6.5L4.5 19A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.7-3l-5.5-9.5V3"/></svg>,
  leaf: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21c0-9 6-15 16-16-1 10-7 16-16 16ZM5 21c1.5-4 4-7 8-9"/></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/></svg>,
  snow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></svg>,
  brush: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 4 4 14l2 2 10-10M14 4l4 4-4 4-4-4 4-4Z"/><path d="m6 16-3 5 5-3"/></svg>,
  net: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="9" r="6"/><path d="m13 13 8 8M5 9h6M8 6v6"/></svg>,
  robot: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M9 13h.01M15 13h.01M12 4v4M8 19v2M16 19v2"/></svg>,
  filter: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5 7h14M5 17h14"/></svg>,
  cover: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M3 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M5 10V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3"/></svg>,
  sun: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>,
  truck: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17V6h11v11M14 9h4l3 4v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
  chat: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/></svg>,
  award: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8"/></svg>,
};

/* ============================================================
   ROUTING
============================================================ */
const NAV_ROUTES = [
  { id: 'home',         label: 'Start',            short: 'Start' },
  { id: 'shop',         label: 'Shop',             short: 'Shop' },
  { id: 'chemie',       label: 'Wasserpflege',     short: 'Wasserpflege' },
  { id: 'reinigung',    label: 'Reinigung',        short: 'Reinigung' },
  { id: 'ueberdachung', label: 'Überdachungen',    short: 'Überdachungen' },
  { id: 'galerie',      label: 'Galerie & Kontakt', short: 'Galerie' },
];
const LEGAL_ROUTES = ['impressum', 'datenschutz', 'agb'];
const ALL_ROUTE_IDS = [...NAV_ROUTES.map(r => r.id), ...LEGAL_ROUTES];
const ROUTES = NAV_ROUTES; // backward-compat export

function useRoute() {
  const get = () => {
    const h = (location.hash || '#home').replace('#', '');
    return ALL_ROUTE_IDS.includes(h) ? h : 'home';
  };
  const [route, setRoute] = useState(get());
  useEffect(() => {
    const on = () => { setRoute(get()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return [route, (id) => { location.hash = id; }];
}

function NavLink({ to, current, children, onClick, className = '' }) {
  return (
    <a
      href={`#${to}`}
      className={`${className} ${current === to ? 'active' : ''}`}
      onClick={(e) => { onClick && onClick(e); }}
    >
      {children}
    </a>
  );
}

/* ============================================================
   HEADER & FOOTER
============================================================ */
function Header({ route, openMenu, menuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 6);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <a href="#home" className="brand" aria-label="coolpool Startseite">
          <span className="brand-mark" aria-hidden="true"></span>
          <span>coolpool<sup>.at</sup></span>
        </a>
        <nav className="nav" aria-label="Hauptnavigation">
          {NAV_ROUTES.map(r => (
            <NavLink key={r.id} to={r.id} current={route}>{r.short}</NavLink>
          ))}
        </nav>
        <div className="header-cta">
          <a className="phone-link" href="tel:+436776340572"><Icon.phone /> <span className="phone-text">+43 677 634 05072</span></a>
          <a className="btn btn--ghost" href="#galerie">Anfragen</a>
          <a className="btn btn--primary" href="#shop">Zum Shop</a>
        </div>
        <button
          className={`hamburger ${menuOpen ? 'is-open' : ''}`}
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={menuOpen}
          onClick={openMenu}
        ><span></span></button>
      </div>
    </header>
  );
}

function MobileMenu({ open, close, route }) {
  return (
    <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="close" onClick={close} aria-label="Menü schließen">✕</button>
      <a href="tel:+436776340572" className="phone-link" style={{ marginTop: 8 }}>
        <Icon.phone /> +43 677 634 05072
      </a>
      <nav aria-label="Mobile Navigation">
        {NAV_ROUTES.map(r => (
          <a key={r.id} href={`#${r.id}`} className={route === r.id ? 'active' : ''} onClick={close}>
            {r.label}
          </a>
        ))}
      </nav>
      <div className="m-cta">
        <a className="btn btn--primary btn--lg btn--block" href="#shop" onClick={close}>Zum Shop</a>
        <a className="btn btn--ghost btn--lg btn--block" href="#galerie" onClick={close}>Beratung anfragen</a>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#home" className="brand"><span className="brand-mark"></span><span>coolpool<sup>.at</sup></span></a>
            <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 360 }}>
              Ihr Pool-Fachhandel in Sommerein. Poolchemie, Reinigung, Zubehör und persönliche Beratung – online bestellen, im Geschäft abholen oder bequem liefern lassen.
            </p>
            <div className="social-row">
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V7.5c0-1.2.4-2 2-2h2V2.1A28 28 0 0 0 14 2c-3 0-5 1.8-5 5.2V10H6v4h3v8h4Z"/></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
              <a href="#" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 12a8 8 0 0 1-12 6.9L3 21l2.1-4.9A8 8 0 1 1 20 12Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg></a>
            </div>
          </div>
          <div>
            <h4>Sortiment</h4>
            <a href="#chemie">Poolchemie</a>
            <a href="#reinigung">Poolreinigung</a>
            <a href="#shop">Filter & Technik</a>
            <a href="#ueberdachung">Poolüberdachungen</a>
            <a href="#shop">Zubehör</a>
          </div>
          <div>
            <h4>Service</h4>
            <a href="#galerie">Persönliche Beratung</a>
            <a href="#galerie">Wasseranalyse</a>
            <a href="#galerie">Lieferung & Abholung</a>
            <a href="#galerie">Galerie ansehen</a>
          </div>
          <div>
            <h4>Kontakt</h4>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.7 }}>
              Sarasdorferweg 3A<br/>2453 Sommerein<br/>Österreich
            </p>
            <p style={{ marginTop: 10 }}>
              <a href="tel:+436776340572" style={{ display: 'inline', fontWeight: 600 }}>+43 677 634 05072</a><br/>
              <a href="mailto:Coolpool@gmx.at" style={{ display: 'inline' }}>Coolpool@gmx.at</a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 coolpool – Inhaber: Alex Mück</div>
          <div>
            <a href="#impressum">Impressum</a>
            <a href="#datenschutz">Datenschutz</a>
            <a href="#agb">AGB</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Icon, ROUTES, NAV_ROUTES, LEGAL_ROUTES, useRoute, Header, MobileMenu, Footer });
