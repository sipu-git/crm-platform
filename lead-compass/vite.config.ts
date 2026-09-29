import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve:{
    tsconfigPaths:true
  },
  build:{
    sourcemap:true
  },
  server: { port: 4173 },
});
