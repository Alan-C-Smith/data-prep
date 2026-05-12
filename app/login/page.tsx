'use client';

import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/app/contexts/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Check your email for confirmation link');
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <section className="rounded-3xl border border-border bg-card p-10 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">
              {isSignUp ? 'Sign Up' : 'Login'}
            </p>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {isSignUp
                ? 'Get started with data preprocessing.'
                : 'Access your data cleanup history and continue where you left off.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don’t have an account? Contact us on the Contact page for setup information.
          </p>
        </section>
      </main>
    </div>
  );
}
