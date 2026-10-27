import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppData, setActiveProfile, useActiveProfile } from '../lib/store';
import {
  IconBook,
  IconCalendar,
  IconCompass,
  IconDashboard,
  IconDocument,
  IconHeart,
  IconMoonStars,
  IconPlus,
  IconSettings,
  IconSparkles,
  IconTag,
  IconUsers,
} from './Icons';

const NAV: Array<{ to: string; label: string; icon: typeof IconDashboard; group: string }> = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard, group: 'Your sky' },
  { to: '/chart', label: 'Birth chart', icon: IconCompass, group: 'Your sky' },
  { to: '/horoscope', label: 'Daily reading', icon: IconMoonStars, group: 'Your sky' },
  { to: '/ask', label: 'Ask Sutra', icon: IconSparkles, group: 'Go deeper' },
  { to: '/match', label: 'Compatibility', icon: IconHeart, group: 'Go deeper' },
  { to: '/reports', label: 'Reports', icon: IconDocument, group: 'Go deeper' },
  { to: '/panchang', label: 'Panchang', icon: IconCalendar, group: 'The sky today' },
  { to: '/learn', label: 'Astropedia', icon: IconBook, group: 'The sky today' },
  { to: '/family', label: 'Your circle', icon: IconUsers, group: 'Account' },
  { to: '/packs', label: 'Plans & packs', icon: IconTag, group: 'Account' },
  { to: '/settings', label: 'Settings & data', icon: IconSettings, group: 'Account' },
];

const TITLES: Record<string, string> = {
  '/dashboard': 'Today, read from your chart',
  '/chart': 'Your birth chart',
  '/horoscope': 'Daily reading',
  '/ask': 'Ask Sutra',
  '/match': 'Compatibility',
  '/reports': 'Your reports',
  '/panchang': 'Panchang & muhurta',
  '/learn': 'Astropedia',
  '/family': 'Your circle',
  '/settings': 'Settings & data',
  '/packs': 'Plans & packs',
};

export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden>
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="19" fill="none" stroke="#d9b26a" strokeWidth="1.4" opacity=".55" />
          <path
            d="M32 12c2.4 11.2 8.8 17.6 20 20-11.2 2.4-17.6 8.8-20 20-2.4-11.2-8.8-17.6-20-20 11.2-2.4 17.6-8.8 20-20Z"
            fill="#e6c885"
          />
          <circle cx="32" cy="32" r="3" fill="#0a0c1e" />
        </svg>
      </div>
      <div>
        <div className="brand-name">
          Astro<span>Sutra</span>
        </div>
        <div className="brand-sub">Vedic, computed</div>
      </div>
    </div>
  );
}

export function ProfileSwitcher({ compact = false }: { compact?: boolean }) {
  const data = useAppData();
  const active = useActiveProfile();
  const navigate = useNavigate();
  if (!active) {
    return (
      <button className="btn btn--small" onClick={() => navigate('/welcome')} type="button">
        <IconPlus /> Add birth details
      </button>
    );
  }
  const initials = active.name
    .replace(/[^\p{L}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="row" style={{ gap: 8 }}>
      <label className="profile-chip">
        <span className="avatar" aria-hidden>
          {initials}
        </span>
        <span className="profile-chip-text">
          <span className="profile-chip-name">{active.name}</span>
          {!compact ? <span className="profile-chip-meta">{active.relation}</span> : null}
        </span>
        <select
          aria-label="Active profile"
          value={active.id}
          onChange={(event) => setActiveProfile(event.target.value)}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-dim)',
            width: 20,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {data.profiles.map((profile) => (
            <option key={profile.id} value={profile.id} style={{ color: '#111' }}>
              {profile.name}
            </option>
          ))}
        </select>
      </label>
      <NavLink to="/family" className="btn btn--ghost btn--small no-print" aria-label="Manage profiles">
        <IconPlus />
      </NavLink>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useActiveProfile();
  const title = TITLES[location.pathname] ?? 'AstroSutra';
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: active?.birth.timeZone ?? 'Asia/Kolkata',
  }).format(new Date());

  const groups = [...new Set(NAV.map((item) => item.group))];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar no-print" aria-label="Sections">
        <Brand />
        <nav className="nav" aria-label="Main">
          {groups.map((group) => (
            <div key={group}>
              <div className="nav-label">{group}</div>
              {NAV.filter((item) => item.group === group).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <item.icon />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-note">
            Everything is computed in your browser. No account, no server, no birth data leaving this device.
          </div>
          <div className="tiny dim">AstroSutra · v1.0 · MIT</div>
        </div>
      </aside>

      <main className="main" id="main-content" tabIndex={-1}>
        <div className="main-inner">
          <div className="topbar no-print">
            <div className="topbar-left">
              <button className="btn btn--quiet" onClick={() => navigate('/dashboard')} type="button" aria-label="Dashboard">
                <IconDashboard />
              </button>
              <div>
                <div className="topbar-date">{today}</div>
                <div className="topbar-title">{title}</div>
              </div>
            </div>
            <div className="topbar-actions">
              <ProfileSwitcher />
            </div>
          </div>
          <Outlet />
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Primary">
        {[
          { to: '/dashboard', label: 'Home', icon: IconDashboard },
          { to: '/chart', label: 'Chart', icon: IconCompass },
          { to: '/ask', label: 'Sutra', icon: IconSparkles },
          { to: '/horoscope', label: 'Today', icon: IconMoonStars },
          { to: '/match', label: 'Match', icon: IconHeart },
        ].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function RequireProfile({ children }: { children: React.ReactNode }) {
  const data = useAppData();
  if (data.profiles.length === 0) return <NavigateToWelcome />;
  return <>{children}</>;
}

function NavigateToWelcome() {
  return <Navigate to="/welcome" replace />;
}
