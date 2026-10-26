import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Callout, Card, CardTitle, PageHeader } from '../components/ui';
import { IconArrowRight, IconLock, IconSparkles } from '../components/Icons';
import { NAKSHATRAS, PLANETS, RASHIS } from '../lib/constants';
import { recordQuestion, useActiveChart, useActiveProfile, useAppData } from '../lib/store';
import { askVaani, SUGGESTED_QUESTIONS, type VaaniAnswer } from '../lib/vaani';
import { dashaTreeAt, formatPeriodDate } from '../lib/dasha';
import { questionsLeft, todayKey } from '../lib/packs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  answer?: VaaniAnswer;
}

export default function AskPage() {
  const profile = useActiveProfile();
  const chart = useActiveChart();
  const data = useAppData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const tree = useMemo(() => (chart ? dashaTreeAt(chart, new Date()) : null), [chart]);

  if (!profile || !chart || !tree) return null;

  const left = questionsLeft(data.usage, todayKey());

  const send = (question: string) => {
    const clean = question.trim();
    if (!clean || left <= 0) return;
    const answer = askVaani(clean, chart, new Date());
    recordQuestion();
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text: clean },
      { id: `a-${Date.now()}`, role: 'assistant', answer },
    ]);
    setInput('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Chart-aware guide · offline"
        title="Ask Vaani"
        description="Vaani reads your dashas, house lords and transits and answers with the factors it used. It is a transparent rules engine, not a language model — and nothing leaves your browser."
        actions={
          messages.length > 0 ? (
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setMessages([])}>
              New conversation
            </button>
          ) : null
        }
      />

      <div className="grid grid-chart">
        <Card>
          <div className="chat-shell">
            {messages.length === 0 ? (
              <>
                <div className="bubble">
                  <div className="bubble-title">Namaste, {profile.name.split(' ')[0]}.</div>
                  <p>
                    I have your chart: a {RASHIS[chart.ascendant.sign].english} ascendant, a {RASHIS[chart.moonSign].english}{' '}
                    Moon in {NAKSHATRAS[chart.birthNakshatra].name}, and you are running{' '}
                    {PLANETS[tree.maha.lord].name} mahadasha with {PLANETS[tree.antar.lord].name} antardasha until{' '}
                    {formatPeriodDate(tree.antar.end)}.
                  </p>
                  <p style={{ marginTop: 10 }}>
                    Ask about work, relationships, money, health routines, study, travel or timing. I will show you
                    which parts of the chart produced the answer.
                  </p>
                </div>
                <div>
                  <div className="eyebrow">Start with</div>
                  <div className="suggestions">
                    {SUGGESTED_QUESTIONS.slice(0, 4).map((question) => (
                      <button
                        key={question}
                        type="button"
                        className="suggestion"
                        onClick={() => send(question)}
                        disabled={left <= 0}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="chat-log">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="bubble bubble--user">
                      <p>{message.text}</p>
                    </div>
                  ) : (
                    <div key={message.id} className="bubble">
                      <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                        <IconSparkles width={15} height={15} style={{ color: 'var(--gold)' }} />
                        <span className="tiny dim">
                          {message.answer?.mode === 'care' ? 'A careful answer' : 'From your chart'}
                        </span>
                      </div>
                      <div className="bubble-title">{message.answer?.title}</div>
                      {message.answer?.sections.map((section) => (
                        <div key={section.title}>
                          <h5>{section.title}</h5>
                          <p>{section.body}</p>
                        </div>
                      ))}
                      {message.answer && message.answer.factors.length > 0 ? (
                        <>
                          <h5>Factors used</h5>
                          <div className="stack" style={{ gap: 0 }}>
                            {message.answer.factors.map((factor) => (
                              <div key={factor.label} className="kv">
                                <dt>{factor.label}</dt>
                                <dd style={{ fontSize: '0.78rem' }}>{factor.value}</dd>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {message.answer && message.answer.followUps.length > 0 ? (
                        <div className="suggestions" style={{ marginTop: 12 }}>
                          {message.answer.followUps.map((question) => (
                            <button key={question} type="button" className="suggestion" onClick={() => send(question)}>
                              {question}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ),
                )}
              </div>
            )}

            {left > 0 ? (
              <>
                <form
                  className="chat-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    send(input);
                  }}
                >
                  <textarea
                    ref={inputRef}
                    className="textarea"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask about your chart…"
                    aria-label="Your question"
                  />
                  <button className="btn" type="submit" disabled={!input.trim()}>
                    Ask <IconArrowRight />
                  </button>
                </form>
                <p className="tiny dim">
                  {left} question{left === 1 ? '' : 's'} left today.{' '}
                  <Link to="/packs" className="muted">Get a pack</Link> · Vaani describes patterns and timing in your
                  chart. It does not predict events and will decline medical, legal or crisis questions.
                </p>
              </>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                <Callout tone="teal">
                  You have used today&apos;s free questions. The allowance resets at midnight on this device.
                </Callout>
                <Link className="btn" to="/packs">
                  <IconSparkles /> Get a question pack <IconArrowRight />
                </Link>
                <p className="tiny dim">
                  Packs add 50 questions and never expire. Your chart, the daily horoscope and the panchang stay
                  free.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="stack">
          <Card>
            <CardTitle title="How Vaani works" eyebrow="Transparency" />
            <div className="stack" style={{ gap: 12 }}>
              {[
                ['1. Your question is classified', 'Keywords route the question to one of ten life areas. Nothing is sent to a server.'],
                ['2. The relevant chart factors are read', 'Dasha lords, the house that rules the topic, its lord and occupants, and the current transits.'],
                ['3. Original text is assembled', 'Hand-written interpretation for those combinations — not generated by an external model.'],
                ['4. The working is shown', 'Every answer lists the periods and placements it used.'],
              ].map(([title, body]) => (
                <div key={title}>
                  <div className="small" style={{ fontWeight: 600 }}>{title}</div>
                  <p className="tiny muted">{body}</p>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="row" style={{ gap: 8 }}>
              <Badge tone="teal"><IconLock width={12} height={12} /> On-device</Badge>
              <Badge tone="violet">No model API</Badge>
            </div>
          </Card>

          <Card>
            <CardTitle title="Your current chapter" eyebrow="Dasha" />
            <div className="row-between small" style={{ marginBottom: 6 }}>
              <span>{PLANETS[tree.maha.lord].name} mahadasha</span>
              <span className="dim">till {formatPeriodDate(tree.maha.end)}</span>
            </div>
            <div className="row-between small" style={{ marginBottom: 6 }}>
              <span>{PLANETS[tree.antar.lord].name} antardasha</span>
              <span className="dim">till {formatPeriodDate(tree.antar.end)}</span>
            </div>
            <div className="row-between small">
              <span>{PLANETS[tree.pratyantar.lord].name} pratyantardasha</span>
              <span className="dim">till {formatPeriodDate(tree.pratyantar.end)}</span>
            </div>
            <div className="divider" />
            <p className="tiny dim">
              {PLANETS[tree.maha.lord].name} sits in your house {chart.houseOf[tree.maha.lord]} in{' '}
              {RASHIS[chart.positions[tree.maha.lord].sign].english}.
            </p>
            <Link className="btn btn--quiet btn--small" to="/chart" style={{ marginTop: 8 }}>
              See the full chart <IconArrowRight />
            </Link>
          </Card>

          <Card className="card--flat">
            <div className="eyebrow">Other questions</div>
            <div className="suggestions">
              {SUGGESTED_QUESTIONS.slice(4).map((question) => (
                <button
                  key={question}
                  type="button"
                  className="suggestion"
                  onClick={() => send(question)}
                  disabled={left <= 0}
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
