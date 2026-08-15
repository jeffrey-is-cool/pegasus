"use client";

import Image from "next/image";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import {
  APPLY_FUNNEL_TRACKING,
  applyScreenProperties,
  type ApplyScreen,
} from "./apply-funnel-tracking";
import {
  findSchoolProfile,
  SCHOOL_ADMISSIONS_YEAR_LABEL,
  SCHOOL_SEARCH_OPTIONS,
} from "./school-data";
import styles from "./apply.module.css";

type Option = {
  value: string;
  label: string;
  detail?: string;
};

type InfoSlide = {
  id: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
  body: string;
  sourceLabel: string;
  sourceUrl: string;
};

type SuggestedAnswer = {
  label: string;
  logoAlt: string;
  logoSrc: string;
  value: string;
};

type Question = {
  advisorMessage: string;
  key: string;
  columns: 1 | 2;
  maxSelections?: number;
  multiSelect?: boolean;
  searchableAnswers?: readonly string[];
  suggestedAnswers?: SuggestedAnswer[];
  textInputPlaceholder?: string;
  prompt: string;
  supporting: string;
  options: Option[];
  infoSlidesByAnswer?: Record<string, InfoSlide>;
};

const DREAM_SCHOOL_SUGGESTIONS = [
  {
    label: "Harvard University",
    logoAlt: "Harvard University logo",
    logoSrc: "/logos/harvard_mark.png",
    value: "Harvard University",
  },
  {
    label: "Stanford University",
    logoAlt: "Stanford University logo",
    logoSrc: "/logos/stanford_cropped.png",
    value: "Stanford University",
  },
  {
    label: "University of Pennsylvania",
    logoAlt: "University of Pennsylvania logo",
    logoSrc: "/logos/penn_shield.png",
    value: "University of Pennsylvania",
  },
  {
    label: "Brown University",
    logoAlt: "Brown University logo",
    logoSrc: "/logos/brown_shield.png",
    value: "Brown University",
  },
  {
    label: "Dartmouth College",
    logoAlt: "Dartmouth College logo",
    logoSrc: "/logos/dartmouth_coa.png",
    value: "Dartmouth College",
  },
  {
    label: "New York University",
    logoAlt: "New York University logo",
    logoSrc: "/logos/nyu_torch.png",
    value: "New York University",
  },
  {
    label: "University of Michigan",
    logoAlt: "University of Michigan logo",
    logoSrc: "/logos/michigan_seal.png",
    value: "University of Michigan",
  },
  {
    label: "Cooper Union",
    logoAlt: "Cooper Union logo",
    logoSrc: "/logos/cooper.png",
    value: "Cooper Union",
  },
] satisfies SuggestedAnswer[];

const APPLICATION_LEVERS = [
  {
    action: "Strengthen college-prep grades.",
    metric: "92%",
    title: "Academic performance",
  },
  {
    action: "Choose challenging, sustainable classes.",
    metric: "87%",
    title: "Course rigor",
  },
  {
    action: "Show initiative and contribution.",
    metric: "66%",
    title: "Character",
  },
] as const;

const STUDENT_STAGE_INFO_SLIDES: Record<string, InfoSlide> = {
  younger_than_high_school: {
    id: "curriculum_strength",
    imageAlt: "A student preparing for school",
    imageSrc: "/apply/high-school-student.png",
    title: "67% of students who completed Algebra I before ninth grade enrolled in a four-year college.",
    body: "That compared with 43% for students who completed it in ninth grade and 23% for those who completed it in eleventh or twelfth grade. Early course sequencing can preserve more advanced options later.",
    sourceLabel: "U.S. Department of Education, NCES — Algebra I Coursetaking",
    sourceUrl: "https://nces.ed.gov/pubs2019/2019154/index.asp",
  },
  freshman: {
    id: "college_prep_grades",
    imageAlt: "A student preparing for school",
    imageSrc: "/apply/high-school-student.png",
    title: "Freshman GPA was nearly twice as predictive of graduation as test scores.",
    body: "Ninth-grade performance also predicted college enrollment and persistence, making freshman year a powerful opportunity to establish the right trajectory.",
    sourceLabel: "UChicago Consortium — The Predictive Power of Ninth-Grade GPA",
    sourceUrl:
      "https://consortium.uchicago.edu/sites/default/files/2018-10/Predictive%20Power%20of%20Ninth-Grade-Sept%202017-Consortium.pdf",
  },
  sophomore: {
    id: "placeholder_stat",
    imageAlt: "A student preparing for school",
    imageSrc: "/apply/high-school-student.png",
    title: "[Insert a relevant admissions statistic]",
    body: "Add a short, sourced statistic here that explains why this stage matters for the student’s admissions path.",
    sourceLabel: "Placeholder — add source before launch",
    sourceUrl: "#",
  },
  junior: {
    id: "essay_weight",
    imageAlt: "A student preparing for school",
    imageSrc: "/apply/high-school-student.png",
    title: "Students who retested improved their ACT Superscore by 2.4 points on average.",
    body: "Junior year leaves time to establish a testing baseline, address weak areas, and improve before applications and early deadlines arrive.",
    sourceLabel: "ACT — Graduating Class Database (2024)",
    sourceUrl:
      "https://www.act.org/content/act/en/research/services-and-resources/data-and-visualization/grad-class-database-2024.html",
  },
  senior: {
    id: "early_applications",
    imageAlt: "A student preparing for school",
    imageSrc: "/apply/high-school-student.png",
    title: "Nearly six in ten Common App applicants applied early.",
    body: "With 58% submitting at least one Early Action or Early Decision application, senior-year strategy needs to be ready well before regular deadlines.",
    sourceLabel: "Common App — Early Admission Deadlines (2022–23)",
    sourceUrl:
      "https://www.commonapp.org/about/reports-and-insights/early-admission-deadlines-student-trends-and-implications/",
  },
  transfer: {
    id: "transfer_path",
    imageAlt: "A student preparing for school",
    imageSrc: "/apply/high-school-student.png",
    title: "66% earned a bachelor’s—but just 14% finished within two years of transferring.",
    body: "The transfer route can work, but credit alignment, school selection, and timing make an enormous difference in how efficiently students reach the degree.",
    sourceLabel: "National Student Clearinghouse — Tracking Transfer (2025)",
    sourceUrl:
      "https://www.studentclearinghouse.org/nscblog/tracking-transfer-report-reveals-student-pathway-insights/",
  },
};

const QUESTIONS: Question[] = [
  {
    advisorMessage: "The earlier I understand where your child is today, the more intentional we can be about what comes next.",
    key: "student_stage",
    columns: 2,
    prompt: "Where is your child in their education?",
    supporting: "Choose the stage that best matches where they are today.",
    infoSlidesByAnswer: STUDENT_STAGE_INFO_SLIDES,
    options: [
      {
        value: "younger_than_high_school",
        label: "Before 9th grade",
      },
      {
        value: "freshman",
        label: "9th grade",
      },
      {
        value: "sophomore",
        label: "10th grade",
      },
      {
        value: "junior",
        label: "11th grade",
      },
      {
        value: "senior",
        label: "12th grade",
      },
      {
        value: "transfer",
        label: "Transfer student",
      },
      {
        value: "graduate_school",
        label: "Graduate school",
      },
    ],
  },
  {
    advisorMessage: "There is no single definition of success. I want to understand what matters most to your family.",
    key: "dream_outcome",
    columns: 1,
    prompt: "What is the dream outcome for admissions?",
    supporting: "Choose the outcome that matters most to your family.",
    options: [
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
  },
  {
    advisorMessage: "Most families do not need more information. They need clarity on where support will make the biggest difference.",
    key: "priority",
    columns: 2,
    multiSelect: true,
    prompt: "What are the biggest pain points you feel right now in the admissions process?",
    supporting: "Select all that apply.",
    options: [
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
  },
  {
    advisorMessage: "Do not overthink this. Choose the schools that feel most exciting right now, and we can refine the list later.",
    key: "dream_school",
    columns: 1,
    maxSelections: 3,
    multiSelect: true,
    searchableAnswers: SCHOOL_SEARCH_OPTIONS,
    suggestedAnswers: DREAM_SCHOOL_SUGGESTIONS,
    textInputPlaceholder: "Search or type a school",
    prompt: "What are your child’s top three schools?",
    supporting: "Search for a school or choose from the options below.",
    options: [],
  },
  {
    advisorMessage: "A realistic range helps us balance ambition, fit, and the return your family expects from this investment.",
    key: "college_investment",
    columns: 2,
    prompt: "How much are you looking to invest in a college degree?",
    supporting: "Consider the total cost of attendance, including tuition, housing, and other expenses.",
    options: [
      {
        value: "under_10k",
        label: "Less than $10,000",
      },
      {
        value: "10k_to_20k",
        label: "$10,000–$20,000",
      },
      {
        value: "up_to_50k",
        label: "Up to $50,000",
      },
      {
        value: "up_to_150k",
        label: "Up to $150,000",
      },
    ],
  },
];

type Phase = "intro" | "questions" | "processing" | "complete" | "prebooking" | "booking";
type Answers = Record<string, string>;
type ScreenExitReason = "back" | "completed" | "page_exit" | "screen_changed";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const MULTI_VALUE_SEPARATOR = "|";

function selectedAnswerValues(value: string | undefined) {
  return value?.split(MULTI_VALUE_SEPARATOR).filter(Boolean) ?? [];
}

function optionLabel(question: Question, value: string | undefined) {
  if (!value) return "Not answered";
  if (question.textInputPlaceholder) return selectedAnswerValues(value).join(", ");

  const labels = selectedAnswerValues(value)
    .map((item) => question.options.find((option) => option.value === item)?.label)
    .filter((label): label is string => Boolean(label));

  return labels.join(", ") || "Not answered";
}

function formatAcceptanceRate(rate: number | null | undefined) {
  if (rate == null) return "Not available";
  return `${(rate * 100).toFixed(1)}%`;
}

function FounderPortrait() {
  return (
    <div className={styles.cardFounderPhoto}>
      <Image
        alt="Jeffrey Zhang, founder of Pegasus Prep Education"
        height={64}
        src="/jeffrey.png"
        width={64}
      />
    </div>
  );
}

function AdvisorHeader({ message }: { message: string }) {
  return (
    <div className={styles.advisorHeader}>
      <FounderPortrait />
      <div className={styles.advisorDetails}>
        <p className={styles.advisorName}>Jeffrey Zhang</p>
        <blockquote className={styles.advisorProof}>{message}</blockquote>
      </div>
    </div>
  );
}

export function ApplyFunnel() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [textAnswerDrafts, setTextAnswerDrafts] = useState<Answers>({});
  const [activeInfoSlide, setActiveInfoSlide] = useState<InfoSlide | null>(null);
  const [showSchoolComparison, setShowSchoolComparison] = useState(false);
  const [showApplicationLevers, setShowApplicationLevers] = useState(false);
  const [preBookingQuestion, setPreBookingQuestion] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const questionActionsRef = useRef<HTMLDivElement>(null);
  const screenExitReasonRef = useRef<ScreenExitReason>("screen_changed");
  const question = QUESTIONS[step];
  const selected = question ? answers[question.key] : undefined;
  const selectedValues = selectedAnswerValues(selected);
  const canContinue = Boolean(selected) &&
    (!question?.maxSelections || selectedValues.length === question.maxSelections);
  const customSelectedValues = selectedValues.filter(
    (value) => !question?.suggestedAnswers?.some((answer) => answer.value === value),
  );
  const selectedSchoolProfiles = selectedValues.map((name) => ({
    logo: DREAM_SCHOOL_SUGGESTIONS.find((school) => school.value === name),
    name,
    profile: findSchoolProfile(name),
  }));
  const trackingScreen: ApplyScreen =
    phase === "intro"
      ? { id: "intro", name: "Assessment introduction", type: "intro", index: 0 }
      : phase === "processing"
        ? {
            id: "processing",
            name: "Reviewing assessment answers",
            type: "processing",
            index: QUESTIONS.length + 1,
          }
      : phase === "prebooking"
        ? {
            id: "prebooking_questions",
            name: "Questions before booking",
            type: "prebooking",
            index: QUESTIONS.length + 3,
            questionKey: "prebooking_question",
            questionLabel: "Any questions before booking?",
          }
      : phase === "booking"
        ? {
            id: "booking",
            name: "Schedule a private call",
            type: "booking",
            index: QUESTIONS.length + 4,
          }
      : phase === "complete"
        ? { id: "complete", name: "Qualified result", type: "complete", index: QUESTIONS.length + 2 }
        : showSchoolComparison
          ? {
              id: showApplicationLevers
                ? "info_dream_school_application_levers"
                : "info_dream_school_acceptance_rates",
              name: showApplicationLevers
                ? "Three application levers"
                : "Top-school acceptance rates",
              type: "info",
              index: step + 1.5,
              questionKey: question!.key,
              questionLabel: question!.prompt,
            }
        : activeInfoSlide
          ? {
              id: `info_${question!.key}_${activeInfoSlide.id}`,
              name: activeInfoSlide.title,
              type: "info",
              index: step + 1.5,
              questionKey: question!.key,
              questionLabel: question!.prompt,
            }
        : {
            id: `question_${question!.key}`,
            name: question!.prompt,
            type: "question",
            index: step + 1,
            questionKey: question!.key,
            questionLabel: question!.prompt,
          };

  useEffect(() => {
    if (phase !== "intro") headingRef.current?.focus();
  }, [activeInfoSlide, phase, showApplicationLevers, showSchoolComparison, step]);

  useEffect(() => {
    const startedAt = performance.now();
    let closed = false;

    posthog.capture(APPLY_FUNNEL_TRACKING.events.screenViewed, applyScreenProperties(trackingScreen));
    screenExitReasonRef.current = "screen_changed";

    const closeScreen = (exitReason: ScreenExitReason) => {
      if (closed) return;
      closed = true;
      posthog.capture(APPLY_FUNNEL_TRACKING.events.screenTimed, {
        ...applyScreenProperties(trackingScreen),
        duration_seconds: Number(((performance.now() - startedAt) / 1000).toFixed(2)),
        exit_reason: exitReason,
      });
    };

    const onPageHide = () => closeScreen("page_exit");
    window.addEventListener("pagehide", onPageHide, { once: true });

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      closeScreen(screenExitReasonRef.current);
    };
  }, [trackingScreen.id]);

  useEffect(() => {
    if (phase !== "processing") return;

    const timer = window.setTimeout(() => {
      posthog.capture(APPLY_FUNNEL_TRACKING.events.screenCompleted, {
        ...applyScreenProperties({
          id: "processing",
          name: "Reviewing assessment answers",
          type: "processing",
          index: QUESTIONS.length + 1,
        }),
      });
      screenExitReasonRef.current = "completed";
      setPhase("complete");
    }, 1250);

    return () => window.clearTimeout(timer);
  }, [phase]);

  const summary = useMemo(
    () => [
      {
        label: "Student stage",
        value: optionLabel(QUESTIONS[0], answers.student_stage),
      },
      {
        label: "Dream outcome",
        value: optionLabel(QUESTIONS[1], answers.dream_outcome),
      },
      {
        label: "Dream school",
        value: optionLabel(QUESTIONS[3], answers.dream_school),
      },
      {
        label: "College investment",
        value: optionLabel(QUESTIONS[4], answers.college_investment),
      },
    ],
    [answers],
  );

  const begin = () => {
    screenExitReasonRef.current = "completed";
    setActiveInfoSlide(null);
    setShowSchoolComparison(false);
    setShowApplicationLevers(false);
    setPreBookingQuestion("");
    setPhase("questions");
    setStep(0);
  };

  const scrollQuestionActionsIntoView = () => {
    window.requestAnimationFrame(() => {
      const actions = questionActionsRef.current;
      if (!actions) return;

      const bounds = actions.getBoundingClientRect();
      const isFullyVisible = bounds.top >= 0 && bounds.bottom <= window.innerHeight;

      if (!isFullyVisible) {
        actions.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });
  };

  const choose = (value: string) => {
    const nextValue = question.multiSelect
      ? selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value).join(MULTI_VALUE_SEPARATOR)
        : question.maxSelections && selectedValues.length >= question.maxSelections
          ? selected ?? value
          : [...selectedValues, value].join(MULTI_VALUE_SEPARATOR)
      : value;

    setAnswers((current) => ({ ...current, [question.key]: nextValue }));
    posthog.capture(APPLY_FUNNEL_TRACKING.events.answerRecorded, {
      ...applyScreenProperties(trackingScreen),
      answer_key: nextValue,
      answer_label: optionLabel(question, nextValue),
    });

    scrollQuestionActionsIntoView();
  };

  const chooseSuggestedAnswer = (value: string) => {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : question.maxSelections && selectedValues.length >= question.maxSelections
        ? selectedValues
        : [...selectedValues, value];
    const nextValue = nextValues.join(MULTI_VALUE_SEPARATOR);

    setAnswers((current) => ({ ...current, [question.key]: nextValue }));
    posthog.capture(APPLY_FUNNEL_TRACKING.events.answerRecorded, {
      ...applyScreenProperties(trackingScreen),
      answer_key: nextValue,
      answer_label: nextValues.join(", "),
    });

    scrollQuestionActionsIntoView();
  };

  const addTextAnswer = () => {
    const value = textAnswerDrafts[question.key]?.trim();
    if (!value || selectedValues.includes(value)) return;
    if (question.maxSelections && selectedValues.length >= question.maxSelections) return;

    const nextValues = [...selectedValues, value];
    const nextValue = nextValues.join(MULTI_VALUE_SEPARATOR);
    setAnswers((current) => ({ ...current, [question.key]: nextValue }));
    setTextAnswerDrafts((current) => ({ ...current, [question.key]: "" }));
    posthog.capture(APPLY_FUNNEL_TRACKING.events.answerRecorded, {
      ...applyScreenProperties(trackingScreen),
      answer_key: nextValue,
      answer_label: nextValues.join(", "),
    });
    scrollQuestionActionsIntoView();
  };

  const advanceFromCurrentQuestion = () => {
    if (step === QUESTIONS.length - 1) {
      posthog.capture(APPLY_FUNNEL_TRACKING.events.funnelCompleted, {
        funnel: APPLY_FUNNEL_TRACKING.funnel,
        funnel_version: APPLY_FUNNEL_TRACKING.version,
        total_steps: QUESTIONS.length,
      });
      setPhase("processing");
      return;
    }

    setStep((current) => current + 1);
  };

  const continueForward = () => {
    if (!question || !selected || !canContinue) return;

    posthog.capture(APPLY_FUNNEL_TRACKING.events.screenCompleted, {
      ...applyScreenProperties(trackingScreen),
      answer_key: selected,
      answer_label: optionLabel(question, selected),
    });
    screenExitReasonRef.current = "completed";

    const nextInfoSlide = question.infoSlidesByAnswer?.[selected];
    if (question.key === "dream_school") {
      setShowApplicationLevers(false);
      setShowSchoolComparison(true);
      return;
    }

    if (nextInfoSlide) {
      setActiveInfoSlide(nextInfoSlide);
      return;
    }

    advanceFromCurrentQuestion();
  };

  const continueFromInfoSlide = () => {
    posthog.capture(
      APPLY_FUNNEL_TRACKING.events.screenCompleted,
      applyScreenProperties(trackingScreen),
    );
    screenExitReasonRef.current = "completed";
    setActiveInfoSlide(null);
    advanceFromCurrentQuestion();
  };

  const continueFromSchoolComparison = () => {
    posthog.capture(
      APPLY_FUNNEL_TRACKING.events.screenCompleted,
      applyScreenProperties(trackingScreen),
    );
    screenExitReasonRef.current = "completed";

    if (!showApplicationLevers) {
      setShowApplicationLevers(true);
      return;
    }

    setShowApplicationLevers(false);
    setShowSchoolComparison(false);
    advanceFromCurrentQuestion();
  };

  const continueToPreBooking = () => {
    posthog.capture(
      APPLY_FUNNEL_TRACKING.events.screenCompleted,
      applyScreenProperties(trackingScreen),
    );
    screenExitReasonRef.current = "completed";
    setPhase("prebooking");
  };

  const continueToBooking = () => {
    const questionAnswer = preBookingQuestion.trim();
    posthog.capture(APPLY_FUNNEL_TRACKING.events.answerRecorded, {
      ...applyScreenProperties(trackingScreen),
      answer_key: questionAnswer || "no_question",
      answer_label: questionAnswer || "No question",
    });
    posthog.capture(
      APPLY_FUNNEL_TRACKING.events.screenCompleted,
      applyScreenProperties(trackingScreen),
    );
    screenExitReasonRef.current = "completed";
    setPhase("booking");
  };

  const recordBookingClick = () => {
    posthog.capture(
      APPLY_FUNNEL_TRACKING.events.screenCompleted,
      applyScreenProperties(trackingScreen),
    );
    posthog.capture("booking_link_clicked", {
      funnel: APPLY_FUNNEL_TRACKING.funnel,
      funnel_version: APPLY_FUNNEL_TRACKING.version,
      prebooking_question: preBookingQuestion.trim() || "no_question",
    });
    screenExitReasonRef.current = "completed";
  };

  const jumpToStep = (nextStep: number) => {
    screenExitReasonRef.current = "screen_changed";
    setActiveInfoSlide(null);
    setShowApplicationLevers(false);
    setShowSchoolComparison(false);
    setPreBookingQuestion("");
    setStep(nextStep);
    setPhase("questions");
  };

  const devNavigator = IS_DEVELOPMENT ? (
    <nav className={styles.devNavigator} aria-label="Development step navigation">
      <span className={styles.devLabel}>Dev</span>
      {QUESTIONS.map((item, index) => (
        <button
          aria-current={phase === "questions" && !activeInfoSlide && !showSchoolComparison && step === index ? "step" : undefined}
          className={`${styles.devStep} ${phase === "questions" && !activeInfoSlide && !showSchoolComparison && step === index ? styles.devStepActive : ""}`}
          key={item.key}
          onClick={() => jumpToStep(index)}
          title={item.prompt}
          type="button"
        >
          {index + 1}
        </button>
      ))}
    </nav>
  ) : null;

  return (
    <main className={styles.shell}>
      <div className={styles.stage}>
        {devNavigator}
        {phase === "intro" && (
          <section className={`${styles.card} ${styles.introCard}`} aria-labelledby="apply-intro-title">
            <AdvisorHeader message="I’ll help you turn uncertainty into a clear, practical admissions plan." />
            <h1 className={styles.displayTitle} id="apply-intro-title">
              Find the right path to your child&apos;s best-fit college.
            </h1>
            <p className={styles.introCopy}>
              Answer five focused questions so I can understand your goals, identify where
              support matters most, and recommend the right next step.
            </p>
            <button className={styles.primaryButton} type="button" onClick={begin}>
              Start the assessment
              <span aria-hidden="true">→</span>
            </button>
            <p className={styles.introDuration}>
              <span aria-hidden="true">◷</span>
              Takes about 3 minutes
            </p>
          </section>
        )}
        {phase === "intro" && (
          <div className={styles.introBrandSignature}>
            <BrandMark className={styles.introBrandMark} />
            <span>Pegasus Prep Education</span>
          </div>
        )}

        {phase === "questions" && activeInfoSlide && (
          <section
            className={`${styles.card} ${styles.infoSlideCard}`}
            aria-labelledby="apply-info-slide-title"
          >
            <div className={styles.infoSlidePhoto}>
              <Image
                alt={activeInfoSlide.imageAlt}
                height={220}
                src={activeInfoSlide.imageSrc}
                width={220}
              />
            </div>
            <h1
              className={styles.infoSlideTitle}
              id="apply-info-slide-title"
              ref={headingRef}
              tabIndex={-1}
            >
              {activeInfoSlide.title}
            </h1>
            <p className={styles.infoSlideCopy}>{activeInfoSlide.body}</p>
            <a
              className={styles.infoSlideSource}
              href={activeInfoSlide.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Source: {activeInfoSlide.sourceLabel}
            </a>
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={continueFromInfoSlide}>
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {phase === "questions" && showSchoolComparison && (
          <section
            className={`${styles.card} ${styles.schoolComparisonCard} ${showApplicationLevers ? styles.applicationLeversCard : ""}`}
            aria-labelledby="school-comparison-title"
          >
            <h1
              className={styles.schoolComparisonTitle}
              id="school-comparison-title"
              ref={headingRef}
              tabIndex={-1}
            >
              {showApplicationLevers
                ? "The three things colleges weigh most."
                : "Here’s how selective your top schools are."}
            </h1>
            {!showApplicationLevers && (
              <p className={styles.schoolComparisonIntro}>
                Overall undergraduate acceptance rates from the {SCHOOL_ADMISSIONS_YEAR_LABEL}—not
                a prediction of any individual student&apos;s result.
              </p>
            )}
            {showApplicationLevers ? (
              <div className={`${styles.schoolComparisonGrid} ${styles.applicationLeversGrid}`}>
                {APPLICATION_LEVERS.map((lever) => (
                  <article className={styles.applicationLeverCard} key={lever.title}>
                    <strong>{lever.metric}</strong>
                    <h2>{lever.title}</h2>
                    <span>{lever.action}</span>
                  </article>
                ))}
              </div>
            ) : (
              <>
                <div className={styles.schoolComparisonGrid}>
                  {selectedSchoolProfiles.map(({ logo, name, profile }) => (
                    <article className={styles.schoolRateCard} key={name}>
                      {logo ? (
                        <span className={styles.schoolRateLogo}>
                          <Image alt={logo.logoAlt} height={52} src={logo.logoSrc} width={52} />
                        </span>
                      ) : (
                        <span className={styles.schoolRateMonogram} aria-hidden="true">
                          {name.charAt(0)}
                        </span>
                      )}
                      <h2>{name}</h2>
                      <strong>{formatAcceptanceRate(profile?.acceptanceRate)}</strong>
                      <span>overall acceptance rate</span>
                    </article>
                  ))}
                </div>
              </>
            )}
            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={continueFromSchoolComparison}
              >
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {phase === "questions" && question && !activeInfoSlide && !showSchoolComparison && (
          <form
            className={styles.card}
            key={question.key}
            onSubmit={(event) => {
              event.preventDefault();
              continueForward();
            }}
          >
            <AdvisorHeader message={question.advisorMessage} />
            <fieldset className={styles.fieldset}>
              <legend className={styles.visuallyHidden}>{question.prompt}</legend>
              <div className={styles.questionHeading}>
                <h1 className={styles.questionTitle} ref={headingRef} tabIndex={-1}>
                  {question.prompt}
                </h1>
                <p className={styles.supporting}>{question.supporting}</p>
              </div>

              {question.textInputPlaceholder ? (
                <div className={styles.textAnswerGroup}>
                  <label className={styles.visuallyHidden} htmlFor={`${question.key}-answer`}>
                    Search for a school
                  </label>
                  <div className={styles.textAnswerRow}>
                    <input
                      aria-label={question.prompt}
                      className={styles.textAnswer}
                      id={`${question.key}-answer`}
                      list={question.searchableAnswers ? `${question.key}-options` : undefined}
                      name={question.key}
                      onChange={(event) =>
                        setTextAnswerDrafts((current) => ({
                          ...current,
                          [question.key]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        addTextAnswer();
                      }}
                      placeholder={question.textInputPlaceholder}
                      type="search"
                      value={textAnswerDrafts[question.key] ?? ""}
                    />
                    <button
                      className={styles.addTextAnswerButton}
                      disabled={
                        !textAnswerDrafts[question.key]?.trim() ||
                        Boolean(
                          question.maxSelections &&
                            selectedValues.length >= question.maxSelections,
                        )
                      }
                      onClick={addTextAnswer}
                      type="button"
                    >
                      Add school
                    </button>
                  </div>
                  {question.searchableAnswers && (
                    <datalist id={`${question.key}-options`}>
                      {question.searchableAnswers.map((answer) => (
                        <option key={answer} value={answer} />
                      ))}
                    </datalist>
                  )}
                  {customSelectedValues.length > 0 && (
                    <div className={styles.selectedAnswerList} aria-label="Selected dream schools">
                      {customSelectedValues.map((answer) => (
                        <button
                          className={styles.selectedAnswerChip}
                          key={answer}
                          onClick={() => chooseSuggestedAnswer(answer)}
                          type="button"
                        >
                          {answer}
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {question.suggestedAnswers && (
                    <div className={styles.answerSuggestions}>
                      <div className={styles.answerSuggestionGrid}>
                        {question.suggestedAnswers.map((answer) => {
                          const isSelected = selectedValues.includes(answer.value);
                          const isSelectionLimitReached = Boolean(
                            question.maxSelections &&
                              selectedValues.length >= question.maxSelections,
                          );

                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`${styles.answerSuggestion} ${isSelected ? styles.answerSuggestionSelected : ""}`}
                              disabled={!isSelected && isSelectionLimitReached}
                              key={answer.value}
                              onClick={() => chooseSuggestedAnswer(answer.value)}
                              type="button"
                            >
                              <span className={styles.answerSuggestionLogo}>
                                <Image
                                  alt={answer.logoAlt}
                                  height={40}
                                  src={answer.logoSrc}
                                  width={40}
                                />
                              </span>
                              <span>{answer.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`${styles.options} ${
                    question.columns === 2 ? styles.optionsTwoColumns : styles.optionsOneColumn
                  }`}
                >
                  {question.options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <label
                      className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                      key={option.value}
                    >
                      <input
                        className={styles.visuallyHidden}
                        type={question.multiSelect ? "checkbox" : "radio"}
                        name={question.key}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => choose(option.value)}
                      />
                      <span className={styles.optionBody}>
                        <span className={styles.optionIndicator} aria-hidden="true">
                          <span />
                        </span>
                        <span className={styles.optionCopy}>
                          <span className={styles.optionLabel}>{option.label}</span>
                        </span>
                      </span>
                    </label>
                  );
                  })}
                </div>
              )}
            </fieldset>

            <div
              className={`${styles.actions} ${styles.questionActions}`}
              ref={questionActionsRef}
            >
              <button className={styles.primaryButton} type="submit" disabled={!canContinue}>
                {step === QUESTIONS.length - 1 ? "See your next step" : "Continue"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        )}

        {phase === "complete" && (
          <section className={`${styles.card} ${styles.resultCard}`} aria-labelledby="apply-result-title">
            <AdvisorHeader message="Based on what you shared, a private strategy call is the right next step." />
            <div className={styles.resultIcon} aria-hidden="true">
              <span>✓</span>
            </div>
            <p className={styles.eyebrow}>You qualify</p>
            <h1 className={styles.displayTitle} id="apply-result-title" ref={headingRef} tabIndex={-1}>
              You&apos;re qualified to schedule a private call.
            </h1>
            <dl className={styles.summary}>
              {summary.map((item) => (
                <div className={styles.summaryRow} key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={continueToPreBooking}>
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {phase === "prebooking" && (
          <form
            aria-labelledby="apply-prebooking-title"
            className={`${styles.card} ${styles.resultCard}`}
            onSubmit={(event) => {
              event.preventDefault();
              continueToBooking();
            }}
          >
            <AdvisorHeader message="Ask anything that would help you feel prepared for our conversation." />
            <h1 className={styles.displayTitle} id="apply-prebooking-title" ref={headingRef} tabIndex={-1}>
              Any questions before booking?
            </h1>
            <label className={styles.visuallyHidden} htmlFor="prebooking-question">
              Your question
            </label>
            <textarea
              className={`${styles.textAnswer} ${styles.preBookingTextarea}`}
              id="prebooking-question"
              onChange={(event) => setPreBookingQuestion(event.target.value)}
              placeholder="Type your question (optional)"
              value={preBookingQuestion}
            />
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="submit">
                Continue to booking
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        )}

        {phase === "booking" && (
          <section className={`${styles.card} ${styles.resultCard}`} aria-labelledby="apply-booking-title">
            <AdvisorHeader message="Choose a time that works for your family, and we’ll take it from there." />
            <p className={styles.eyebrow}>Final step</p>
            <h1 className={styles.displayTitle} id="apply-booking-title" ref={headingRef} tabIndex={-1}>
              Book your private call.
            </h1>
            <div className={styles.actions}>
              <a
                className={styles.primaryLink}
                href="https://calendly.com/jeffrey-pegasusprep/discovery"
                onClick={recordBookingClick}
                rel="noreferrer"
                target="_blank"
              >
                Choose a time
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        )}

        {phase === "processing" && (
          <section
            aria-labelledby="apply-processing-title"
            aria-live="polite"
            className={`${styles.card} ${styles.processingCard}`}
          >
            <span className={styles.processingSpinner} aria-hidden="true" />
            <h1 id="apply-processing-title" ref={headingRef} tabIndex={-1}>
              Reviewing your answers…
            </h1>
          </section>
        )}
      </div>
    </main>
  );
}
