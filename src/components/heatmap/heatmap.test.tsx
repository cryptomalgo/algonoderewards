import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Heatmap from "./heatmap";
import { MinimalBlock } from "@/lib/block-types";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({ currency: "USD" }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("Heatmap with MinimalBlock data", () => {
  const createTestBlocks = (): MinimalBlock[] => {
    const now = Date.now() / 1000;
    const blocks: MinimalBlock[] = [];

    // Create blocks for the last 3 months
    for (let i = 0; i < 90; i++) {
      const daysAgo = i;
      const timestamp = now - daysAgo * 86400;

      // Add 1-3 blocks per day with varying rewards
      for (let j = 0; j < (i % 3) + 1; j++) {
        blocks.push({
          round: 46512900 + i * 100 + j,
          timestamp: Math.floor(timestamp + j * 3600),
          proposer:
            "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU",
          proposerPayout: 1000000 + (i % 5) * 100000,
        });
      }
    }

    return blocks;
  };

  it("should render without crashing with MinimalBlock data", () => {
    const blocks = createTestBlocks();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Heatmap blocks={blocks} />
        </ThemeProvider>
      </QueryClientProvider>,
    );

    expect(container).toBeTruthy();
  });

  it("should handle empty blocks array", () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Heatmap blocks={[]} />
        </ThemeProvider>
      </QueryClientProvider>,
    );

    expect(container).toBeTruthy();
  });

  it("should process MinimalBlock proposer field correctly", () => {
    const blocks: MinimalBlock[] = [
      {
        round: 46512900,
        timestamp: Math.floor(Date.now() / 1000 - 86400),
        proposer: "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU",
        proposerPayout: 1000000,
      },
      {
        round: 46512950,
        timestamp: Math.floor(Date.now() / 1000 - 86400),
        proposer: "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU",
        proposerPayout: 2000000,
      },
    ];

    // Should not throw with proposer as address string
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Heatmap blocks={blocks} />
        </ThemeProvider>
      </QueryClientProvider>,
    );
    expect(container).toBeTruthy();
  });
});
