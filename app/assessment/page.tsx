/**
 * Assessment page — Server Component that loads questions (without answers)
 * and resumes progress from the encrypted cookie on refresh.
 */

import { redirect } from "next/navigation";
import AssessmentClient from "@/components/AssessmentClient";
import { getAssessmentState } from "@/lib/actions";
import { getClientQuestions } from "@/lib/questionBank";

export default async function AssessmentPage() {
  // Artificial delay to demonstrate loading.tsx — in production this would be
  // a real data fetch (e.g. loading questions from a CMS or API).
  await new Promise((resolve) => setTimeout(resolve, 600));

  const state = await getAssessmentState();
  if (!state) {
    redirect("/");
  }

  const questions = getClientQuestions();

  return (
    <div className="flex min-h-dvh flex-1 flex-col px-4 py-4 sm:py-8">
      <AssessmentClient
        questions={questions}
        initialProgress={state.progress}
      />
    </div>
  );
}
