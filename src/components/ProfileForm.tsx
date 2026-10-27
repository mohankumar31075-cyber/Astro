import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { ALL_TIME_ZONES, CITIES, searchCities, type City } from '../lib/cities';
import { validateDraft, type Profile, type ProfileDraft } from '../lib/store';
import { IconArrowRight, IconCheck, IconLocation, IconSearch } from './Icons';
import { Callout } from './ui';

const DEFAULT_CITY = CITIES[0];

export function draftFromProfile(profile: Profile): ProfileDraft {
  return {
    name: profile.name,
    relation: profile.relation,
    gender: profile.gender,
    date: profile.birth.date,
    time: profile.birth.time,
    timeUnknown: Boolean(profile.birth.timeUnknown),
    place: profile.birth.place,
    latitude: profile.birth.latitude,
    longitude: profile.birth.longitude,
    timeZone: profile.birth.timeZone,
  };
}

function StepTitle({
  as: Tag,
  children,
  style,
}: {
  as: 'h1' | 'h2';
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Tag style={style} className={Tag === 'h1' ? 'form-title' : undefined}>
      {children}
    </Tag>
  );
}

export function ProfileForm({
  initial,
  onSubmit,
  headingLevel = 'h2',
  submitLabel = 'Create chart',
  onCancel,
}: {
  initial?: ProfileDraft;
  onSubmit: (draft: ProfileDraft) => void;
  submitLabel?: string;
  onCancel?: () => void;
  /** 'h1' when the form is the whole page; 'h2' when it sits under a PageHeader. */
  headingLevel?: 'h1' | 'h2';
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>(
    initial ?? {
      name: '',
      relation: 'Self',
      gender: 'unspecified',
      date: '',
      time: '12:00',
      timeUnknown: false,
      place: `${DEFAULT_CITY.name}, ${DEFAULT_CITY.country}`,
      latitude: DEFAULT_CITY.latitude,
      longitude: DEFAULT_CITY.longitude,
      timeZone: DEFAULT_CITY.timeZone,
    },
  );
  const [cityQuery, setCityQuery] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [touched, setTouched] = useState(false);
  const errors = validateDraft(draft);
  const suggestions = useMemo(() => searchCities(cityQuery, 7), [cityQuery]);

  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const pickCity = (city: City) => {
    setDraft((current) => ({
      ...current,
      place: `${city.name}, ${city.country}`,
      latitude: city.latitude,
      longitude: city.longitude,
      timeZone: city.timeZone,
    }));
    setCityQuery('');
  };

  const stepValid = step === 0 ? draft.name.trim().length > 0 : step === 1 ? !errors.date && !errors.time : !errors.latitude && !errors.longitude && !errors.timeZone;

  const next = () => {
    if (!stepValid) {
      setTouched(true);
      return;
    }
    setTouched(false);
    if (step < 2) setStep(step + 1);
    else if (Object.keys(errors).length === 0) onSubmit(draft);
  };

  return (
    <div>
      <div className="stepper" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span key={index} className={index <= step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 ? (
        <>
          <StepTitle as={headingLevel} style={{ marginBottom: 6 }}>Who is this chart for?</StepTitle>
          <p className="muted small" style={{ marginBottom: 24 }}>
            You can add family members later. Names stay on this device.
          </p>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              className="input"
              value={draft.name}
              autoFocus
              onChange={(event) => set('name', event.target.value)}
              placeholder="e.g. Ananya Rao"
            />
            {touched && errors.name ? <span className="field-error">{errors.name}</span> : null}
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="relation">Relationship to you</label>
              <select id="relation" className="select" value={draft.relation} onChange={(event) => set('relation', event.target.value)}>
                {['Self', 'Partner', 'Mother', 'Father', 'Sibling', 'Child', 'Friend', 'Other'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="gender">Gender (optional)</label>
              <select
                id="gender"
                className="select"
                value={draft.gender}
                onChange={(event) => set('gender', event.target.value as ProfileDraft['gender'])}
              >
                <option value="unspecified">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <p className="hint">
            Gender is only used for traditional Guna Milan role assignment, which you can change on the
            compatibility screen. It is never sent anywhere.
          </p>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <StepTitle as={headingLevel} style={{ marginBottom: 6 }}>When were they born?</StepTitle>
          <p className="muted small" style={{ marginBottom: 24 }}>
            Exact local time matters: it sets the ascendant and the balance of the first dasha.
          </p>
          <div className="field">
            <label htmlFor="date">Date of birth</label>
            <input
              id="date"
              type="date"
              className="input"
              value={draft.date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => set('date', event.target.value)}
            />
            {errors.date ? <span className="field-error">{errors.date}</span> : <span className="hint">Uses the calendar date at the place of birth.</span>}
          </div>
          <div className="field">
            <label htmlFor="time">Time of birth (24-hour)</label>
            <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
              <input
                id="time"
                type="time"
                className="input"
                value={draft.time}
                disabled={draft.timeUnknown}
                onChange={(event) => set('time', event.target.value)}
              />
              <label className="row small muted" style={{ gap: 7, whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={draft.timeUnknown}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setDraft((current) => ({ ...current, timeUnknown: checked, time: checked ? '12:00' : current.time }));
                  }}
                />
                Not sure
              </label>
            </div>
            {draft.timeUnknown ? (
              <span className="hint">
                We will calculate with 12:00 local time and mark the chart approximate. The Moon and ascendant may
                be off by up to a sign.
              </span>
            ) : (
              <span className="hint">Check the birth certificate, hospital record or a family member&apos;s memory.</span>
            )}
          </div>
          <Callout tone="teal">
            An error of four minutes moves the ascendant by about one degree. For most readings, a time within
            half an hour is enough — but for nakshatra padas and dasha dates, exact matters.
          </Callout>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <StepTitle as={headingLevel} style={{ marginBottom: 6 }}>Where were they born?</StepTitle>
          <p className="muted small" style={{ marginBottom: 20 }}>
            Search a city, or enter coordinates directly. Time zones are handled with historical offsets.
          </p>
          <div className="field">
            <label htmlFor="city">City</label>
            <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
              <input
                id="city"
                className="input"
                value={cityQuery}
                placeholder={draft.place}
                onChange={(event) => setCityQuery(event.target.value)}
                autoComplete="off"
              />
              <span className="btn btn--ghost btn--small" aria-hidden style={{ pointerEvents: 'none' }}>
                <IconSearch />
              </span>
            </div>
            {cityQuery ? (
              <div className="card card--flat" style={{ padding: 6, marginTop: 6 }}>
                {suggestions.length === 0 ? (
                  <div className="small muted" style={{ padding: 10 }}>
                    No match. Enter the coordinates manually below.
                  </div>
                ) : (
                  suggestions.map((city) => (
                    <button
                      key={`${city.name}-${city.country}`}
                      type="button"
                      className="nav-item"
                      style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', color: 'var(--cream)' }}
                      onClick={() => pickCity(city)}
                    >
                      <IconLocation />
                      <span>
                        {city.name}
                        <span className="dim small"> · {city.region}, {city.country}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
            <span className="hint">
              Selected: {draft.place} · {draft.latitude.toFixed(3)}°, {draft.longitude.toFixed(3)}°
            </span>
          </div>

          <button type="button" className="btn btn--quiet btn--small" onClick={() => setShowManual((value) => !value)}>
            {showManual ? 'Hide manual entry' : 'Enter coordinates manually'}
          </button>

          {showManual ? (
            <div style={{ marginTop: 14 }}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="lat">Latitude (north +)</label>
                  <input
                    id="lat"
                    type="number"
                    step="0.0001"
                    className="input"
                    value={draft.latitude}
                    onChange={(event) => set('latitude', Number(event.target.value))}
                  />
                  {errors.latitude ? <span className="field-error">{errors.latitude}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="lon">Longitude (east +)</label>
                  <input
                    id="lon"
                    type="number"
                    step="0.0001"
                    className="input"
                    value={draft.longitude}
                    onChange={(event) => set('longitude', Number(event.target.value))}
                  />
                  {errors.longitude ? <span className="field-error">{errors.longitude}</span> : null}
                </div>
              </div>
              <div className="field">
                <label htmlFor="place">Place name</label>
                <input id="place" className="input" value={draft.place} onChange={(event) => set('place', event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="tz">Time zone</label>
                <input
                  id="tz"
                  className="input"
                  list="tz-options"
                  value={draft.timeZone}
                  onChange={(event) => set('timeZone', event.target.value)}
                />
                <datalist id="tz-options">
                  {ALL_TIME_ZONES.map((zone) => (
                    <option key={zone} value={zone} />
                  ))}
                </datalist>
                {errors.timeZone ? <span className="field-error">{errors.timeZone}</span> : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="row" style={{ marginTop: 26, gap: 10 }}>
        {step > 0 ? (
          <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
            Back
          </button>
        ) : onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="button" className="btn" onClick={next}>
          {step === 2 ? (
            <>
              <IconCheck /> {submitLabel}
            </>
          ) : (
            <>
              Continue <IconArrowRight />
            </>
          )}
        </button>
        {step === 2 ? <span className="hint">Nothing is uploaded.</span> : null}
      </div>
    </div>
  );
}
