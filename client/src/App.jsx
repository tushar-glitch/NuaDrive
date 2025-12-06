import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

function App() {
  return (
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
              </div>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
