/**
 * Renders a single assessment question with selectable options.
 * Supports multiple-choice (single) and multi-select question types.
 */

"use client";

import type { Answer, ClientQuestion } from "@/types/assessment";

interface QuestionCardProps {
  question: ClientQuestion;
  selected: Answer | undefined;
  onSelect: (answer: Answer) => void;
  disabled?: boolean;
}

function isSelected(
  option: string,
  selected: Answer | undefined,
  type: ClientQuestion["type"]
): boolean {
  if (selected === undefined) return false;
  if (type === "multi-select" && Array.isArray(selected)) {
    return selected.includes(option);
  }
  return selected === option;
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  const handleOptionClick = (option: string) => {
    if (disabled) return;

    if (question.type === "multi-select") {
      const current = Array.isArray(selected) ? selected : [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      onSelect(next);
    } else {
      onSelect(option);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div>
        <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
          {question.topic}
        </span>
        <h2 className="mt-2.5 text-sm font-semibold leading-snug text-zinc-900 dark:text-white sm:text-base">
          {question.prompt}
        </h2>
        {question.type === "multi-select" && (
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Select all that apply</p>
        )}
      </div>

      <ul className="scrollbar-hidden mt-4 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {question.options.map((option) => {
          const active = isSelected(option, selected, question.type);
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => handleOptionClick(option)}
                disabled={disabled}
                className={`w-full rounded-lg border px-3.5 py-2 text-left text-xs transition-colors sm:text-sm ${
                  active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-100"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-indigo-400/60 dark:hover:bg-white/10"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                      question.type === "multi-select" ? "rounded-sm" : "rounded-full"
                    } border-2 ${
                      active
                        ? "border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400"
                        : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
                    }`}
                  >
                    {active && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {option}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
