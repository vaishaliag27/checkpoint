/**
 * Landing page — introduces Checkpoint and starts a new assessment session.
 */

import { startAssessment } from "@/lib/actions";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <main className="w-full max-w-xl rounded-3xl border border-black/5 bg-white/75 p-8 text-center shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 sm:p-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
          Timed Assessment
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
          Checkpoint
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          A 15-question timed assessment covering Logic, Math, and Verbal
          reasoning. You have 30 seconds per question — progress is saved
          automatically if you refresh.
        </p>

        <ul className="mt-8 space-y-2 text-left text-sm text-zinc-500 dark:text-zinc-400">
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> 15 mixed-format questions
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> 30-second timer per question
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> Resume after refresh
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> Topic breakdown on completion
          </li>
        </ul>

        <form action={startAssessment} className="mt-10">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-indigo-600 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            Start Assessment
          </button>
        </form>
      </main>
    </div>
  );
}
