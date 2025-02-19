import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: "/prinit-frontend/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
