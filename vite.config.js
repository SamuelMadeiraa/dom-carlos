import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    /* 5181 é a porta padrão do projeto; PORT permite subir uma segunda
       instância quando a porta já está ocupada */
    port: Number(process.env.PORT) || 5181,
    strictPort: !process.env.PORT,
  },
})
