import { Navbar } from '@/components/Navbar';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <section className="text-center py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Simple, predictable pricing</h1>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground leading-8">
            Choose the plan that fits your data preprocessing needs. Each tier includes support for file uploads,
            cleanup operations, and exports so you can prepare data with confidence.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-full rounded-3xl border border-border bg-card p-6 text-center shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-4">Starter</p>
              <p className="text-5xl font-bold text-foreground mb-4">Free</p>
              <p className="text-sm text-muted-foreground mb-6">Basic file upload and cleanup tools.</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>CSV / Excel upload</li>
                <li>Column selection</li>
                <li>Export to CSV</li>
              </ul>
            </div>
            <button className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              Choose Free
            </button>
          </div>

          <div className="h-full rounded-3xl border border-border bg-card p-6 text-center shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-4">Standard</p>
              <p className="text-5xl font-bold text-foreground mb-4">$9 / month</p>
              <p className="text-sm text-muted-foreground mb-6">Recommended for regular preprocessing workflows.</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>Unlimited uploads</li>
                <li>Advanced cleaning</li>
                <li>Priority support</li>
              </ul>
            </div>
            <button className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              Choose Standard
            </button>
          </div>

          <div className="h-full rounded-3xl border border-border bg-card p-6 text-center shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-4">Pro</p>
              <p className="text-5xl font-bold text-foreground mb-4">$19 / month</p>
              <p className="text-sm text-muted-foreground mb-6">Best for teams and high-volume data prep.</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>Team collaboration</li>
                <li>Advanced export options</li>
                <li>Dedicated support</li>
              </ul>
            </div>
            <button className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              Choose Pro
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
