import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, CardTitle, PageHeader } from '../components/ui';
import { IconArrowRight, IconSearch } from '../components/Icons';
import { GLOSSARY, GLOSSARY_CATEGORIES } from '../lib/glossary';

export default function LearnPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [open, setOpen] = useState<string | null>(GLOSSARY[0].term);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((entry) => {
      const matchesCategory = category === 'All' || entry.category === category;
      const matchesQuery =
        !q ||
        entry.term.toLowerCase().includes(q) ||
        entry.short.toLowerCase().includes(q) ||
        entry.body.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Astropedia"
        title="The vocabulary, explained"
        description="Short, honest definitions of the terms AstroSutra uses — written for this project, with the places where traditions disagree left visible."
        actions={
          <Link className="btn btn--ghost btn--small" to="/how-it-works">
            How calculations work <IconArrowRight />
          </Link>
        }
      />

      <Card style={{ marginBottom: 18 }}>
        <div className="row-between" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'nowrap', flex: 1, minWidth: 220 }}>
            <IconSearch width={18} height={18} style={{ color: 'var(--muted-dim)' }} />
            <input
              className="input"
              placeholder="Search terms, e.g. nakshatra, dasha, nadi…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="row" style={{ gap: 6 }}>
            {['All', ...GLOSSARY_CATEGORIES].map((entry) => (
              <button
                key={entry}
                type="button"
                className={`suggestion${category === entry ? ' active' : ''}`}
                onClick={() => setCategory(entry)}
                style={
                  category === entry
                    ? { borderColor: 'var(--line-strong)', color: 'var(--cream)', background: 'rgba(217,178,106,0.1)' }
                    : undefined
                }
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-2">
        <div className="stack">
          {filtered.map((entry) => {
            const isOpen = open === entry.term;
            return (
              <Card key={entry.term} className={isOpen ? 'card--gold' : ''}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : entry.term)}
                  style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', width: '100%', color: 'inherit' }}
                >
                  <div className="row-between">
                    <div>
                      <div className="row" style={{ gap: 10 }}>
                        <h3 style={{ fontSize: '1.2rem' }}>{entry.term}</h3>
                        <Badge tone="muted">{entry.category}</Badge>
                      </div>
                      <p className="small muted" style={{ marginTop: 6 }}>{entry.short}</p>
                    </div>
                    <span className="dim">{isOpen ? '−' : '+'}</span>
                  </div>
                </button>
                {isOpen ? (
                  <div style={{ marginTop: 14 }}>
                    <p className="small" style={{ color: '#d7d9e8' }}>{entry.body}</p>
                    {entry.sanskrit ? <p className="tiny dim">Sanskrit: {entry.sanskrit}</p> : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
          {filtered.length === 0 ? (
            <Card>
              <p className="muted">No terms match that search.</p>
            </Card>
          ) : null}
        </div>

        <div className="stack">
          <Card>
            <CardTitle title="Start with these" eyebrow="Suggested reading" />
            <div className="stack" style={{ gap: 10 }}>
              {['Lagna', 'Nakshatra', 'Vimshottari dasha', 'Guna Milan'].map((term) => (
                <button
                  key={term}
                  type="button"
                  className="nav-item"
                  style={{ background: 'none', border: 'none', color: 'var(--cream)', width: '100%', textAlign: 'left' }}
                  onClick={() => setOpen(term)}
                >
                  <span>{term}</span>
                  <span className="spacer" />
                  <IconArrowRight width={14} height={14} />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle title="Where traditions differ" eyebrow="Honesty note" />
            <p className="small muted">
              Astrology is not a single system. Ayanamsa choice, house division, dasha year length, the definition of
              yogas and the weighting of compatibility factors all vary between schools and software. AstroSutra
              picks one coherent method, states it, and does not pretend the alternatives do not exist.
            </p>
            <Link className="btn btn--ghost btn--small" to="/legal/terms" style={{ marginTop: 10 }}>
              Limitations & terms
            </Link>
          </Card>

          <Card className="card--flat">
            <div className="eyebrow">Terminology & copyright</div>
            <p className="tiny muted">
              Jyotisha terminology (rashi, nakshatra, dasha, koota and so on) is part of the public-domain heritage of
              Indian astronomy and astrology. The specific wording of these definitions is original to AstroSutra and
              licensed CC BY 4.0.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
