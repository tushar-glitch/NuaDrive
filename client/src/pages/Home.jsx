import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Share files securely.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Simple, fast, and secure file sharing for everyone. Upload your files and share them instantly with a link.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
                {user ? (
                    <Link to="/dashboard" className="px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                        Go to Dashboard
                    </Link>
                ) : (
                    <>
                        <Link to="/register" className="px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                        Get Started
                        </Link>
                        <Link to="/login" className="px-6 py-3 text-base font-medium text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors">
                        Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
