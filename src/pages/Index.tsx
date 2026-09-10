import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ChevronRight, Clock3, Heart, MapPin,
  Play, Search, ShieldCheck, Sparkles, Star, Users, Verified,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";

const heroImage = "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1800&q=85";

const artForms = [
  { name: "Classical Dance", detail: "Kathak · Bharatanatyam · Odissi", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80" },
  { name: "Folk Dance", detail: "Garba · Bihu · Ghoomar", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80" },
  { name: "Folk Music", detail: "Baul · Sufi · Rajasthani", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80" },
  { name: "Instrumentalists", detail: "Tabla · Sitar · Flute", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80" },
  { name: "Theatre & Puppetry", detail: "Kathputli · Yakshagana", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80" },
  { name: "Traditional Arts", detail: "Craft · Storytelling · Ritual", image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=80" },
];

const artists = [
  { name: "Meera Sharma", form: "Kathak", location: "Jaipur, Rajasthan", rating: 4.9, price: "₹8,000+", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
  { name: "Arjun Das", form: "Tabla & Folk Music", location: "Kolkata, West Bengal", rating: 4.8, price: "₹6,500+", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80" },
  { name: "Ananya Nair", form: "Bharatanatyam", location: "Chennai, Tamil Nadu", rating: 5.0, price: "₹10,000+", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80" },
  { name: "Ravi Bhati", form: "Rajasthani Folk", location: "Jodhpur, Rajasthan", rating: 4.9, price: "₹7,500+", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80" },
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [artistCount, setArtistCount] = useState(500);

  useEffect(() => {
    if (isAuthenticated && user?.role === "artist") navigate("/artist/dashboard");
    fetch(`${import.meta.env.VITE_API_URL}/api/stats`)
      .then((r) => r.json())
      .then((r) => r?.success && r?.data?.totalArtists && setArtistCount(r.data.totalArtists))
      .catch(() => undefined);
  }, [isAuthenticated, user, navigate]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/artists?search=${encodeURIComponent(query.trim())}` : "/artists");
  };

  const stats = useMemo(() => [
    [String(artistCount) + "+", "Verified artists"],
    ["28", "States represented"],
    ["4.9/5", "Average rating"],
    ["24/7", "Booking support"],
  ], [artistCount]);

  return (
    <MainLayout>
      <main className="if-home">
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
            <div className="if-artist-grid">{artists.map((artist) => <article className="if-artist-card" key={artist.name}><div className="if-artist-image"><img src={artist.image} alt={artist.name}/><button aria-label={`Save ${artist.name}`}><Heart size={18}/></button><span className="if-verified"><Verified size={14}/> Verified</span></div><div className="if-artist-body"><div className="if-artist-top"><div><h3>{artist.name}</h3><p>{artist.form}</p></div><span className="if-rating"><Star size={14} fill="currentColor"/> {artist.rating}</span></div><div className="if-location"><MapPin size={15}/> {artist.location}</div><div className="if-artist-bottom"><span>From <strong>{artist.price}</strong></span><Link to="/artists">View profile <ChevronRight size={15}/></Link></div></div></article>)}</div>
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
          <div className="if-container if-cta-box"><div><div className="if-eyebrow">For artists & performers</div><h2>Your art deserves a bigger stage.</h2><p>Create a profile, showcase your work and let event hosts discover you.</p></div><Link className="if-primary-button" to="/register?role=artist">Join IndiFolks <ArrowRight size={17}/></Link></div>
        </section>
      </main>
    </MainLayout>
  );
};

export default Index;
