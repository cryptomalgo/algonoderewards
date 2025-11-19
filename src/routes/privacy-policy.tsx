import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-4xl py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-gray-900 sm:text-6xl dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last Updated: November 19, 2025 (
            <a
              href="https://github.com/cryptomalgo/algonoderewards/commits/main/src/routes/privacy-policy.tsx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline dark:text-blue-400"
            >
              View History
            </a>
            )
          </p>
        </div>

        <div className="mt-12 space-y-12 text-left">
          {/* Overview */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Overview
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                AlgoNodeRewards is an open-source, frontend-only web application
                that displays statistics and analytics for Algorand node
                rewards. I am committed to protecting your privacy and being
                transparent about any data processing that occurs when you use
                this website.
              </p>
            </div>
          </section>

          {/* Your Consent */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Your Consent
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                By using this website, you agree to this Privacy Policy. If you
                do not agree with this policy, please do not use the site.
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                If I make material changes to this policy, I will update the
                "Last Updated" date above. Your continued use of the site after
                any changes constitutes your acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Local Data Storage (IndexedDB) */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Local Data Storage (IndexedDB)
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                This website offers an <strong>opt-in</strong> caching feature
                that uses IndexedDB, a browser storage technology. By default,
                this caching is <strong>disabled</strong> and must be manually
                enabled by you.
              </p>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                What is IndexedDB?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                IndexedDB is a low-level API for client-side storage of
                structured data in your web browser. It allows the website to
                store data locally on your device, which can improve performance
                and reduce API requests.
              </p>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                What Data is Cached?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                When you enable caching, the following public blockchain data is
                stored locally in your browser:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>Block numbers (rounds)</li>
                <li>Block timestamps</li>
                <li>Block proposer addresses (Algorand wallet addresses)</li>
                <li>Block proposer payouts (reward amounts)</li>
              </ul>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                This data is retrieved from the public Algorand blockchain via
                the Nodely API. No personal information or private data is
                cached.
              </p>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                How to Enable/Disable Caching
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Caching is <strong>disabled by default</strong>. To enable it:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  Open the cache management dialog via the settings button
                </li>
                <li>Toggle the "Enable caching" option</li>
                <li>
                  You can view cached addresses, their sizes, and clear the
                  cache at any time
                </li>
              </ul>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Data Control
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You have full control over this cached data:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  The data is stored only on your device and never sent to any
                  server
                </li>
                <li>You can disable caching at any time</li>
                <li>You can delete cached data for specific addresses</li>
                <li>You can clear all cached data with one click</li>
                <li>
                  You can also clear browser data through your browser settings
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Information I Collect
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                Information You Provide
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                I do not collect, store, or process any personal information
                directly. You are not required to create an account or provide
                any personal data to use this service.
              </p>

              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                Automatically Collected Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                When you visit this website, certain technical information is
                automatically collected by the hosting provider,
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  className="ml-1 underline-offset-2 hover:underline"
                >
                  Cloudflare
                </a>
                : page views and visits, performance metrics, device type
                (desktop/mobile/tablet), country/region, browser type, and
                referrer information. This data is aggregated and does not
                personally identify you. Cloudflare does not use cookies for
                these basic analytics.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Third-Party Services
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nodely API
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>Retrieves public blockchain data only</li>
                <li>Does not transmit any personal information from you</li>
                <li>Does not require authentication or identification</li>
              </ul>

              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                Binance API
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                I use the Binance public API to retrieve real-time USD exchange
                rates for Algorand. This connection does not transmit any
                personal information.
              </p>

              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                NFD API
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                I use the NFD API (
                <a
                  href="https://api-docs.nf.domains/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline dark:text-blue-400"
                >
                  https://api-docs.nf.domains/
                </a>
                ) to convert .algo addresses to wallet addresses. This API does
                not transmit any personal information from you.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Hosting Infrastructure
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                This website is hosted on Cloudflare Pages. According to
                Cloudflare's privacy practices:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  Cloudflare processes technical data (IP addresses, request
                  logs) as necessary to provide hosting and security services
                </li>
                <li>Cloudflare does not sell or rent personal information</li>
                <li>
                  Data is processed in accordance with Cloudflare's Privacy
                  Policy, available at
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:underline dark:text-blue-400"
                  >
                    https://www.cloudflare.com/privacypolicy/
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Important: I have not enabled Real User Monitoring (RUM) on the
                Cloudflare Pages deployment, which means no enhanced tracking or
                analytics beacon is injected into the website.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Cookies
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                This website does not set cookies for tracking or analytics
                purposes. However, some third-party providers used by this site
                (for example, Binance or other embedded services) may set their
                own cookies according to their policies. I do not control these
                cookies. Please refer to the respective provider's privacy
                policy for details.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Data Retention
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                I do not store any user data. Any analytics data collected by
                Cloudflare is retained according to their retention policies and
                is not under my direct control.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Your Rights
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                Since I do not collect or store personal information directly,
                there is no personal data for you to access, modify, or delete
                from my systems. For information about data processed by
                Cloudflare, please refer to Cloudflare's Privacy Policy and
                their data subject rights procedures.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Changes to This Privacy Policy
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                I may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated "Last Updated" date.
                I encourage you to review this policy periodically.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Open Source
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                This project is open source and available on GitHub at
                <a
                  href="https://github.com/cryptomalgo/algonoderewards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-500 hover:underline dark:text-blue-400"
                >
                  https://github.com/cryptomalgo/algonoderewards
                </a>
                . You can review the code to verify these privacy practices.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Contact
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                If you have any questions about this Privacy Policy, or this
                project, please reach out on X (Twitter) at
                <a
                  href="https://x.com/cryptomalgo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-500 hover:underline dark:text-blue-400"
                >
                  @cryptomalgo
                </a>
                , or via Discord
                <a
                  href="https://discord.com/users/1347256298651259016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-500 hover:underline dark:text-blue-400"
                >
                  @cryptomalgo
                </a>
                . <br />
                Alternatively, you can open an issue on the
                <a
                  href="https://github.com/cryptomalgo/algonoderewards/issues"
                  target="_blank"
                  className="ml-1 text-blue-500 hover:underline dark:text-blue-400"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
          </section>
          <section>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Changelog
            </h3>
            <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                <strong>November 19, 2025:</strong> Added section on local data
                storage (IndexedDB) caching mechanism, clarifying that caching
                is disabled by default and requires opt-in
              </li>
              <li>
                <strong>October 17, 2025:</strong> Initial privacy policy
                published
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
