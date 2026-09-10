import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <MainLayout>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-display text-4xl font-bold text-foreground md:text-5xl">
              About <span className="text-gradient-saffron-green">Indifolks</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Indifolks is India's premier platform for discovering and booking authentic traditional artists.
              We connect customers with verified folk and classical performers from all 36 states and union territories.
            </p>

            <div className="mb-12 rounded-2xl border border-border bg-card p-8 text-left">
              <h2 className="mb-4 font-display text-2xl font-semibold">Our Mission</h2>
              <p className="mb-4 text-muted-foreground">
                To preserve and promote India's rich cultural heritage by empowering traditional artists
                and making their incredible talent accessible to everyone.
              </p>
              <p className="text-muted-foreground">
                We believe every celebration deserves the magic of authentic Indian artistry,
                and every artist deserves a platform to showcase their craft.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary">500+</p>
                <p className="text-muted-foreground">Verified Artists</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary">36</p>
                <p className="text-muted-foreground">States & UTs</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary">100+</p>
                <p className="text-muted-foreground">Art Forms</p>
              </div>
            </div>

            <div className="mt-12">
              <Button asChild size="lg" className="bg-gradient-saffron">
                <Link to="/states">Start Exploring</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default About;
