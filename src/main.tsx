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
// Symbols are not in any Latin subset — this file carries the zodiac and
// planet glyphs (☉ ☽ ♀ ♂ ♃ ♄ ☊ ☋ ★).
import '@fontsource/noto-sans-symbols-2/400.css';
import './styles/app.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
