import { Navbar } from '@/components/Navbar';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <section className="rounded-3xl border border-border bg-card p-10 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">Login</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Sign in to your account</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Access your data cleanup history and continue where you left off.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don’t have an account? Contact us on the Contact page for setup information.
          </p>
        </section>
      </main>
    </div>
  );
}
