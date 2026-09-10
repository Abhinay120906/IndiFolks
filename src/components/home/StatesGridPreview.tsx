import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface StateStat {
  id: string;
  name: string;
  artistCount: number;
  artFormCount: number;
  icon: string;
}


// Fallback mock data for Indian states
const defaultStates = [
  { id: "rajasthan", name: "Rajasthan", artForms: 12, artists: 45, image: "🏜️" },
  { id: "kerala", name: "Kerala", artForms: 8, artists: 32, image: "🌴" },
  { id: "tamil-nadu", name: "Tamil Nadu", artForms: 15, artists: 58, image: "🛕" },
  { id: "west-bengal", name: "West Bengal", artForms: 10, artists: 38, image: "🎭" },
  { id: "maharashtra", name: "Maharashtra", artForms: 11, artists: 42, image: "🏛️" },
  { id: "punjab", name: "Punjab", artForms: 7, artists: 28, image: "🌾" },
  { id: "gujarat", name: "Gujarat", artForms: 9, artists: 35, image: "🎪" },
  { id: "odisha", name: "Odisha", artForms: 13, artists: 41, image: "🏺" },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatesGridPreview = () => {
  const [states, setStates] = useState<any[]>(defaultStates);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const result = await response.json();
        if (result.success && result.data.stateStats && result.data.stateStats.length > 0) {
          // Use the fetched stats, but limit to some prominent ones or a fixed set for the preview
          const fetchedStates = result.data.stateStats.map((s: StateStat) => ({
            id: s.id,
            name: s.name,
            artForms: s.artFormCount,
            artists: s.artistCount,
            image: s.icon
          }));

          // If we have enough states, use them. Otherwise, mix or just show the top 8.
          setStates(fetchedStates.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching state stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-primary"
          >
            Explore by Region
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl"
          >
            Discover Artists from Every State
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-muted-foreground"
          >
            India's rich cultural tapestry spans 28 states, each with unique folk traditions,
            classical art forms, and talented performers waiting to bring magic to your events.
          </motion.p>
        </div>

        {/* States Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {states.map((state) => (
            <motion.div key={state.id} variants={itemVariants}>
              <Link
                to={`/states/${state.id}`}
                className="group relative block overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-warm"
              >
                {/* Decorative background */}
                <div className="absolute -right-8 -top-8 text-8xl opacity-10 transition-transform group-hover:scale-110 group-hover:opacity-20">
                  {state.image && (state.image.startsWith('/') || state.image.startsWith('http')) ? (
                    state.image === '/placeholder.svg' ? (
                      "🏛️"
                    ) : (
                      <img src={state.image} alt={state.name} className="h-20 w-20 object-contain" />
                    )
                  ) : (
                    state.image || "🏛️"
                  )}
                </div>


                <div className="relative">
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground group-hover:text-primary">
                    {state.name}
                  </h3>
                  <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                    <span>{state.artForms} Art Forms</span>
                    <span>•</span>
                    <span>{state.artists} Artists</span>
                  </div>

                  <span className="inline-flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explore
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Button asChild variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/5">
            <Link to="/states">
              View All 36 States & UTs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default StatesGridPreview;
