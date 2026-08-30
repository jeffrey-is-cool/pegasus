type ApplyScreenType =
  | "intro"
  | "question"
  | "info"
  | "processing"
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

export const APPLY_FUNNEL_QUESTION_LABELS = {
  student_stage: "Where is your child in their education?",
  dream_outcome: "What is the dream outcome for admissions?",
  priority: "What are the biggest pain points you feel right now in the admissions process?",
  dream_school: "What are your child’s top three schools?",
  college_investment: "How much are you looking to invest in a college degree?",
} as const;

export const APPLY_FUNNEL_ANSWER_OPTIONS = {
  student_stage: [
    { value: "younger_than_high_school", label: "Before 9th grade" },
    { value: "freshman", label: "9th grade" },
    { value: "sophomore", label: "10th grade" },
    { value: "junior", label: "11th grade" },
    { value: "senior", label: "12th grade" },
    { value: "transfer", label: "Transfer student" },
    { value: "graduate_school", label: "Graduate school" },
  ],
  dream_outcome: [
    {
      value: "best_fit",
      label: "My child gets into the school that is their best fit, regardless of prestige",
    },
    {
      value: "highest_roi",
      label: "They get into a school with the highest return on investment",
    },
    {
      value: "feeling_stuck",
      label: "I’m not sure I’m making the right decision and want a third-party perspective",
    },
    {
      value: "strong_options",
      label: "They have strong options and a clear path forward",
    },
  ],
  priority: [
    {
      value: "strategy",
      label: "Strategy and positioning",
      detail: "School selection, differentiation, and a plan that compounds over time.",
    },
    {
      value: "storytelling",
      label: "Essays and storytelling",
      detail: "Turning the student’s experiences into an authentic, memorable narrative.",
    },
    {
      value: "performance",
      label: "Confidence and execution",
      detail: "Accountability, communication, mindset, and performing under pressure.",
    },
    {
      value: "complete_management",
      label: "Complete process management",
      detail: "One accountable private team coordinating every important detail.",
    },
    {
      value: "too_busy",
      label: "I’m too busy to give this process the attention I want to give it",
    },
    {
      value: "student_not_listening",
      label: "My kid doesn’t listen to me",
    },
  ],
  dream_school: [
    { value: "Harvard University", label: "Harvard University" },
    { value: "Stanford University", label: "Stanford University" },
    { value: "University of Pennsylvania", label: "University of Pennsylvania" },
    { value: "Brown University", label: "Brown University" },
    { value: "Dartmouth College", label: "Dartmouth College" },
    { value: "New York University", label: "New York University" },
    { value: "University of Michigan", label: "University of Michigan" },
    { value: "Cooper Union", label: "Cooper Union" },
  ],
  college_investment: [
    { value: "under_10k", label: "Less than $10,000" },
    { value: "10k_to_20k", label: "$10,000–$20,000" },
    { value: "up_to_50k", label: "Up to $50,000" },
    { value: "up_to_150k", label: "Up to $150,000" },
  ],
} as const;

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
