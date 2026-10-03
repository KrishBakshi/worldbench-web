import type { Metadata } from "next";
import Link from "next/link";
import Leaderboard from "@/components/results/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Every model's worldbench score, overall and test by test.",
};

export default function LeaderboardPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <Link href="/tests" className="text-sm text-mist hover:text-mist-bright">
        &larr; Back
      </Link>
      <h1 className="mt-6 font-display text-2xl text-mist-bright">Leaderboard</h1>
      <p className="mt-1 text-sm text-mist">
        Every model&rsquo;s score, overall and test by test. Open a model for its full breakdown.
      </p>
      <Leaderboard />
    </section>
  );
}
