"use client";

import { useRef, useState } from "react";

import {
  APPLY_FUNNEL_ANSWER_OPTIONS,
  APPLY_FUNNEL_QUESTION_LABELS,
} from "@/app/apply/apply-funnel-tracking";
import type {
  ApplyFunnelAnswerReport,
  ApplyFunnelReport,
  ApplyFunnelStepReport,
  ApplyFunnelWindow,
} from "@/lib/analytics/apply-funnel-report";

import styles from "../funnel-stats.module.css";

const WINDOWS: Array<{ value: ApplyFunnelWindow; label: string }> = [
  { value: "today", label: "Today" },
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

function metric(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function percent(value: number | null) {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function seconds(value: number | null) {
  return value == null ? "—" : `${value.toFixed(1)}s`;
}

function timeframe(window: ApplyFunnelWindow) {
  return window === "today" ? "today" : `trailing ${window} days`;
}

function dateRange(report: ApplyFunnelReport) {
  const { start, end } = report.observedDataRange;
  if (!start || !end) return null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  return `${formatter.format(new Date(start))}–${formatter.format(new Date(end))}`;
}

type AnswerGroup = {
  questionKey: string;
  questionLabel: string;
  answers: ApplyFunnelAnswerReport[];
};

function groupAnswers(answers: ApplyFunnelAnswerReport[]) {
  const groups = new Map<string, AnswerGroup>(
    Object.entries(APPLY_FUNNEL_QUESTION_LABELS).map(([questionKey, questionLabel]) => {
      const options = APPLY_FUNNEL_ANSWER_OPTIONS[
        questionKey as keyof typeof APPLY_FUNNEL_ANSWER_OPTIONS
      ];
      return [
        questionKey,
        {
          questionKey,
          questionLabel,
          answers: options.map((option) => ({
            questionKey,
            questionLabel,
            answerKey: option.value,
            answerLabel: option.label,
            answers: 0,
            people: 0,
          })),
        },
      ];
    }),
  );

  answers.forEach((answer) => {
    const group = groups.get(answer.questionKey) ?? {
      questionKey: answer.questionKey,
      questionLabel: answer.questionLabel,
      answers: [],
    };
    const expectedIndex = group.answers.findIndex(
      (expected) => expected.answerKey === answer.answerKey,
    );
    if (expectedIndex >= 0) {
      group.answers[expectedIndex] = {
        ...answer,
        answerLabel: group.answers[expectedIndex].answerLabel,
      };
    } else {
      group.answers.push(answer);
    }
    groups.set(answer.questionKey, group);
  });
  return [...groups.values()];
}

function FunnelDropoffChart({ steps }: { steps: ApplyFunnelStepReport[] }) {
  if (!steps.length) {
    return <p className={styles.empty}>No screen events were recorded in this timeframe.</p>;
  }

  const maxPeople = Math.max(1, ...steps.map(({ people }) => people));
  const left = 48;
  const right = 24;
  const minimumColumnWidth = 160;
  const chartWidth = Math.max(960, left + right + steps.length * minimumColumnWidth);
  const baseline = 220;
  const chartHeight = 170;
  const availableWidth = chartWidth - left - right;
  const columnWidth = availableWidth / steps.length;
  const barWidth = Math.min(64, columnWidth * 0.56);
  const points = steps.map((step, index) => {
    const x = left + columnWidth * index + columnWidth / 2;
    const y = baseline - (step.people / maxPeople) * chartHeight;
    return { step, x, y };
  });

  return (
    <div className={styles.chartWrap}>
      <div
        aria-label="Scrollable funnel step chart"
        className={styles.chartScroller}
        role="region"
        tabIndex={0}
      >
        <div className={styles.chartCanvas} style={{ minWidth: `${chartWidth}px` }}>
          <svg
            className={styles.chart}
            viewBox={`0 0 ${chartWidth} 260`}
            role="img"
            aria-label="Unique people reaching each apply funnel screen"
          >
            {[0, 1, 2, 3, 4].map((line) => {
              const y = baseline - (chartHeight / 4) * line;
              return <line key={line} x1={left} x2={chartWidth - right} y1={y} y2={y} className={styles.gridLine} />;
            })}
            {points.map(({ step, x, y }, index) => (
              <g key={`${step.index}:${step.id}`}>
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, baseline - y)}
                  rx="3"
                  className={styles.chartBar}
                />
                <text x={x} y={Math.max(18, y - 11)} textAnchor="middle" className={styles.chartValue}>
                  {metric(step.people)}
                </text>
                <text x={x} y={248} textAnchor="middle" className={styles.chartIndex}>
                  {index + 1}
                </text>
              </g>
            ))}
            {points.length > 1 ? (
              <polyline
                points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
                className={styles.chartLine}
              />
            ) : null}
            {points.map(({ step, x, y }) => (
              <circle key={`point:${step.id}`} cx={x} cy={y} r="5" className={styles.chartPoint} />
            ))}
          </svg>
          <div
            className={styles.chartLabels}
            style={{
              gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
              paddingLeft: `${left}px`,
              paddingRight: `${right}px`,
            }}
          >
            {steps.map((step) => (
              <div key={`label:${step.id}`}>
                <strong>{step.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function FunnelStatsWorkbench({ initialReport }: { initialReport: ApplyFunnelReport }) {
  const [window, setWindow] = useState<ApplyFunnelWindow>(initialReport.window);
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestController = useRef<AbortController | null>(null);

  const loadReport = async (nextWindow: ApplyFunnelWindow) => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setWindow(nextWindow);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/dev/funnel?window=${nextWindow}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const nextReport = (await response.json()) as ApplyFunnelReport & { error?: string };
      if (!response.ok) throw new Error(nextReport.error ?? "Unable to load funnel report.");
      setReport(nextReport);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Unable to load funnel report.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const visibleReport = report.window === window ? report : null;
  const steps = visibleReport?.steps ?? [];
  const lastStepPeople = steps.at(-1)?.people ?? 0;
  const answerEvents = visibleReport?.answers.reduce((total, answer) => total + answer.answers, 0) ?? 0;
  const timedSteps = steps.filter((step) => step.averageDurationSeconds != null);
  const averageTime = timedSteps.length
    ? timedSteps.reduce((total, step) => total + (step.averageDurationSeconds ?? 0), 0) / timedSteps.length
    : null;
  const answerGroups = groupAnswers(visibleReport?.answers ?? []);
  const observedRange = visibleReport ? dateRange(visibleReport) : null;

  return (
    <main className={styles.workspace}>
      {visibleReport?.status === "not_configured" ? (
        <section className={styles.notice} data-tone="warning">
          Add <code>POSTHOG_PERSONAL_API_KEY</code> to <code>.env.local</code> to load project 559881.
        </section>
      ) : null}
      {visibleReport?.status === "error" || error ? (
        <section className={styles.notice} data-tone="error">
          PostHog data could not be loaded. {error || "Check the server log."}
        </section>
      ) : null}

      <div className={styles.report} aria-busy={loading}>
        {!visibleReport && !error ? <p className={styles.loading}>Loading funnel stats…</p> : null}
        {visibleReport ? (
          <>
            <section className={styles.card}>
              <div className={styles.sectionHeading}>
                <h1>Summary</h1>
                <span>
                  admissions · {timeframe(window)}{observedRange ? ` · observed ${observedRange}` : ""}
                </span>
              </div>
              <div className={styles.metricsGrid}>
                <MetricCard label="Entry people" value={metric(visibleReport.summary.starters)} />
                <MetricCard label="Last-step people" value={metric(lastStepPeople)} />
                <MetricCard label="Step completion" value={percent(visibleReport.summary.starters ? (lastStepPeople / visibleReport.summary.starters) * 100 : null)} />
                <MetricCard label="Assessment complete" value={metric(visibleReport.summary.completed)} />
                <MetricCard label="Booking clicks" value={metric(visibleReport.summary.bookingClicks)} />
                <MetricCard label="Booking rate" value={percent(visibleReport.summary.bookingRate)} />
                <MetricCard label="Avg screen time" value={seconds(averageTime)} />
                <MetricCard label="Answer events" value={metric(answerEvents)} />
              </div>
              <p className={styles.metricNote}>
                Funnel metrics use exact <code>funnel</code> matches in PostHog project 559881.
              </p>
              <div className={styles.routeRow}>
                <div>
                  <h2>/apply</h2>
                  <p>Private admissions assessment from entry through strategy-call booking.</p>
                </div>
                <div className={styles.windowPicker} aria-label="Report timeframe">
                  {WINDOWS.map((option) => (
                    <button
                      aria-pressed={window === option.value}
                      disabled={loading && window === option.value}
                      key={option.label}
                      onClick={() => void loadReport(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHeading}>
                <h2>Step drop-off</h2>
                <span>PostHog people · screen completion and timing below</span>
              </div>
              <FunnelDropoffChart steps={steps} />
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHeading}>
                <h2>Answer distribution</h2>
                <span>Captured answers · people deduplicated per answer</span>
              </div>
              {answerGroups.length ? (
                <div className={styles.answerGrid}>
                  {answerGroups.map(({ questionKey, questionLabel, answers }) => {
                    const maxAnswers = Math.max(0, ...answers.map((answer) => answer.answers));
                    return (
                      <article className={styles.answerCard} key={questionKey}>
                        <h3>{questionLabel}</h3>
                        <code>{questionKey}</code>
                        <ol>
                          {answers.map((answer) => (
                            <li key={answer.answerKey}>
                              <div><span>{answer.answerLabel}</span><strong>{metric(answer.answers)}</strong></div>
                              <span className={styles.answerBar} aria-hidden="true">
                                <span style={{ width: `${maxAnswers ? (answer.answers / maxAnswers) * 100 : 0}%` }} />
                              </span>
                              <small>{metric(answer.people)} unique people</small>
                            </li>
                          ))}
                        </ol>
                      </article>
                    );
                  })}
                </div>
              ) : <p className={styles.empty}>No answers were recorded in this timeframe.</p>}
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHeading}>
                <h2>Exact step data</h2>
                <span>People, views, completion, timing, and page exits per screen</span>
              </div>
              {steps.length ? (
                <div className={styles.stepRows} role="table" aria-label="Exact funnel step data">
                  {steps.map((step, index) => (
                    <div className={styles.stepRow} role="row" key={`row:${step.id}`}>
                      <div role="cell">
                        <strong>{index + 1}. {step.name}</strong>
                        <span>{step.id} · {step.type}</span>
                      </div>
                      <dl>
                        <div><dt>People</dt><dd>{metric(step.people)}</dd></div>
                        <div><dt>Views</dt><dd>{metric(step.views)}</dd></div>
                        <div><dt>Completed</dt><dd>{percent(step.completionRate)}</dd></div>
                        <div><dt>Avg time</dt><dd>{seconds(step.averageDurationSeconds)}</dd></div>
                        <div><dt>Page exits</dt><dd>{metric(step.pageExitPeople)}</dd></div>
                      </dl>
                    </div>
                  ))}
                </div>
              ) : <p className={styles.empty}>No exact step data in this timeframe.</p>}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
