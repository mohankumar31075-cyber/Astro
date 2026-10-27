import { useMemo, useState } from 'react';
import { Badge, Card, CardTitle, Meter, PageHeader, Property } from '../components/ui';
import { IconClock, IconLocation, IconMoonStars, IconSearch, IconSun } from '../components/Icons';
import { CITIES, searchCities, type City } from '../lib/cities';
import { PLANETS, RASHIS, WEEKDAYS } from '../lib/constants';
import { useActiveProfile, useAppData, updateSettings } from '../lib/store';
import { computePanchang, phaseName } from '../lib/panchang';
import { formatLocalTime, isoDate, zonedToUtc } from '../lib/time';

export default function PanchangPage() {
  const profile = useActiveProfile();
  const data = useAppData();
  const [dateISO, setDateISO] = useState(() => isoDate(new Date(), profile?.birth.timeZone ?? 'Asia/Kolkata'));
  const [query, setQuery] = useState('');
  const [useBirthPlace, setUseBirthPlace] = useState(Boolean(profile) && data.settings.useProfilePlace);

  const cityFromSettings = data.settings.panchangCity;
  const fallbackCity: City = cityFromSettings
    ? {
        name: cityFromSettings.name,
        region: '',
        country: '',
        latitude: cityFromSettings.latitude,
        longitude: cityFromSettings.longitude,
        timeZone: cityFromSettings.timeZone,
      }
    : CITIES[1]; // Delhi

  const place = useMemo(() => {
    if (useBirthPlace && profile) {
      return {
        latitude: profile.birth.latitude,
        longitude: profile.birth.longitude,
        timeZone: profile.birth.timeZone,
        place: profile.birth.place,
      };
    }
    return {
      latitude: fallbackCity.latitude,
      longitude: fallbackCity.longitude,
      timeZone: fallbackCity.timeZone,
      place: fallbackCity.name,
    };
  }, [useBirthPlace, profile, fallbackCity]);

  const instant = useMemo(() => zonedToUtc(dateISO, '12:00', place.timeZone), [dateISO, place.timeZone]);
  const panchang = useMemo(() => computePanchang(instant, place), [instant, place]);
  const suggestions = query ? searchCities(query, 6) : [];

  const windows = [
    { label: 'Rahu Kaal', window: panchang.rahuKaal, tone: 'danger' as const, note: 'Traditionally avoided for beginnings' },
    { label: 'Yamaganda', window: panchang.yamaganda, tone: 'danger' as const, note: 'Avoid new ventures' },
    { label: 'Gulika', window: panchang.gulika, tone: 'danger' as const, note: 'Best for routine work' },
    { label: 'Abhijit', window: panchang.abhijit, tone: 'teal' as const, note: 'Auspicious mid-day window' },
  ];

  const chooseCity = (city: City) => {
    updateSettings({
      useProfilePlace: false,
      panchangCity: {
        name: `${city.name}, ${city.country}`,
        latitude: city.latitude,
        longitude: city.longitude,
        timeZone: city.timeZone,
      },
    });
    setUseBirthPlace(false);
    setQuery('');
  };

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Five limbs of the day"
        title="Panchang & muhurta"
        description="Tithi, vara, nakshatra, yoga and karana computed for the coordinates you choose — with the inauspicious windows marked."
        actions={
          <input
            type="date"
            className="input"
            style={{ width: 160 }}
            aria-label="Panchang date"
            value={dateISO}
            onChange={(event) => setDateISO(event.target.value)}
          />
        }
      />

      <Card style={{ marginBottom: 18 }}>
        <div className="row-between" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="eyebrow">Location</div>
            <div className="row" style={{ gap: 10 }}>
              <span className="row" style={{ gap: 6 }}>
                <IconLocation width={16} height={16} style={{ color: 'var(--gold)' }} />
                <strong className="small">{place.place}</strong>
              </span>
              <span className="tiny dim">
                {place.latitude.toFixed(2)}°, {place.longitude.toFixed(2)}° · {place.timeZone}
              </span>
            </div>
          </div>
          {profile ? (
            <div className="segmented">
              <button type="button" className={useBirthPlace ? 'active' : ''} onClick={() => setUseBirthPlace(true)}>
                My birth city
              </button>
              <button type="button" className={!useBirthPlace ? 'active' : ''} onClick={() => setUseBirthPlace(false)}>
                Another city
              </button>
            </div>
          ) : null}
        </div>

        {!useBirthPlace ? (
          <div style={{ marginTop: 14, maxWidth: 460 }}>
            <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
              <input
                className="input"
                value={query}
                placeholder="Search a city for today's panchang…"
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
              <span className="btn btn--ghost btn--small" aria-hidden style={{ pointerEvents: 'none' }}>
                <IconSearch />
              </span>
            </div>
            {suggestions.length > 0 ? (
              <div className="card card--flat" style={{ padding: 6, marginTop: 6 }}>
                {suggestions.map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    className="nav-item"
                    style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', color: 'var(--cream)' }}
                    onClick={() => chooseCity(city)}
                  >
                    <IconLocation />
                    <span>
                      {city.name} <span className="dim small">· {city.country}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            <p className="tiny dim" style={{ marginTop: 8 }}>
              Times are computed for this city's coordinates and time zone, including daylight-saving rules.
            </p>
          </div>
        ) : null}
      </Card>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Card>
          <CardTitle title={panchang.tithi.name} eyebrow={`${panchang.tithi.paksha} paksha · tithi ${panchang.tithi.number}`} />
          <h3 style={{ fontSize: '1.6rem', marginBottom: 6 }}>
            {panchang.weekday.name} <span className="dim" style={{ fontSize: '0.7em' }}>{panchang.weekday.english}</span>
          </h3>
          <p className="small muted">{WEEKDAYS[panchang.weekday.index].english} is ruled by {PLANETS[panchang.weekday.lord].name}.</p>
          <div className="divider" />
          <dl style={{ margin: 0 }}>
            <Property label="Nakshatra">{panchang.nakshatra.name} · pada {panchang.nakshatra.pada}</Property>
            <Property label="Nakshatra lord">{PLANETS[panchang.nakshatra.lord].name}</Property>
            <Property label="Yoga">{panchang.yoga.name}</Property>
            <Property label="Karana">{panchang.karana.name}</Property>
            <Property label="Moon rashi">{RASHIS[panchang.moonSign].english}</Property>
            <Property label="Sun rashi">{RASHIS[panchang.sunSign].english}</Property>
          </dl>
        </Card>

        <Card>
          <CardTitle title="Sun & Moon" eyebrow="Rise and set" />
          <dl style={{ margin: 0 }}>
            <Property label="Sunrise">{formatLocalTime(panchang.sunrise, place.timeZone)}</Property>
            <Property label="Sunset">{formatLocalTime(panchang.sunset, place.timeZone)}</Property>
            <Property label="Next sunrise">{formatLocalTime(panchang.nextSunrise, place.timeZone)}</Property>
            <Property label="Moonrise">{formatLocalTime(panchang.moonrise, place.timeZone)}</Property>
            <Property label="Moonset">{formatLocalTime(panchang.moonset, place.timeZone)}</Property>
            <Property label="Day length">
              {panchang.dayLengthMinutes ? `${Math.floor(panchang.dayLengthMinutes / 60)}h ${panchang.dayLengthMinutes % 60}m` : '—'}
            </Property>
          </dl>
          <div className="divider" />
          <div className="row-between small">
            <span className="row" style={{ gap: 6 }}>
              <IconMoonStars width={14} height={14} /> {phaseName(panchang.phaseAngle)}
            </span>
            <span className="dim">{panchang.illumination.toFixed(0)}% lit</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Meter value={panchang.illumination} tone="violet" />
          </div>
        </Card>

        <Card>
          <CardTitle title="Timing windows" eyebrow="Local time" />
          <div className="stack" style={{ gap: 12 }}>
            {windows.map((item) => (
              <div key={item.label}>
                <div className="row-between">
                  <span className="small" style={{ fontWeight: 600 }}>
                    {item.label}
                  </span>
                  <Badge tone={item.tone === 'danger' ? 'danger' : 'teal'}>
                    {item.window
                      ? `${formatLocalTime(item.window.start, place.timeZone)}–${formatLocalTime(item.window.end, place.timeZone)}`
                      : 'Unavailable'}
                  </Badge>
                </div>
                <div className="tiny dim">{item.note}</div>
              </div>
            ))}
          </div>
          <p className="tiny dim" style={{ marginTop: 12 }}>
            Rahu Kaal divides sunrise–sunset into eight parts; the part depends on the weekday. Windows are null near
            the poles when the Sun does not rise or set.
          </p>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <CardTitle title="What the limbs mean" eyebrow="Reading the panchang" />
          <div className="stack" style={{ gap: 12 }}>
            <div>
              <div className="small" style={{ fontWeight: 600 }}>Tithi</div>
              <p className="tiny muted">
                The Moon gains 12° on the Sun each tithi, giving 30 tithis per lunar month. Shukla paksha waxes;
                Krishna paksha wanes.
              </p>
            </div>
            <div>
              <div className="small" style={{ fontWeight: 600 }}>Nakshatra</div>
              <p className="tiny muted">
                The Moon's lunar mansion, one of 27 divisions of 13°20′. The panchang nakshatra is the one the Moon
                occupies at sunrise; its lord also seeds the Vimshottari dasha.
              </p>
            </div>
            <div>
              <div className="small" style={{ fontWeight: 600 }}>Yoga</div>
              <p className="tiny muted">
                The combined longitude of the Sun and Moon, divided into 27 yogas. Some, such as Vyatipata and
                Vaidhriti, are traditionally avoided for beginnings.
              </p>
            </div>
            <div>
              <div className="small" style={{ fontWeight: 600 }}>Karana</div>
              <p className="tiny muted">
                Half a tithi. There are eleven karanas; Vishti (Bhadra) is the one most often avoided.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle title="End times" eyebrow="When each limb changes" />
          <dl style={{ margin: 0 }}>
            <Property label={`Tithi · ${panchang.tithi.name}`}>
              {panchang.tithi.endsAt ? formatLocalTime(panchang.tithi.endsAt, place.timeZone) : '—'}
            </Property>
            <Property label={`Nakshatra · ${panchang.nakshatra.name}`}>
              {panchang.nakshatra.endsAt ? formatLocalTime(panchang.nakshatra.endsAt, place.timeZone) : '—'}
            </Property>
            <Property label={`Yoga · ${panchang.yoga.name}`}>
              {panchang.yoga.endsAt ? formatLocalTime(panchang.yoga.endsAt, place.timeZone) : '—'}
            </Property>
            <Property label={`Karana · ${panchang.karana.name}`}>
              {panchang.karana.endsAt ? formatLocalTime(panchang.karana.endsAt, place.timeZone) : '—'}
            </Property>
          </dl>
          <div className="divider" />
          <div className="row" style={{ gap: 10 }}>
            <IconSun width={16} height={16} style={{ color: 'var(--gold)' }} />
            <p className="tiny muted" style={{ margin: 0 }}>
              A muhurta is a chosen window, not a guarantee. Most families combine panchang windows with the
              personal dashas of the people involved, which is why two panchangs can give different advice.
            </p>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <IconClock width={14} height={14} style={{ color: 'var(--muted-dim)' }} />
            <span className="tiny dim">All times shown in {place.timeZone}</span>
          </div>
        </Card>
      </div>

      <Card className="card--flat" style={{ marginTop: 18 }}>
        <div className="eyebrow">Note on the birth nakshatra</div>
        <p className="tiny muted">
          The nakshatra shown here is for the selected calendar day at sunrise. If you were born later in the day,
          the Moon may already have moved into the next nakshatra — use your birth chart for the natal placement,
          not the daily panchang.
        </p>
      </Card>
    </div>
  );
}
