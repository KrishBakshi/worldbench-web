import GravityStarsBackground from "@/components/backgrounds/GravityStarsBackground";
import HomeIsland from "@/components/HomeIsland";
import ExploreEvaluationsButton from "@/components/ExploreEvaluationsButton";
import ReferenceLinks from "@/components/ReferenceLinks";
import RevealText from "@/components/RevealText";
import RevealFade from "@/components/RevealFade";

export default function HomePage() {
  return (
    <>
      {/* Fixed to the viewport so the starfield sits behind the header and the
          recent-tests row, not just the hero. */}
      <GravityStarsBackground className="fixed inset-0 z-0" mouseGravity="repel" />
      <div className="relative z-10 flex h-full flex-col">
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-28 sm:pb-6">
          {/* Eyebrow: what kind of thing this is, before the name says which. */}
          <RevealText
            as="p"
            animation="blurIn"
            startOnView={false}
            delay={0.05}
            className="text-center font-display text-[10px] uppercase tracking-[0.4em] text-mist sm:text-xs"
          >
            A benchmark for 3D world generation
          </RevealText>

          {/* Layered hero: the name sits behind the floating island, so the
              mountain rises into the wordmark. "World" in ink, "Bench" in the
              paper's accent blue; the two halves land a beat apart. */}
          <div className="relative mt-3 aspect-[4/3] w-full max-w-4xl sm:mt-4 sm:aspect-auto sm:h-[46vh]">
            {/* The name animates in character-by-character (MagicUI
                TextAnimate), but only on the first load — RevealText renders it
                statically on a client-side return (see useHeroReveal). */}
            <h1 className="absolute inset-x-0 top-0 z-0 flex items-baseline justify-center font-display text-[15vw] leading-[0.85] font-bold tracking-[-0.045em] sm:text-8xl md:text-9xl lg:text-[min(10rem,17vh)]">
              <RevealText
                as="span"
                by="character"
                animation="blurInUp"
                startOnView={false}
                delay={0.15}
                className="text-mist-bright"
              >
                World
              </RevealText>
              <RevealText
                as="span"
                by="character"
                animation="blurInUp"
                startOnView={false}
                delay={0.35}
                className="text-glow"
              >
                Bench
              </RevealText>
            </h1>

            <HomeIsland />
          </div>

          {/* The paper's subtitle as the tagline: says plainly what is
              measured. Blurs in a beat after the name settles — first load
              only, via RevealText. */}
          <RevealText
            as="p"
            animation="blurIn"
            startOnView={false}
            delay={1.05}
            className="mt-20 max-w-md text-center text-sm text-mist sm:mt-[9vh] sm:text-base"
          >
            Evaluating LLMs on Three.js voxel world generation
          </RevealText>

          {/* The CTA, then the quiet reference row beneath it, fade up last. */}
          <RevealFade className="mt-6 flex flex-col items-center gap-5" delay={1.35}>
            <ExploreEvaluationsButton />
            <ReferenceLinks />
          </RevealFade>
        </section>
      </div>
    </>
  );
}
