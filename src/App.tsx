import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Guests from "./pages/Guests";
import Scanner from "./pages/Scanner";
import Tables from "./pages/Tables";
import Invite from "./pages/Invite";
import NotFound from "./pages/NotFound";
import ScanResult from "./pages/ScanResult";
import ScanDirect from "./pages/ScanDirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/invite/:qrCode" element={<Invite />} />
          <Route path="/scan-result/:qrCode" element={<ScanResult />} />
          <Route path="/scan-direct/:data" element={<ScanDirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
