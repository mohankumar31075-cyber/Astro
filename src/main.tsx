import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Latin subsets only: the UI is English with transliterated Sanskrit; the
// Devanagari in the glossary renders with the reader's system font. Importing
// the whole family would ship cyrillic, greek and vietnamese files nobody uses.
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
// The astrological glyphs (♈–♓ ☉ ☽ ♀ ♂ ♃ ♄ ☊ ☋ ★) come from a 14 kB subset
// built by scripts/subset-symbols.py and declared in styles/app.css — no
// fontsource CSS import, so the browser downloads one small file instead of a
// 382 kB package that only ever supplied two of the characters.
import './styles/app.css';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
