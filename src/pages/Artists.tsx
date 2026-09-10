import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Filter, Star, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";

const artForms = ["All Art Forms", "Bharatanatyam", "Kathak", "Kathakali", "Odissi", "Manipuri", "Rajasthani Folk", "Baul Music", "Lavani", "Hindustani Classical"];
const states = ["All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

const Artists = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedArtForm, setSelectedArtForm] = useState(searchParams.get("artForm") || "All Art Forms");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "All States");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set("search", searchQuery);
        if (selectedArtForm !== "All Art Forms") queryParams.set("artForm", selectedArtForm);
        if (selectedState !== "All States") queryParams.set("state", selectedState);
        queryParams.set("sort", sortBy);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists?${queryParams.toString()}`);
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchArtists();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, selectedArtForm, selectedState, sortBy]);

  const filteredArtists = artists; // Already filtered by backend

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream via-background to-muted py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-4 font-display text-4xl font-bold text-foreground md:text-5xl">
              Find Your Perfect <span className="text-gradient-saffron">Artist</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Browse through our curated collection of verified traditional artists.
              Filter by art form, state, or search by name.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search artists or art forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-border bg-card pl-12 text-base shadow-warm focus-visible:ring-primary"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Grid Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedArtForm} onValueChange={setSelectedArtForm}>
              <SelectTrigger className="w-[180px] border-border">
                <SelectValue placeholder="Art Form" />
              </SelectTrigger>
              <SelectContent>
                {artForms.map((artForm) => (
                  <SelectItem key={artForm} value={artForm}>{artForm}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[180px] border-border">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <p className="mb-6 text-sm text-muted-foreground">
            Showing {filteredArtists.length} artists
          </p>

          {/* Artists Grid */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArtists.map((artist, index) => (
                <motion.div
                  key={artist._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                        <span>{artist.experience || 'Experienced'}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Starting from</span>
                          <p className="font-semibold text-foreground">
                            ₹{(artist.totalPrice || Math.round((artist.price || 0) * 1.1)).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <Button size="sm" className="bg-gradient-saffron hover:opacity-90">
                          View Profile
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredArtists.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">No artists found matching your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedArtForm("All Art Forms");
                  setSelectedState("All States");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Artists;
