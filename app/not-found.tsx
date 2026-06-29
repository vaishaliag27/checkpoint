/**
 * Global not-found page — shown for invalid or expired result IDs
 * and any other unmatched routes.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Not Found</h1>
      <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-300">
        This result may have expired or the link is invalid. Results are kept
        for one hour and are not stored permanently.
      </p>
      <Link
        href="/"
        className="mt-8 cursor-pointer rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
