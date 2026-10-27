import { Link } from 'react-router-dom';
import { HouseGrid, NorthChart, PlanetTable, SouthChart } from '../components/Charts';
import { Badge, Callout, Card, CardTitle, PageHeader, Property } from '../components/ui';
import { IconPrint, IconSparkles } from '../components/Icons';
import { NAKSHATRAS, PLANETS, RASHIS } from '../lib/constants';
import { useActiveChart, useActiveProfile, useAppData, updateSettings } from '../lib/store';
import { dashaAtBirth, dashaTreeAt, mahadashaSequence, formatPeriodDate } from '../lib/dasha';
import { analyseChart } from '../lib/yogas';
import { AYANAMSA_INFO } from '../lib/ayanamsa';
import { navamsaSign } from '../lib/astro';
import { formatLocalDateTime, zoneOffsetMinutes, formatOffset } from '../lib/time';

export default function ChartPage() {
  const profile = useActiveProfile();
  const chart = useActiveChart();
  const data = useAppData();
  if (!profile || !chart) return null;

  const now = new Date();
  const tree = dashaTreeAt(chart, now);
  const birth = dashaAtBirth(chart);
  const factors = analyseChart(chart);
  const nakshatra = NAKSHATRAS[chart.birthNakshatra];
  const offset = zoneOffsetMinutes(chart.utc, profile.birth.timeZone);
  const sequence = mahadashaSequence(chart).slice(0, 9);

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow={`${profile.name} · ${profile.birth.timeUnknown ? 'approximate time' : 'exact time'}`}
        title="Your birth chart"
        description={`Sidereal positions for ${formatLocalDateTime(chart.utc, profile.birth.timeZone)} at ${profile.birth.place}, using the Lahiri ayanamsa and whole-sign houses.`}
        actions={
          <>
            <div className="segmented" role="group" aria-label="Chart style">
              <button
                type="button"
                className={data.settings.chartStyle === 'north' ? 'active' : ''}
                onClick={() => updateSettings({ chartStyle: 'north' })}
              >
                North
              </button>
              <button
                type="button"
                className={data.settings.chartStyle === 'south' ? 'active' : ''}
                onClick={() => updateSettings({ chartStyle: 'south' })}
              >
                South
              </button>
            </div>
            <Link className="btn btn--ghost btn--small" to="/ask">
              <IconSparkles /> Ask about this
            </Link>
          </>
        }
      />

      <div className="grid grid-chart" style={{ marginBottom: 18 }}>
        <Card>
          {data.settings.chartStyle === 'north' ? <NorthChart chart={chart} /> : <SouthChart chart={chart} />}
          <div className="divider" />
          <div className="legend">
            <span><span className="glyph">☉</span> Sun</span>
            <span><span className="glyph">☽</span> Moon</span>
            <span><span className="glyph">♂</span> Mars</span>
            <span><span className="glyph">☿</span> Mercury</span>
            <span><span className="glyph">♃</span> Jupiter</span>
            <span><span className="glyph">♀</span> Venus</span>
            <span><span className="glyph">♄</span> Saturn</span>
            <span><span className="glyph">☊</span> Rahu</span>
            <span><span className="glyph">☋</span> Ketu</span>
            <span className="dim">R retrograde</span>
          </div>
          <p className="tiny dim" style={{ marginTop: 10 }}>
            {data.settings.chartStyle === 'north'
              ? 'Numbers are rashis (1 = Aries). Houses are fixed with the 1st at the top diamond and run anticlockwise; the lagna is marked.'
              : 'Signs are fixed in the South Indian layout. The lagna is marked with a diagonal stroke in its sign cell.'}
          </p>
        </Card>

        <div className="stack">
          <Card>
            <CardTitle title="Chart summary" eyebrow="Snapshot" />
            <div className="stat-grid">
              <div className="stat">
                <div className="stat-label">Lagna</div>
                <div className="stat-value">
                  <span className="glyph">{RASHIS[chart.ascendant.sign].symbol}</span> {RASHIS[chart.ascendant.sign].english}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Moon</div>
                <div className="stat-value">
                  <span className="glyph">{RASHIS[chart.moonSign].symbol}</span> {RASHIS[chart.moonSign].english}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Sun</div>
                <div className="stat-value">
                  <span className="glyph">{RASHIS[chart.sunSign].symbol}</span> {RASHIS[chart.sunSign].english}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Birth nakshatra</div>
                <div className="stat-value">{nakshatra.name}</div>
              </div>
            </div>
            <dl style={{ margin: '14px 0 0' }}>
              <Property label="Ascendant degree">
                {chart.ascendant.degreeInSign.toFixed(2)}° {RASHIS[chart.ascendant.sign].english} · pada {chart.ascendant.pada}
              </Property>
              <Property label="Moon nakshatra">
                {nakshatra.name} pada {chart.positions.moon.pada} · lord {PLANETS[nakshatra.lord].name}
              </Property>
              <Property label="Navamsa lagna">
                {RASHIS[navamsaSign(chart.ascendant.longitude)].english} — the D9 refinement of the ascendant
              </Property>
              <Property label="Dasha at birth">
                {PLANETS[birth.lord].name} · {birth.balanceYears.toFixed(2)} years remaining
              </Property>
              <Property label="Current dasha">
                {PLANETS[tree.maha.lord].name} / {PLANETS[tree.antar.lord].name} / {PLANETS[tree.pratyantar.lord].name}
              </Property>
            </dl>
          </Card>

          <Card>
            <CardTitle title="Birth details" eyebrow="As entered" />
            <dl style={{ margin: 0 }}>
              <Property label="Date & time">{formatLocalDateTime(chart.utc, profile.birth.timeZone)}</Property>
              <Property label="Place">{profile.birth.place}</Property>
              <Property label="Coordinates">
                {profile.birth.latitude.toFixed(4)}°, {profile.birth.longitude.toFixed(4)}°
              </Property>
              <Property label="Time zone">{profile.birth.timeZone} ({formatOffset(offset)})</Property>
              <Property label="UTC instant">{formatLocalDateTime(chart.utc, 'UTC')}</Property>
              <Property label="Julian day">{chart.julianDay.toFixed(5)}</Property>
              <Property label="Ayanamsa">{chart.ayanamsa.toFixed(4)}° · {AYANAMSA_INFO.name}</Property>
            </dl>
            {profile.birth.timeUnknown ? (
              <Callout tone="danger" >
                Birth time was marked unknown, so 12:00 local time was used. The ascendant, house cusps and dasha
                balance are approximate — treat the Moon sign as the more reliable signal.
              </Callout>
            ) : null}
          </Card>
        </div>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardTitle title="Graha positions" eyebrow="Sidereal longitude" aside={<Link className="small muted" to="/panchang">Today's sky</Link>} />
        <PlanetTable chart={chart} />
      </Card>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card>
          <CardTitle title="Your birth nakshatra" eyebrow={nakshatra.english} />
          <h3 style={{ marginBottom: 10 }}>{nakshatra.name} · pada {chart.positions.moon.pada}</h3>
          <p className="small muted">{nakshatra.keywords.charAt(0).toUpperCase() + nakshatra.keywords.slice(1)}.</p>
          <dl style={{ margin: '12px 0 0' }}>
            <Property label="Ruling planet">{PLANETS[nakshatra.lord].name}</Property>
            <Property label="Deity">{nakshatra.deity}</Property>
            <Property label="Symbol">{nakshatra.symbol}</Property>
            <Property label="Gana">{nakshatra.gana}</Property>
            <Property label="Yoni">{nakshatra.yoni}</Property>
            <Property label="Nadi">{nakshatra.nadi}</Property>
            <Property label="Motivation">{nakshatra.motivation}</Property>
          </dl>
        </Card>

        <Card>
          <CardTitle title="Yogas & doshas" eyebrow={`${factors.length} factors detected`} />
          <div className="stack" style={{ gap: 14 }}>
            {factors.map((factor) => (
              <div key={factor.id}>
                <div className="row-between">
                  <div className="row" style={{ gap: 8 }}>
                    <strong style={{ fontSize: '0.92rem' }}>{factor.title}</strong>
                    <Badge tone={factor.kind === 'yoga' ? 'teal' : 'rose'}>{factor.kind}</Badge>
                    <Badge tone={factor.strength === 'cancelled' ? 'muted' : 'gold'}>{factor.strength}</Badge>
                  </div>
                  <span className="tiny dim">
                    {factor.planets.map((p) => PLANETS[p].name).join(' + ')} · house {factor.houses.join(', ')}
                  </span>
                </div>
                <p className="small muted" style={{ marginTop: 6 }}>{factor.detail}</p>
                <p className="tiny" style={{ color: 'var(--gold-dim)', marginTop: 4 }}>{factor.guidance}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardTitle title="Houses" eyebrow="Whole-sign · from the ascendant" />
        <HouseGrid chart={chart} />
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <CardTitle title="Vimshottari mahadashas" eyebrow="120-year cycle from birth" />
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Lord</th>
                <th>Starts</th>
                <th>Ends</th>
                <th>Years</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sequence.map((period) => {
                const isCurrent = period.lord === tree.maha.lord && now >= period.start && now < period.end;
                return (
                  <tr key={`${period.lord}-${period.start.toISOString()}`}>
                    <td>
                      <span className="planet-cell">
                        <span className="glyph">{PLANETS[period.lord].symbol}</span>
                        {PLANETS[period.lord].name}
                      </span>
                    </td>
                    <td className="mono">{formatPeriodDate(period.start)}</td>
                    <td className="mono">{formatPeriodDate(period.end)}</td>
                    <td className="mono">{((period.end.getTime() - period.start.getTime()) / (365.2425 * 86_400_000)).toFixed(0)}</td>
                    <td>{isCurrent ? <Badge tone="teal">Running</Badge> : <span className="dim small">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="card--flat">
        <CardTitle title="Method notes" />
        <div className="grid grid-2" style={{ gap: 20 }}>
          <div>
            <p className="small muted">
              <strong>Positions.</strong> Geocentric ecliptic longitudes from the Astronomy Engine ephemeris, computed
              in the true ecliptic of date and converted to sidereal using the Lahiri ayanamsa.
            </p>
            <p className="small muted">
              <strong>Rahu and Ketu.</strong> Mean lunar node. The true node oscillates around it by up to about
              1.7°; classical practice differs on which to use, and AstroSutra states its choice rather than hiding it.
            </p>
          </div>
          <div>
            <p className="small muted">
              <strong>Houses.</strong> Whole-sign (rashi) houses from the sidereal ascendant, the default in Vedic
              practice. The Midheaven is not used for house division.
            </p>
            <p className="small muted">
              <strong>Dashas.</strong> Vimshottari with 365.2425-day years. Some traditions use 360-day savana years,
              which can shift period boundaries by weeks.
            </p>
          </div>
        </div>
        <div className="row no-print" style={{ marginTop: 8 }}>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => window.print()}>
            <IconPrint /> Print this chart
          </button>
          <Link className="btn btn--quiet btn--small" to="/legal/licensing">
            Licensing & attribution
          </Link>
        </div>
      </Card>
    </div>
  );
}
