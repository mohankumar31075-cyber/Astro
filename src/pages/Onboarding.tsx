import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Brand } from '../components/Layout';
import { ProfileForm } from '../components/ProfileForm';
import { Card } from '../components/ui';
import { IconCheck, IconLock, IconShield, IconSparkles } from '../components/Icons';
import { addSampleProfile, saveProfile, useAppData } from '../lib/store';

const POINTS = [
  'Real ephemeris — the same kind of positional data used by observatories, reduced to the sidereal zodiac.',
  'A guide that cites its own working: dasha lords, house rulerships and transits, listed under every answer.',
  'Panchang, compatibility and family charts, all computed from your details rather than looked up.',
  'Local-only storage. Export a JSON file or erase everything in one click.',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const data = useAppData();
  const wantsSample = params.get('sample') === '1';

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Brand />
        <div>
          <div className="auth-quote">
            “The sky is not a verdict.
            <br />
            It is a <em>second opinion</em>.”
          </div>
          <p className="muted small" style={{ marginTop: 18, maxWidth: '46ch' }}>
            AstroSutra computes a real Vedic birth chart, then helps you read it without the fear-selling.
          </p>
        </div>
        <div className="auth-bullets">
          {POINTS.map((point) => (
            <div key={point} className="auth-bullet">
              <IconCheck />
              <span>{point}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 16 }}>
          <span className="badge badge--teal">
            <IconLock width={12} height={12} /> No account
          </span>
          <span className="badge badge--violet">
            <IconShield width={12} height={12} /> MIT licensed
          </span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="row-between" style={{ marginBottom: 22 }}>
          <Link to="/" className="small muted">
            ← Back to home
          </Link>
          {data.profiles.length > 0 ? (
            <Link to="/dashboard" className="small muted">
              Open existing chart
            </Link>
          ) : null}
        </div>

        {wantsSample ? (
          <Card className="card--gold card--pad-sm" as="div">
            <div className="row-between">
              <div>
                <div className="eyebrow">Sample chart</div>
                <p className="small muted">
                  Load a demo profile (Mumbai, 14 Aug 1992, 22:45) to explore every screen before entering real
                  details.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => {
                  addSampleProfile();
                  navigate('/dashboard');
                }}
              >
                <IconSparkles /> Load sample
              </button>
            </div>
          </Card>
        ) : null}

        <div style={{ marginTop: wantsSample ? 20 : 0 }}>
          <ProfileForm
            onSubmit={(draft) => {
              saveProfile(draft);
              navigate('/dashboard');
            }}
          />
        </div>

        <div className="divider" />
        <div className="row-between small dim">
          <span>
            Already have an AstroSutra export? Import it from{' '}
            <Link to="/settings" style={{ color: 'var(--gold)' }}>
              Settings → Data
            </Link>
            .
          </span>
          <Link to="/legal/privacy" className="muted">
            Privacy
          </Link>
        </div>
      </main>
    </div>
  );
}
