import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtistTaxonomyFields from "@/components/ArtistTaxonomyFields";
import { ART_ILLUSTRATIONS } from "@/lib/artIllustrations";

export default function Register() {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'artist' ? 'artist' : 'customer';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: initialRole,
        bio: '',
        state: '',
        specialty: '',
        artForm: '',
        awards: '',
    });

    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.role === 'artist' && (!formData.state.trim() || !formData.artForm.trim())) {
            toast({ variant: 'destructive', title: 'Missing artist details', description: 'Choose your state and art form, or enter them using Other.' });
            return;
        }
        setIsLoading(true);

        try {
            let bodyData;
            let headersData: HeadersInit = {};

            if (formData.role === 'artist' && profileImage) {
                const submitData = new FormData();
                submitData.append('name', formData.name);
                submitData.append('email', formData.email);
                submitData.append('password', formData.password);
                submitData.append('role', formData.role);
                submitData.append('bio', formData.bio);
                submitData.append('state', formData.state);
                submitData.append('specialty', formData.specialty);
                submitData.append('artForm', formData.artForm);
                submitData.append('awards', formData.awards);
                submitData.append('profileImage', profileImage);
                bodyData = submitData;
                // Don't set Content-Type header when sending FormData, browser will set it with the boundary
            } else {
                const payload = { ...formData };
                if (payload.role !== 'artist') {
                    payload.bio = '';
                    payload.state = '';
                    payload.specialty = '';
                    payload.artForm = '';
                    payload.awards = '';
                }
                bodyData = JSON.stringify(payload);
                headersData['Content-Type'] = 'application/json';
            }


            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: headersData,
                body: bodyData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.pendingApproval) {
                toast({
                    title: 'Registration Submitted',
                    description: data.message,
                });
                navigate('/login');
            } else {
                login(data as User);
                toast({
                    title: 'Success',
                    description: 'Account created successfully',
                });
                navigate('/');
            }

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

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md my-8">
                    <CardHeader>
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription>Sign up to get started</CardDescription>
                    </CardHeader>
                    <Tabs value={formData.role} onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))} className="w-full">
                        <div className="px-6 pt-2">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="customer">Customer</TabsTrigger>
                                <TabsTrigger value="artist">Artist</TabsTrigger>
                                </TabsList>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {formData.role === 'artist' && (
                                    <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/50 transition-all animate-in fade-in slide-in-from-top-2">
                                        <h3 className="font-semibold text-sm">Tell customers where to find your art</h3>
                                        <div className="grid grid-cols-3 gap-2" aria-label="Examples of Indian performance art">
                                            {[
                                                ['Classical Dance', ART_ILLUSTRATIONS['Classical Dance']],
                                                ['Folk Music', ART_ILLUSTRATIONS['Folk Music']],
                                                ['Traditional Arts', ART_ILLUSTRATIONS['Traditional Arts']]
                                            ].map(([title,src]) => (
                                                <div key={title} className="overflow-hidden rounded-lg bg-card">
                                                    <img src={src} alt={`${title} illustration`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                                                    <p className="px-1 py-2 text-center text-[10px] font-medium">{title}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Choose a recognised state and art form so visitors can discover you in search.
                                            Can't find your tradition? Select Other and enter its name.
                                        </p>

                                        <div className="space-y-2">
                                            <Label htmlFor="profileImage">Profile Image</Label>
                                            <Input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} />
                                            <p className="text-xs text-muted-foreground">Optional. Profile images require cloud storage to be configured.</p>
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                                                    <img src={imagePreview} alt="Profile Preview" className="h-24 w-24 object-cover rounded-md border" />
                                                </div>
                                            )}
                                        </div>



                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Input id="bio" value={formData.bio} onChange={handleChange} required />
                                        </div>
                                        <ArtistTaxonomyFields
                                            required
                                            state={formData.state}
                                            artForm={formData.artForm}
                                            specialty={formData.specialty}
                                            onStateChange={value=>setFormData(prev=>({...prev,state:value}))}
                                            onArtFormChange={value=>setFormData(prev=>({...prev,artForm:value}))}
                                            onSpecialtyChange={value=>setFormData(prev=>({...prev,specialty:value}))}
                                        />
                                        <div className="space-y-2">
                                            <Label htmlFor="awards">Awards (Optional)</Label>
                                            <Input id="awards" value={formData.awards} onChange={handleChange} placeholder="e.g. National Art Prize 2023" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Loading...' : 'Register'}
                                </Button>
                                <div className="text-sm text-center text-muted-foreground">
                                    Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Tabs>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
