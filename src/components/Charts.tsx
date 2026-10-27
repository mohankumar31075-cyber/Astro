/**
 * Birth-chart renderers.
 *
 * Retrograde planets are marked with a plain "R" rather than the traditional
 * ℞ (U+211E): no font bundled with the app carries that codepoint, so it would
 * fall back to whatever the operating system happens to have and render as a
 * tofu box on stock Android. "R" is the marker ephemeris tables have used for
 * centuries and is present in every font.
 *
 * Both diagrams are drawn from the same computed data:
 *  • North Indian (diamond) — houses fixed, signs rotate. House 1 is the top
 *    diamond and the count runs anticlockwise.
 *  • South Indian (square) — signs fixed, houses rotate. The lagna is marked
 *    with a diagonal stroke in its cell.
 */
import { GRAHA_ORDER, NAKSHATRAS, PLANETS, RASHIS } from '../lib/constants';
import { navamsaSign, type BirthChart } from '../lib/astro';

const NORTH_CENTROIDS: Record<number, [number, number]> = {
  1: [50, 22],
  2: [24, 9],
  3: [9, 24],
  4: [24, 50],
  5: [9, 76],
  6: [24, 91],
  7: [50, 78],
  8: [76, 91],
  9: [91, 76],
  10: [76, 50],
  11: [91, 24],
  12: [76, 9],
};

/** Room available in each house region, used to lay out planet rows. */
const NORTH_WIDTH: Record<number, number> = {
  1: 30, 2: 26, 3: 22, 4: 22, 5: 22, 6: 26, 7: 30, 8: 26, 9: 22, 10: 22, 11: 22, 12: 26,
};

function planetsIn(chart: BirthChart, house: number) {
  return GRAHA_ORDER.filter((key) => chart.houseOf[key] === house).map((key) => chart.positions[key]);
}

function HouseContents({
  chart,
  house,
  x,
  y,
  width,
  compact,
}: {
  chart: BirthChart;
  house: number;
  x: number;
  y: number;
  width: number;
  compact?: boolean;
}) {
  const sign = chart.houseSigns[house - 1];
  const planets = planetsIn(chart, house);
  const signSize = compact ? 3.4 : 3.8;

  // Stelliums are real — five or six grahas in one rashi happens — and the
  // triangular houses are their narrowest at the point where the stack would
  // end. Rather than let a tall column cross into the neighbouring house, lay
  // crowded houses out as a small grid of glyphs and scale the type down, the
  // way printed panchang charts do. Degrees come back as soon as there is room.
  const crowded = planets.length > 4;
  const columns = crowded ? 2 : 1;
  const rows = Math.ceil(planets.length / columns);
  const planetSize = (compact ? 3.1 : 3.4) * (crowded ? 0.72 : 1);
  const showDegree = width >= 24 && planets.length <= 4;
  const stepY = planetSize + (crowded ? 0.5 : 0.6);
  const stepX = crowded ? 7.2 : 0;

  // Vertical extent of the ink, used to keep the cluster inside the frame.
  const signAscent = signSize * 0.95;
  const topInk = signSize + 1.2 + signAscent;
  const bottomInk = Math.max(0, rows - 1) * stepY + planetSize * 0.3;
  const minCentre = 1.8 + topInk;
  const maxCentre = 98.2 - bottomInk;
  let centreY = y - ((rows - 1) * stepY) / 2;
  centreY = Math.min(Math.max(centreY, minCentre), Math.max(minCentre, maxCentre));

  return (
    <g>
      <text
        x={x}
        y={centreY - signSize - 1.2}
        textAnchor="middle"
        className="chart-sign"
        style={{ fontSize: signSize }}
      >
        {RASHIS[sign].english.slice(0, 3)}
      </text>
      {planets.map((planet, index) => {
        const column = Math.floor(index / rows);
        const row = index % rows;
        const offsetX = (column - (columns - 1) / 2) * stepX;
        return (
          <text
            key={planet.key}
            x={x + offsetX}
            y={centreY + row * stepY}
            textAnchor="middle"
            className={planet.retrograde ? 'chart-planet chart-planet--retro' : 'chart-planet'}
            style={{ fontSize: planetSize }}
          >
            <tspan className="glyph">{PLANETS[planet.key].symbol}</tspan>
            {showDegree ? (
              <tspan className="chart-deg" style={{ fontSize: planetSize * 0.68 }}>
                {' '}
                {planet.degreeInSign.toFixed(0)}°{planet.retrograde ? ' R' : ''}
              </tspan>
            ) : planet.retrograde ? (
              <tspan className="chart-deg" style={{ fontSize: planetSize * 0.62 }}>
                {' '}R
              </tspan>
            ) : null}
          </text>
        );
      })}
      {house === 1 ? (
        <text x={x} y={centreY - signSize - 5.2} textAnchor="middle" className="chart-lagna" style={{ fontSize: 3 }}>
          LAGNA
        </text>
      ) : null}
    </g>
  );
}

export function NorthChart({ chart }: { chart: BirthChart }) {
  return (
    <div className="chart-frame">
      <svg viewBox="0 0 100 100" role="img" aria-label={`North Indian birth chart for ${chart.input.name}`}>
        <rect x="1" y="1" width="98" height="98" rx="3" className="chart-line" />
        <path d="M1 1 99 99M99 1 1 99" className="chart-line" />
        <path d="M50 1 99 50 50 99 1 50Z" className="chart-line" />
        {Array.from({ length: 12 }, (_, i) => {
          const house = i + 1;
          const [x, y] = NORTH_CENTROIDS[house];
          return (
            <HouseContents key={house} chart={chart} house={house} x={x} y={y} width={NORTH_WIDTH[house]} />
          );
        })}
      </svg>
    </div>
  );
}

const SOUTH_LAYOUT: Array<{ sign: number; col: number; row: number }> = [
  { sign: 11, col: 0, row: 0 },
  { sign: 0, col: 1, row: 0 },
  { sign: 1, col: 2, row: 0 },
  { sign: 2, col: 3, row: 0 },
  { sign: 10, col: 0, row: 1 },
  { sign: 3, col: 3, row: 1 },
  { sign: 9, col: 0, row: 2 },
  { sign: 4, col: 3, row: 2 },
  { sign: 8, col: 0, row: 3 },
  { sign: 7, col: 1, row: 3 },
  { sign: 6, col: 2, row: 3 },
  { sign: 5, col: 3, row: 3 },
];

export function SouthChart({ chart }: { chart: BirthChart }) {
  const cell = 24;
  const offset = 2;
  return (
    <div className="chart-frame">
      <svg viewBox="0 0 100 100" role="img" aria-label={`South Indian birth chart for ${chart.input.name}`}>
        <rect x="1" y="1" width="98" height="98" rx="3" className="chart-line" />
        {SOUTH_LAYOUT.map(({ sign, col, row }) => {
          const x = offset + col * cell;
          const y = offset + row * cell;
          const isLagna = sign === chart.ascendant.sign;
          const planets = GRAHA_ORDER.filter((key) => chart.positions[key].sign === sign).map((key) => chart.positions[key]);
          return (
            <g key={sign}>
              <rect x={x} y={y} width={cell} height={cell} className="chart-line" />
              {isLagna ? (
                <path d={`M${x} ${y + cell} L${x + 7} ${y}`} stroke="var(--gold)" strokeWidth="0.7" fill="none" />
              ) : null}
              <text x={x + cell / 2} y={y + 4.4} textAnchor="middle" className="chart-sign" style={{ fontSize: 3.1 }}>
                {RASHIS[sign].english.slice(0, 3)}
              </text>
              {planets.map((planet, index) => (
                <text
                  key={planet.key}
                  x={x + cell / 2}
                  y={y + 9.4 + index * 3.5}
                  textAnchor="middle"
                  className={planet.retrograde ? 'chart-planet chart-planet--retro' : 'chart-planet'}
                  style={{ fontSize: 3.3 }}
                >
                  <tspan className="glyph">{PLANETS[planet.key].symbol}</tspan>
                  <tspan className="chart-deg" style={{ fontSize: 2.3 }}>
                    {' '}
                    {planet.degreeInSign.toFixed(0)}
                  </tspan>
                  {planet.retrograde ? <tspan className="chart-deg"> R</tspan> : null}
                </text>
              ))}
            </g>
          );
        })}
        <text x="50" y="47" textAnchor="middle" className="chart-sign" style={{ fontSize: 3, fill: 'var(--gold-dim)' }}>
          {chart.input.name.toUpperCase()}
        </text>
        <text x="50" y="53" textAnchor="middle" className="chart-planet" style={{ fontSize: 3.4 }}>
          Lagna {RASHIS[chart.ascendant.sign].english}
        </text>
        <text x="50" y="59" textAnchor="middle" className="chart-deg" style={{ fontSize: 2.8 }}>
          Moon {RASHIS[chart.moonSign].english} · Sun {RASHIS[chart.sunSign].english}
        </text>
      </svg>
    </div>
  );
}

export function PlanetTable({ chart }: { chart: BirthChart }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>Graha</th>
            <th>Sign</th>
            <th>Degree</th>
            <th>Nakshatra</th>
            <th>House</th>
            <th>Navamsa</th>
            <th>Dignity</th>
            <th>Motion</th>
          </tr>
        </thead>
        <tbody>
          {GRAHA_ORDER.map((key) => {
            const p = chart.positions[key];
            return (
              <tr key={key}>
                <td>
                  <span className="planet-cell">
                    <span className="glyph">{PLANETS[key].symbol}</span>
                    {PLANETS[key].name}
                  </span>
                </td>
                <td>
                  {RASHIS[p.sign].english} <span className="dim small">({RASHIS[p.sign].name})</span>
                </td>
                <td className="mono">
                  {Math.floor(p.degreeInSign)}°{String(Math.floor((p.degreeInSign % 1) * 60)).padStart(2, '0')}′
                </td>
                <td>
                  {NAKSHATRAS[p.nakshatra].name} <span className="dim small">pada {p.pada}</span>
                </td>
                <td className="mono">{p.house}</td>
                <td className="dim small">{RASHIS[navamsaSign(p.longitude)].english}</td>
                <td>
                  <span className={p.dignity === 'Exalted' || p.dignity === 'Own sign' || p.dignity === 'Moolatrikona' ? 'muted' : 'dim'}>
                    {p.dignity}
                  </span>
                </td>
                <td>
                  {p.retrograde ? <span className="badge badge--rose">Retrograde</span> : <span className="dim small">Direct</span>}
                  {p.combust ? <span className="badge badge--muted" style={{ marginLeft: 4 }}>Combust</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function HouseGrid({ chart }: { chart: BirthChart }) {
  return (
    <div className="grid grid-4" style={{ gap: 10 }}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
        const sign = chart.houseSigns[house - 1];
        const planets = planetsIn(chart, house);
        return (
          <div key={house} className="stat" style={{ minHeight: 92 }}>
            <div className="stat-label">
              House {house} · {RASHIS[sign].english}
            </div>
            <div className="stat-value" style={{ fontSize: '0.82rem' }}>
              {planets.length ? (
                planets.map((p) => (
                  <span key={p.key} style={{ marginRight: 6 }}>
                    <span className="glyph" style={{ color: 'var(--gold)' }}>
                      {PLANETS[p.key].symbol}
                    </span>
                    <span className="small" style={{ marginLeft: 2 }}>
                      {p.degreeInSign.toFixed(0)}°
                    </span>
                  </span>
                ))
              ) : (
                <span className="dim small">Empty</span>
              )}
            </div>
            <div className="tiny dim" style={{ marginTop: 4 }}>
              Lord {PLANETS[RASHIS[sign].lord].name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
