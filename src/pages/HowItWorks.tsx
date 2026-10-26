import { Link } from 'react-router-dom';
import { Brand } from '../components/Layout';
import { Badge, Card, CardTitle } from '../components/ui';
import { IconArrowRight, IconCheck } from '../components/Icons';

const PIPELINE = [
  {
    step: '01',
    title: 'Birth data → UTC',
    body:
      'Your local civil time is resolved to an exact UTC instant using the IANA time-zone database in your browser, including historical offset changes and daylight saving. This matters more than most apps admit: a wrong zone shifts everything by whole degrees.',
  },
  {
    step: '02',
    title: 'UTC → planetary longitudes',
    body:
      'The Astronomy Engine ephemeris returns geocentric vectors for the Sun, Moon and planets. These are converted to the true ecliptic of date. The Moon uses the engine\'s dedicated lunar theory; Rahu and Ketu use the mean lunar node.',
  },
  {
    step: '03',
    title: 'Tropical → sidereal',
    body:
      'The Lahiri ayanamsa is subtracted, anchored at J2000 (23.853222°) and propagated with IAU 2006 general precession. That is what makes the zodiac sidereal rather than tropical.',
  },
  {
    step: '04',
    title: 'Ascendant & houses',
    body:
      'The sidereal ascendant is derived from local sidereal time, latitude and obliquity. Houses are whole-sign from that ascendant, the classical Vedic default, so house 1 is exactly the rising rashi.',
  },
  {
    step: '05',
    title: 'Dashas & panchang',
    body:
      'Vimshottari dashas start from the lord of the Moon\'s birth nakshatra, with the balance proportional to the part of the nakshatra traversed. The panchang is resolved for your coordinates with sunrise defining the Vedic day.',
  },
  {
    step: '06',
    title: 'Interpretation',
    body:
      'A deterministic rules engine selects the relevant placements, then assembles original written interpretation. Vaani is not a language model: the same chart and question always produce the same answer, and the factors used are listed.',
  },
];

const CHOICES = [
  ['Ayanamsa', 'Lahiri (Chitrapaksha)'],
  ['House system', 'Whole-sign (rashi) from the sidereal ascendant'],
  ['Node type', 'Mean lunar node'],
  ['Dasha system', 'Vimshottari, 365.2425-day years'],
  ['Compatibility', 'Ashtakoot Guna Milan, 36 points'],
  ['Panchang day', 'Sunrise to sunrise'],
  ['Ephemeris', 'Astronomy Engine 2.1.19 (MIT)'],
];

const VALIDATION = [
  'The Sun and Moon coincide within 0.1° at the 8 April 2024 total solar eclipse, in sidereal Pisces/Revati.',
  'Saturn, Jupiter and Rahu match their known sidereal signs on 1 January 2024.',
  'The calculated ascendant is independently verified to lie on the eastern horizon by altitude and azimuth.',
  'Rahu and Ketu are always exactly 180° apart; the Sun and Moon are never reported retrograde.',
  'Lahiri ayanamsa values are tested against published almanac figures for 1950, 2000, 2025 and 2050.',
  'New-moon times and Delhi sunrise are checked against published values to within minutes.',
  'Dasha periods are contiguous and sum to exactly 120 years with correct antardasha proportions.',
];

const LIMITS = [
  'Birth time is the dominant source of error. Minutes matter for the ascendant and dasha balance.',
  'Schools differ on ayanamsa, house division and dasha year length. AstroSutra states its choices; it does not claim they are the only ones.',
  'Yogas and doshas have variant definitions in classical texts. Only a well-attested subset is implemented.',
  'Compatibility scoring varies widely between software packages. AstroSutra shows the rule it applied for each koota.',
  'Interpretation is culturally situated. It is offered for reflection, never as a prediction of events.',
];

export default function HowItWorks() {
  return (
    <div className="landing" style={{ maxWidth: 1000 }}>
      <header className="landing-nav">
        <Brand />
        <div className="row" style={{ gap: 16 }}>
          <Link to="/" className="small muted">Home</Link>
          <Link to="/legal/licensing" className="small muted">Licensing</Link>
          <Link className="btn btn--small" to="/welcome">
            Create a chart <IconArrowRight />
          </Link>
        </div>
      </header>

      <div className="eyebrow">Methodology</div>
      <h1 style={{ fontSize: 'clamp(2.3rem, 4.4vw, 3.4rem)', marginBottom: 12 }}>
        How the numbers are made
      </h1>
      <p className="lede" style={{ maxWidth: '62ch', marginBottom: 28 }}>
        AstroSutra is a calculator with opinions about presentation, not a black box. Here is the full pipeline, the
        conventions chosen at every fork, and the checks that keep the astronomy honest.
      </p>

      <div className="row" style={{ gap: 8, marginBottom: 30 }}>
        <Badge tone="teal"><IconCheck width={12} height={12} /> 93 passing tests</Badge>
        <Badge tone="violet">No network calls</Badge>
        <Badge>MIT licensed</Badge>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 26 }}>
        {PIPELINE.map((item) => (
          <Card key={item.step} className="card--flat" as="article">
            <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
              <span className="badge">{item.step}</span>
              <div>
                <h4 style={{ marginBottom: 6 }}>{item.title}</h4>
                <p className="small muted">{item.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 26 }}>
        <CardTitle title="Conventions, stated plainly" eyebrow="Every fork in the road" />
        <dl style={{ margin: 0 }}>
          {CHOICES.map(([label, value]) => (
            <div className="kv" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid grid-2" style={{ marginBottom: 26 }}>
        <Card>
          <CardTitle title="How accuracy is checked" eyebrow="Tests" />
          <ul className="check-list">
            {VALIDATION.map((item) => (
              <li key={item}>
                <IconCheck />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle title="Where it can be wrong" eyebrow="Limitations" />
          <ul className="check-list">
            {LIMITS.map((item) => (
              <li key={item}>
                <span style={{ color: 'var(--muted)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="card--gold">
        <div className="row-between">
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ marginBottom: 6 }}>Astronomy is science. Interpretation is culture.</h3>
            <p className="small muted">
              The planetary positions on this site are reproducible and testable. The meaning Vedic astrology assigns
              to them is a living tradition, not a physical claim, and AstroSutra treats it that way — which is why
              readings are framed as reflection and why the app declines medical, legal and crisis questions.
            </p>
          </div>
          <Link className="btn" to="/welcome">
            Try it with your chart <IconArrowRight />
          </Link>
        </div>
      </Card>

      <footer className="footer">
        <div>© {new Date().getFullYear()} AstroSutra · Original work.</div>
        <div className="footer-links">
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/notices">Notices</Link>
          <Link to="/legal/licensing">Licensing</Link>
        </div>
      </footer>
    </div>
  );
}
