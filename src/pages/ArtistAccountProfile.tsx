import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ExternalLink, Image as ImageIcon, Loader2, MapPin, Pencil, RefreshCcw } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

type ArtistProfileData = {
  _id: string;
  name: string;
  profileImage?: string;
  state?: string;
  artForm?: string;
  specialty?: string;
  bio?: string;
  experience?: string;
  story?: string;
  price?: number;
  approvalStatus?: string;
  gallery?: { _id?: string; url: string; title?: string }[];
  completeness?: { score: number; missing: string[] };
};

const editLink = "/artist/dashboard?tab=profile";

export default function ArtistAccountProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ArtistProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user?._id || !token) {
      setLoading(false);
      setError("Sign in as an artist to view your profile.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`${import.meta.env.VITE_API_URL}/api/artists/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw Error(data?.message || "Failed to load your artist profile");
        return data as ArtistProfileData;
      })
      .then(data => {
        if (cancelled) return;
        setProfile(data);
        // Keep navigation/account identity in step with the latest saved server data.
        updateUser({
          name: data.name,
          state: data.state,
          artForm: data.artForm,
          specialty: data.specialty,
          profileImage: data.profileImage || "",
          bio: data.bio,
        });
      })
      .catch(reason => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Profile unavailable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?._id, refresh]);

  return <MainLayout>
    <div className="container max-w-5xl space-y-6 py-8 md:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-sm font-medium text-[#9a4b26]">ARTIST ACCOUNT</div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">My Artist Profile</h1>
          <p className="mt-2 text-muted-foreground">Your saved details, as used by IndiFolks. Editing is managed in the artist dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => setRefresh(x => x + 1)}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild className="bg-[#c65a2d] text-white hover:bg-[#9f3e1c] focus-visible:ring-[#9f3e1c]">
            <Link to={editLink}><Pencil className="mr-2 h-4 w-4" /> Edit in Dashboard</Link>
          </Button>
        </div>
      </div>

      {loading ? <div className="flex min-h-40 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading your latest profile…
      </div> : error ? <Card><CardContent className="space-y-3 py-6">
        <p role="alert" className="font-medium text-destructive">{error}</p>
        <Button variant="outline" onClick={() => setRefresh(x => x + 1)}>Try again</Button>
      </CardContent></Card> : profile && <>
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
              {profile.profileImage
                ? <img src={profile.profileImage} alt={`${profile.name} profile picture`} className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-muted-foreground">
                    {profile.name?.charAt(0).toUpperCase() || "A"}
                  </div>}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <Badge variant="secondary" className="capitalize">{profile.approvalStatus || "artist"}</Badge>
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#c65a2d]"/>{profile.state || "State not added"}</span>
                <span className="font-semibold">{profile.artForm || "Art form not added"}</span>
                {profile.specialty && <span>{profile.specialty}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">Profile strength: {profile.completeness?.score ?? 0}%</span>
                {profile.completeness?.missing?.length === 0 && <span className="inline-flex items-center gap-1 text-sm text-green-700"><CheckCircle2 className="h-4 w-4"/> Complete</span>}
                <Button asChild variant="outline" size="sm">
                  <Link to={`/artists/${profile._id}`}>View customer-facing profile <ExternalLink className="ml-1 h-4 w-4"/></Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Professional details</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div><p className="mb-1 text-muted-foreground">Primary art form</p><p className="font-semibold">{profile.artForm || "Not added"}</p></div>
              <div><p className="mb-1 text-muted-foreground">Additional specialty</p><p className="font-semibold">{profile.specialty || "Not added"}</p></div>
              <div><p className="mb-1 text-muted-foreground">Experience</p><p className="font-semibold">{profile.experience || "Not added"}</p></div>
              <div><p className="mb-1 text-muted-foreground">Performance price</p><p className="font-semibold">₹{Number(profile.price || 0).toLocaleString("en-IN")}</p></div>
              <div><p className="mb-1 text-muted-foreground">Bio</p><p className="whitespace-pre-wrap break-words">{profile.bio || "Not added"}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Your artistic journey</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap break-words">{profile.story || "You haven't added your artistic story yet."}</p>
              <div className="border-t pt-4">
                <p className="mb-3 font-semibold">Performance gallery ({profile.gallery?.length || 0})</p>
                {profile.gallery?.length ? <div className="grid grid-cols-3 gap-2">
                  {profile.gallery.slice(0,12).map((photo,i) => <img
                    key={photo._id || photo.url || i}
                    src={photo.url}
                    alt={photo.title || `Performance gallery photo ${i+1}`}
                    loading="lazy" className="aspect-square w-full rounded-lg border object-cover" />)}
                </div> : <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-4 text-muted-foreground">
                  <ImageIcon className="h-5 w-5"/> No gallery photos uploaded yet
                </div>}
              </div>
            </CardContent>
          </Card>
        </div>
        {profile.completeness?.missing?.length ? <Card>
          <CardContent className="space-y-3 p-6">
            <p className="font-semibold">Finish your profile</p>
            <p className="text-sm text-muted-foreground">Missing details: {profile.completeness.missing.join(", ")}.</p>
            <Button asChild variant="outline"><Link to={editLink}>Add details in Dashboard <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
          </CardContent>
        </Card> : null}
      </>}
    </div>
  </MainLayout>;
}
