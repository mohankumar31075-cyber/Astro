import type { CSSProperties, ReactNode } from 'react';
import { IconCheck } from './Icons';

export function Card({
  children,
  className = '',
  as: Tag = 'section',
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
  style?: CSSProperties;
  id?: string;
}) {
  return (
    <Tag className={`card ${className}`} style={style} id={id}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function CardTitle({ title, aside, eyebrow }: { title: ReactNode; aside?: ReactNode; eyebrow?: string }) {
  return (
    <div className="card-title">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h3>{title}</h3>
      </div>
      {aside ? <div className="row">{aside}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = 'gold',
}: {
  children: ReactNode;
  tone?: 'gold' | 'violet' | 'teal' | 'rose' | 'muted' | 'danger';
}) {
  const cls = tone === 'gold' ? 'badge' : `badge badge--${tone}`;
  return <span className={cls}>{children}</span>;
}

export function Meter({ value, max = 100, tone }: { value: number; max?: number; tone?: 'violet' | 'teal' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`meter${tone ? ` meter--${tone}` : ''}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="stars" aria-label={`${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? '' : 'off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="check-list">
      {items.map((item, i) => (
        <li key={i}>
          <IconCheck />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

export function Callout({ children, tone }: { children: ReactNode; tone?: 'teal' | 'danger' }) {
  return <div className={`callout${tone ? ` callout--${tone}` : ''}`}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  actions,
  description,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header style={{ marginBottom: 22 }}>
      <div className="row-between">
        <div style={{ minWidth: 0 }}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>{title}</h1>
          {description ? (
            <p className="lede" style={{ marginTop: 8 }}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="row no-print">{actions}</div> : null}
      </div>
    </header>
  );
}

export function ScoreRing({ value, max, label }: { value: number; max: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="score-ring">
      <svg viewBox="0 0 132 132" aria-hidden>
        <circle cx="66" cy="66" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a98a4e" />
            <stop offset="100%" stopColor="#f1d8a3" />
          </linearGradient>
        </defs>
      </svg>
      <div className="score-ring-text">
        <div>
          <div className="score-ring-value">
            {Number.isInteger(value) ? value : value.toFixed(1)}
            <span style={{ fontSize: '0.95rem', color: 'var(--muted-dim)' }}>/{max}</span>
          </div>
          <div className="score-ring-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          className={`tab${value === tab.value ? ' active' : ''}`}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="kv">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
