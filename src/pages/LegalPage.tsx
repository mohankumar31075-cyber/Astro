import { Link, useParams } from 'react-router-dom';
import { Brand } from '../components/Layout';
import { Card } from '../components/ui';
import noticesRaw from '../../THIRD-PARTY-NOTICES.md?raw';

interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const DOCS: LegalDoc[] = [
  {
    slug: 'privacy',
    title: 'Privacy policy',
    updated: '26 October 2026',
    intro:
      'AstroSutra is designed so that there is nothing for us to collect. It is a static web application: your birth details are processed in your browser, stored in your browser, and never sent to a server operated by this project.',
    sections: [
      {
        heading: 'What is stored, and where',
        paragraphs: [
          'Profiles, preferences and the active chart are written to your browser\'s localStorage under the key astrosutra.data.v1. A profile contains the name, relationship label, optional gender, date and time of birth, birthplace label, latitude, longitude and time zone that you enter.',
          'That is the entire dataset. There is no account, no email address, no password, no device identifier and no usage history.',
        ],
      },
      {
        heading: 'What is transmitted',
        paragraphs: [
          'Nothing. The application makes no runtime requests to an analytics service, advertising network, AI provider or astrology API. Fonts and the ephemeris library are bundled with the app rather than fetched from a third-party CDN.',
          'If you open AstroSutra from a website, the web server hosting the static files will see your IP address and user agent in its access logs, as any web server does. That is a property of the host, not of this application.',
        ],
      },
      {
        heading: 'Cookies and tracking',
        paragraphs: ['AstroSutra sets no cookies, uses no pixels, and includes no analytics SDK. There is no consent banner because there is nothing to consent to.'],
      },
      {
        heading: 'Your controls',
        paragraphs: ['You can exercise every data right you have without contacting anyone:'],
        list: [
          'Access and portability: Settings → Your data → Export everything as JSON.',
          'Rectification: edit any profile under Your circle.',
          'Erasure: Settings → Erase all local data, or clear this site\'s storage in your browser.',
        ],
      },
      {
        heading: 'Data about other people',
        paragraphs: [
          'If you add a family member or partner, you are choosing to store their birth details on your device. Please only do so with their knowledge. An exported backup file is plain JSON containing their details — treat it like any other personal document.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'AstroSutra is intended for adults. Charts for children may be added by a parent or guardian, but the app is not directed at children under 13 and collects no data from them beyond what a guardian enters locally.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          'If this policy changes, the effective date above changes with it. Because the application has no server, a new version of the app is the only way this policy can be delivered to you — and it will be included in the bundle.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    updated: '26 October 2026',
    intro:
      'These terms cover your use of AstroSutra. They are written to be read, not to be survived. The short version: use it for reflection, do not use it for decisions that need an expert, and understand that astrology is not a science of certainty.',
    sections: [
      {
        heading: 'What AstroSutra is',
        paragraphs: [
          'AstroSutra is a calculator and a set of interpretive texts. It computes astronomical positions, converts them to the sidereal zodiac, and explains classical Jyotisha concepts in modern language. The astronomy is real; the interpretation is a cultural and reflective practice, not a prediction of events.',
          'Readings, compatibility scores and reports are provided for personal reflection and entertainment. They are not statements of fact about your future, your character or another person.',
        ],
      },
      {
        heading: 'What AstroSutra is not',
        paragraphs: ['AstroSutra does not provide, and must not be used as, any of the following:'],
        list: [
          'Medical advice, diagnosis or treatment. Consult a qualified doctor.',
          'Legal advice. Consult a qualified lawyer.',
          'Financial or investment advice. Consult a licensed adviser.',
          'A crisis or mental-health service. If you are in danger, contact your local emergency number — in India, Tele-MANAS on 14416.',
        ],
      },
      {
        heading: 'Compatibility scores',
        paragraphs: [
          'Ashtakoot Guna Milan reads only the Moon\'s nakshatra and rashi. Classical traditions differ on weighting, and the texts themselves list exceptions for Bhakoot, Nadi and Mangal dosha. A score is not a judgement on whether a relationship should exist, and AstroSutra presents it with those caveats on the same screen.',
        ],
      },
      {
        heading: 'Packs and payments',
        paragraphs: [
          'The free tier covers the chart, the daily horoscope, the panchang, compatibility and a small daily question allowance. Packs raise those limits. In this open-source build there is no payment processor connected: activating a pack is a local demo, no card details are requested, and nothing is charged. Entitlements are stored in this browser alongside your charts and disappear when you erase your data.',
          'Where packs are sold in a hosted deployment, the purchase terms, taxes and refund policy of that deployment apply, and the entitlement is verified server-side. Nothing in this repository processes or stores payment credentials.',
        ],
      },
      {
        heading: 'Your responsibilities',
        paragraphs: ['By using AstroSutra you agree to:'],
        list: [
          'Enter birth data for other people only with their knowledge and consent.',
          'Keep exported backup files secure — they contain personal data in plain text.',
          'Not present generated readings as professional advice to third parties.',
          'Not misrepresent AstroSutra as being affiliated with Melooha or any other astrology product.',
        ],
      },
      {
        heading: 'Availability and accuracy',
        paragraphs: [
          'The app is provided as-is, without warranty. Astronomical calculations are checked against published ephemeris data (see the tests and methodology page), but birth-time inaccuracies, ayanamsa choice, house system and dasha year length can all legitimately change a result.',
          'Because the app is entirely client-side, we cannot recover data you delete, and we cannot restore a chart you did not export.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the maximum extent permitted by law, the authors are not liable for indirect or consequential loss arising from use of the app or reliance on its readings. Nothing here excludes liability that cannot lawfully be excluded.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: ['These terms are governed by the laws of India, with courts in Bengaluru, Karnataka having jurisdiction.'],
      },
    ],
  },
  {
    slug: 'licensing',
    title: 'Licensing',
    updated: '26 October 2026',
    intro:
      'AstroSutra is an original project. This page explains what you may do with it, what you may not, and how the third-party components are handled.',
    sections: [
      {
        heading: 'Code — MIT',
        paragraphs: [
          'The application source code is licensed under the MIT License (see the LICENSE file in the repository). You may use, copy, modify, merge, publish, distribute, sublicense and sell copies, provided the copyright notice and permission notice are included.',
        ],
      },
      {
        heading: 'Editorial text — CC BY 4.0',
        paragraphs: [
          'The written readings, sign profiles, glossary, methodology notes and all other prose authored for AstroSutra are licensed under Creative Commons Attribution 4.0. You may reuse and adapt the text, including commercially, with credit to "AstroSutra" and a link to the project.',
        ],
      },
      {
        heading: 'Name, logo and identity',
        paragraphs: [
          'The AstroSutra name and its mark are project identifiers. The open licences above do not grant trademark rights, and you may not use the name or logo in a way that suggests endorsement of a derivative, or confuses users about which project they are using.',
        ],
      },
      {
        heading: 'Third-party components',
        paragraphs: [
          'AstroSutra depends on permissively licensed libraries, principally the Astronomy Engine ephemeris (MIT), React (MIT), React Router (MIT), Vite (MIT), TypeScript (Apache-2.0) and the OFL-licensed typefaces Cormorant Garamond, Manrope and Noto Sans Symbols 2.',
          'Full texts and attribution are reproduced in the third-party notices, which ship inside the application bundle and in the repository as THIRD-PARTY-NOTICES.md.',
        ],
      },
      {
        heading: 'What was deliberately not done',
        paragraphs: [
          'No Melooha code, artwork, copy, database or API has been accessed, decompiled or reproduced. Melooha is a separate commercial product by Astroverse Technologies Pvt. Ltd. AstroSutra is an independent implementation in the same product category, built from public-domain Jyotisha concepts and openly documented astronomy.',
          'Names of zodiac signs, nakshatras, dashas and classical yogas are traditional terminology in the public domain. Their modern explanations here are newly written, and the in-app guide is named Sutra after this project rather than borrowing another product\'s assistant name.',
        ],
      },
      {
        heading: 'Reporting a licensing concern',
        paragraphs: [
          'If you believe something in this repository or bundle is misattributed, open an issue on the project\'s GitHub repository with the file and the concern. Such reports are treated as priority bugs.',
        ],
      },
    ],
  },
];

export default function LegalPage() {
  const { slug } = useParams();
  const doc = DOCS.find((entry) => entry.slug === slug);

  return (
    <div className="landing" style={{ maxWidth: 900 }}>
      <header className="landing-nav">
        <Brand />
        <Link to="/" className="small muted">
          ← Back to AstroSutra
        </Link>
      </header>

      {doc ? (
        <>
          <div className="eyebrow">Legal · updated {doc.updated}</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: 12 }}>{doc.title}</h1>
          <p className="lede" style={{ marginBottom: 26 }}>{doc.intro}</p>

          <div className="stack">
            {doc.sections.map((section) => (
              <Card key={section.heading} as="article">
                <h3 style={{ marginBottom: 10 }}>{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="small muted">{paragraph}</p>
                ))}
                {section.list ? (
                  <ul className="check-list" style={{ marginTop: 10 }}>
                    {section.list.map((item) => (
                      <li key={item} style={{ display: 'list-item', marginLeft: 8, color: 'var(--muted)' }}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      ) : slug === 'notices' ? (
        <>
          <div className="eyebrow">Legal · third-party notices</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: 12 }}>Third-party notices</h1>
          <p className="lede" style={{ marginBottom: 22 }}>
            AstroSutra is built on permissively licensed open-source components. The full licence texts, copyright
            lines and attribution reproduced below are shipped with the application to satisfy the MIT, Apache-2.0
            and SIL Open Font Licence requirements.
          </p>
          <Card>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
              {noticesRaw}
            </pre>
          </Card>
        </>
      ) : (
        <Card>
          <h2>Page not found</h2>
          <p className="muted">That legal page does not exist.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn--ghost btn--small" to="/legal/privacy">Privacy</Link>
            <Link className="btn btn--ghost btn--small" to="/legal/terms">Terms</Link>
            <Link className="btn btn--ghost btn--small" to="/legal/licensing">Licensing</Link>
            <Link className="btn btn--ghost btn--small" to="/legal/notices">Notices</Link>
          </div>
        </Card>
      )}

      <footer className="footer">
        <div>© {new Date().getFullYear()} AstroSutra · Original work, MIT-licensed code.</div>
        <div className="footer-links">
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/licensing">Licensing</Link>
          <Link to="/legal/notices">Notices</Link>
        </div>
      </footer>
    </div>
  );
}
