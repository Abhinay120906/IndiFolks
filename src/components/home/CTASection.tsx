import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Stats {
  totalArtists: number;
  successfulBookings: number;
  statesCovered: number;
}


const CTASection = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRjk5MzMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTMwIDMwbTAtMjBhMjAgMjAgMCAxIDEgMCA0MCBhMjAgMjAgMCAxIDEgMCAtNDBNMzAgMzBtMC0xMGExMCAxMCAwIDEgMSAwIDIwIGExMCAxMCAwIDEgMSAwIC0yMCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-primary/20 bg-card/80 p-8 shadow-warm backdrop-blur-sm md:p-12"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Join Our Community
            </div>

            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Are You a Traditional Artist?
            </h2>

            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Join Indifolks and connect with customers looking for authentic Indian folk and classical
              performances. Showcase your art to a wider audience and grow your bookings.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-saffron px-8 hover:opacity-90">
                <Link to="/register?role=artist">
                  Register as Artist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/5">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>

            </div>

            <div className="mt-10 grid grid-cols-3 gap-8 border-t border-border pt-8">
              <div>
                <p className="font-display text-3xl font-bold text-primary">
                  {stats ? `${stats.totalArtists}+` : '500+'}
                </p>
                <p className="text-sm text-muted-foreground">Verified Artists</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">
                  {stats ? `${stats.successfulBookings}+` : '2000+'}
                </p>
                <p className="text-sm text-muted-foreground">Successful Bookings</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">
                  {stats ? stats.statesCovered : '36'}
                </p>
                <p className="text-sm text-muted-foreground">States Covered</p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
