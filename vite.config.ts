import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and routing
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],

          // Charts library
          "vendor-charts": ["recharts"],

          // UI components
          "vendor-ui": [
            "lucide-react",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dialog",
            "@radix-ui/react-checkbox",
          ],

          // Date utilities
          "vendor-dates": ["date-fns"],

          // Motion and animations
          "vendor-motion": ["motion/react"],

          // Algorand SDK
          "vendor-algorand": ["algosdk"],

          // Separate chunks for heavy chart components
          "charts-cumulative": [
            "src/components/address/charts/cumulative-rewards-chart.tsx",
            "src/components/address/charts/cumulative-blocks-chart.tsx",
          ],
          "charts-advanced": [
            "src/components/address/charts/block-reward-intervals.tsx",
            "src/components/address/charts/reward-by-day-hour-chart.tsx",
          ],

          // Heatmap components
          heatmap: [
            "src/components/heatmap/heatmap.tsx",
            "src/components/heatmap/day-view.tsx",
            "src/components/heatmap/month-view.tsx",
          ],

          // Stats components
          stats: [
            "src/components/address/stats/stats-panels.tsx",
            "src/components/address/stats/status/status.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase warning limit to 600KB
  },
});
