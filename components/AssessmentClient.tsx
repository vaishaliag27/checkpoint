/**
 * Client-side assessment runner — orchestrates timer, questions, and
 * Server Action calls for saving progress and submitting answers.
 */

"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { saveProgress, submitAssessment } from "@/lib/actions";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import type { Answer, ClientQuestion, SessionProgress } from "@/types/assessment";

interface AssessmentClientProps {
  questions: ClientQuestion[];
  initialProgress: SessionProgress;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AssessmentClient({
  questions,
  initialProgress,
}: AssessmentClientProps) {
  const [currentIndex, setCurrentIndex] = useState(initialProgress.currentIndex);
  const [selected, setSelected] = useState<Answer | undefined>(
    () => initialProgress.answers[questions[initialProgress.currentIndex]?.id]
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(
    initialProgress.totalElapsedSeconds
  );
  const [isPending, startTransition] = useTransition();
  const advancingRef = useRef(false);
  const elapsedRef = useRef(initialProgress.totalElapsedSeconds);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    const tick = () => {
      setElapsedSeconds(
        Math.floor((Date.now() - initialProgress.startedAt) / 1000)
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [initialProgress.startedAt]);

  useEffect(() => {
    advancingRef.current = false;
  }, [currentIndex]);

  const getAnswer = useCallback((): Answer => {
    if (selected !== undefined) return selected;
    return question?.type === "multi-select" ? [] : "";
  }, [selected, question?.type]);

  const advance = useCallback(() => {
    if (advancingRef.current || !question) return;
    advancingRef.current = true;

    const answer = getAnswer();

    startTransition(async () => {
      if (isLast) {
        await submitAssessment(question.id, answer, elapsedRef.current);
      } else {
        await saveProgress(
          question.id,
          answer,
          currentIndex,
          elapsedRef.current
        );
        setCurrentIndex((i) => i + 1);
        setSelected(undefined);
        advancingRef.current = false;
      }
    });
  }, [question, getAnswer, isLast, currentIndex]);

  const handleTimeout = useCallback(() => {
    advance();
  }, [advance]);

  if (!question) return null;

  return (
    <div className="mx-auto flex h-full max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 sm:max-h-[calc(100dvh-4rem)] sm:p-8">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Checkpoint</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Overall time</p>
          <p className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
            {formatElapsed(elapsedSeconds)}
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <p className="mb-1 text-xs text-zinc-400 dark:text-zinc-500">Question timer</p>
          <Timer
            key={question.id}
            questionKey={question.id}
            onTimeout={handleTimeout}
            paused={isPending}
          />
        </div>
      </header>

      <div className="min-h-0 flex flex-1 flex-col py-6">
        <div className="space-y-8">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
        <div className="mt-8 min-h-0 flex flex-1 flex-col">
          <QuestionCard
            question={question}
            selected={selected}
            onSelect={setSelected}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-white/10">
        <button
          type="button"
          onClick={advance}
          disabled={isPending}
          className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
