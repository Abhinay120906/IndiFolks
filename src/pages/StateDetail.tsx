import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, MapPin, Users, Palette, Music,
  Star, Calendar, Play, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";

const StateDetail = () => {
  const { stateId } = useParams();
  const [state, setState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/states/${stateId}`);
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error("Error fetching state details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchState();
  }, [stateId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!state) {
    return (
      <MainLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">State not found</h2>
          <Link to="/states" className="mt-4 text-primary underline">Back to States</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/states" className="hover:text-primary">Explore States</Link>
            <span>/</span>
            <span className="text-foreground">{state.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-20">
        <div className="absolute -right-20 -top-20 text-[200px] opacity-10">
          {state.icon}
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <MapPin className="mr-1 h-3 w-3" />
              {state.region}
            </Badge>
            <h1 className="mb-4 font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              {state.name}
            </h1>
            <p className="mb-6 text-lg text-muted-foreground md:text-xl">
              {state.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-warm">
                <Palette className="h-5 w-5 text-primary" />
                <span className="font-medium">{state.artForms.length} Art Forms</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-warm">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{state.featuredArtists.length}+ Artists</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cultural Highlights */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground md:text-3xl">
              Cultural Highlights
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.culturalHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Art Forms */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Traditional Art Forms
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {state.artForms.map((artForm, index) => (
              <motion.div
                key={artForm.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full overflow-hidden transition-all hover:border-primary/30 hover:shadow-warm">
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={artForm.image}
                      alt={artForm.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute right-3 top-3 bg-card/90">
                      {artForm.type}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 font-display text-xl font-semibold text-foreground group-hover:text-primary">
                      {artForm.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {artForm.description}
                    </p>
                    <Link
                      to={`/artists?artForm=${artForm.name}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      View Artists
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      {state.featuredArtists.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Featured Artists from {state.name}
              </h2>
              <Link to={`/artists?state=${state.name}`}>
                <Button variant="outline" className="border-primary/30">
                  View All Artists
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {state.featuredArtists.map((artist, index) => (
                <motion.div
                  key={artist._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/artists/${artist._id}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-warm"
                  >
                    {/* Artist Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={artist.profileImage || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                          className="h-full w-full object-cover"
                          alt={artist.name}
                        />
                      </div>
                      <Badge
                        className={`absolute right-3 top-3 ${artist.available ? "bg-green-500 hover:bg-green-600" : ""
                          }`}
                        variant={artist.available ? "default" : "secondary"}
                      >
                        {artist.available ? "Available" : "Booked"}
                      </Badge>
                    </div>

                    {/* Artist Info */}
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
                        {artist.name}
                      </h3>
                      <p className="mb-2 text-sm text-primary">{artist.artForm || artist.specialty}</p>

                      <div className="mb-3 flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-medium">{artist.rating || 4.5}</span>
                        <span className="text-muted-foreground">({artist.reviewsCount || 0})</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div>
                          <span className="text-xs text-muted-foreground">From</span>
                          <p className="font-semibold text-foreground">
                            ₹{(artist.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <Button size="sm" className="bg-gradient-saffron hover:opacity-90">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 py-12 md:py-16">
        <div className="container text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">
            Ready to Book an Artist from {state.name}?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Explore our curated selection of verified traditional artists and book instantly for your event.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={`/artists?state=${state.name}`}>
              <Button size="lg" className="bg-gradient-saffron hover:opacity-90">
                Browse All Artists
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/states">
              <Button size="lg" variant="outline" className="border-primary/30">
                Explore Other States
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default StateDetail;
