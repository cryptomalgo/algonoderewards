import { describe, it, expect } from "vitest";
import { formatBytes } from "./format-bytes";

describe("formatBytes", () => {
  describe("Bytes (B)", () => {
    it("should format 0 bytes", () => {
      expect(formatBytes(0)).toBe("0 B");
    });

    it("should format bytes less than 1 KB", () => {
      expect(formatBytes(500)).toBe("500 B");
      expect(formatBytes(1023)).toBe("1023 B");
    });
  });

  describe("Kilobytes (KB)", () => {
    it("should format exact KB values", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(2048)).toBe("2 KB");
    });

    it("should round KB values with decimals", () => {
      // 1.5 KB = 1536 bytes -> rounds to 2 KB
      expect(formatBytes(1536)).toBe("2 KB");

      // 358.29 KB = 366888.96 bytes = 366889 bytes -> rounds to 358 KB
      expect(formatBytes(366889)).toBe("358 KB");

      // 100.7 KB = 103116.8 bytes = 103117 bytes -> rounds to 101 KB
      expect(formatBytes(103117)).toBe("101 KB");

      // 99.4 KB = 101785.6 bytes = 101786 bytes -> rounds to 99 KB
      expect(formatBytes(101786)).toBe("99 KB");
    });

    it("should handle large KB values close to MB threshold", () => {
      // 1023.5 KB = 1048064 bytes -> rounds to 1024 KB
      expect(formatBytes(1048064)).toBe("1024 KB");
    });
  });

  describe("Megabytes (MB)", () => {
    it("should format exact MB values", () => {
      // 1 MB = 1048576 bytes
      expect(formatBytes(1048576)).toBe("1 MB");

      // 2 MB = 2097152 bytes
      expect(formatBytes(2097152)).toBe("2 MB");
    });

    it("should round MB values with decimals", () => {
      // 1.5 MB = 1572864 bytes -> rounds to 2 MB
      expect(formatBytes(1572864)).toBe("2 MB");

      // 2.3 MB = 2411724.8 bytes = 2411725 bytes -> rounds to 2 MB
      expect(formatBytes(2411725)).toBe("2 MB");

      // 2.7 MB = 2831155.2 bytes = 2831155 bytes -> rounds to 3 MB
      expect(formatBytes(2831155)).toBe("3 MB");
    });

    it("should handle large MB values", () => {
      // 100.2 MB = 105115033.6 bytes = 105115034 bytes -> rounds to 100 MB
      expect(formatBytes(105115034)).toBe("100 MB");
    });
  });

  describe("Edge cases", () => {
    it("should handle 1 byte", () => {
      expect(formatBytes(1)).toBe("1 B");
    });

    it("should handle exactly 1024 bytes (1 KB)", () => {
      expect(formatBytes(1024)).toBe("1 KB");
    });

    it("should handle exactly 1048576 bytes (1 MB)", () => {
      expect(formatBytes(1048576)).toBe("1 MB");
    });
  });
});
