import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ModalProvider>
          <AuthProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </AuthProvider>
        </ModalProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
