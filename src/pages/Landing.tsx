import { Link } from 'react-router-dom';
import { Brand } from '../components/Layout';
import { Badge, Card, CheckList, Eyebrow } from '../components/ui';
import {
  IconArrowRight,
  IconCalendar,
  IconCompass,
  IconHeart,
  IconLock,
  IconMoonStars,
  IconShield,
  IconSparkles,
  IconUsers,
} from '../components/Icons';
import { useAppData } from '../lib/store';
import { RASHIS } from '../lib/constants';

function ZodiacWheel() {
  return (
    <div className="zodiac-wheel" aria-hidden>
      <svg viewBox="0 0 100 100">
        <defs>
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,123,216,0.35)" />
            <stop offset="70%" stopColor="rgba(139,123,216,0.06)" />
            <stop offset="100%" stopColor="rgba(139,123,216,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill="url(#wheelGlow)" />
        <circle cx="50" cy="50" r="44" className="zodiac-ring" />
        <circle cx="50" cy="50" r="34" className="zodiac-ring" />
        <circle cx="50" cy="50" r="22" className="zodiac-ring zodiac-ring--dashed" />
        {RASHIS.map((rashi, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const x = 50 + Math.cos(angle) * 39;
          const y = 50 + Math.sin(angle) * 39;
          const inner = (index * 30 + 15 - 90) * (Math.PI / 180);
          return (
            <g key={rashi.index}>
              <line
                x1={50 + Math.cos(angle) * 34}
                y1={50 + Math.sin(angle) * 34}
                x2={50 + Math.cos(angle) * 44}
                y2={50 + Math.sin(angle) * 44}
                className="zodiac-tick"
              />
              <text x={x} y={y + 1.6} textAnchor="middle" className="zodiac-symbol" style={{ fontSize: 4.6 }}>
                {rashi.symbol}
              </text>
              <text
                x={50 + Math.cos(inner) * 28.5}
                y={50 + Math.sin(inner) * 28.5 + 0.8}
                textAnchor="middle"
                className="zodiac-label"
                style={{ fontSize: 2.4 }}
              >
                {rashi.english.slice(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}
        <g className="orbit">
          <circle cx="50" cy="27" r="1.5" fill="#f1d8a3" />
          <circle cx="78" cy="62" r="1" fill="#8b7bd8" />
          <circle cx="23" cy="63" r="1.2" fill="#5ec8b8" opacity="0.8" />
        </g>
        <text x="50" y="47" textAnchor="middle" className="zodiac-center">
          AstroSutra
        </text>
        <text x="50" y="52" textAnchor="middle" className="zodiac-center-small">
          REAL EPHEMERIS
        </text>
        <text x="50" y="57" textAnchor="middle" className="zodiac-center-small" style={{ fill: 'var(--gold-dim)' }}>
          VEDIC SIDEREAL
        </text>
      </svg>
    </div>
  );
}

const FEATURES = [
  {
    icon: IconCompass,
    title: 'A chart calculated, not guessed',
    body: 'Planetary positions come from a JPL-derived ephemeris and are converted to the sidereal zodiac with the Lahiri ayanamsa. Signs, nakshatras, padas and whole-sign houses are computed, never templated.',
  },
  {
    icon: IconSparkles,
    title: 'A guide that reads your chart',
    body: 'Vaani answers from your own dashas, house lords and transits — in plain language, with the factors it used listed underneath. No question ever leaves your device.',
  },
  {
    icon: IconHeart,
    title: 'Compatibility with the receipts',
    body: 'Ashtakoot Guna Milan across all eight kootas, plus Mangal dosha, the 7th house and Venus in both charts. You see the method, not just a number.',
  },
  {
    icon: IconMoonStars,
    title: 'A daily reading built from today\'s sky',
    body: 'Tithi, nakshatra, weekday lord and the Moon\'s transit house, combined with writing for your sign. The same day always produces the same reading.',
  },
  {
    icon: IconCalendar,
    title: 'Panchang for your place',
    body: 'Tithi, yoga, karana, sunrise and sunset, Rahu Kaal, Gulika, Yamaganda and Abhijit — computed for your coordinates and time zone, worldwide.',
  },
  {
    icon: IconUsers,
    title: 'Family charts in one place',
    body: 'Add the people you care about, keep separate charts, and compare any two of them. Profiles stay on your device unless you export them.',
  },
];

const PRINCIPLES = [
  'We show the calculation behind every number — ayanamsa, house system, year length and all.',
  'No fear-selling, no "remedy" purchases, no paid predictions dressed as certainty.',
  'No ads, no trackers, no analytics SDKs, no third-party AI calls.',
  'Original code, original writing, permissively licensed dependencies with notices included.',
];

export default function Landing() {
  const data = useAppData();
  const hasProfile = data.profiles.length > 0;

  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <div className="row" style={{ gap: 18 }}>
          <a className="small muted" href="#features">
            Features
          </a>
          <a className="small muted" href="#how">
            How it works
          </a>
          <Link className="small muted" to="/legal/licensing">
            Licensing
          </Link>
          <Link className="btn btn--small" to={hasProfile ? '/dashboard' : '/welcome'}>
            {hasProfile ? 'Open dashboard' : 'Start free'} <IconArrowRight />
          </Link>
        </div>
      </header>

      <section className="hero">
        <div>
          <Eyebrow>Vedic astrology · computed, not copy-pasted</Eyebrow>
          <h1>
            Your sky,
            <br />
            <em>actually calculated.</em>
          </h1>
          <p>
            AstroSutra turns exact birth details into a real sidereal chart, then helps you read it — dashas,
            transits, compatibility and a daily reading that explains where it came from.
          </p>
          <div className="hero-cta">
            <Link className="btn" to={hasProfile ? '/dashboard' : '/welcome'}>
              {hasProfile ? 'Continue with your chart' : 'Create your chart'} <IconArrowRight />
            </Link>
            <Link className="btn btn--ghost" to="/how-it-works">
              See the maths
            </Link>
          </div>
          <div className="hero-meta">
            <div>
              <strong>9</strong>
              <span>grahas</span>
            </div>
            <div>
              <strong>27</strong>
              <span>nakshatras</span>
            </div>
            <div>
              <strong>120</strong>
              <span>year dasha cycle</span>
            </div>
            <div>
              <strong>0</strong>
              <span>servers touched</span>
            </div>
          </div>
        </div>
        <ZodiacWheel />
      </section>

      <section className="section" id="features">
        <div className="section-head">
          <Eyebrow>What is inside</Eyebrow>
          <h2>A full reading surface, built on first principles</h2>
          <p className="lede" style={{ marginTop: 12 }}>
            AstroSutra is an independent app in the same territory as Melooha, AstroSage or Co-Star — and every
            screen is written and computed from scratch here.
          </p>
        </div>
        <div className="grid grid-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="card--flat" as="article">
              <div className="feature">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2>Three inputs, then the sky does the rest</h2>
            <div className="stack" style={{ marginTop: 24 }}>
              {[
                ['Enter the birth details', 'Date, exact time, and place. Time matters: it sets your ascendant and the balance of your first dasha.'],
                ['We compute the chart', 'Sidereal positions for the nine grahas, the ascendant, 27 nakshatras, whole-sign houses, Vimshottari dashas down to pratyantar level.'],
                ['Read, compare, decide', 'Daily guidance, a chart-aware guide, compatibility with your family profiles, and printable reports you can share.'],
              ].map(([title, body], index) => (
                <div key={title} className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
                  <span
                    className="avatar"
                    style={{ width: 34, height: 34, background: 'rgba(217,178,106,0.12)' }}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{title}</h4>
                    <p className="small muted" style={{ maxWidth: 46 + 'ch' }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card>
            <Eyebrow>Our principles</Eyebrow>
            <h3 style={{ marginBottom: 16 }}>No mysticism tax</h3>
            <CheckList items={PRINCIPLES} />
            <div style={{ marginTop: 22 }}>
              <Badge tone="teal">
                <IconLock width={12} height={12} /> Local-first
              </Badge>{' '}
              <Badge tone="violet">
                <IconShield width={12} height={12} /> MIT licensed
              </Badge>
            </div>
            <p className="small dim" style={{ marginTop: 20 }}>
              AstroSutra is not affiliated with Melooha or any other astrology app. All names, copy, artwork and
              algorithms in this project are original; third-party libraries are credited in the in-app notices.
            </p>
          </Card>
        </div>
      </section>

      <section className="section" id="plans">
        <div className="row-between" style={{ marginBottom: 18, gap: 20 }}>
          <div>
            <Eyebrow>Plans</Eyebrow>
            <h2>Free to use. Packs only if you want more.</h2>
          </div>
          <Link className="small muted" to={hasProfile ? '/packs' : '/welcome'}>
            Compare plans <IconArrowRight />
          </Link>
        </div>
        <div className="grid grid-2">
          <Card>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <h3 style={{ margin: 0 }}>Free</h3>
              <Badge tone="teal">No card, no account</Badge>
            </div>
            <CheckList
              items={[
                'Your full kundli, dasha and panchang',
                'Daily horoscope for all twelve signs',
                'Compatibility between your saved profiles',
                'Three chart-based questions a day',
              ]}
            />
          </Card>
          <Card>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <h3 style={{ margin: 0 }}>Packs</h3>
              <Badge tone="violet">One-off, never expire</Badge>
            </div>
            <CheckList
              items={[
                'Question pack: fifty more questions',
                'Report pack: the full written reports',
                'Family pack: up to eight saved profiles',
                'Everything: all three, once',
              ]}
            />
          </Card>
        </div>
        <p className="tiny dim" style={{ marginTop: 12 }}>
          This open-source build has no payment processor connected: packs can be activated locally for free, and
          reset at any time. The limits and the upgrade screens are the real product logic.
        </p>
      </section>

      <section className="section">
        <Card className="card--gold card--pad-lg">
          <div className="row-between" style={{ gap: 26 }}>
            <div style={{ maxWidth: 620 }}>
              <Eyebrow>Start now</Eyebrow>
              <h2 style={{ marginBottom: 10 }}>Your chart takes about a minute.</h2>
              <p className="muted small">
                No email, no password, no subscription. Try the sample chart first if you want to look around
                before entering real details.
              </p>
            </div>
            <div className="row">
              <Link className="btn" to="/welcome">
                Create my chart <IconArrowRight />
              </Link>
              <Link className="btn btn--ghost" to="/welcome?sample=1">
                Try a sample
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className="footer">
        <div>
          © {new Date().getFullYear()} AstroSutra · An original project. Not affiliated with Melooha.
        </div>
        <div className="footer-links">
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/notices">Third-party notices</Link>
          <Link to="/legal/licensing">Licensing</Link>
          <Link to="/how-it-works">Method</Link>
          <Link to={hasProfile ? '/packs' : '/welcome'}>Plans</Link>
        </div>
      </footer>
    </div>
  );
}
