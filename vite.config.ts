import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {

   
    allowedHosts: ['main.server', "stainercontrol.docdrive.link"], // Add the host "main.server" to the array

  },
})
