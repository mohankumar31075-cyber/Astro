import { Link, useParams } from 'react-router-dom';
import { Badge, Card, PageHeader } from '../components/ui';
import { IconArrowRight, IconLock, IconPrint } from '../components/Icons';
import { generateReport, REPORT_DEFS, type ReportSlug } from '../lib/reports';
import { useActiveChart, useActiveProfile, useAppData } from '../lib/store';
import { formatLocalDateTime } from '../lib/time';
import { NAKSHATRAS, RASHIS } from '../lib/constants';
import { FREE_LIMITS, reportSectionLimit } from '../lib/packs';

export default function ReportPage() {
  const { slug } = useParams();
  const profile = useActiveProfile();
  const chart = useActiveChart();
  const data = useAppData();
  if (!profile || !chart) return null;
  const valid = REPORT_DEFS.some((def) => def.slug === slug);
  if (!valid) {
    return (
      <Card>
        <h2>Report not found</h2>
        <Link className="btn btn--ghost" to="/reports" style={{ marginTop: 12 }}>
          Back to reports <IconArrowRight />
        </Link>
      </Card>
    );
  }
  const report = generateReport(slug as ReportSlug, chart, new Date());
  const generated = new Date();
  const sectionLimit = reportSectionLimit(data.packs);
  const locked = Math.max(0, report.sections.length - sectionLimit);

  return (
    <div className="fade-in" id="report">
      <PageHeader
        eyebrow="AstroSutra report"
        title={report.def.title}
        description={report.def.subtitle}
        actions={
          <>
            <Link to="/reports" className="btn btn--ghost btn--small">
              All reports
            </Link>
            <button type="button" className="btn btn--small" onClick={() => window.print()}>
              <IconPrint /> Print / save PDF
            </button>
          </>
        }
      />

      <div className="print-only" style={{ marginBottom: 16 }}>
        <div className="eyebrow">AstroSutra · Vedic chart report</div>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div className="eyebrow">Prepared for</div>
            <h2 style={{ fontSize: '1.8rem' }}>{profile.name}</h2>
            <p className="small muted" style={{ marginTop: 6 }}>
              {RASHIS[chart.ascendant.sign].english} ascendant · {RASHIS[chart.moonSign].english} Moon ·{' '}
              {NAKSHATRAS[chart.birthNakshatra].name} nakshatra
            </p>
          </div>
          <div className="stack" style={{ gap: 6, textAlign: 'right' }}>
            <span className="tiny dim">{formatLocalDateTime(chart.utc, profile.birth.timeZone)}</span>
            <span className="tiny dim">{profile.birth.place}</span>
            <span className="tiny dim">Lahiri ayanamsa · whole-sign houses</span>
            <span className="tiny dim">Generated {formatLocalDateTime(generated, profile.birth.timeZone)}</span>
          </div>
        </div>
        <div className="divider" />
        <p className="lede">{report.intro}</p>
      </Card>

      <div className="stack" style={{ gap: 18 }}>
        {report.sections.slice(0, sectionLimit).map((section, index) => (
          <Card key={section.title} as="article">
            <div className="row" style={{ gap: 10, marginBottom: 8 }}>
              <span className="badge">{String(index + 1).padStart(2, '0')}</span>
              <h3>{section.title}</h3>
            </div>
            <p className="small" style={{ color: '#d7d9e8' }}>{section.body}</p>
            {section.bullets ? (
              <ul className="check-list" style={{ marginTop: 10 }}>
                {section.bullets.map((bullet) => (
                  <li key={bullet} style={{ display: 'list-item', marginLeft: 6, color: 'var(--muted)' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}
      </div>

      {locked > 0 ? (
        <Card className="card--gold" style={{ marginTop: 18 }}>
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <IconLock />
            <h3 style={{ margin: 0 }}>
              {locked} more section{locked === 1 ? '' : 's'} in this report
            </h3>
          </div>
          <p className="small muted">
            The free tier shows the first {FREE_LIMITS.reportSections} sections of every report. The report pack opens the rest of
            this one and every other report, for good.
          </p>
          <div className="row" style={{ marginTop: 14, gap: 10 }}>
            <Link className="btn btn--small" to="/packs">
              Open the full report <IconArrowRight />
            </Link>
            <Link className="btn btn--ghost btn--small" to="/reports">
              All reports
            </Link>
          </div>
        </Card>
      ) : null}

      <Card style={{ marginTop: 18 }}>
        <div className="eyebrow">Period timeline</div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Period</th>
                <th>Span</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.timeline.map((item) => (
                <tr key={`${item.title}-${item.span}`}>
                  <td>{item.title}</td>
                  <td className="mono">{item.span}</td>
                  <td>{item.current ? <Badge tone="teal">Running</Badge> : <span className="dim small">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="card--flat" style={{ marginTop: 18 }}>
        <p className="tiny muted">{report.closing}</p>
        <div className="row no-print" style={{ marginTop: 12 }}>
          <Link className="btn btn--ghost btn--small" to="/reports">
            Other reports <IconArrowRight />
          </Link>
          <Link className="btn btn--quiet btn--small" to="/legal/terms">
            Terms & limitations
          </Link>
        </div>
      </Card>
    </div>
  );
}
