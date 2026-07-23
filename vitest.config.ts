import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Inject .env.local values into process.env so eager module-level parseEnv() calls succeed
  Object.assign(process.env, env);

  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      // Map the exact `server-only` import to a no-op stub so server-only modules can be
      // imported under vitest. Done as a targeted alias (not a global "react-server"
      // condition) so React still resolves to its client build for component tests.
      alias: [
        {
          find: /^server-only$/,
          replacement: fileURLToPath(new URL("./test/stubs/empty.ts", import.meta.url)),
        },
      ],
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
      include: [
        "{app,components,config,lib,features,server,scripts}/**/*.test.{ts,tsx}",
        "*.test.{ts,tsx}",
      ],
    },
  };
});
