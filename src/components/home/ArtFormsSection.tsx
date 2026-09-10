import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ArtFormStat {
  id: string;
  name: string;
  state: string;
  artistCount: number;
  icon: string;
}


// Fallback mock data for popular art forms
const defaultArtForms = [
  { id: "bharatanatyam", name: "Bharatanatyam", state: "Tamil Nadu", artists: 58, icon: "💃" },
  { id: "kathak", name: "Kathak", state: "Uttar Pradesh", artists: 42, icon: "👠" },
  { id: "kathakali", name: "Kathakali", state: "Kerala", artists: 35, icon: "🎭" },
  { id: "rajasthani-folk", name: "Rajasthani Folk", state: "Rajasthan", artists: 45, icon: "🎺" },
  { id: "baul", name: "Baul Music", state: "West Bengal", artists: 28, icon: "🎸" },
  { id: "lavani", name: "Lavani", state: "Maharashtra", artists: 32, icon: "🪘" },
];


const ArtFormsSection = () => {
  const [artForms, setArtForms] = useState<any[]>(defaultArtForms);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const result = await response.json();
        if (result.success && result.data.artFormStats && result.data.artFormStats.length > 0) {
          const fetchedArtForms = result.data.artFormStats.map((af: ArtFormStat) => ({
            id: af.id,
            name: af.name,
            state: af.state,
            artists: af.artistCount,
            icon: af.icon || "🎭"
          }));

          setArtForms(fetchedArtForms.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching art form stats:', error);
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
            Rich Cultural Heritage
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl"
          >
            Popular Art Forms
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-muted-foreground"
          >
            From classical dance forms passed down through generations to vibrant folk traditions,
            explore the diverse artistic expressions of India.
          </motion.p>
        </div>

        {/* Art Forms Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artForms.map((artForm, index) => (
            <motion.div
              key={artForm.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/artists?artForm=${artForm.name}`}

                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-warm"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 text-3xl transition-transform group-hover:scale-110 overflow-hidden">
                  {artForm.icon && (artForm.icon.startsWith('/') || artForm.icon.startsWith('http')) ? (
                    artForm.icon === '/placeholder.svg' ? (
                      <span className="text-3xl">🎭</span>
                    ) : (
                      <img src={artForm.icon} alt={artForm.name} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <span>{artForm.icon || "🎭"}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
                    {artForm.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate" title={`${artForm.state} • ${artForm.artists} Artists`}>
                    {artForm.state} • {artForm.artists} Artists
                  </p>

                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtFormsSection;
