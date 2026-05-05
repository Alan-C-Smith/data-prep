import { Navbar } from '@/components/Navbar';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <section className="text-center py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Get in touch</h1>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground leading-8">
            Have a question or need help with your data preprocessing workflows? Reach out and we’ll get back to you shortly.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Email</h2>
            <p className="text-sm text-muted-foreground mb-6">support@dataprep.example.com</p>
            <p className="text-sm text-muted-foreground">Use this address for product questions, feedback, or support requests.</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Need help?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              For faster support, please include your file type and the steps you want to perform.
            </p>
            <p className="text-sm text-muted-foreground">We’ll respond with guidance on how to use the tool most effectively.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
