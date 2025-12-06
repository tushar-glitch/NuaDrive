import { Link } from 'react-router-dom';
import { Cloud } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Cloud className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Nua</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors ring-offset-2 focus:ring-2 focus:ring-indigo-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
