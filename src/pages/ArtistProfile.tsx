import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, MapPin, Calendar, Clock, Users, Award, Play,
  ChevronLeft, ChevronRight, Heart, Share2, CheckCircle,
  Phone, Mail, Music, Palette, Loader2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import BookingModal from "@/components/BookingModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const ArtistProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [artist, setArtist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [ownReview, setOwnReview] = useState<{rating: number; comment: string} | null>(null);
  const [isCheckingOwnReview, setIsCheckingOwnReview] = useState(false);
  const [reviewLookupFailed, setReviewLookupFailed] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`);
        const data = await response.json();
        setArtist(data);
      } catch (error) {
        console.error("Error fetching artist profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setOwnReview(null);
    setReviewLookupFailed(false);
    if (!id || user?.role !== "customer" || !token) {
      setIsCheckingOwnReview(false);
      return;
    }
    let cancelled = false;
    setIsCheckingOwnReview(true);
    const loadOwnReview = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}/my-review`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Unable to check previous reviews");
        const data = await response.json();
        if (!cancelled) setOwnReview(data.review ?? null);
      } catch {
        if (!cancelled) setReviewLookupFailed(true);
      } finally {
        if (!cancelled) setIsCheckingOwnReview(false);
      }
    };
    void loadOwnReview();
    return () => { cancelled = true; };
  }, [id, user?._id, user?.role]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!artist) {
    return (
      <MainLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Artist not found</h2>
          <Link to="/artists" className="mt-4 text-primary underline">Back to Artists</Link>
        </div>
      </MainLayout>
    );
  }

  // The API returns `reviews`; `customerReviews` is retained only for older fixtures.
  const displayedReviews = Array.isArray(artist.reviews)
    ? artist.reviews
    : Array.isArray(artist.customerReviews) ? artist.customerReviews : [];

  const starStyle = (selected: boolean) =>
    selected ? "fill-[#f6b73c] text-[#d88b14]" : "fill-none text-[#cdbfae]";

  const gallery = [
    { id: 1, type: "image", url: artist.profileImage || "/placeholder.svg", title: "Profile Image" },
    // In a real app we would have more images in the gallery field
    { id: 2, type: "image", url: "/placeholder.svg", title: "Performance" },
  ];


  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/artists" className="hover:text-primary">Artists</Link>
            <span>/</span>
            <span className="text-foreground">{artist.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream via-background to-muted py-8 md:py-12">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={artist?.gallery?.[currentGalleryIndex]?.url || artist?.profileImage || "/placeholder.svg"}
                  alt={artist?.gallery?.[currentGalleryIndex]?.title || "Artist Profile"}
                  className="h-full w-full object-cover"
                />
                {artist?.gallery?.[currentGalleryIndex]?.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <Button size="lg" className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary">
                      <Play className="h-8 w-8 fill-primary-foreground" />
                    </Button>
                  </div>
                )}

                {/* Navigation */}
                {(artist?.gallery?.length || 0) > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
                      onClick={prevGalleryImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
                      onClick={nextGalleryImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Counter */}
                {(artist?.gallery?.length || 0) > 0 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-sm">
                    {currentGalleryIndex + 1} / {artist.gallery.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {(artist?.gallery?.length || 0) > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {artist.gallery.map((item: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentGalleryIndex(index)}
                      className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${index === currentGalleryIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img src={item.url || "/placeholder.svg"} alt={item.title || "Gallery Item"} className="h-full w-full object-cover" />
                      {item.type === "video" && (
                        <Play className="absolute inset-0 m-auto h-5 w-5 text-primary-foreground drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Artist Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" /> Verified
                </Badge>
                {artist.available ? (
                  <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">Available</Badge>
                ) : (
                  <Badge variant="secondary">Currently Booked</Badge>
                )}
              </div>

              <h1 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                {artist.name}
              </h1>
              <p className="mb-4 text-lg text-primary">{artist.artForm || artist.specialty || 'Traditional Artist'}</p>

              {/* Art Forms */}
              <div className="mb-4 flex flex-wrap gap-2">
                {(Array.isArray(artist?.artForms) ? artist.artForms : [artist?.artForm]).filter(Boolean).map((art: any) => (
                  <Badge key={art} variant="outline" className="border-primary/30 bg-primary/5">
                    <Palette className="mr-1 h-3 w-3" /> {art}
                  </Badge>
                ))}
              </div>

              {/* Rating & Location */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star strokeWidth={1.8} className={cn("h-5 w-5", starStyle(Boolean(artist.reviewsCount)))} />
                  <span className="font-semibold">{artist.reviewsCount ? artist.rating : "New"}</span>
                  <span className="text-muted-foreground">({artist.reviewsCount || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {artist.city && `${artist.city}, `}{artist.state}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4">
                <div className="text-center">
                  <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground">{artist.experience || 'Experienced'}</p>
                  <p className="text-xs text-muted-foreground">Experience</p>
                </div>
                <div className="text-center">
                  <Award className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground">{artist.specialty || artist.artForm || 'Maestro'}</p>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Starting from</span>
                    <p className="text-3xl font-bold text-foreground">
                      ₹{(artist.totalPrice || Math.round((artist.price || 0) * 1.1)).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">per performance</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-saffron text-lg hover:opacity-90"
                    onClick={() => {
                      setSelectedPackage(null);
                      setIsBookingModalOpen(true);
                    }}
                  >
                    Book Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/30"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-secondary text-secondary" : ""}`} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        artistId={artist._id}
        artistName={artist.name}
        price={artist.totalPrice || Math.round((artist.price || 0) * 1.1)}
        initialPackage={selectedPackage}
      />

      {/* Details Tabs */}
      <section className="py-8 md:py-12 bg-muted/20">
        <div className="container">
          <Tabs defaultValue="about" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-card border p-1 rounded-full shadow-sm">
                <TabsTrigger value="about" className="rounded-full px-8">About</TabsTrigger>
                <TabsTrigger value="pricing" className="rounded-full px-8">Pricing</TabsTrigger>
                <TabsTrigger value="availability" className="rounded-full px-8">Availability</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full px-8">Reviews</TabsTrigger>
              </TabsList>
            </div>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0">
                      <CardTitle className="text-2xl font-display">The Artist's Journey</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <p className="text-lg leading-relaxed text-muted-foreground font-light">
                        {artist.bio || 'No bio available.'}
                      </p>

                      {artist.story && (
                        <div className="relative border-l-4 border-primary/20 pl-6 py-2 italic text-muted-foreground/90">
                          <p className="text-lg leading-relaxed">
                            "{artist.story}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {(artist?.pastPerformances?.length || 0) > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold font-display">Notable Performances</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {artist.pastPerformances.map((perf: any, index: number) => (
                          <div key={index} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all">
                            <h4 className="font-bold text-lg">{perf.event}</h4>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{perf.venue}</span>
                            </div>
                            <div className="mt-3 inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                              {perf.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="rounded-3xl border-none bg-card shadow-xl shadow-saffron-100/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Award className="h-6 w-6 text-saffron-500" />
                        Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Primary Art Form</Label>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/50">
                          <Palette className="h-5 w-5 text-primary" />
                          <span className="font-bold">{artist.artForm || artist.specialty}</span>
                        </div>
                      </div>

                      {artist?.awards && (
                        <div className="space-y-3">
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Recognition</Label>
                          <ul className="space-y-3">
                            {(Array.isArray(artist.awards) ? artist.awards : [artist.awards]).map((award: any, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="mt-1 flex h-2 w-2 rounded-full bg-saffron-500 shrink-0" />
                                <span className="text-sm font-medium">{award}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="text-xl font-bold">Interested in Booking?</h3>
                      <p className="text-primary-foreground/80 text-sm">
                        Contact {artist.name} to customize a performance for your next event.
                      </p>
                      <Button variant="secondary" className="w-full rounded-full" onClick={() => {
                        setSelectedPackage(null);
                        setIsBookingModalOpen(true);
                      }}>
                        Message Artist
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-bold font-display">Performance Packages</h2>
                <p className="text-muted-foreground">Choose the perfect package for your occasion</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {artist?.pricing?.packages?.length ? (
                  artist.pricing.packages.map((pkg: any, index: number) => (
                    <Card key={index} className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 rounded-3xl">
                      {index === 1 && (
                        <div className="absolute top-0 right-0 bg-saffron-500 text-white px-4 py-1.5 text-xs font-bold rounded-bl-2xl">
                          MOST POPULAR
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-primary">{pkg.name}</CardTitle>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Clock className="h-4 w-4" />
                          {pkg.duration}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground min-h-[60px]">
                          {pkg.description}
                        </p>
                        <div className="pt-4 border-t border-border flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold">₹{(Math.round((pkg.price || 0) * 1.1)).toLocaleString("en-IN")}</span>
                          <span className="text-muted-foreground text-xs">fixed rate</span>
                        </div>
                        <Button className="w-full rounded-full bg-primary hover:bg-primary/90" onClick={() => {
                          setSelectedPackage(pkg);
                          setIsBookingModalOpen(true);
                        }}>
                          Book This Package
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-3xl">
                    <p>Standard pricing applies based on the quoted rate of ₹{(artist.totalPrice || Math.round((artist.price || 0) * 1.1)).toLocaleString("en-IN")}.</p>
                    <Button variant="outline" className="mt-4 rounded-full" onClick={() => setIsBookingModalOpen(true)}>Inquire for Quote</Button>
                  </div>
                )}
              </div>

              {artist?.pricing?.addOns?.length > 0 && (
                <div className="mt-12 space-y-6">
                  <h3 className="text-2xl font-bold font-display text-center">Enhancement Options</h3>
                  <div className="grid gap-4 max-w-3xl mx-auto">
                    {artist.pricing.addOns.map((addon: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-2xl border bg-card/50 hover:bg-card transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="font-semibold text-foreground">{addon.name}</span>
                        </div>
                        <span className="font-bold text-primary">
                          +₹{addon.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-4xl mx-auto">
                <Card className="rounded-3xl border-none shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-display">Booking Schedule</CardTitle>
                    <p className="text-muted-foreground">Dates highlighted in red are already confirmed</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-8 flex justify-center flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-secondary"></div>
                        <span className="text-sm font-medium">Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-muted"></div>
                        <span className="text-sm font-medium">Blocked</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-6 shadow-inner bg-muted/5">
                      <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div key={day} className="py-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            {day}
                          </div>
                        ))}
                        {/* Fill empty slots for the first week */}
                        {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
                          const day = i + 1;
                          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const isBlocked = artist?.availability?.blockedDates?.includes(dateStr);
                          const isBooked = artist?.availability?.bookedDates?.includes(dateStr);

                          return (
                            <button
                              key={day}
                              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${isBooked
                                ? "bg-secondary text-secondary-foreground shadow-inner"
                                : isBlocked
                                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                  : "bg-green-500/10 text-green-700 hover:bg-green-500/30 ring-1 ring-inset ring-green-500/20"
                                }`}
                              disabled={isBlocked || isBooked}
                              onClick={() => {
                                setSelectedDate(date);
                                setIsBookingModalOpen(true);
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-10 text-center">
                      <Button size="lg" className="bg-gradient-saffron px-10 rounded-full shadow-lg shadow-saffron-200" onClick={() => setIsBookingModalOpen(true)}>
                        <Calendar className="mr-2 h-5 w-5" />
                        Check Availability
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-none bg-card shadow-lg p-6 flex flex-col items-center justify-center text-center">
                      <span className="text-5xl font-extrabold text-foreground">{artist.rating || 0}</span>
                      <div className="flex my-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} strokeWidth={1.8} className={`h-5 w-5 ${starStyle(i < Math.floor(artist.rating || 0))}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm">Average rating from {artist.reviewsCount || 0} reviews</p>
                    </Card>

                    {/* Don't invite repeat submissions: the backend permits one review per customer. */}
                    {user?.role !== "customer" ? (
                      <Card className="rounded-3xl border-none bg-card p-6 shadow-lg">
                        <h4 className="mb-2 text-lg font-bold">Leave a Review</h4>
                        <p className="mb-4 text-sm text-muted-foreground">Sign in as a customer after completing a booking to leave feedback.</p>
                        <Button asChild variant="outline"><Link to="/login">Customer login</Link></Button>
                      </Card>
                    ) : isCheckingOwnReview ? (
                      <Card className="rounded-3xl border-none bg-card p-6 shadow-lg">
                        <p className="text-sm text-muted-foreground">Checking your review…</p>
                      </Card>
                    ) : reviewLookupFailed ? (
                      <Card className="rounded-3xl border-none bg-card p-6 shadow-lg">
                        <p className="text-sm text-muted-foreground">Couldn't check your review history. Refresh the page or sign in again.</p>
                      </Card>
                    ) : ownReview ? (
                      <Card className="rounded-3xl border border-green-200 bg-green-50 p-6 text-green-950 shadow-sm">
                        <h4 className="mb-2 text-lg font-bold">You've already reviewed this artist</h4>
                        <div className="mb-2 flex items-center gap-1" aria-label={`Your rating: ${ownReview.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} strokeWidth={1.8} className={`h-5 w-5 ${starStyle(star <= ownReview.rating)}`} />
                          ))}
                        </div>
                        <p className="text-sm">Your review has been published. Thank you for sharing your experience.</p>
                      </Card>
                    ) : (
                    <Card className="rounded-3xl border-none bg-card shadow-lg p-6">
                      <h4 className="font-bold text-lg mb-4">Write a Review</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2 text-sm font-medium text-foreground">Your rating</p>
                          <div className="flex items-center gap-1" role="group" aria-label="Choose a rating from 1 to 5 stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
                                aria-pressed={star === reviewRating}
                                onClick={() => setReviewRating(star)}
                                className="rounded-lg p-1.5 transition-transform hover:scale-110 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                              >
                                <Star strokeWidth={1.8} className={`h-8 w-8 transition-colors ${starStyle(star <= reviewRating)}`} />
                              </button>
                            ))}
                            <span className="ml-2 text-sm font-medium text-muted-foreground">{reviewRating ? `${reviewRating}/5` : "Select stars"}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="review-comment">Your Comment</Label>
                          <textarea
                            id="review-comment"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full min-h-[100px] rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <Button
                          className="w-full rounded-full bg-primary"
                          disabled={isSubmittingReview || reviewRating === 0 || !reviewComment.trim()}
                          onClick={async () => {
                            setIsSubmittingReview(true);
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${artist._id}/reviews`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
                              });
                              const data = await response.json();
                              if (!response.ok) throw new Error(data?.message || "Failed to submit review");
                              setArtist(data);
                              setOwnReview({ rating: reviewRating, comment: reviewComment.trim() });
                              setReviewComment("");
                              setReviewRating(0);
                              toast.success("Review submitted!");
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Failed to submit review");
                            } finally {
                              setIsSubmittingReview(false);
                            }
                          }}
                        >
                          {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Submit Review
                        </Button>
                      </div>
                    </Card>
                    )}
                  </div>

                  <Card className="lg:col-span-2 rounded-3xl border-none bg-transparent shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-2xl font-display">Voice of the Audience</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                      {displayedReviews.length > 0 ? (
                        displayedReviews.map((review: any, idx: number) => (
                          <div key={review._id || review.id || idx} className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 border border-primary/10 font-bold text-primary text-lg">
                                  {(review.name || review.user || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground text-lg">{review.name || review.user || 'Customer'}</p>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : (review.date || "")}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    strokeWidth={1.8}
                                     className={`h-4 w-4 ${starStyle(i < (review.rating || 0))}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed italic">
                              {review.comment ? `“${review.comment}”` : "No written comment."}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center text-muted-foreground bg-card rounded-3xl border border-dashed flex flex-col items-center">
                          <MessageSquare className="h-12 w-12 opacity-10 mb-4" />
                          <p>No reviews yet for this artist. Be the first to host them!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section >
    </MainLayout >
  );
};

export default ArtistProfile;
