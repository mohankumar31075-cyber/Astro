import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NorthChart } from '../components/Charts';
import { IconArrowRight, IconClock, IconHeart, IconMoonStars, IconSparkles, IconSun } from '../components/Icons';
import { Badge, Card, CardTitle, Meter, PageHeader, Stat, Stars } from '../components/ui';
import { NAKSHATRAS, PLANETS, RASHIS } from '../lib/constants';
import { useActiveChart, useActiveProfile, useAppData } from '../lib/store';
import { antardashasOf, dashaTreeAt, formatPeriodDate } from '../lib/dasha';
import { computePanchang, phaseName } from '../lib/panchang';
import { currentTransits, ordinal, sadeSati } from '../lib/transits';
import { analyseChart } from '../lib/yogas';
import { dailyHoroscope, personalisedNote } from '../lib/horoscope';
import { formatLocalTime } from '../lib/time';

export default function Dashboard() {
  const profile = useActiveProfile();
  const chart = useActiveChart();
  const data = useAppData();
  const now = useMemo(() => new Date(), []);

  if (!profile || !chart) return null;

  const place = !data.settings.useProfilePlace && data.settings.panchangCity
    ? {
        latitude: data.settings.panchangCity.latitude,
        longitude: data.settings.panchangCity.longitude,
        timeZone: data.settings.panchangCity.timeZone,
        place: data.settings.panchangCity.name,
      }
    : {
        latitude: chart.input.latitude,
        longitude: chart.input.longitude,
        timeZone: chart.input.timeZone,
        place: chart.input.place,
      };

  const panchang = computePanchang(now, place);
  const tree = dashaTreeAt(chart, now);
  const sade = sadeSati(chart, now);
  const transits = currentTransits(chart, now);
  const factors = analyseChart(chart);
  const topYoga = factors.find((factor) => factor.kind === 'yoga') ?? factors[0];
  const note = personalisedNote(chart, now);
  const reading = dailyHoroscope(chart.moonSign, now, place);
  const antars = antardashasOf(chart, now);

  const localHour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: profile.birth.timeZone, hour: '2-digit', hour12: false }).format(now),
  );
  const greeting = localHour < 5 ? 'Still awake' : localHour < 12 ? 'Good morning' : localHour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile.name.split(' ')[0];
  const mahaProgress =
    ((now.getTime() - tree.maha.start.getTime()) / (tree.maha.end.getTime() - tree.maha.start.getTime())) * 100;

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow={new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: profile.birth.timeZone }).format(now)}
        title={`${greeting}, ${firstName}.`}
        description={`${RASHIS[chart.ascendant.sign].english} ascendant · ${RASHIS[chart.moonSign].english} Moon · ${NAKSHATRAS[chart.birthNakshatra].name} nakshatra`}
        actions={
          <>
            <Link className="btn btn--ghost btn--small" to="/horoscope">
              <IconMoonStars /> Today
            </Link>
            <Link className="btn btn--small" to="/ask">
              <IconSparkles /> Ask Vaani
            </Link>
          </>
        }
      />

      <div className="grid grid-hero" style={{ marginBottom: 18 }}>
        <Card>
          <div className="row" style={{ gap: 10, marginBottom: 14 }}>
            <Badge tone="teal">{note.moonHouse ? `${ordinal(note.moonHouse)} from your Moon` : 'Transit'}</Badge>
            <Badge tone="violet">{phaseName(panchang.phaseAngle)}</Badge>
            <span className="tiny dim">
              {panchang.tithi.paksha} {panchang.tithi.name} · {panchang.nakshatra.name} nakshatra
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 12 }}>
            {reading.headline}
          </h2>
          <p className="lede" style={{ marginBottom: 18 }}>
            {note.text} {reading.summary.split('. ').slice(1, 3).join('. ')}
          </p>

          <div className="stat-grid" style={{ marginBottom: 18 }}>
            <Stat label="Lagna" value={<><span className="glyph">{RASHIS[chart.ascendant.sign].symbol}</span>{RASHIS[chart.ascendant.sign].english}</>} />
            <Stat label="Moon" value={<><span className="glyph">{RASHIS[chart.moonSign].symbol}</span>{RASHIS[chart.moonSign].english}</>} />
            <Stat label="Nakshatra" value={NAKSHATRAS[chart.birthNakshatra].name} />
            <Stat label="Moon sign reading" value={<Stars value={reading.stars} />} />
          </div>

          <div className="row" style={{ gap: 10 }}>
            <Link className="btn btn--small" to="/ask">
              Ask about your chart <IconArrowRight />
            </Link>
            <Link className="btn btn--ghost btn--small" to="/reports">
              Read a full report
            </Link>
          </div>
        </Card>

        <Card>
          <CardTitle
            title="Your chart"
            aside={
              <Link to="/chart" className="small muted">
                Open <IconArrowRight width={12} height={12} />
              </Link>
            }
          />
          <NorthChart chart={chart} />
          <div className="row-between" style={{ marginTop: 12 }}>
            <span className="tiny dim">North Indian · whole-sign houses</span>
            <span className="tiny dim">{chart.ayanamsa.toFixed(2)}° ayanamsa</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Card>
          <CardTitle title="Today's panchang" eyebrow={panchang.place} aside={<Link className="small muted" to="/panchang">Details</Link>} />
          <dl style={{ margin: 0 }}>
            <div className="kv"><dt>Tithi</dt><dd>{panchang.tithi.paksha} {panchang.tithi.name}</dd></div>
            <div className="kv"><dt>Nakshatra</dt><dd>{panchang.nakshatra.name} · pada {panchang.nakshatra.pada}</dd></div>
            <div className="kv"><dt>Yoga</dt><dd>{panchang.yoga.name}</dd></div>
            <div className="kv"><dt>Karana</dt><dd>{panchang.karana.name}</dd></div>
            <div className="kv">
              <dt><IconSun width={12} height={12} /> Sunrise / sunset</dt>
              <dd>{formatLocalTime(panchang.sunrise, place.timeZone)} · {formatLocalTime(panchang.sunset, place.timeZone)}</dd>
            </div>
            <div className="kv">
              <dt><IconClock width={12} height={12} /> Rahu Kaal</dt>
              <dd>
                {panchang.rahuKaal
                  ? `${formatLocalTime(panchang.rahuKaal.start, place.timeZone)} – ${formatLocalTime(panchang.rahuKaal.end, place.timeZone)}`
                  : '—'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle title="The active weather" eyebrow="Gochara" aside={<Link className="small muted" to="/chart">Chart</Link>} />
          <div className="stack" style={{ gap: 12 }}>
            {sade.active ? (
              <div>
                <Badge tone="rose">Sade Sati · {sade.phase}</Badge>
                <p className="small muted" style={{ marginTop: 8 }}>
                  Saturn is in your {ordinal(sade.houseFromMoon)} house from the Moon
                  {sade.phaseEnd ? ` until about ${formatPeriodDate(sade.phaseEnd)}` : ''}. Expect a season of
                  consolidation rather than quick wins.
                </p>
              </div>
            ) : (
              <div>
                <Badge tone="teal">No Sade Sati</Badge>
                <p className="small muted" style={{ marginTop: 8 }}>
                  Saturn is in your {ordinal(sade.houseFromMoon)} house from the Moon — outside the 12th, 1st and
                  2nd houses that make up Sade Sati.
                </p>
              </div>
            )}
            {transits
              .filter((t) => t.key === 'jupiter' || t.key === 'saturn' || t.key === 'rahu')
              .map((transit) => (
                <div key={transit.key} className="row-between">
                  <span className="small">
                    <span className="glyph" style={{ color: 'var(--gold)', marginRight: 6 }}>
                      {PLANETS[transit.key].symbol}
                    </span>
                    {PLANETS[transit.key].name}
                  </span>
                  <span className="small dim">
                    {RASHIS[transit.sign].english} · {ordinal(transit.houseFromMoon)} from Moon
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Your strongest combination" eyebrow={topYoga.kind === 'yoga' ? 'Yoga' : 'Dosha'} aside={<Link className="small muted" to="/chart">All factors</Link>} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: 8 }}>{topYoga.title}</h3>
          <p className="small muted">{topYoga.detail}</p>
          <div className="callout" style={{ marginTop: 14 }}>
            {topYoga.guidance}
          </div>
        </Card>
      </div>

      <div className="grid grid-hero">
        <Card>
          <CardTitle title="Your dasha timeline" eyebrow="Vimshottari" aside={<Link className="small muted" to="/chart">Full cycle</Link>} />
          <div className="row-between" style={{ marginBottom: 6 }}>
            <div>
              <div className="small">
                <strong>{PLANETS[tree.maha.lord].name} Mahadasha</strong>
              </div>
              <div className="tiny dim">
                {formatPeriodDate(tree.maha.start)} → {formatPeriodDate(tree.maha.end)} · {PLANETS[tree.antar.lord].name} antardasha
              </div>
            </div>
            <span className="badge">{Math.round(mahaProgress)}% elapsed</span>
          </div>
          <Meter value={mahaProgress} />
          <div style={{ marginTop: 18 }}>
            <div className="eyebrow">Antardashas in this chapter</div>
            <div className="timeline">
              {antars.map((period) => {
                const active = period.lord === tree.antar.lord;
                return (
                  <div key={period.lord} className={`timeline-item${active ? ' active' : ''}`}>
                    <span className="timeline-dot" />
                    <div>
                      <div className="row-between">
                        <span className="timeline-title">
                          {PLANETS[period.lord].name}
                          {active ? <span className="badge" style={{ marginLeft: 8 }}>Now</span> : null}
                        </span>
                        <span className="timeline-date">
                          {formatPeriodDate(period.start)} – {formatPeriodDate(period.end)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="stack">
          <Card>
            <CardTitle title="Quick paths" />
            <div className="stack" style={{ gap: 8 }}>
              {[
                { to: '/horoscope', icon: IconMoonStars, label: 'Today\'s reading', detail: `${RASHIS[chart.moonSign].english} Moon · ${reading.stars}/5` },
                { to: '/match', icon: IconHeart, label: 'Check compatibility', detail: 'Ashtakoot + Mangal dosha' },
                { to: '/reports', icon: IconSparkles, label: 'Full reports', detail: 'Career, love, health, money' },
              ].map((item) => (
                <Link key={item.to} to={item.to} className="nav-item" style={{ justifyContent: 'space-between' }}>
                  <span className="row" style={{ gap: 10 }}>
                    <item.icon />
                    <span>
                      <span style={{ display: 'block', fontSize: '0.86rem', color: 'var(--cream)' }}>{item.label}</span>
                      <span className="tiny dim">{item.detail}</span>
                    </span>
                  </span>
                  <IconArrowRight width={14} height={14} />
                </Link>
              ))}
            </div>
          </Card>
          <Card className="card--flat">
            <div className="eyebrow">A note on method</div>
            <p className="tiny muted">
              Positions come from an MIT-licensed ephemeris and are converted with the Lahiri ayanamsa. Houses are
              whole-sign. Dasha years use 365.2425 days. Every reading is interpretive, not predictive.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
