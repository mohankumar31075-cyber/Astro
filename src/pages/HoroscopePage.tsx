import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Card, CardTitle, Meter, PageHeader, Stars } from '../components/ui';
import { IconArrowRight, IconMoonStars, IconPrint, IconSun } from '../components/Icons';
import { NAKSHATRAS, PLANETS, RASHIS, RASHI_SLUGS } from '../lib/constants';
import { useActiveChart, useActiveProfile, useAppData } from '../lib/store';
import { dailyHoroscope, personalisedNote, SIGN_PROFILES } from '../lib/horoscope';
import { phaseName } from '../lib/panchang';
import { formatLocalTime, isoDate, zonedToUtc } from '../lib/time';

export default function HoroscopePage() {
  const profile = useActiveProfile();
  const chart = useActiveChart();
  const data = useAppData();
  const { slug } = useParams();
  const initialSign = slug ? Math.max(0, RASHI_SLUGS.indexOf(slug)) : data.settings.lastHoroscopeSign ?? chart?.moonSign ?? 0;
  const [sign, setSign] = useState<number>(initialSign);
  const [dateISO, setDateISO] = useState(() => isoDate(new Date(), profile?.birth.timeZone ?? 'Asia/Kolkata'));
  const [mode, setMode] = useState<'moon' | 'sun'>('moon');

  useEffect(() => {
    if (slug && RASHI_SLUGS.includes(slug)) setSign(RASHI_SLUGS.indexOf(slug));
  }, [slug]);

  const place = useMemo(() => {
    const city = !data.settings.useProfilePlace ? data.settings.panchangCity : null;
    if (city) return { latitude: city.latitude, longitude: city.longitude, timeZone: city.timeZone, place: city.name };
    return {
      latitude: profile?.birth.latitude ?? 28.6139,
      longitude: profile?.birth.longitude ?? 77.209,
      timeZone: profile?.birth.timeZone ?? 'Asia/Kolkata',
      place: profile?.birth.place ?? 'New Delhi',
    };
  }, [data.settings, profile]);

  const instant = useMemo(() => zonedToUtc(dateISO, '12:00', place.timeZone), [dateISO, place.timeZone]);
  const reading = useMemo(() => dailyHoroscope(sign, instant, place), [sign, instant, place]);
  const personal = chart ? personalisedNote(chart, instant) : null;
  const profileData = SIGN_PROFILES[sign];
  const isToday = dateISO === isoDate(new Date(), place.timeZone);

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow={place.place}
        title={isToday ? 'Today\'s reading' : `Reading for ${dateISO}`}
        description="Composed from today's tithi, nakshatra, weekday lord and the Moon's transit house — with the reasoning shown, not hidden."
        actions={
          <>
            <input
              type="date"
              className="input"
              style={{ width: 160 }}
              value={dateISO}
              onChange={(event) => setDateISO(event.target.value)}
            />
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setDateISO(isoDate(new Date(), place.timeZone))}>
              Today
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => window.print()}>
              <IconPrint />
            </button>
          </>
        }
      />

      <div className="grid grid-hero" style={{ marginBottom: 18 }}>
        <Card>
          <div className="row" style={{ gap: 12, marginBottom: 14 }}>
            <div className="row" style={{ gap: 8 }}>
              <span className="glyph" style={{ fontSize: '1.6rem', color: 'var(--gold)' }}>
                {RASHIS[sign].symbol}
              </span>
              <div>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{profileData.tagline}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                  {RASHIS[sign].english} <span className="dim" style={{ fontSize: '0.9rem' }}>{RASHIS[sign].name}</span>
                </h2>
              </div>
            </div>
            <span className="spacer" />
            <div style={{ textAlign: 'right' }}>
              <Stars value={reading.stars} />
              <div className="tiny dim">day rating</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 10 }}>{reading.headline}</h3>
          <p className="lede" style={{ marginBottom: 16 }}>{reading.summary}</p>

          <div className="grid grid-3" style={{ gap: 10, marginBottom: 16 }}>
            <div className="stat">
              <div className="stat-label">Lucky number</div>
              <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{reading.lucky.number}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Colour</div>
              <div className="stat-value" style={{ fontSize: '0.86rem' }}>
                <span
                  aria-hidden
                  style={{ display: 'inline-block', width: 11, height: 11, borderRadius: '50%', background: reading.lucky.colour.hex, marginRight: 6 }}
                />
                {reading.lucky.colour.name}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Abhijit muhurta</div>
              <div className="stat-value" style={{ fontSize: '0.82rem' }}>{reading.lucky.hour}</div>
            </div>
          </div>

          <div className="stack" style={{ gap: 16 }}>
            {reading.sections.map((section) => (
              <div key={section.key}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{section.title}</div>
                <p className="small" style={{ color: '#d7d9e8' }}>{section.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="stack">
          <Card>
            <CardTitle title="Why this reading" eyebrow="Today's sky" />
            <dl style={{ margin: 0 }}>
              <div className="kv"><dt>Moon transits</dt><dd>{RASHIS[reading.moon.sign].english} · {NAKSHATRAS[reading.moon.nakshatra].name} {reading.moon.pada}</dd></div>
              <div className="kv"><dt>House from your sign</dt><dd>{reading.moon.house}</dd></div>
              <div className="kv"><dt>Tithi</dt><dd>{reading.panchang.tithi.paksha} {reading.panchang.tithi.name}</dd></div>
              <div className="kv"><dt>Yoga / Karana</dt><dd>{reading.panchang.yoga.name} · {reading.panchang.karana.name}</dd></div>
              <div className="kv"><dt>Day lord</dt><dd>{reading.panchang.weekday.english} · {PLANETS[reading.panchang.weekday.lord].name}</dd></div>
              <div className="kv"><dt>Moon phase</dt><dd>{phaseName(reading.panchang.phaseAngle)}</dd></div>
            </dl>
            <div style={{ marginTop: 12 }}>
              <div className="row-between tiny dim" style={{ marginBottom: 4 }}>
                <span>Illumination</span>
                <span>{reading.panchang.illumination.toFixed(0)}%</span>
              </div>
              <Meter value={reading.panchang.illumination} tone="violet" />
            </div>
            <div className="divider" />
            <div className="row-between small">
              <span className="row" style={{ gap: 6 }}>
                <IconSun width={14} height={14} /> {formatLocalTime(reading.panchang.sunrise, place.timeZone)}
              </span>
              <span className="dim">Sunset {formatLocalTime(reading.panchang.sunset, place.timeZone)}</span>
            </div>
            <Link className="btn btn--ghost btn--small btn--full" to="/panchang" style={{ marginTop: 12 }}>
              Full panchang <IconArrowRight />
            </Link>
          </Card>

          {chart && personal ? (
            <Card className="card--gold">
              <CardTitle title="Your chart today" eyebrow="Personal layer" />
              <p className="small muted">{personal.text}</p>
              <div className="row" style={{ marginTop: 10 }}>
                <Badge tone="teal">{RASHIS[chart.moonSign].english} Moon</Badge>
                <Badge tone="violet">{NAKSHATRAS[chart.birthNakshatra].name}</Badge>
              </div>
              <Link className="btn btn--quiet btn--small" to="/ask" style={{ marginTop: 10 }}>
                Ask Sutra about today <IconArrowRight />
              </Link>
            </Card>
          ) : null}

          <Card className="card--flat">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Read as</span>
              <div className="segmented">
                <button type="button" className={mode === 'moon' ? 'active' : ''} onClick={() => setMode('moon')}>
                  Moon sign
                </button>
                <button type="button" className={mode === 'sun' ? 'active' : ''} onClick={() => setMode('sun')}>
                  Sun sign
                </button>
              </div>
            </div>
            <p className="tiny dim">
              {mode === 'moon'
                ? `Vedic readings traditionally use the Moon sign. ${profile ? `${profile.name}'s Moon is in ${RASHIS[chart?.moonSign ?? 0].english}.` : ''}`
                : 'Western-style readings use the Sun sign. Switch to Moon sign for the traditional Vedic view.'}
            </p>
            {profile && chart ? (
              <button
                type="button"
                className="btn btn--ghost btn--small btn--full"
                style={{ marginTop: 10 }}
                onClick={() => setSign(mode === 'moon' ? chart.moonSign : chart.sunSign)}
              >
                Use my {mode === 'moon' ? 'Moon' : 'Sun'} sign
              </button>
            ) : null}
          </Card>
        </div>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardTitle title="Read another sign" eyebrow="All twelve" />
        <div className="grid grid-4" style={{ gap: 10 }}>
          {RASHIS.map((rashi) => (
            <button
              key={rashi.index}
              type="button"
              onClick={() => setSign(rashi.index)}
              className="stat"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: sign === rashi.index ? 'var(--line-strong)' : undefined,
                background: sign === rashi.index ? 'rgba(217,178,106,0.09)' : undefined,
              }}
            >
              <div className="row" style={{ gap: 8 }}>
                <span className="glyph" style={{ color: 'var(--gold)' }}>{rashi.symbol}</span>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{rashi.english}</div>
                  <div className="tiny dim">{rashi.name}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle
          title={`About ${RASHIS[sign].english}`}
          eyebrow="Sign profile"
          aside={
            <Link className="small muted" to={`/horoscope/${RASHI_SLUGS[sign]}`}>
              Permalink
            </Link>
          }
        />
        <div className="grid grid-2" style={{ gap: 24 }}>
          <div>
            <p className="small muted">{profileData.essence}</p>
            <div className="eyebrow" style={{ marginTop: 14 }}>Strengths</div>
            <div className="row" style={{ gap: 6 }}>
              {profileData.strengths.map((item) => (
                <Badge key={item} tone="teal">{item}</Badge>
              ))}
            </div>
            <div className="eyebrow" style={{ marginTop: 14 }}>Watch-outs</div>
            <div className="row" style={{ gap: 6 }}>
              {profileData.watchouts.map((item) => (
                <Badge key={item} tone="muted">{item}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="small" style={{ marginBottom: 10 }}>
              <strong>Work.</strong> <span className="muted">{profileData.career}</span>
            </div>
            <div className="small" style={{ marginBottom: 10 }}>
              <strong>Love.</strong> <span className="muted">{profileData.love}</span>
            </div>
            <div className="small">
              <strong>Energy.</strong> <span className="muted">{profileData.wellbeing}</span>
            </div>
            <div className="callout" style={{ marginTop: 14 }}>
              <IconMoonStars width={13} height={13} /> Readings are composed from real ephemeris data plus original
              interpretation text, and are meant for reflection — not for medical, legal or financial decisions.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
