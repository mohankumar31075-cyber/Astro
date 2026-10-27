import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Callout, Card, CardTitle, PageHeader, Property } from '../components/ui';
import { IconDownload, IconLock, IconPrint, IconTrash } from '../components/Icons';
import {
  clearAll,
  exportData,
  importData,
  updateSettings,
  useActiveProfile,
  useAppData,
} from '../lib/store';
import { describePlan, profileLimit, questionsLeft, todayKey } from '../lib/packs';
import { formatLocalDateTime } from '../lib/time';

export default function SettingsPage() {
  const data = useAppData();
  const profile = useActiveProfile();
  const [status, setStatus] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `astrosutra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Backup downloaded.');
  };

  const onImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const result = importData(text);
    setStatus(result.message);
  };

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Preferences, data, licences"
        title="Settings & data"
        description="AstroSutra has no account layer. These settings and profiles live in this browser and nowhere else."
      />

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card>
          <CardTitle title="Reading preferences" eyebrow="Display" />
          <div className="field">
            <label>Chart style</label>
            <div className="segmented">
              <button
                type="button"
                className={data.settings.chartStyle === 'north' ? 'active' : ''}
                onClick={() => updateSettings({ chartStyle: 'north' })}
              >
                North Indian
              </button>
              <button
                type="button"
                className={data.settings.chartStyle === 'south' ? 'active' : ''}
                onClick={() => updateSettings({ chartStyle: 'south' })}
              >
                South Indian
              </button>
            </div>
            <span className="hint">Both show the same computed chart, drawn differently.</span>
          </div>

          <div className="field">
            <label>Panchang location</label>
            <div className="segmented">
              <button
                type="button"
                className={data.settings.useProfilePlace ? 'active' : ''}
                onClick={() => updateSettings({ useProfilePlace: true })}
              >
                Birth city
              </button>
              <button
                type="button"
                className={!data.settings.useProfilePlace ? 'active' : ''}
                onClick={() => updateSettings({ useProfilePlace: false })}
                disabled={!data.settings.panchangCity}
              >
                Saved city
              </button>
            </div>
            <span className="hint">
              {data.settings.panchangCity
                ? `Saved city: ${data.settings.panchangCity.name}`
                : 'Choose a city on the Panchang page to save one.'}
            </span>
          </div>

          {profile ? (
            <Callout tone="teal">
              Active profile: <strong>{profile.name}</strong> · {formatLocalDateTime(new Date(), profile.birth.timeZone)} local ·{' '}
              {profile.birth.timeZone}
            </Callout>
          ) : null}
        </Card>

        <Card>
          <CardTitle title="Your data" eyebrow="Local only" />
          <div className="stack" style={{ gap: 12 }}>
            <div>
              <button type="button" className="btn btn--ghost btn--small btn--full" onClick={download}>
                <IconDownload /> Export everything as JSON
              </button>
              <p className="tiny dim" style={{ marginTop: 6 }}>
                Includes every profile and preference. Keep it private — birth details are personal data.
              </p>
            </div>

            <div>
              <button
                type="button"
                className="btn btn--ghost btn--small btn--full"
                onClick={() => fileInput.current?.click()}
              >
                Import a backup
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json"
                aria-hidden="true"
                tabIndex={-1}
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void onImport(file);
                  event.target.value = '';
                }}
              />
              <p className="tiny dim" style={{ marginTop: 6 }}>
                Importing replaces the profiles currently on this device.
              </p>
            </div>

            <div>
              <button
                type="button"
                className="btn btn--danger btn--small btn--full"
                onClick={() => {
                  if (window.confirm('Erase every profile and setting from this browser? Export first if you want a copy.')) {
                    clearAll();
                    setStatus('All local data erased.');
                  }
                }}
              >
                <IconTrash /> Erase all local data
              </button>
            </div>

            {status ? <div className="small" style={{ color: 'var(--teal)' }}>{status}</div> : null}
          </div>
        </Card>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card>
          <CardTitle title="Privacy" eyebrow="What leaves this device" />
          <div className="row" style={{ marginBottom: 10 }}>
            <Badge tone="teal"><IconLock width={12} height={12} /> Nothing</Badge>
          </div>
          <p className="small muted">
            There is no backend, no analytics, no advertising SDK and no third-party AI call. The app is a static
            bundle; every calculation runs in your browser. Clearing site data removes everything permanently.
          </p>
          <Link className="btn btn--quiet btn--small" to="/legal/privacy" style={{ marginTop: 8 }}>
            Read the privacy policy
          </Link>
        </Card>

        <Card>
          <CardTitle title="Plan" eyebrow="Entitlements" />
          <p className="small muted" style={{ marginBottom: 12 }}>
            {describePlan(data.packs, data.usage, todayKey())}
          </p>
          <dl style={{ margin: 0 }}>
            <Property label="Questions left today">{questionsLeft(data.usage, todayKey())}</Property>
            <Property label="Saved profiles">
              {data.profiles.length} of {profileLimit(data.packs)}
            </Property>
          </dl>
          <Link className="btn btn--ghost btn--small" to="/packs" style={{ marginTop: 12 }}>
            Plans &amp; packs
          </Link>
        </Card>

        <Card>
          <CardTitle title="About this build" eyebrow="Version 1.0.0" />
          <dl style={{ margin: 0 }}>
            <Property label="Licence">MIT (code) · CC BY 4.0 (editorial text)</Property>
            <Property label="Ephemeris">Astronomy Engine 2.1 (MIT)</Property>
            <Property label="Fonts">Cormorant Garamond, Manrope (OFL 1.1)</Property>
            <Property label="Ayanamsa">Lahiri / Chitrapaksha</Property>
            <Property label="House system">Whole-sign (rashi)</Property>
          </dl>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn--ghost btn--small" to="/legal/notices">
              Third-party notices
            </Link>
            <Link className="btn btn--quiet btn--small" to="/legal/licensing">
              Licensing
            </Link>
          </div>
        </Card>
      </div>

      <Card className="card--flat">
        <CardTitle title="Method notes" />
        <div className="grid grid-2">
          <p className="tiny muted">
            Planetary longitudes come from the Astronomy Engine ephemeris and are converted to sidereal using the
            Lahiri ayanamsa anchored at J2000. Rahu and Ketu use the mean node. Houses are whole-sign from the
            sidereal ascendant.
          </p>
          <p className="tiny muted">
            Vimshottari dashas use a 365.2425-day year and are computed to pratyantardasha level. Panchang elements
            are resolved for the selected coordinates, with sunrise defining the start of the Vedic day.
          </p>
        </div>
        <div className="row no-print" style={{ marginTop: 12 }}>
          <Link className="btn btn--quiet btn--small" to="/how-it-works">
            Full methodology
          </Link>
          <button type="button" className="btn btn--quiet btn--small" onClick={() => window.print()}>
            <IconPrint /> Print this page
          </button>
        </div>
      </Card>
    </div>
  );
}
