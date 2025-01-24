import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: Number(process.env.PORT),
    allowedHosts: ["practice-deployment-production.up.railway.app"],
  },
});
