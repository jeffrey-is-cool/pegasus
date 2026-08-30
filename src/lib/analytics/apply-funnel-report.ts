import "server-only";

import { APPLY_FUNNEL_TRACKING } from "@/app/apply/apply-funnel-tracking";

export type ApplyFunnelWindow = "today" | 7 | 30 | 90;

type ReportStatus = "ready" | "not_configured" | "error";

export type ApplyFunnelStepReport = {
  id: string;
  name: string;
  index: number;
  type: string;
  views: number;
  people: number;
  completions: number;
  completedPeople: number;
  completionRate: number | null;
  averageDurationSeconds: number | null;
  medianDurationSeconds: number | null;
  pageExitPeople: number;
};

export type ApplyFunnelAnswerReport = {
  questionKey: string;
  questionLabel: string;
  answerKey: string;
  answerLabel: string;
  answers: number;
  people: number;
};

export type ApplyFunnelReport = {
  status: ReportStatus;
  window: ApplyFunnelWindow;
  summary: {
    starters: number;
    completed: number;
    bookingClicks: number;
    completionRate: number | null;
    bookingRate: number | null;
  };
  steps: ApplyFunnelStepReport[];
  answers: ApplyFunnelAnswerReport[];
  observedDataRange: {
    start: string | null;
    end: string | null;
  };
};

const EMPTY_SUMMARY = {
  starters: 0,
  completed: 0,
  bookingClicks: 0,
  completionRate: null,
  bookingRate: null,
};

const DEFAULT_POSTHOG_PROJECT_ID = "559881";

function queryHost() {
  const configured = process.env.POSTHOG_API_HOST?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const ingestionHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  if (ingestionHost) {
    return ingestionHost
      .replace("://us.i.posthog.com", "://us.posthog.com")
      .replace("://eu.i.posthog.com", "://eu.posthog.com")
      .replace(/\/+$/, "");
  }

  return "https://us.posthog.com";
}

function hogQlString(value: string) {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

function windowThreshold(window: ApplyFunnelWindow) {
  return window === "today" ? "toStartOfDay(now())" : `now() - INTERVAL ${window} DAY`;
}

function numberAt(row: unknown[], index: number) {
  const value = Number(row[index]);
  return Number.isFinite(value) ? value : 0;
}

function nullableNumberAt(row: unknown[], index: number) {
  if (row[index] == null) return null;
  const value = Number(row[index]);
  return Number.isFinite(value) ? value : null;
}

function stringAt(row: unknown[], index: number) {
  return typeof row[index] === "string" ? row[index] : "";
}

function rate(numerator: number, denominator: number) {
  return denominator > 0 ? (numerator / denominator) * 100 : null;
}

async function runHogQlQuery(
  endpoint: string,
  personalApiKey: string,
  query: string,
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${personalApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).replaceAll(/\s+/g, " ").trim().slice(0, 1_000);
    throw new Error(
      `PostHog query failed with status ${response.status}${detail ? `: ${detail}` : ""}`,
    );
  }

  const payload = (await response.json()) as { results?: unknown };
  if (!Array.isArray(payload.results)) {
    throw new Error("PostHog returned no result rows.");
  }

  return payload.results.filter(Array.isArray) as unknown[][];
}

function emptyReport(
  status: Exclude<ReportStatus, "ready">,
  window: ApplyFunnelWindow,
): ApplyFunnelReport {
  return {
    status,
    window,
    summary: EMPTY_SUMMARY,
    steps: [],
    answers: [],
    observedDataRange: { start: null, end: null },
  };
}

export async function getApplyFunnelReport(
  window: ApplyFunnelWindow,
): Promise<ApplyFunnelReport> {
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim() || DEFAULT_POSTHOG_PROJECT_ID;

  if (!personalApiKey) {
    return emptyReport("not_configured", window);
  }

  const funnel = hogQlString(APPLY_FUNNEL_TRACKING.funnel);
  const threshold = windowThreshold(window);
  const summaryQuery = `
    SELECT
      event,
      toString(properties.screen_id) AS screen_id,
      count() AS events,
      uniqExact(toString(distinct_id)) AS people,
      min(timestamp) AS first_seen_at,
      max(timestamp) AS last_seen_at
    FROM events
    WHERE timestamp >= ${threshold}
      AND event IN ('apply_screen_viewed', 'apply_funnel_completed', 'booking_link_clicked')
      AND toString(properties.funnel) = ${funnel}
    GROUP BY event, screen_id
    ORDER BY event ASC, screen_id ASC
    LIMIT 200
  `;
  const stepsQuery = `
    SELECT
      toString(properties.screen_id) AS screen_id,
      any(toString(properties.screen_name)) AS screen_name,
      toFloatOrZero(toString(properties.screen_index)) AS screen_index,
      any(toString(properties.screen_type)) AS screen_type,
      countIf(event = 'apply_screen_viewed') AS views,
      uniqExactIf(toString(distinct_id), event = 'apply_screen_viewed') AS people,
      countIf(event = 'apply_screen_completed') AS completions,
      uniqExactIf(toString(distinct_id), event = 'apply_screen_completed') AS completed_people,
      avgIf(toFloatOrZero(toString(properties.duration_seconds)), event = 'apply_screen_timed') AS average_duration,
      quantileIf(0.5)(toFloatOrZero(toString(properties.duration_seconds)), event = 'apply_screen_timed') AS median_duration,
      uniqExactIf(toString(distinct_id), event = 'apply_screen_timed' AND toString(properties.exit_reason) = 'page_exit') AS page_exit_people
    FROM events
    WHERE timestamp >= ${threshold}
      AND event IN ('apply_screen_viewed', 'apply_screen_completed', 'apply_screen_timed')
      AND toString(properties.funnel) = ${funnel}
      AND toString(properties.screen_id) != ''
    GROUP BY screen_id, screen_index
    ORDER BY screen_index ASC, screen_id ASC
    LIMIT 200
  `;
  const answersQuery = `
    SELECT
      if(toString(properties.question_key) = '', toString(properties.screen_id), toString(properties.question_key)) AS question_key,
      if(toString(properties.question_label) = '', toString(properties.screen_name), toString(properties.question_label)) AS question_label,
      arrayJoin(splitByChar('|', toString(properties.answer_key))) AS answer_key,
      count() AS answers,
      uniqExact(toString(distinct_id)) AS people
    FROM events
    WHERE timestamp >= ${threshold}
      AND event = 'apply_answer_recorded'
      AND toString(properties.funnel) = ${funnel}
      AND toString(properties.answer_key) != ''
    GROUP BY question_key, question_label, answer_key
    ORDER BY question_label ASC, answers DESC
    LIMIT 500
  `;

  try {
    const endpoint = `${queryHost()}/api/projects/${encodeURIComponent(projectId)}/query/`;
    const [summaryRows, stepRows, answerRows] = await Promise.all([
      runHogQlQuery(endpoint, personalApiKey, summaryQuery),
      runHogQlQuery(endpoint, personalApiKey, stepsQuery),
      runHogQlQuery(endpoint, personalApiKey, answersQuery),
    ]);
    const summaryEvents = summaryRows.flatMap((row) => {
      const event = stringAt(row, 0);
      if (!event) return [];
      return [{
        event,
        screenId: stringAt(row, 1),
        events: numberAt(row, 2),
        people: numberAt(row, 3),
        firstSeenAt: stringAt(row, 4),
        lastSeenAt: stringAt(row, 5),
      }];
    });
    const starters = summaryEvents.find(({ event, screenId }) =>
      event === APPLY_FUNNEL_TRACKING.events.screenViewed && screenId === "intro")?.people ?? 0;
    const completed = summaryEvents.find(({ event }) =>
      event === APPLY_FUNNEL_TRACKING.events.funnelCompleted)?.people ?? 0;
    const bookingClicks = summaryEvents.find(({ event }) =>
      event === "booking_link_clicked")?.people ?? 0;
    const observedStarts = summaryEvents
      .map(({ firstSeenAt }) => firstSeenAt)
      .filter(Boolean)
      .sort();
    const observedEnds = summaryEvents
      .map(({ lastSeenAt }) => lastSeenAt)
      .filter(Boolean)
      .sort();

    return {
      status: "ready",
      window,
      summary: {
        starters,
        completed,
        bookingClicks,
        completionRate: rate(completed, starters),
        bookingRate: rate(bookingClicks, starters),
      },
      steps: stepRows.map((row) => {
        const people = numberAt(row, 5);
        const completedPeople = numberAt(row, 7);
        return {
          id: stringAt(row, 0),
          name: stringAt(row, 1) || stringAt(row, 0),
          index: numberAt(row, 2),
          type: stringAt(row, 3),
          views: numberAt(row, 4),
          people,
          completions: numberAt(row, 6),
          completedPeople,
          completionRate: rate(completedPeople, people),
          averageDurationSeconds: nullableNumberAt(row, 8),
          medianDurationSeconds: nullableNumberAt(row, 9),
          pageExitPeople: numberAt(row, 10),
        };
      }),
      answers: answerRows.map((row) => {
        const answerKey = stringAt(row, 2);
        return {
          questionKey: stringAt(row, 0),
          questionLabel: stringAt(row, 1) || stringAt(row, 0),
          answerKey,
          answerLabel: answerKey === "no_question" ? "No question" : answerKey,
          answers: numberAt(row, 3),
          people: numberAt(row, 4),
        };
      }),
      observedDataRange: {
        start: observedStarts[0] ?? null,
        end: observedEnds.at(-1) ?? null,
      },
    };
  } catch (error) {
    console.error("[dev/funnel] PostHog query failed", error);
    return emptyReport("error", window);
  }
}
