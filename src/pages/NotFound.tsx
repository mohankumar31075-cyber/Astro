import { Link } from 'react-router-dom';
import { Brand } from '../components/Layout';
import { Card } from '../components/ui';
import { IconArrowRight } from '../components/Icons';

export default function NotFound() {
  return (
    <div className="landing" style={{ maxWidth: 720 }}>
      <header className="landing-nav">
        <Brand />
        <Link to="/" className="small muted">Home</Link>
      </header>
      <Card>
        <div className="eyebrow">404</div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 10 }}>This house is empty</h1>
        <p className="muted">
          The page you were looking for is not in this chart. It may have moved, or the link may be mistyped.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <Link className="btn" to="/">Back to AstroSutra <IconArrowRight /></Link>
          <Link className="btn btn--ghost" to="/welcome">Create a chart</Link>
        </div>
      </Card>
    </div>
  );
}
