import { Link } from 'react-router-dom';
import { Badge, Card, PageHeader } from '../components/ui';
import { IconArrowRight, IconCompass, IconHeart, IconLeaf, IconStars, IconWallet } from '../components/Icons';
import { REPORT_DEFS, type ReportSlug } from '../lib/reports';
import { useActiveChart, useActiveProfile } from '../lib/store';
import { dashaTreeAt, formatPeriodDate } from '../lib/dasha';
import { PLANETS, RASHIS } from '../lib/constants';

const ICONS: Record<ReportSlug, typeof IconCompass> = {
  career: IconCompass,
  love: IconHeart,
  health: IconLeaf,
  money: IconWallet,
  life: IconStars,
};

export default function ReportsPage() {
  const profile = useActiveProfile();
  const chart = useActiveChart();
  if (!profile || !chart) return null;
  const tree = dashaTreeAt(chart, new Date());

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow={`${profile.name} · ${RASHIS[chart.ascendant.sign].english} rising`}
        title="Your reports"
        description="Long-form readings that name every placement they use. Open a report and print it — the print stylesheet produces a clean PDF."
      />

      <Card className="card--flat" style={{ marginBottom: 18 }}>
        <div className="row-between">
          <div className="row" style={{ gap: 10 }}>
            <Badge tone="teal">Now: {PLANETS[tree.maha.lord].name} / {PLANETS[tree.antar.lord].name}</Badge>
            <span className="tiny dim">until {formatPeriodDate(tree.antar.end)}</span>
          </div>
          <span className="tiny dim">Reports are generated on your device from this chart.</span>
        </div>
      </Card>

      <div className="grid grid-2">
        {REPORT_DEFS.map((report) => {
          const Icon = ICONS[report.slug];
          return (
            <Card key={report.slug} as="article">
              <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
                <div className="feature-icon">
                  <Icon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{report.title}</h3>
                  <div className="tiny" style={{ color: 'var(--gold-dim)', marginTop: 2 }}>{report.subtitle}</div>
                  <p className="small muted" style={{ marginTop: 10 }}>{report.description}</p>
                  <div className="row-between" style={{ marginTop: 14 }}>
                    <span className="tiny dim">{report.minutes} min read · print-ready</span>
                    <Link className="btn btn--ghost btn--small" to={`/reports/${report.slug}`}>
                      Open <IconArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="card--flat" style={{ marginTop: 18 }}>
        <p className="tiny muted">
          Reports are assembled from the same computed factors shown on your chart page — no external writing service
          is involved. Longer, human-written consultations are a different product; AstroSutra is explicit about which
          one you are reading.
        </p>
      </Card>
    </div>
  );
}
