import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Viatges from './pages/Viatges';
import Region from './pages/Region';
import Lloc from './pages/Lloc';
import PuntInteres from './pages/PuntInteres';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/viatges" element={<Viatges />} />
              <Route path="/viatges/regio/:regioSlug" element={<Region />} />
              <Route path="/viatges/regio/:regioSlug/:llocSlug" element={<Lloc />} />
              <Route path="/viatges/regio/:regioSlug/:llocSlug/:puntSlug" element={<PuntInteres />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
