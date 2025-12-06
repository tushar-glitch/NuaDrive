import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Register() {
  return (
    <AuthLayout 
      title="Create your account"
      subtitle={
        <>
          Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </>
      }
    >
      <form className="space-y-6" action="#" method="POST">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
