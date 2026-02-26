import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Create a dummy firebase config if it doesn't exist (for build to succeed)
const configPath = path.resolve(__dirname, 'firebase.config.js');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, 'export const firebaseConfig = null;\n');
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
})
