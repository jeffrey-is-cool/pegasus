type ApplyScreenType =
  | "intro"
  | "question"
  | "info"
  | "processing"
  | "prebooking"
  | "booking"
  | "complete";

export type ApplyScreen = {
  id: string;
  name: string;
  type: ApplyScreenType;
  index: number;
  questionKey?: string;
  questionLabel?: string;
};

export const APPLY_FUNNEL_TRACKING = {
  funnel: "private_admissions_assessment",
  version: 2,
  events: {
    answerRecorded: "apply_answer_recorded",
    funnelCompleted: "apply_funnel_completed",
    funnelRestarted: "apply_funnel_restarted",
    screenCompleted: "apply_screen_completed",
    screenTimed: "apply_screen_timed",
    screenViewed: "apply_screen_viewed",
  },
} as const;

export function applyScreenProperties(screen: ApplyScreen) {
  return {
    funnel: APPLY_FUNNEL_TRACKING.funnel,
    funnel_version: APPLY_FUNNEL_TRACKING.version,
    screen_id: screen.id,
    screen_name: screen.name,
    screen_type: screen.type,
    screen_index: screen.index,
    ...(screen.questionKey ? { question_key: screen.questionKey } : {}),
    ...(screen.questionLabel ? { question_label: screen.questionLabel } : {}),
  };
}
