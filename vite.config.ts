import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"
import { fileURLToPath } from "url"
import tailwindcss from "@tailwindcss/vite"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [
    vue({
      script: { vapor: true },
      template: { vapor: true }
    }),
    tailwindcss()
  ],
  root: "src",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html")
      },
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "js/[name].[hash].js",
        entryFileNames: "js/[name].[hash].js"
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
