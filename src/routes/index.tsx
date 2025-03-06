import { createFileRoute } from "@tanstack/react-router";
import SearchBar from "../components/search-bar.tsx";
import StakingCta from "@/components/staking-cta.tsx";

import { motion } from "motion/react";
import CoinsSpread from "@/components/coins-spread.tsx";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="relative p-6 text-center">
            <CoinsSpread />

            <motion.h1
              initial={{ opacity: 0.01 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.4,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
              }}
              className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl"
            >
              Cool stats for your Algorand staking rewards
            </motion.h1>
            <motion.p
              initial={{ opacity: 0.01 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
              }}
              className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8"
            >
              Get your total node rewards and identify peak performance periods
              with our detailed rewards heatmap
            </motion.p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SearchBar />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
      <StakingCta />
    </>
  );
}
