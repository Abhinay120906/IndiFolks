import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FeaturedArtists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists?limit=10`);
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        console.error("Error fetching featured artists:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container">
        {/* Section Header ... (keep existing) ... */}
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-primary"
            >
              Top Performers
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold text-foreground md:text-4xl"
            >
              Featured Artists
            </motion.h2>
          </div>
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/artists">View All Artists</Link>
          </Button>
        </div>

        {/* Artists Carousel */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {artists.map((artist) => (
                <CarouselItem key={artist._id} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={`/artists/${artist._id}`}
                      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-warm"
                    >
                      {/* Artist Image */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={artist.profileImage || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                            className="h-full w-full object-cover"
                            alt={artist.name}
                          />
                        </div>
                        {/* Availability Badge */}
                        <div className="absolute right-3 top-3">
                          <Badge
                            variant={artist.available ? "default" : "secondary"}
                            className={artist.available ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {artist.available ? "Available" : "Booked"}
                          </Badge>
                        </div>
                      </div>

                      {/* Artist Info */}
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
                              {artist.name}
                            </h3>
                            <p className="text-sm text-primary">{artist.artForm || artist.specialty}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-medium">{artist.rating || 4.5}</span>
                            <span className="text-muted-foreground">({artist.reviewsCount || 0})</span>
                          </div>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{artist.state}</span>
                          <span className="text-border">•</span>
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{artist.experience || '20+ years'}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <div>
                            <span className="text-xs text-muted-foreground">Starting from</span>
                            <p className="font-semibold text-foreground">
                              ₹{(artist.price || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <Button size="sm" className="bg-gradient-saffron hover:opacity-90">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-primary/30 bg-background hover:bg-primary/10" />
            <CarouselNext className="right-0 border-primary/30 bg-background hover:bg-primary/10" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FeaturedArtists;
