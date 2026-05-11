import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Servicos from './pages/Servicos';
import Galeria from './pages/Galeria';
import Equipe from './pages/Equipe';
import Contato from './pages/Contato';
import Certificados from './pages/Certificados';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/certificados" element={<Certificados />} />
            <Route path="/contato" element={<Contato />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
