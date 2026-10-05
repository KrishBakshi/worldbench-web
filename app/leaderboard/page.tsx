import type { Metadata } from "next";
import Leaderboard from "@/components/results/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Every model's worldbench score, overall and test by test.",
};

export default function LeaderboardPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <h1 className="font-display text-2xl text-mist-bright">Leaderboard</h1>
      <p className="mt-1 text-sm text-mist">
        Every model&rsquo;s score, overall and test by test. Open a model for its full breakdown.
      </p>
      <Leaderboard />
    </section>
  );
}
