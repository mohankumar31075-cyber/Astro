import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Callout, Card, CardTitle, EmptyState, Meter, PageHeader, ScoreRing, Stars } from '../components/ui';
import { IconHeart, IconPrint, IconSparkles } from '../components/Icons';
import { NAKSHATRAS, PLANETS, RASHIS } from '../lib/constants';
import { chartForProfile, useAppData, useActiveProfile } from '../lib/store';
import { computeMatch, formatPoints, kootaPercent } from '../lib/matching';
import { dashaTreeAt, formatPeriodDate } from '../lib/dasha';

export default function MatchPage() {
  const data = useAppData();
  const active = useActiveProfile();
  const profiles = data.profiles;
  const [aId, setAId] = useState<string>(active?.id ?? profiles[0]?.id ?? '');
  const [bId, setBId] = useState<string>(profiles.find((p) => p.id !== (active?.id ?? profiles[0]?.id))?.id ?? '');
  const [groomSide, setGroomSide] = useState<'a' | 'b'>('b');

  useEffect(() => {
    if (bId === aId) {
      const other = profiles.find((profile) => profile.id !== aId);
      if (other) setBId(other.id);
    }
  }, [aId, bId, profiles]);

  const profileA = profiles.find((p) => p.id === aId) ?? profiles[0];
  const profileB = profiles.find((p) => p.id === bId) ?? profiles.find((p) => p.id !== profileA?.id);
  const chartA = chartForProfile(profileA ?? null);
  const chartB = chartForProfile(profileB ?? null);

  const match = useMemo(
    () => (chartA && chartB ? computeMatch(chartA, chartB, { groomSide }) : null),
    [chartA, chartB, groomSide],
  );

  if (profiles.length < 2) {
    return (
      <div className="fade-in">
        <PageHeader eyebrow="Ashtakoot Guna Milan" title="Compatibility" />
        <Card>
          <EmptyState
            title="Two charts are needed"
            action={
              <Link className="btn" to="/family">
                <IconHeart /> Add a second profile
              </Link>
            }
          >
            Compatibility compares the Moon's nakshatra and rashi in two charts. Add a partner, a family member or a
            friend's birth details to run the full eight-koota comparison.
          </EmptyState>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Ashtakoot Guna Milan"
        title="Compatibility"
        description="Eight classical factors, computed from both charts — with the method and the caveats in plain sight."
        actions={
          <button type="button" className="btn btn--ghost btn--small" onClick={() => window.print()}>
            <IconPrint /> Print
          </button>
        }
      />

      <Card style={{ marginBottom: 18 }}>
        <div className="grid grid-3" style={{ gap: 16, alignItems: 'end' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="a">Partner A</label>
            <select id="a" className="select" value={profileA?.id} onChange={(event) => setAId(event.target.value)}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name} · {profile.relation}</option>
              ))}
            </select>
            {chartA ? (
              <span className="hint">
                {RASHIS[chartA.moonSign].english} Moon · {NAKSHATRAS[chartA.birthNakshatra].name}
              </span>
            ) : null}
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="b">Partner B</label>
            <select id="b" className="select" value={profileB?.id ?? ''} onChange={(event) => setBId(event.target.value)}>
              {profiles.filter((p) => p.id !== profileA?.id).map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name} · {profile.relation}</option>
              ))}
            </select>
            {chartB ? (
              <span className="hint">
                {RASHIS[chartB.moonSign].english} Moon · {NAKSHATRAS[chartB.birthNakshatra].name}
              </span>
            ) : null}
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Traditional role for Varna</label>
            <div className="segmented">
              <button type="button" className={groomSide === 'b' ? 'active' : ''} onClick={() => setGroomSide('b')}>
                {profileB?.name.split(' ')[0] ?? 'B'} as groom side
              </button>
              <button type="button" className={groomSide === 'a' ? 'active' : ''} onClick={() => setGroomSide('a')}>
                {profileA?.name.split(' ')[0] ?? 'A'} as groom side
              </button>
            </div>
            <span className="hint">Varna is the only directional koota in the classical scheme.</span>
          </div>
        </div>
      </Card>

      {match && chartA && chartB && profileA && profileB ? (
        <>
          <Card style={{ marginBottom: 18 }}>
            <div className="score-hero">
              <ScoreRing value={match.total} max={36} label="of 36 gunas" />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                  <Badge tone={match.verdict.tone === 'challenging' ? 'danger' : match.verdict.tone === 'mixed' ? 'muted' : 'teal'}>
                    {match.verdict.label}
                  </Badge>
                  <span className="small dim">{match.percentage.toFixed(0)}% of the maximum</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', marginBottom: 8 }}>
                  {profileA.name} <span className="dim" style={{ fontSize: '0.7em' }}>+</span> {profileB.name}
                </h2>
                <p className="small muted">{match.verdict.text}</p>
                <div className="row" style={{ gap: 8, marginTop: 12 }}>
                  {match.strengths.map((name) => (
                    <Badge key={name} tone="teal">{name} strongest</Badge>
                  ))}
                  {match.frictions.map((name) => (
                    <Badge key={name} tone="rose">{name} needs work</Badge>
                  ))}
                </div>
              </div>
              <div className="stack" style={{ minWidth: 180 }}>
                <div className="stat">
                  <div className="stat-label">Moons</div>
                  <div className="stat-value" style={{ fontSize: '0.84rem' }}>{match.extra.moonSignPair}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Nakshatras</div>
                  <div className="stat-value" style={{ fontSize: '0.84rem' }}>
                    {NAKSHATRAS[chartA.birthNakshatra].name} · {NAKSHATRAS[chartB.birthNakshatra].name}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-chart" style={{ marginBottom: 18 }}>
            <Card>
              <CardTitle title="The eight kootas" eyebrow="Score breakdown" />
              <div>
                {match.kootas.map((koota) => (
                  <div key={koota.key} className="koota">
                    <div className="koota-head">
                      <span className="koota-name">{koota.name}</span>
                      <span className="koota-score">{formatPoints(koota.score)} / {koota.max}</span>
                    </div>
                    <div style={{ margin: '6px 0' }}>
                      <Meter value={kootaPercent(koota)} tone={kootaPercent(koota) < 34 ? undefined : 'teal'} />
                    </div>
                    <p className="koota-detail">{koota.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="stack">
              <Card>
                <CardTitle title="Mangal dosha" eyebrow="Both charts" />
                {[match.mangal.a, match.mangal.b].map((status) => (
                  <div key={status.name} style={{ marginBottom: 14 }}>
                    <div className="row-between">
                      <strong className="small">{status.name}</strong>
                      <Badge tone={status.manglik ? 'rose' : 'teal'}>
                        {status.manglik ? `Manglik · ${status.strength}` : 'Not Manglik'}
                      </Badge>
                    </div>
                    <p className="tiny muted" style={{ marginTop: 4 }}>{status.detail}</p>
                  </div>
                ))}
                <Callout tone="teal">{match.mangal.note}</Callout>
              </Card>

              <Card>
                <CardTitle title="Beyond the score" eyebrow="What else to read" />
                <p className="small muted" style={{ marginBottom: 8 }}>{match.extra.seventhLord.a}</p>
                <p className="small muted" style={{ marginBottom: 8 }}>{match.extra.seventhLord.b}</p>
                <p className="small muted" style={{ marginBottom: 8 }}>{match.extra.venus.a}</p>
                <p className="small muted">{match.extra.venus.b}</p>
                <div className="divider" />
                <p className="tiny dim">{match.extra.dashaNote}</p>
              </Card>
            </div>
          </div>

          <Card style={{ marginBottom: 18 }}>
            <CardTitle title="Timing in both charts" eyebrow="Where each person is now" />
            <div className="grid grid-2">
              {[chartA, chartB].map((chart) => {
                const tree = dashaTreeAt(chart, new Date());
                return (
                  <div key={chart.input.name} className="stat">
                    <div className="stat-label">{chart.input.name}</div>
                    <div className="stat-value" style={{ fontSize: '0.92rem' }}>
                      {PLANETS[tree.maha.lord].name} / {PLANETS[tree.antar.lord].name}
                    </div>
                    <div className="tiny dim" style={{ marginTop: 4 }}>
                      Antardasha until {formatPeriodDate(tree.antar.end)} · {PLANETS[tree.maha.lord].name} in house {chart.houseOf[tree.maha.lord]}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="card--flat">
            <div className="row-between">
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>A score is not a decision</h3>
                <p className="small muted" style={{ maxWidth: '70ch' }}>
                  Guna Milan reads only the Moon. Families and traditions weight the factors differently, and the
                  classical texts list exceptions for Bhakoot, Nadi and Mangal dosha. Use this as a conversation
                  starter, never as a verdict on a relationship.
                </p>
              </div>
              <Link className="btn btn--ghost btn--small" to="/ask">
                <IconSparkles /> Ask Sutra about this
              </Link>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <span className="tiny dim">Overall strength</span>
              <Stars value={Math.max(1, Math.round(match.total / 7.2))} />
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState title="Select two different profiles">Choose distinct charts for both partners to compare.</EmptyState>
        </Card>
      )}
    </div>
  );
}
