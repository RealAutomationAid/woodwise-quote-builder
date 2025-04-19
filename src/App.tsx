import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuoteProvider } from "@/contexts/QuoteContext";
import Index from "./pages/Index";
import LoginPage from "./pages/login";
import CatalogPage from "./pages/catalog";
import QuotePage from "./pages/quote";
import QuotesHistoryPage from "./pages/quotes";
import AdminQuotesPage from "./pages/admin/quotes";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminCategoriesPage from "./pages/admin/categories";
import AdminProductsPage from "./pages/admin/products";
import AccountPage from "./pages/account";
import CreateQuotePage from "./pages/admin/create-quote";
import EditQuotePage from "./pages/admin/edit-quote";
import QuoteDetailPage from "./pages/quote-detail";
import SignupPage from "./pages/signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <QuoteProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route 
                path="/quote" 
                element={
                  <ProtectedRoute>
                    <QuotePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quotes" 
                element={
                  <ProtectedRoute>
                    <QuotesHistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quotes/:id" 
                element={
                  <ProtectedRoute>
                    <QuoteDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/quotes" 
                element={
                  <AdminRoute>
                    <AdminQuotesPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <AdminRoute>
                    <AdminCategoriesPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <AdminRoute>
                    <AdminProductsPage />
                  </AdminRoute>
                } 
              />
              <Route
                path="/admin/quotes/create"
                element={
                  <AdminRoute>
                    <CreateQuotePage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/edit-quote/:quoteId"
                element={
                  <AdminRoute>
                    <EditQuotePage />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QuoteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
