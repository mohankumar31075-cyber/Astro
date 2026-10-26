import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Callout, Card, EmptyState, PageHeader } from '../components/ui';
import { ProfileForm, draftFromProfile } from '../components/ProfileForm';
import { IconArrowRight, IconPlus, IconTrash, IconUsers } from '../components/Icons';
import {
  chartForProfile,
  deleteProfile,
  saveProfile,
  setActiveProfile,
  useActiveProfile,
  useAppData,
  type ProfileDraft,
} from '../lib/store';
import { NAKSHATRAS, RASHIS } from '../lib/constants';
import { profileLimit } from '../lib/packs';
import { formatLocalDateTime } from '../lib/time';

export default function FamilyPage() {
  const data = useAppData();
  const active = useActiveProfile();
  const [mode, setMode] = useState<{ type: 'list' } | { type: 'add' } | { type: 'edit'; id: string }>({ type: 'list' });
  const editing = mode.type === 'edit' ? data.profiles.find((p) => p.id === mode.id) : undefined;
  const limit = profileLimit(data.packs);
  const atLimit = data.profiles.length >= limit;

  if (mode.type !== 'list') {
    return (
      <div className="fade-in">
        <PageHeader
          eyebrow={mode.type === 'edit' ? 'Edit profile' : 'New profile'}
          title={mode.type === 'edit' ? editing?.name ?? 'Edit profile' : 'Add someone to your circle'}
        />
        <Card>
          <ProfileForm
            initial={editing ? draftFromProfile(editing) : undefined}
            submitLabel={mode.type === 'edit' ? 'Save changes' : 'Add to circle'}
            onCancel={() => setMode({ type: 'list' })}
            onSubmit={(draft: ProfileDraft) => {
              saveProfile(draft, mode.type === 'edit' ? mode.id : undefined);
              setMode({ type: 'list' });
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow={`${data.profiles.length} profile${data.profiles.length === 1 ? '' : 's'}`}
        title="Your circle"
        description="Every profile is a separate chart. Switch the active profile to change what the dashboard, readings and reports are built from."
        actions={
          atLimit ? (
            <Link className="btn btn--ghost btn--small" to="/packs">
              <IconPlus /> Add more with a pack
            </Link>
          ) : (
            <button type="button" className="btn btn--small" onClick={() => setMode({ type: 'add' })}>
              <IconPlus /> Add member
            </button>
          )
        }
      />

      {atLimit && data.profiles.length > 0 ? (
        <Callout>
          You have saved {data.profiles.length} of {limit} profile{limit === 1 ? '' : 's'} on the free tier. The family
          pack raises the limit to eight and unlocks compatibility between everyone you save.{' '}
          <Link to="/packs" className="muted">See the packs</Link>.
        </Callout>
      ) : null}

      {data.profiles.length === 0 ? (
        <Card>
          <EmptyState
            title="No profiles yet"
            action={
              <button type="button" className="btn" onClick={() => setMode({ type: 'add' })}>
                <IconUsers /> Add the first profile
              </button>
            }
          >
            Add your own birth details first, then family and friends.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-2">
          {data.profiles.map((profile) => {
            const chart = chartForProfile(profile);
            const isActive = active?.id === profile.id;
            return (
              <Card key={profile.id} className={isActive ? 'card--gold' : ''} as="article">
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div className="row" style={{ gap: 12 }}>
                    <div className="avatar" style={{ width: 42, height: 42, fontSize: '0.9rem' }}>
                      {profile.name
                        .replace(/[^\p{L}\s]/gu, '')
                        .trim()
                        .split(/\s+/)
                        .map((part) => part[0] ?? '')
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem' }}>{profile.name}</h3>
                      <div className="row" style={{ gap: 6, marginTop: 2 }}>
                        <span className="tiny dim">{profile.relation}</span>
                        {profile.isSample ? <Badge tone="muted">Sample</Badge> : null}
                        {isActive ? <Badge tone="teal">Active</Badge> : null}
                      </div>
                    </div>
                  </div>
                </div>

                <dl style={{ margin: '14px 0 0' }}>
                  <div className="kv">
                    <dt>Born</dt>
                    <dd>{formatLocalDateTime(chart?.utc ?? new Date(), profile.birth.timeZone)}</dd>
                  </div>
                  <div className="kv">
                    <dt>Place</dt>
                    <dd>{profile.birth.place}</dd>
                  </div>
                  <div className="kv">
                    <dt>Chart</dt>
                    <dd>
                      {chart
                        ? `${RASHIS[chart.ascendant.sign].english} lagna · ${RASHIS[chart.moonSign].english} Moon`
                        : '—'}
                    </dd>
                  </div>
                  <div className="kv">
                    <dt>Nakshatra</dt>
                    <dd>{chart ? NAKSHATRAS[chart.birthNakshatra].name : '—'}</dd>
                  </div>
                </dl>

                <div className="row" style={{ marginTop: 14, gap: 8 }}>
                  {!isActive ? (
                    <button type="button" className="btn btn--small" onClick={() => setActiveProfile(profile.id)}>
                      Make active
                    </button>
                  ) : (
                    <span className="badge badge--teal">Dashboard is using this chart</span>
                  )}
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => setMode({ type: 'edit', id: profile.id })}>
                    Edit
                  </button>
                  <span className="spacer" />
                  <button
                    type="button"
                    className="btn btn--quiet btn--small"
                    aria-label={`Delete ${profile.name}`}
                    onClick={() => {
                      if (window.confirm(`Delete ${profile.name}'s chart? This cannot be undone.`)) {
                        deleteProfile(profile.id);
                      }
                    }}
                  >
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="card--flat" style={{ marginTop: 18 }}>
        <div className="row-between">
          <div>
            <div className="eyebrow">Comparing charts</div>
            <p className="small muted" style={{ maxWidth: '70ch' }}>
              With two or more profiles you can run Ashtakoot compatibility between any pair — partners, family
              members or friends.
            </p>
          </div>
          <Link className="btn btn--ghost btn--small" to="/match">
            Compatibility <IconArrowRight />
          </Link>
        </div>
        <Callout tone="teal">
          Profiles live in this browser's local storage. Exports are plain JSON — keep them somewhere safe if you
          want a backup.
        </Callout>
      </Card>
    </div>
  );
}
