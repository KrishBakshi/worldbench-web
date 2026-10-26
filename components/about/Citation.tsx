import ReferenceLinks from "@/components/ReferenceLinks";
import { BIBTEX } from "@/lib/links";

/**
 * About page citation block: the BibTeX as a plain, selectable code block,
 * with the same reference row as the home page underneath it.
 */
export default function Citation() {
  return (
    <div className="not-prose my-4">
      <pre className="overflow-x-auto rounded-lg border border-line bg-void-deep/60 p-4 font-mono text-xs leading-relaxed text-mist-bright">
        {BIBTEX}
      </pre>
      <ReferenceLinks className="mt-3 justify-start -ml-2.5" />
    </div>
  );
}
