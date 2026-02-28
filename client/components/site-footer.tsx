export function SiteFooter() {
  return (
    <footer className="mt-20 bg-[var(--color-footer)] text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_repeat(3,0.8fr)] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] font-[family-name:var(--font-display)] text-sm font-semibold">
              QH
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
              QuickHire
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
            QuickHire helps fast-moving teams publish openings, reach quality
            candidates, and manage hiring from a focused job board experience.
          </p>
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
            About
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li>Companies</li>
            <li>Pricing</li>
            <li>Terms</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
            Resources
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li>Help Docs</li>
            <li>Guides</li>
            <li>Contact Us</li>
            <li>Newsletter</li>
          </ul>
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
            Get notifications
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/65">
            Subscribe for hiring updates and newly posted roles.
          </p>
          <div className="mt-5 flex gap-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            />
            <button
              type="button"
              className="rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 text-sm text-white/45 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>2026 QuickHire. All rights reserved.</p>
          <p>Built for the QuickHire hiring challenge.</p>
        </div>
      </div>
    </footer>
  );
}
