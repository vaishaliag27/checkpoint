/**
 * Results page — displays score, time taken, and topic accuracy chart.
 * Reads result data from a short-lived encrypted cookie set during submission.
 */

import { notFound } from "next/navigation";
import ResultChart from "@/components/ResultChart";
import { retakeAssessment } from "@/lib/actions";
import { getResult } from "@/lib/session";

interface ResultPageProps {
  params: Promise<{ resultId: string }>;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { resultId } = await params;
  const result = await getResult(resultId);

  if (!result) {
    notFound();
  }

  const pct = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12">
      <main className="mx-auto w-full max-w-2xl space-y-8">
        <header className="text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Assessment Complete</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">Your Results</h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 text-center shadow-lg shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Score</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">
              {result.score}
              <span className="text-lg font-normal text-zinc-400 dark:text-zinc-500">
                /{result.totalQuestions}
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 text-center shadow-lg shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Accuracy</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">{pct}%</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 text-center shadow-lg shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Time Taken</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
              {formatElapsed(result.timeTakenSeconds)}
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white/80 p-6 shadow-lg shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Accuracy by Topic
          </h2>
          <ResultChart topicScores={result.topicScores} />
        </section>

        <form action={retakeAssessment} className="flex justify-center pt-2">
          <button
            type="submit"
            className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
          >
            Retake Assessment
          </button>
        </form>
      </main>
    </div>
  );
}
