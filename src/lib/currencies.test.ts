import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchAlgoPrice, getUserPreferredCurrency } from "./currencies";

describe("currencies", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchAlgoPrice", () => {
    it("should fetch ALGO price in USD using ALGOUSDC pair", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: "0.135" }),
      } as Response);

      const price = await fetchAlgoPrice("USD");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDC",
      );
      expect(price).toBe(0.135);
    });

    it("should fetch ALGO price in EUR using two-step conversion (ALGOUSDT / EURUSDT)", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDT
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "1.15" }), // EURUSDT
        } as Response);

      const price = await fetchAlgoPrice("EUR");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDT",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=EURUSDT",
      );
      expect(price).toBeCloseTo(0.1174, 4); // 0.135 / 1.15
    });

    it("should fetch ALGO price in GBP using two-step conversion (ALGOUSDT / GBPUSDT)", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDT
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "1.18" }), // GBPUSDT
        } as Response);

      const price = await fetchAlgoPrice("GBP");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDT",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=GBPUSDT",
      );
      expect(price).toBeCloseTo(0.1144, 4); // 0.135 / 1.18
    });

    it("should fetch ALGO price in AUD using two-step conversion (ALGOUSDT / AUDUSDT)", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDT
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.725" }), // AUDUSDT
        } as Response);

      const price = await fetchAlgoPrice("AUD");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDT",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=AUDUSDT",
      );
      expect(price).toBeCloseTo(0.1862, 4); // 0.135 / 0.725
    });

    it("should fetch ALGO price in JPY using USD exchange rate API", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDC
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            rates: { JPY: 150.0 },
          }),
        } as Response);

      const price = await fetchAlgoPrice("JPY");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDC",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.exchangerate-api.com/v4/latest/USD",
      );
      expect(price).toBeCloseTo(20.25, 2); // 0.135 * 150
    });

    it("should fetch ALGO price in CAD using USD exchange rate API", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDC
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            rates: { CAD: 1.35 },
          }),
        } as Response);

      const price = await fetchAlgoPrice("CAD");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDC",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.exchangerate-api.com/v4/latest/USD",
      );
      expect(price).toBeCloseTo(0.18225, 5); // 0.135 * 1.35
    });

    it("should fetch ALGO price in CHF using USD exchange rate API", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDC
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            rates: { CHF: 0.92 },
          }),
        } as Response);

      const price = await fetchAlgoPrice("CHF");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDC",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.exchangerate-api.com/v4/latest/USD",
      );
      expect(price).toBeCloseTo(0.1242, 4); // 0.135 * 0.92
    });

    it("should fetch ALGO price in CNY using USD exchange rate API", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDC
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            rates: { CNY: 7.2 },
          }),
        } as Response);

      const price = await fetchAlgoPrice("CNY");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDC",
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.exchangerate-api.com/v4/latest/USD",
      );
      expect(price).toBeCloseTo(0.972, 3); // 0.135 * 7.2
    });

    it("should throw error when Binance API fails", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Service Unavailable",
      } as Response);

      await expect(fetchAlgoPrice("USD")).rejects.toThrow(
        "Binance API responded with status:",
      );
    });

    it("should throw error when exchange rate API fails for JPY", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: "0.135" }), // ALGOUSDC
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Service Unavailable",
        } as Response);

      await expect(fetchAlgoPrice("JPY")).rejects.toThrow(
        "Exchange rate API failed",
      );
    });
  });

  describe("getUserPreferredCurrency", () => {
    it("should return EUR for fr-FR locale", () => {
      vi.stubGlobal("navigator", { language: "fr-FR" });
      expect(getUserPreferredCurrency()).toBe("EUR");
    });

    it("should return GBP for en-GB locale", () => {
      vi.stubGlobal("navigator", { language: "en-GB" });
      expect(getUserPreferredCurrency()).toBe("GBP");
    });

    it("should return JPY for ja-JP locale", () => {
      vi.stubGlobal("navigator", { language: "ja-JP" });
      expect(getUserPreferredCurrency()).toBe("JPY");
    });

    it("should return AUD for en-AU locale", () => {
      vi.stubGlobal("navigator", { language: "en-AU" });
      expect(getUserPreferredCurrency()).toBe("AUD");
    });

    it("should return CAD for en-CA locale", () => {
      vi.stubGlobal("navigator", { language: "en-CA" });
      expect(getUserPreferredCurrency()).toBe("CAD");
    });

    it("should return CHF for de-CH locale", () => {
      vi.stubGlobal("navigator", { language: "de-CH" });
      expect(getUserPreferredCurrency()).toBe("CHF");
    });

    it("should return CNY for zh-CN locale", () => {
      vi.stubGlobal("navigator", { language: "zh-CN" });
      expect(getUserPreferredCurrency()).toBe("CNY");
    });

    it("should return USD for en-US locale", () => {
      vi.stubGlobal("navigator", { language: "en-US" });
      expect(getUserPreferredCurrency()).toBe("USD");
    });

    it("should return USD for unsupported locale", () => {
      vi.stubGlobal("navigator", { language: "pt-BR" });
      expect(getUserPreferredCurrency()).toBe("USD");
    });

    it("should return USD when navigator.language is undefined", () => {
      vi.stubGlobal("navigator", {});
      expect(getUserPreferredCurrency()).toBe("USD");
    });
  });
});
