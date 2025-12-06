import { Link } from 'react-router-dom';
import { Cloud } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Cloud className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Nua</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}
