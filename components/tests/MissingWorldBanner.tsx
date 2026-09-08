/**
 * Shown in place of the island iframe when a test folder has meta but no
 * world.html. Loading the missing file as a frame would 404 through the App
 * Router and render the whole site inside the panel — so we never point an
 * iframe at a path that isn't there.
 */
export default function MissingWorldBanner() {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <p className="font-display text-4xl tracking-[0.12em] text-mist-bright">
        404
      </p>
      <p className="text-xs uppercase tracking-[0.15em] text-mist">
        Oops! The experiment file is not found.
      </p>
    </div>
  );
}
