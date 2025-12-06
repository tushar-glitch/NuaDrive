import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './components/auth/AuthContext';

import FileViewer from './pages/FileViewer';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <div className="min-h-screen font-sans">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
                    Share files securely.
                  </h1>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Simple, fast, and secure file sharing for everyone. Upload your files and share them instantly with a link.
                  </p>
                  <div className="mt-8 flex gap-4 justify-center">
                     <Link to="/register" className="px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                       Get Started
                     </Link>
                     <Link to="/login" className="px-6 py-3 text-base font-medium text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors">
                       Sign In
                     </Link>
                  </div>
                </div>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/file/:uuid" element={<FileViewer />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
