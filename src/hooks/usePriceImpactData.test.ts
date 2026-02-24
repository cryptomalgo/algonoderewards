import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePriceImpactData } from "./usePriceImpactData";
import { MinimalBlock } from "@/lib/block-types";
import { useAlgoPrice } from "@/hooks/queries/useAlgoPrice";
import { getAlgoUsdPrice } from "@/utils/algoPrice";
import { generateDateRange } from "@/lib/date-utils";

vi.mock("@/hooks/queries/useAlgoPrice", () => ({
  useAlgoPrice: vi.fn(),
}));

vi.mock("@/utils/algoPrice", () => ({
  getAlgoUsdPrice: vi.fn(),
}));

vi.mock("@/lib/date-utils", () => ({
  generateDateRange: vi.fn(),
}));

const mockUseAlgoPrice = vi.mocked(useAlgoPrice);
const mockGetAlgoUsdPrice = vi.mocked(getAlgoUsdPrice);
const mockGenerateDateRange = vi.mocked(generateDateRange);

function createMockBlock(timestampIso: string, proposerPayout: number): MinimalBlock {
  return {
    round: 1,
    timestamp: Math.floor(new Date(timestampIso).getTime() / 1000),
    proposer: "TESTADDR",
    proposerPayout,
  };
}

describe("usePriceImpactData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAlgoPrice.mockReturnValue({
      data: 0.1,
      isLoading: false,
    } as ReturnType<typeof useAlgoPrice>);
  });

  it("groups rewards by UTC date across timezone boundaries", () => {
    const block = createMockBlock("2026-02-23T23:30:00Z", 2_000_000);
    mockGenerateDateRange.mockReturnValue(["2026-02-23", "2026-02-24"]);
    mockGetAlgoUsdPrice.mockImplementation((date) =>
      date === "2026-02-23" ? 0.08 : 0.09,
    );

    const { result } = renderHook(() => usePriceImpactData([block]));

    const feb23 = result.current.fullData.find((d) => d.date === "2026-02-23");
    const feb24 = result.current.fullData.find((d) => d.date === "2026-02-24");

    expect(feb23?.rewardAlgo).toBe(2);
    expect(feb24?.rewardAlgo).toBe(0);
    expect(result.current.scatterData).toHaveLength(1);
    expect(result.current.scatterData[0].date).toBe("2026-02-23");
  });

  it("excludes reward days from scatter data when close price is missing", () => {
    const block = createMockBlock("2026-02-24T03:00:00Z", 1_500_000);
    mockGenerateDateRange.mockReturnValue(["2026-02-24"]);
    mockGetAlgoUsdPrice.mockReturnValue(null);

    const { result } = renderHook(() => usePriceImpactData([block]));

    expect(result.current.fullData[0].rewardAlgo).toBe(1.5);
    expect(result.current.fullData[0].priceAtReceipt).toBeNull();
    expect(result.current.fullData[0].valueAtReceipt).toBeNull();
    expect(result.current.scatterData).toHaveLength(0);
  });

  it("includes reward days in scatter data once close price is available", () => {
    const block = createMockBlock("2026-02-24T03:00:00Z", 1_500_000);
    mockGenerateDateRange.mockReturnValue(["2026-02-24"]);
    mockGetAlgoUsdPrice.mockReturnValue(0.08385);

    const { result } = renderHook(() => usePriceImpactData([block]));

    expect(result.current.scatterData).toHaveLength(1);
    expect(result.current.scatterData[0].date).toBe("2026-02-24");
    expect(result.current.scatterData[0].valueAtReceipt).toBeCloseTo(0.125775, 6);
  });
});
