import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Camera, Loader2 } from 'lucide-react';

export default function Profile() {
    const { user, login } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [stateLocation, setStateLocation] = useState(user?.state || '');
    const [specialty, setSpecialty] = useState(user?.specialty || '');

    // Image state
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImage || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setStateLocation(user.state || '');
            setSpecialty(user.specialty || '');
            setPreviewUrl(user.profileImage || null);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);

            if (user.role === 'artist') {
                formData.append('bio', bio);
                formData.append('state', stateLocation);
                formData.append('specialty', specialty);
            }

            if (selectedFile) {
                formData.append('profileImage', selectedFile);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local user state
            login(data as User);

            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });

            // Clear selected file after successful upload
            setSelectedFile(null);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <p className="text-muted-foreground">Please log in to view your profile.</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container max-w-2xl py-8">
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display">Your Profile</CardTitle>
                        <CardDescription>Update your personal information and profile picture.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center space-y-4 pb-4">
                                <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-muted relative z-10">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-4xl">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            {/* Common Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        required
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="bg-muted cursor-not-allowed text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                </div>
                            </div>

                            {/* Artist Specific Fields */}
                            {user.role === 'artist' && (
                                <div className="space-y-4 pt-4 border-t border-border mt-4">
                                    <h3 className="font-semibold text-lg text-foreground">Artist Details</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="specialty">Specialty</Label>
                                        <Input
                                            id="specialty"
                                            value={specialty}
                                            onChange={(e) => setSpecialty(e.target.value)}
                                            placeholder="e.g. Classical Dance, Vocals, Pottery"
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stateLocation">State</Label>
                                        <Input
                                            id="stateLocation"
                                            value={stateLocation}
                                            onChange={(e) => setStateLocation(e.target.value)}
                                            placeholder="e.g. Maharashtra"
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us about your art and experience"
                                            rows={4}
                                            className="bg-background resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading} className="bg-gradient-saffron hover:opacity-90 px-8">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
