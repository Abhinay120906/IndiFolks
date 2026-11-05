import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ChevronRight, Clock3, Heart, MapPin,
  Play, Search, ShieldCheck, Sparkles, Star, Users, Verified,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { artIllustration } from "@/lib/artIllustrations";

const heroImage = "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1800&q=85";

const artForms = [
  { name: "Classical Dance", detail: "Kathak · Bharatanatyam · Odissi", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80" },
  { name: "Folk Dance", detail: "Garba · Bihu · Ghoomar", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80" },
  { name: "Folk Music", detail: "Baul · Sufi · Rajasthani", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80" },
  { name: "Instrumentalists", detail: "Tabla · Sitar · Flute", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80" },
  { name: "Theatre & Puppetry", detail: "Kathputli · Yakshagana", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80" },
  { name: "Traditional Arts", detail: "Craft · Storytelling · Ritual", image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=80" },
];


const states = [
  ["Rajasthan", "Folk dance, puppetry & music", "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80"],
  ["Kerala", "Classical dance & ritual arts", "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80"],
  ["West Bengal", "Baul, theatre & folk traditions", "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?auto=format&fit=crop&w=900&q=80"],
  ["Tamil Nadu", "Bharatanatyam & Carnatic arts", "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80"],
];

const steps = [
  ["01", "Tell us what you need", "Choose an art form, location, event date and audience."],
  ["02", "Compare artists", "Explore verified profiles, portfolios, reviews and starting prices."],
  ["03", "Send a booking request", "Share your event details and connect directly with the artist."],
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [artistCount, setArtistCount] = useState(0);
  const [featuredArtists,setFeaturedArtists] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stats`)
      .then((r) => r.json())
      .then((r) => { if(r?.success && typeof r?.data?.totalArtists === "number") setArtistCount(r.data.totalArtists); })
      .catch(() => undefined);
    fetch(`${import.meta.env.VITE_API_URL}/api/artists?limit=4`)
      .then(r=>r.ok?r.json():[])
      .then(artists=>{if(Array.isArray(artists))setFeaturedArtists(artists);})
      .catch(()=>setFeaturedArtists([]));
  }, []);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/artists?search=${encodeURIComponent(query.trim())}` : "/artists");
  };

  const stats = useMemo(() => [
    [String(artistCount), "Verified artists"],
    ["36", "States and territories"],
    ["6", "Art categories"],
    ["Demo", "Safe test payments"],
  ], [artistCount]);

  return (
    <MainLayout>
      <main className="if-home">
        {user?.role === "artist" && <div className="border-b border-orange-200 bg-orange-50 py-3">
          <div className="if-container flex flex-wrap items-center justify-between gap-3 text-sm text-[#743a20]">
            <span><strong>Welcome back, {user.name}.</strong> Discover other performers and book artists for your own events.</span>
            <div className="flex flex-wrap gap-3">
              <Link to="/artist/dashboard" className="font-semibold underline underline-offset-4">Manage my artist dashboard</Link>
              <Link to="/bookings" className="font-semibold underline underline-offset-4">My outgoing bookings</Link>
            </div>
          </div>
        </div>}
        <section className="if-hero">
          <img src={heroImage} alt="Indian folk performance" className="if-hero-image" />
          <div className="if-hero-overlay" />
          <div className="if-hero-grain" />
          <div className="if-container if-hero-inner">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="if-hero-copy">
              <div className="if-eyebrow if-eyebrow-light"><Sparkles size={15} /> India’s cultural talent marketplace</div>
              <h1>Bring <em>India’s</em> traditions to your next celebration.</h1>
              <p>Discover and book authentic folk and classical artists for weddings, festivals, cultural programs and unforgettable private events.</p>
              <form onSubmit={submitSearch} className="if-search">
                <Search size={20} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search artists, art forms or states" aria-label="Search artists" />
                <button type="submit">Explore artists <ArrowRight size={17} /></button>
              </form>
              <div className="if-popular"><span>Popular:</span><Link to="/artists?artForm=Kathak">Kathak</Link><Link to="/artists?artForm=Bharatanatyam">Bharatanatyam</Link><Link to="/states/rajasthan">Rajasthan</Link></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .15 }} className="if-hero-note">
              <div className="if-note-icon"><Verified size={19} /></div>
              <div><strong>Curated, not crowded.</strong><span>Profiles are built around real artists, their craft and their story.</span></div>
            </motion.div>
          </div>
          <div className="if-hero-bottom"><div className="if-container if-trust-row"><span><ShieldCheck size={17}/> Verified profiles</span><span><CheckCircle2 size={17}/> Transparent pricing</span><span><Users size={17}/> Direct artist connection</span><span><Clock3 size={17}/> Flexible event dates</span></div></div>
        </section>

        <section className="if-section if-stat-section">
          <div className="if-container if-stat-grid">{stats.map(([value, label]) => <div className="if-stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
        </section>

        <section className="if-section">
          <div className="if-container">
            <div className="if-section-head"><div><div className="if-eyebrow">Find your sound & story</div><h2>Explore by art form</h2></div><Link className="if-text-link" to="/artists">View all artists <ArrowRight size={17}/></Link></div>
            <div className="if-art-grid">{artForms.map((item, i) => <Link to={`/artists?artForm=${encodeURIComponent(item.name)}`} className="if-art-card" key={item.name}><img src={item.image} alt={item.name}/><div className="if-art-shade"/><div className="if-art-copy"><span>0{i+1}</span><h3>{item.name}</h3><p>{item.detail}</p></div></Link>)}</div>
          </div>
        </section>

        <section className="if-section if-soft-section">
          <div className="if-container">
            <div className="if-section-head"><div><div className="if-eyebrow">Handpicked talent</div><h2>Artists worth discovering</h2><p className="if-section-sub">A cleaner way to browse trusted performers without getting lost in a directory.</p></div><Link className="if-text-link" to="/artists">Browse all <ArrowRight size={17}/></Link></div>
            <div className="if-artist-grid">
              {featuredArtists.length ? featuredArtists.map(artist=><article className="if-artist-card" key={artist._id}>
                <div className="if-artist-image">
                  <img src={artist.profileImage || artist.gallery?.[0]?.url || artIllustration(artist.artCategory)}
                    loading="lazy" alt={artist.profileImage || artist.gallery?.[0]?.url ? artist.name : `Illustrative ${artist.artCategory || "traditional art"} image`} />
                  <span className="if-verified"><Verified size={14}/> Verified</span>
                  {!artist.profileImage&&!artist.gallery?.[0]?.url&&<span className="absolute bottom-3 left-3 rounded bg-black/65 px-2 py-1 text-[10px] text-white">Illustrative category image</span>}
                </div>
                <div className="if-artist-body">
                  <div className="if-artist-top">
                    <div><h3>{artist.name}</h3><p>{artist.artForm || artist.specialty || "Traditional artist"}</p></div>
                    <span className="if-rating"><Star size={14} fill="currentColor"/> {artist.reviewsCount ? artist.rating : "New"}</span>
                  </div>
                  <div className="if-location"><MapPin size={15}/> {artist.state || "Location not listed"}</div>
                  <div className="if-artist-bottom">
                    <span>From <strong>₹{Number(artist.price||0).toLocaleString("en-IN")}</strong></span>
                    <Link to={`/artists/${artist._id}`}>View profile <ChevronRight size={15}/></Link>
                  </div>
                </div>
              </article>) : <div className="col-span-full rounded-xl border border-dashed border-primary/30 bg-card p-8 text-center">
                <p className="text-lg font-semibold">Our artist directory is growing</p>
                <p className="mt-2 text-sm text-muted-foreground">Approved artist profiles will appear here automatically.</p>
                <Link to="/register?role=artist" className="mt-4 inline-flex text-sm font-semibold text-primary">Register as an artist <ArrowRight size={15} className="ml-2"/></Link>
              </div>}
            </div>
          </div>
        </section>

        <section className="if-section">
          <div className="if-container">
            <div className="if-section-head"><div><div className="if-eyebrow">Across the map</div><h2>Discover India, one tradition at a time</h2></div><Link className="if-text-link" to="/states">Explore all states <ArrowRight size={17}/></Link></div>
            <div className="if-state-grid">{states.map(([name, detail, image]) => <Link className="if-state-card" to={`/states/${name.toLowerCase().replaceAll(" ", "-")}`} key={name}><img src={image} alt={name}/><div><span>Explore</span><h3>{name}</h3><p>{detail}</p></div><ArrowRight className="if-state-arrow" size={19}/></Link>)}</div>
          </div>
        </section>

        <section className="if-process">
          <div className="if-container">
            <div className="if-section-head if-process-head"><div><div className="if-eyebrow if-eyebrow-light">Simple from start to stage</div><h2>Book culture without the complexity.</h2></div><p>We designed the journey around the questions event hosts actually have.</p></div>
            <div className="if-steps">{steps.map(([number, title, text]) => <div className="if-step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
          </div>
        </section>

        <section className="if-cta">
          <div className="if-container if-cta-box"><div><div className="if-eyebrow">For artists & performers</div><h2>Your art deserves a bigger stage.</h2><p>{user?.role === "artist" ? "Manage your professional profile and make the most of the IndiFolks community." : "Create a profile, showcase your work and let event hosts discover you."}</p></div><Link className="if-primary-button" to={user?.role === "artist" ? "/artist/dashboard" : "/register?role=artist"}>{user?.role === "artist" ? "My Artist Dashboard" : "Join IndiFolks"} <ArrowRight size={17}/></Link></div>
        </section>
      </main>
    </MainLayout>
  );
};

export default Index;
