import { motion } from "framer-motion";
import { Search, ArrowRight, Star, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


const HeroSection = () => {
  const [artistCount, setArtistCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const result = await response.json();
        if (result.success) {
          setArtistCount(result.data.totalArtists);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-background to-muted py-16 md:py-24 lg:py-32">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        {/* Mandala pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRjk5MzMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTMwIDMwbTAtMjBhMjAgMjAgMCAxIDEgMCA0MCBhMjAgMjAgMCAxIDEgMCAtNDBNMzAgMzBtMC0xMGExMCAxMCAwIDEgMSAwIDIwIGExMCAxMCAwIDEgMSAwIC0yMCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              ✨ Discover India's Artistic Heritage
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Book Authentic{" "}
            <span className="text-gradient-saffron">Indian Folk Artists</span>
            <br />
            from Every State
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Connect with verified traditional artists for weddings, festivals, corporate events,
            and cultural celebrations. Experience the richness of India's artistic traditions.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mb-8 max-w-2xl"
          >
            <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-warm sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by state, art form, or artist..."
                  className="h-12 border-0 bg-muted/50 pl-10 text-base focus-visible:ring-primary"
                />
              </div>
              <Button size="lg" className="h-12 bg-gradient-saffron px-8 text-base hover:opacity-90">
                Find Artists
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Popular: <Link to="/states/rajasthan" className="text-primary hover:underline">Rajasthan</Link>,{" "}
              <Link to="/artists?artForm=Kathak" className="text-primary hover:underline">Kathak</Link>,{" "}
              <Link to="/artists?artForm=Bharatanatyam" className="text-primary hover:underline">Bharatanatyam</Link>
            </p>

          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground md:gap-10"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <span>{artistCount !== null ? `${artistCount}+` : '500+'} Verified Artists</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <Shield className="h-4 w-4 text-accent-foreground" />
              </div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                <Clock className="h-4 w-4 text-secondary" />
              </div>
              <span>Instant Booking</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
