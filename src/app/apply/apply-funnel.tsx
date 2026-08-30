"use client";

import Image from "next/image";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button, ButtonLink } from "@/components/ui/primitives";
import {
  APPLY_FUNNEL_ANSWER_OPTIONS,
  APPLY_FUNNEL_QUESTION_LABELS,
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

type SuggestedAnswer = {
  label: string;
  logoAlt: string;
  logoSrc: string;
  value: string;
};

type Question = {
  key: string;
  columns: 1 | 2;
  maxSelections?: number;
  multiSelect?: boolean;
  searchableAnswers?: readonly string[];
  suggestedAnswers?: readonly SuggestedAnswer[];
  textInputPlaceholder?: string;
  prompt: string;
  supporting: string;
  options: readonly Option[];
};

const DREAM_SCHOOL_SUGGESTION_ASSETS = {
  "Harvard University": {
    logoAlt: "Harvard University logo",
    logoSrc: "/logos/harvard_mark.png",
  },
  "Stanford University": {
    logoAlt: "Stanford University logo",
    logoSrc: "/logos/stanford_cropped.png",
  },
  "University of Pennsylvania": {
    logoAlt: "University of Pennsylvania logo",
    logoSrc: "/logos/penn_shield.png",
  },
  "Brown University": {
    logoAlt: "Brown University logo",
    logoSrc: "/logos/brown_shield.png",
  },
  "Dartmouth College": {
    logoAlt: "Dartmouth College logo",
    logoSrc: "/logos/dartmouth_coa.png",
  },
  "New York University": {
    logoAlt: "New York University logo",
    logoSrc: "/logos/nyu_torch.png",
  },
  "University of Michigan": {
    logoAlt: "University of Michigan logo",
    logoSrc: "/logos/michigan_seal.png",
  },
  "Cooper Union": {
    logoAlt: "Cooper Union logo",
    logoSrc: "/logos/cooper.png",
  },
} as const;

const DREAM_SCHOOL_SUGGESTIONS = APPLY_FUNNEL_ANSWER_OPTIONS.dream_school.map((answer) => ({
  ...answer,
  ...DREAM_SCHOOL_SUGGESTION_ASSETS[answer.value],
})) satisfies SuggestedAnswer[];

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

const QUESTIONS: Question[] = [
  {
    key: "student_stage",
    columns: 2,
    prompt: APPLY_FUNNEL_QUESTION_LABELS.student_stage,
    supporting: "Choose the stage that best matches where they are today.",
    options: APPLY_FUNNEL_ANSWER_OPTIONS.student_stage,
  },
  {
    key: "dream_outcome",
    columns: 1,
    prompt: APPLY_FUNNEL_QUESTION_LABELS.dream_outcome,
    supporting: "Choose the outcome that matters most to your family.",
    options: APPLY_FUNNEL_ANSWER_OPTIONS.dream_outcome,
  },
  {
    key: "priority",
    columns: 2,
    multiSelect: true,
    prompt: APPLY_FUNNEL_QUESTION_LABELS.priority,
    supporting: "Select all that apply.",
    options: APPLY_FUNNEL_ANSWER_OPTIONS.priority,
  },
  {
    key: "dream_school",
    columns: 1,
    maxSelections: 3,
    multiSelect: true,
    searchableAnswers: SCHOOL_SEARCH_OPTIONS,
    suggestedAnswers: DREAM_SCHOOL_SUGGESTIONS,
    textInputPlaceholder: "Search or type a school",
    prompt: APPLY_FUNNEL_QUESTION_LABELS.dream_school,
    supporting: "Search for a school or choose from the options below.",
    options: [],
  },
  {
    key: "college_investment",
    columns: 2,
    prompt: APPLY_FUNNEL_QUESTION_LABELS.college_investment,
    supporting: "Consider the total cost of attendance, including tuition, housing, and other expenses.",
    options: APPLY_FUNNEL_ANSWER_OPTIONS.college_investment,
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

export function ApplyFunnel() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [textAnswerDrafts, setTextAnswerDrafts] = useState<Answers>({});
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
  }, [phase, showApplicationLevers, showSchoolComparison, step]);

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

    if (question.key === "dream_school") {
      setShowApplicationLevers(false);
      setShowSchoolComparison(true);
      return;
    }

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
          aria-current={phase === "questions" && !showSchoolComparison && step === index ? "step" : undefined}
          className={`${styles.devStep} ${phase === "questions" && !showSchoolComparison && step === index ? styles.devStepActive : ""}`}
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
            <h1 className={`${styles.displayTitle} ds-display ds-display--md`} id="apply-intro-title">
              Find the right path to your child&apos;s{" "}
              <em className={`${styles.emphasis} ds-emphasis`}>best-fit college.</em>
            </h1>
            <p className={`${styles.introCopy} ds-body`}>
              Answer five focused questions so I can understand your goals, identify where
              support matters most, and recommend the right next step.
            </p>
            <Button className={styles.primaryButton} size="large" onClick={begin}>
              Start the assessment
              <span aria-hidden="true">→</span>
            </Button>
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

        {phase === "questions" && showSchoolComparison && (
          <section
            className={`${styles.card} ${styles.schoolComparisonCard} ${showApplicationLevers ? styles.applicationLeversCard : ""}`}
            aria-labelledby="school-comparison-title"
          >
            <h1
              className={`${styles.schoolComparisonTitle} ds-display ds-display--md`}
              id="school-comparison-title"
              ref={headingRef}
              tabIndex={-1}
            >
              {showApplicationLevers
                ? "The three things colleges weigh most."
                : "Here’s how selective your top schools are."}
            </h1>
            {!showApplicationLevers && (
              <p className={`${styles.schoolComparisonIntro} ds-body`}>
                Overall undergraduate acceptance rates from the {SCHOOL_ADMISSIONS_YEAR_LABEL}—not
                a prediction of any individual student&apos;s result.
              </p>
            )}
            {showApplicationLevers ? (
              <div className={`${styles.schoolComparisonGrid} ${styles.applicationLeversGrid}`}>
                {APPLICATION_LEVERS.map((lever) => (
                  <article className={styles.applicationLeverCard} key={lever.title}>
                    <strong>{lever.metric}</strong>
                    <h2 className="ds-heading ds-heading--sm">{lever.title}</h2>
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
                      <h2 className="ds-heading ds-heading--sm">{name}</h2>
                      <strong>{formatAcceptanceRate(profile?.acceptanceRate)}</strong>
                      <span>overall acceptance rate</span>
                    </article>
                  ))}
                </div>
              </>
            )}
            <div className={styles.actions}>
              <Button
                className={styles.primaryButton}
                onClick={continueFromSchoolComparison}
              >
                Continue
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </section>
        )}

        {phase === "questions" && question && !showSchoolComparison && (
          <form
            className={styles.card}
            key={question.key}
            onSubmit={(event) => {
              event.preventDefault();
              continueForward();
            }}
          >
            <fieldset className={styles.fieldset}>
              <legend className={styles.visuallyHidden}>{question.prompt}</legend>
              <div className={styles.questionHeading}>
                <h1 className={`${styles.questionTitle} ds-display ds-display--md`} ref={headingRef} tabIndex={-1}>
                  {question.prompt}
                </h1>
                <p className={`${styles.supporting} ds-body`}>{question.supporting}</p>
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
                    <Button
                      className={styles.addTextAnswerButton}
                      disabled={
                        !textAnswerDrafts[question.key]?.trim() ||
                        Boolean(
                          question.maxSelections &&
                            selectedValues.length >= question.maxSelections,
                        )
                      }
                      onClick={addTextAnswer}
                      size="compact"
                    >
                      Add school
                    </Button>
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
              <Button className={styles.primaryButton} type="submit" disabled={!canContinue}>
                {step === QUESTIONS.length - 1 ? "See your next step" : "Continue"}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </form>
        )}

        {phase === "complete" && (
          <section className={`${styles.card} ${styles.resultCard}`} aria-labelledby="apply-result-title">
            <div className={styles.resultIcon} aria-hidden="true">
              <span>✓</span>
            </div>
            <p className={styles.eyebrow}>You qualify</p>
            <h1 className={`${styles.displayTitle} ds-display ds-display--md`} id="apply-result-title" ref={headingRef} tabIndex={-1}>
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
              <Button className={styles.primaryButton} onClick={continueToPreBooking}>
                Continue
                <span aria-hidden="true">→</span>
              </Button>
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
            <h1 className={`${styles.displayTitle} ds-display ds-display--md`} id="apply-prebooking-title" ref={headingRef} tabIndex={-1}>
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
              <Button className={styles.primaryButton} type="submit">
                Continue to booking
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </form>
        )}

        {phase === "booking" && (
          <section className={`${styles.card} ${styles.resultCard}`} aria-labelledby="apply-booking-title">
            <p className={styles.eyebrow}>Final step</p>
            <h1 className={`${styles.displayTitle} ds-display ds-display--md`} id="apply-booking-title" ref={headingRef} tabIndex={-1}>
              Book your private call.
            </h1>
            <div className={styles.actions}>
              <ButtonLink
                className={styles.primaryLink}
                href="https://calendly.com/jeffrey-pegasusprep/discovery"
                onClick={recordBookingClick}
                rel="noreferrer"
                target="_blank"
              >
                Choose a time
                <span aria-hidden="true">↗</span>
              </ButtonLink>
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
            <h1 className="ds-display ds-display--md" id="apply-processing-title" ref={headingRef} tabIndex={-1}>
              Reviewing your answers…
            </h1>
          </section>
        )}
      </div>
    </main>
  );
}
