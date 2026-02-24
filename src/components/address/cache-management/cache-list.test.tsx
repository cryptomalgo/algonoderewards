import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheList } from "./cache-list";
import { SENSITIVE_MASK } from "@/constants";
import { displayAlgoAddress } from "@/lib/utils";

const mockUseSearch = vi.fn();
const mockUseNFDReverseMultiple = vi.fn();
const mockClearCacheForAddress = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => mockUseSearch(),
}));

vi.mock("@/hooks/queries/useNFD", () => ({
  useNFDReverseMultiple: (...args: unknown[]) =>
    mockUseNFDReverseMultiple(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("@/lib/block-storage", () => ({
  clearCacheForAddress: (...args: unknown[]) =>
    mockClearCacheForAddress(...args),
  clearAllCache: vi.fn(),
}));

vi.mock("@/components/ui/mobile-tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("CacheList privacy masking", () => {
  const address =
    "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU";
  const caches = [
    {
      address,
      blockCount: 12,
      lastUpdated: Date.now(),
      sizeInBytes: 1234,
    },
  ];

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <CacheList loading={false} caches={caches} onCacheCleared={vi.fn()} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    mockUseSearch.mockReturnValue({ hideBalance: false });
    mockUseNFDReverseMultiple.mockReturnValue({
      data: { [address]: "noderewards" },
      isLoading: false,
    });
    mockClearCacheForAddress.mockResolvedValue(undefined);
    mockToastSuccess.mockReset();
    mockToastError.mockReset();
  });

  it("masks row and tooltip identity fields when hideBalance is true", () => {
    mockUseSearch.mockReturnValue({ hideBalance: true });

    renderComponent();

    expect(screen.getAllByText(SENSITIVE_MASK).length).toBeGreaterThan(0);
    expect(screen.queryByText("noderewards.algo")).toBeNull();
    expect(screen.queryByText(address)).toBeNull();
  });

  it("shows existing identity fields when hideBalance is false", () => {
    renderComponent();

    expect(screen.getByText("noderewards.algo")).toBeTruthy();
    expect(screen.getByText(address)).toBeTruthy();
  });

  it("uses generic hidden toast for per-address clear in hidden mode", async () => {
    mockUseSearch.mockReturnValue({ hideBalance: true });
    const { container } = renderComponent();

    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);

    await waitFor(() =>
      expect(mockClearCacheForAddress).toHaveBeenCalledWith(address),
    );
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Cleared cache for hidden address",
    );
  });

  it("keeps existing per-address clear toast when visible", async () => {
    const { container } = renderComponent();

    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);

    await waitFor(() =>
      expect(mockClearCacheForAddress).toHaveBeenCalledWith(address),
    );
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Cleared cache for " + displayAlgoAddress(address),
    );
  });
});
