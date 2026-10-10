import Link from "next/link";
import TestGrid from "@/components/tests/TestGrid";

export default function TestsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="mb-6 flex justify-end">
        <Link href="/leaderboard" className="text-sm text-mist hover:text-mist-bright">
          Leaderboard &rarr;
        </Link>
      </div>
      <TestGrid />
    </section>
  );
}
