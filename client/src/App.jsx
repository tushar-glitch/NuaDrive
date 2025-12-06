import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './components/auth/AuthContext';
import AuthLayout from './components/auth/AuthLayout';

import FileViewer from './pages/FileViewer';
import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <div className="min-h-screen font-sans">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/file/:uuid" element={<FileViewer mode="protected" />} />
              <Route path="/s/:token" element={<FileViewer mode="public" />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
