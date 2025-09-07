import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Check if HTTPS certificates exist for development
const httpsConfig = () => {
  try {
    const keyPath = path.resolve('../backend/certs/localhost-key.pem');
    const certPath = path.resolve('../backend/certs/localhost.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    }
  } catch (error) {
    console.log('HTTPS certificates not found, using HTTP');
  }
  return false;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: process.env.ENABLE_HTTPS === 'true' ? httpsConfig() : false,
    host: 'localhost',
    port: 5173
  }
})
