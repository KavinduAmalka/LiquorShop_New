import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import Auth0ProviderWithHistory from './components/Auth0Provider.jsx'
import { Auth0AppContextProvider } from './context/Auth0AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Auth0ProviderWithHistory>
      <Auth0AppContextProvider>
        <App />
      </Auth0AppContextProvider>
    </Auth0ProviderWithHistory>
  </BrowserRouter>,
)
