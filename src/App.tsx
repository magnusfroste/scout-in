import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LazyPage } from "@/components/LazyErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const Index = lazy(() => import("./pages/Index"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<LazyPage><Index /></LazyPage>} />
                  <Route path="/company-profile" element={<LazyPage><CompanyProfilePage /></LazyPage>} />
                  <Route path="/user-profile" element={<LazyPage><UserProfilePage /></LazyPage>} />
                  <Route path="/research" element={<LazyPage><ResearchPage /></LazyPage>} />
                  <Route path="/settings" element={<LazyPage><SettingsPage /></LazyPage>} />
                  <Route path="/admin" element={<LazyPage><AdminPage /></LazyPage>} />
                  <Route path="/history" element={<LazyPage><Index /></LazyPage>} />
                </Route>
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
