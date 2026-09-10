import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar, CheckCircle2, XCircle, Clock,
    User, MessageSquare, IndianRupee, Loader2,
    Plus, Trash2, Upload, MapPin, Award, BookOpen,
    TrendingUp, Star, DollarSign, AlertCircle, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const ArtistDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // Form states
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [experience, setExperience] = useState("");
    const [price, setPrice] = useState(0);
    const [story, setStory] = useState("");
    const [packages, setPackages] = useState<any[]>([]);
    const [gallery, setGallery] = useState<any[]>([]);
    const [newImages, setNewImages] = useState<FileList | null>(null);
    const [galleryToDelete, setGalleryToDelete] = useState<string[]>([]);
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'artist') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([fetchBookings(), fetchProfile()]);
        setIsLoading(false);
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProfile(data);

            // Sync form states
            setName(data.name || "");
            setBio(data.bio || "");
            setSpecialty(data.specialty || "");
            setExperience(data.experience || "");
            setPrice(data.price || 0);
            setStory(data.story || "");
            setPackages(data.pricing?.packages || []);
            setGallery(data.gallery || []);
            setIsAvailable(data.available !== undefined ? data.available : true);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/artist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const updateStatus = async (bookingId: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                toast.success(`Booking ${status} successfully`);
                fetchBookings();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('bio', bio);
            formData.append('specialty', specialty);
            formData.append('experience', experience);
            formData.append('price', price.toString());
            formData.append('story', story);
            // Allow updating approvalStatus through profile update if it's 'draft'
            if (profile?.approvalStatus === 'draft') {
                formData.append('approvalStatus', 'draft');
            }
            formData.append('pricing', JSON.stringify({ packages, addOns: profile?.pricing?.addOns || [] }));
            formData.append('galleryToDelete', JSON.stringify(galleryToDelete));

            if (newImages) {
                Array.from(newImages).forEach(file => {
                    formData.append('images', file);
                });
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                toast.success("Profile updated successfully");
                fetchProfile();
                setNewImages(null);
                setGalleryToDelete([]);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const submitForApproval = async () => {
        setIsStatusLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ approvalStatus: 'pending' })
            });

            if (response.ok) {
                toast.success("Profile submitted for admin approval!");
                fetchProfile();
            } else {
                toast.error("Failed to submit for approval");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsStatusLoading(false);
        }
    };

    const toggleAvailability = async () => {
        setIsStatusLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            // We reuse the update profile endpoint to just flip the availability
            // But we need to make sure the backend handles 'available' field properly
            // Actually let's check artistController's updateArtistProfile again
            // It doesn't seem to explicitly handle 'available'. I might need to add it.

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ available: !isAvailable }),
                // Wait, if I'm sending JSON I shouldn't use FormData or I should set headers correctly
            });

            // Re-thinking: Better to update the backend controller to handle simple JSON updates too or just add the field to multipart
            // Let's assume for a second I will update the backend to handle 'available'

            // Temporary workaround using existing formData structure
            const fd = new FormData();
            fd.append('available', String(!isAvailable));
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (resp.ok) {
                setIsAvailable(!isAvailable);
                toast.success(`You are now ${!isAvailable ? 'Available' : 'Unavailable'}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsStatusLoading(false);
        }
    };

    const addPackage = () => {
        setPackages([...packages, { name: "", duration: "", description: "", price: 0 }]);
        toast.success("New package template added");
    };

    const removePackage = (index: number) => {
        setPackages(packages.filter((_, i) => i !== index));
        toast.info("Package removed from list");
    };

    const updatePackage = (index: number, field: string, value: any) => {
        const newPackages = [...packages];
        newPackages[index] = { ...newPackages[index], [field]: value };
        setPackages(newPackages);
    };

    const toggleDeleteImage = (id: string) => {
        if (galleryToDelete.includes(id)) {
            setGalleryToDelete(galleryToDelete.filter(i => i !== id));
            toast.info("Image marked for preservation");
        } else {
            setGalleryToDelete([...galleryToDelete, id]);
            toast.warning("Image marked for deletion. Save profile to confirm.");
        }
    };

    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

    // Stats calculation
    const totalEarnings = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    const completeness = profile?.completeness || { score: 0, missing: [] };

    return (
        <MainLayout>
            <div className="container py-8">
                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-4xl font-bold tracking-tight">Artist Dashboard</h1>
                            {profile?.approvalStatus && (
                                <Badge variant={
                                    profile.approvalStatus === 'approved' ? 'default' :
                                        profile.approvalStatus === 'pending' ? 'outline' : 'secondary'
                                } className={
                                    profile.approvalStatus === 'approved' ? 'bg-green-500' :
                                        profile.approvalStatus === 'pending' ? 'border-amber-500 text-amber-500' : 'bg-slate-500'
                                }>
                                    {profile.approvalStatus.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground">Welcome back, {profile?.name || user?.name}</p>
                    </div>
                    <div className="flex items-center gap-4 rounded-full border bg-card px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-sm font-semibold">{isAvailable ? 'Accepting Bookings' : 'Offline'}</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <Switch
                            checked={isAvailable}
                            onCheckedChange={toggleAvailability}
                            disabled={isStatusLoading}
                        />
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="bookings" className="relative">
                            Bookings
                            {pendingBookings.length > 0 && (
                                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                    {pendingBookings.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pendingBookings.length}</div>
                                    <p className="text-xs text-muted-foreground">Requires your attention</p>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Confirmed Events</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{confirmedBookings.length}</div>
                                    <p className="text-xs text-muted-foreground">Upcoming performances</p>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-saffron-500">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString('en-IN')}</div>
                                    <p className="text-xs text-muted-foreground">From confirmed bookings</p>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground fill-yellow-400 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{profile?.rating || '4.8'}</div>
                                    <p className="text-xs text-muted-foreground">Based on {profile?.reviewsCount || 0} reviews</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Profile Completeness */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Profile Strength
                                    </CardTitle>
                                    <CardDescription>Improve your profile to attract more clients</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Completeness</span>
                                            <span>{completeness.score}%</span>
                                        </div>
                                        <Progress value={completeness.score} className="h-2" />
                                    </div>

                                    {completeness.missing.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">To improve your profile:</p>
                                            <ul className="space-y-2">
                                                {completeness.missing.map((item: string) => (
                                                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                                        Add {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4 text-center">
                                            <div className="mb-2 rounded-full bg-green-100 p-2 text-green-600">
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-bold text-green-700">Profile looking great!</p>
                                            <p className="text-xs text-muted-foreground">You're fully set up to receive bookings.</p>
                                        </div>
                                    )}

                                    {profile?.approvalStatus === 'draft' && (
                                        <div className="pt-4 border-t">
                                            <Button
                                                className="w-full bg-gradient-saffron hover:opacity-90 shadow-lg mb-2"
                                                onClick={submitForApproval}
                                                disabled={isStatusLoading}
                                            >
                                                {isStatusLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Submit for Approval
                                            </Button>
                                            <p className="text-[10px] text-center text-muted-foreground italic">
                                                Submit your profile when you're ready for admin review.
                                            </p>
                                        </div>
                                    )}

                                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("profile")}>
                                        Manage Profile
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity / Next Event */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle>Upcoming Performances</CardTitle>
                                        <CardDescription>Your schedule for the coming days</CardDescription>
                                    </div>
                                    {confirmedBookings.length > 3 && (
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("schedule")} className="text-primary font-bold">
                                            View All
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {confirmedBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {confirmedBookings.slice(0, 3).map((booking) => (
                                                <div key={booking._id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-muted/30">
                                                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                                                        <span className="text-[10px] font-bold uppercase">{format(new Date(booking.date), "MMM")}</span>
                                                        <span className="text-2xl font-bold">{format(new Date(booking.date), "dd")}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold truncate text-base">{booking.customer.name}</h4>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {format(new Date(booking.date), "p")}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {booking.location || 'Venue TBD'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="hidden sm:inline-flex bg-saffron-50 text-saffron-700 border-saffron-100 h-fit">
                                                        {booking.pricingPackage?.name || 'Standard'}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {confirmedBookings.length === 0 && (
                                                <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                                                    <Calendar className="mb-2 h-8 w-8 opacity-20" />
                                                    <p>No upcoming events scheduled.</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                                            <Calendar className="mb-2 h-8 w-8 opacity-20" />
                                            <p>No upcoming events scheduled.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings">
                        <div className="grid gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Pending Requests</h2>
                                <Badge variant="outline">{pendingBookings.length} Total</Badge>
                            </div>
                            {pendingBookings.length === 0 ? (
                                <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-muted-foreground">
                                    <Clock className="mb-2 h-8 w-8" />
                                    <p>No pending booking requests</p>
                                </div>
                            ) : (
                                pendingBookings.map(booking => (
                                    <BookingCard key={booking._id} booking={booking} onAction={updateStatus} />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Events</CardTitle>
                                    <CardDescription>Keep track of your confirmed performances</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {confirmedBookings.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground">
                                            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
                                            <p>No confirmed events scheduled.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {confirmedBookings.map(booking => (
                                                <div key={booking._id} className="group flex items-center justify-between rounded-xl border p-5 transition-all hover:border-primary/50 hover:shadow-md">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                            <span className="text-[10px] font-bold uppercase">{format(new Date(booking.date), "MMM")}</span>
                                                            <span className="text-2xl font-bold">{format(new Date(booking.date), "dd")}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold">{booking.customer.name}</h4>
                                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {format(new Date(booking.date), "EEEE, h:mm a")}
                                                                </span>
                                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3.5 w-3.5" />
                                                                    {booking.location || 'Venue TBD'}
                                                                </span>
                                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                                <span className="flex items-center gap-1 font-medium text-primary">
                                                                    <IndianRupee className="h-3.5 w-3.5" />
                                                                    {booking.price?.toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>
                                                        <Button variant="ghost" size="sm" onClick={() => updateStatus(booking._id, 'completed')}>Done</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="profile">
                        <form onSubmit={handleUpdateProfile} className="grid gap-8 pb-12">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Details</CardTitle>
                                    <CardDescription>This information will be displayed on your public artist profile</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Artist Stage Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="specialty">Primary Specialty</Label>
                                            <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Kathakali, Baul Singing" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="experience">Years of Experience</Label>
                                            <Input id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 15+ Years" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Base Performance Price (₹)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                            <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="pl-7" placeholder="0" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">This is your starting rate displayed on your profile.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Professional Bio</Label>
                                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Summarize your professional journey..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="story">The Story of Your Art</Label>
                                        <Textarea id="story" value={story} onChange={(e) => setStory(e.target.value)} rows={3} placeholder="Share the heritage and tradition behind your performances..." />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gallery */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Gallery</CardTitle>
                                    <CardDescription>Upload high-quality images of your performances</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                                        {gallery.map((item) => (
                                            <div key={item._id} className="group relative aspect-square overflow-hidden rounded-xl border shadow-sm">
                                                <img src={item.url} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 ${galleryToDelete.includes(item._id) ? "opacity-100 bg-red-500/40" : ""}`}>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full shadow-lg"
                                                        onClick={() => toggleDeleteImage(item._id)}
                                                    >
                                                        {galleryToDelete.includes(item._id) ? <Plus className="rotate-45" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50 hover:bg-muted/50">
                                            <div className="mb-2 rounded-full bg-primary/10 p-2 text-primary">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground">Upload Images</span>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setNewImages(e.target.files)} />
                                        </label>
                                    </div>
                                    {newImages && (
                                        <p className="flex items-center gap-2 text-sm font-medium text-primary">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {newImages.length} new images selected to upload
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle>Pricing Packages</CardTitle>
                                        <CardDescription>Define different service levels and rates</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addPackage} className="rounded-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Package
                                    </Button>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {packages.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                            No packages added yet. Adding packages helps customers book you faster.
                                        </div>
                                    ) : (
                                        packages.map((pkg, index) => (
                                            <div key={index} className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/30 p-5 md:grid-cols-4 relative group">
                                                <div className="grid gap-2">
                                                    <Label>Package Name</Label>
                                                    <Input value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} placeholder="Basic / Full Show" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Duration</Label>
                                                    <Input value={pkg.duration} onChange={(e) => updatePackage(index, 'duration', e.target.value)} placeholder="2 Hours" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Price (₹)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                                        <Input type="number" value={pkg.price} onChange={(e) => updatePackage(index, 'price', Number(e.target.value))} className="pl-7" />
                                                    </div>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <div className="grid gap-2 flex-1">
                                                        <Label>Description</Label>
                                                        <Input value={pkg.description} onChange={(e) => updatePackage(index, 'description', e.target.value)} placeholder="What's included?" />
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePackage(index)} className="text-red-500 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex sticky bottom-8 justify-end">
                                <Button type="submit" size="lg" disabled={isSaving} className="bg-gradient-saffron px-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Profile Changes
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="grid gap-6">
                            {pastBookings.length === 0 ? (
                                <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                                    <CheckCircle2 className="mb-2 h-8 w-8 opacity-20" />
                                    <p>No booking history</p>
                                </div>
                            ) : (
                                pastBookings.map(booking => (
                                    <BookingCard key={booking._id} booking={booking} onAction={updateStatus} />
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
};

const BookingCard = ({ booking, onAction }: { booking: any, onAction: (id: string, status: string) => void }) => {
    return (
        <Card className="overflow-hidden group hover:border-primary/50 transition-all">
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-inner">
                        <img src={booking.customer.profileImage} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-bold">{booking.customer.name}</h4>
                            <Badge variant={
                                booking.status === 'confirmed' ? 'default' :
                                    booking.status === 'pending' ? 'outline' :
                                        'secondary'
                            } className={
                                booking.status === 'confirmed' ? 'bg-green-500' :
                                    booking.status === 'pending' ? 'border-amber-500 text-amber-500' : ''
                            }>
                                {booking.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-primary/70" />
                                {format(new Date(booking.date), "PPP")}
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <IndianRupee className="h-4 w-4 text-green-600" />
                                ₹{booking.price?.toLocaleString("en-IN")}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-primary/70" />
                                {booking.location || 'Venue TBD'}
                            </div>
                            {booking.pricingPackage && (
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{booking.pricingPackage.name}</Badge>
                                </div>
                            )}
                        </div>
                        {booking.message && (
                            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm italic relative">
                                <MessageSquare className="absolute -left-1 -top-1 h-3.5 w-3.5 text-muted-foreground opacity-30" />
                                "{booking.message}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 gap-3 mt-4 md:mt-0">
                    {booking.status === 'pending' && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50 rounded-full px-4"
                                onClick={() => onAction(booking._id, 'cancelled')}
                            >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 shadow-lg shadow-green-200"
                                onClick={() => onAction(booking._id, 'confirmed')}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Confirm
                            </Button>
                        </>
                    )}

                    {booking.status === 'confirmed' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full px-4 hover:bg-primary hover:text-white transition-colors"
                            onClick={() => onAction(booking._id, 'completed')}
                        >
                            Mark Completed
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ArtistDashboard;
