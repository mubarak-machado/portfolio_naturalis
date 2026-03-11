/**
 * App.tsx — Componente Raiz e Roteamento
 * ========================================
 * Define todas as rotas da aplicação usando React Router.
 * 
 * Estrutura de rotas:
 * 
 * PÚBLICAS (cliente):
 * - / → Landing Page (vitrine)
 * - /loja → Catálogo de produtos
 * - /loja/checkout → Carrinho e checkout
 * - /pedido/:token → Acompanhamento do pedido
 * 
 * ADMIN (requer autenticação):
 * - /admin/login → Login do admin
 * - /admin → Dashboard
 * - /admin/produtos → Gestão de produtos
 * - /admin/clientes → CRM de clientes
 * - /admin/vendas → PDV
 * - /admin/pedidos → Gestão de pedidos
 * - /admin/marketing → Criação de posts
 * - /admin/ajuda → Central de ajuda
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/contexts/AuthContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'

// Layouts
import AppLayout from '@/components/layout/AppLayout'
import StoreLayout from '@/components/layout/StoreLayout'

// Admin pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import CustomersPage from '@/pages/CustomersPage'
import SalesPage from '@/pages/SalesPage'
import OrdersPage from '@/pages/OrdersPage'
import MarketingPage from '@/pages/MarketingPage'
import SettingsPage from '@/pages/SettingsPage'
import HelpPage from '@/pages/HelpPage'

// Help guides
import HelpHub from '@/pages/help/HelpHub'
import HelpLayout from '@/pages/help/HelpLayout'
import VendasGuide from '@/pages/help/guides/VendasGuide'
import InventoryGuide from '@/pages/help/guides/InventoryGuide'
import MarketingGuide from '@/pages/help/guides/MarketingGuide'
import DashboardGuide from '@/pages/help/guides/DashboardGuide'
import CustomerGuide from '@/pages/help/guides/CustomerGuide'
import SettingsGuide from '@/pages/help/guides/SettingsGuide'

// Store pages (public)
import StoreLandingPage from '@/pages/store/StoreLandingPage'
import StoreCatalogPage from '@/pages/store/StoreCatalogPage'
import StoreCheckoutPage from '@/pages/store/StoreCheckoutPage'
import OrderTrackingPage from '@/pages/store/OrderTrackingPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache by default
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ModalProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* ── Rotas públicas (cliente) ──────── */}
                  <Route path="/" element={<Navigate to="/loja" replace />} />
                  <Route path="/loja" element={<StoreLayout />}>
                    <Route index element={<StoreLandingPage />} />
                    <Route path="produtos" element={<StoreCatalogPage />} />
                    <Route path="checkout" element={<StoreCheckoutPage />} />
                    <Route path="pedido/:token" element={<OrderTrackingPage />} />
                  </Route>

                  {/* ── Rotas admin ───────────────────── */}
                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="produtos" element={<ProductsPage />} />
                    <Route path="clientes" element={<CustomersPage />} />
                    <Route path="vendas" element={<SalesPage />} />
                    <Route path="pedidos" element={<OrdersPage />} />
                    <Route path="marketing" element={<MarketingPage />} />
                    <Route path="configuracoes" element={<SettingsPage />} />
                    <Route path="ajuda" element={<HelpLayout />}>
                      <Route index element={<HelpHub />} />
                      <Route path="dashboard" element={<DashboardGuide />} />
                      <Route path="vendas" element={<VendasGuide />} />
                      <Route path="produtos" element={<InventoryGuide />} />
                      <Route path="clientes" element={<CustomerGuide />} />
                      <Route path="marketing" element={<MarketingGuide />} />
                      <Route path="configuracoes" element={<SettingsGuide />} />
                      {/* Sub-guias adicionais serão linkados aqui */}
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </ModalProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
