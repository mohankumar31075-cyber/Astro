import { Link } from 'react-router-dom';
import { Badge, Callout, Card, CardTitle, CheckList, PageHeader, Property } from '../components/ui';
import { IconArrowRight, IconCheck, IconLock, IconSparkles } from '../components/Icons';
import { activatePack, resetPacks, useAppData } from '../lib/store';
import {
  describePlan,
  FREE_LIMITS,
  hasPack,
  PACKS,
  questionsLeft,
  reportSectionLimit,
  profileLimit,
  todayKey,
} from '../lib/packs';

const FREE_ROWS = [
  { label: 'Birth chart and kundli', free: 'Included', pack: 'Included' },
  { label: 'Daily horoscope and panchang', free: 'All twelve signs', pack: 'All twelve signs' },
  { label: 'Saved profiles', free: `${FREE_LIMITS.profiles}`, pack: 'Up to 8' },
  { label: 'Vaani questions', free: `${FREE_LIMITS.questionsPerDay} per day`, pack: '50 extra, never expiring' },
  { label: 'Reports', free: `${FREE_LIMITS.reportSections} sections free`, pack: 'Every section' },
  { label: 'Compatibility between saved people', free: 'Included', pack: 'Included' },
  { label: 'Export, import and erase', free: 'Always', pack: 'Always' },
];

export default function PacksPage() {
  const data = useAppData();
  const today = todayKey();
  const left = questionsLeft(data.usage, today);

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Plans"
        title="Free forever, or packs that never expire"
        description="Every reading is computed on your own device. The free tier covers the chart, the daily horoscope, the panchang and a few questions a day. Packs lift the limits — once, without a renewal date."
        actions={
          <Link className="btn btn--ghost btn--small" to="/ask">
            <IconSparkles /> Ask Vaani
          </Link>
        }
      />

      <Callout>
        <strong>This build is open source.</strong> There is no payment processor connected, so activating a pack is
        a local demo: no card, no account, no charge, and nothing leaves this device. You can reset to the free tier
        at any time. The limits themselves are real, and enforced by the app.
      </Callout>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        {PACKS.map((pack) => {
          const owned = hasPack(data.packs, pack.id);
          const isEverything = pack.id === 'everything';
          return (
            <Card key={pack.id} className={isEverything ? 'card--gold' : undefined}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <h3 style={{ margin: 0 }}>{pack.name}</h3>
                {owned ? <Badge tone="teal"><IconCheck width={12} height={12} /> Active</Badge> : null}
              </div>
              <p className="small muted" style={{ minHeight: 40 }}>{pack.tagline}</p>
              <div style={{ margin: '12px 0 18px' }}>
                <CheckList items={pack.includes} />
              </div>
              {owned ? (
                <button type="button" className="btn btn--ghost btn--small" disabled>
                  Activated
                </button>
              ) : (
                <button type="button" className="btn btn--small" onClick={() => activatePack(pack.id)}>
                  Activate free <IconArrowRight />
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card>
          <CardTitle title="Your plan" eyebrow="Right now" />
          <p className="small" style={{ marginBottom: 12 }}>{describePlan(data.packs, data.usage, today)}</p>
          <dl style={{ margin: 0 }}>
            <Property label="Questions left today">{left}</Property>
            <Property label="Saved profiles">
              {data.profiles.length} of {profileLimit(data.packs)}
            </Property>
            <Property label="Report sections">
              {reportSectionLimit(data.packs) === Number.POSITIVE_INFINITY
                ? 'All'
                : `${reportSectionLimit(data.packs)} per report`}
            </Property>
            <Property label="Packs activated">{data.packs.length === 0 ? 'None' : data.packs.join(', ')}</Property>
          </dl>
          {data.packs.length > 0 ? (
            <button type="button" className="btn btn--ghost btn--small" style={{ marginTop: 16 }} onClick={resetPacks}>
              Reset to the free tier
            </button>
          ) : null}
        </Card>

        <Card>
          <CardTitle title="Free tier vs packs" eyebrow="The whole table" />
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>With packs</th>
                </tr>
              </thead>
              <tbody>
                {FREE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td className="dim">{row.free}</td>
                    <td>{row.pack}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle title="How this would work as a business" eyebrow="Honest disclosure" />
        <p className="small muted">
          AstroSutra is modelled on the pack pricing common to astrology apps — a generous free tier, then one-off
          packs rather than a subscription. In a hosted deployment, activation would be verified against a payment
          provider&apos;s webhook and the entitlement would live on the server.
        </p>
        <p className="small muted">
          This repository is the whole product, client-side. Shipping a fake checkout would be worse than shipping
          none: it would invite card details for a payment that does not exist. So the pack rules, the gates and the
          upgrade states are real and tested, and the purchase step is the one thing that is deliberately stubbed —
          and labelled as such wherever it appears.
        </p>
        <p className="tiny dim" style={{ marginTop: 10 }}>
          <IconLock width={12} height={12} /> Entitlements are stored in this browser only, under the same local
          data as your charts. Erasing your data erases them too.
        </p>
      </Card>
    </div>
  );
}
