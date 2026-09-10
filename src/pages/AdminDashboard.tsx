import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Artist {
    _id: string;
    name: string;
    email: string;
    profileImage: string;
    bio?: string;
    state?: string;
    specialty?: string;
    artForm?: string;
    experience?: string;
    story?: string;
    price?: number;
    adminFee?: number;
    totalPrice?: number;
    awards?: string;
    gallery?: { url: string; type: string; title?: string }[];
    isApproved: boolean;
    approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
    aadharNumber?: string;
    createdAt: string;
}

interface UserRecord {
    _id: string;
    name: string;
    email: string;
    role: 'customer' | 'artist' | 'admin';
    profileImage: string;
    isApproved?: boolean;
    aadharNumber?: string;
    createdAt: string;
    // Artist specific fields if role is artist
    bio?: string;
    state?: string;
    artForm?: string;
    specialty?: string;
    price?: number;
    totalPrice?: number;
    adminFee?: number;
}

interface Booking {
    _id: string;
    customer: { _id: string; name: string; email: string; profileImage: string };
    artist: { _id: string; name: string; email: string; profileImage: string; artForm: string; specialty: string };
    date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    price: number;
    location: string;
    createdAt: string;
}

type ActiveTab = 'pending' | 'artists' | 'users' | 'bookings';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState<ActiveTab>('pending');
    const [artists, setArtists] = useState<Artist[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingArtists, setIsLoadingArtists] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

    const token = user?.token || localStorage.getItem('token');

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    const fetchArtists = useCallback(async () => {
        setIsLoadingArtists(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/artists`, { headers: authHeaders });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setArtists(data);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoadingArtists(false);
        }
    }, [token]);

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: authHeaders });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUsers(data);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoadingUsers(false);
        }
    }, [token]);

    const fetchBookings = useCallback(async () => {
        setIsLoadingBookings(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, { headers: authHeaders });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setBookings(data);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoadingBookings(false);
        }
    }, [token]);

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'bookings') fetchBookings();
    }, [activeTab, fetchUsers, fetchBookings]);

    const approveArtist = async (id: string) => {
        setActionLoading(id + '-approve');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/artists/${id}/approve`, { method: 'PATCH', headers: authHeaders });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setArtists((prev) => prev.map((a) => (a._id === id ? { ...a, isApproved: true } : a)));
            toast({ title: '✅ Artist Approved', description: 'Artist can now log in and be listed.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    const rejectArtist = async (id: string) => {
        setActionLoading(id + '-reject');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/artists/${id}/reject`, { method: 'PATCH', headers: authHeaders });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setArtists((prev) => prev.map((a) => (a._id === id ? { ...a, isApproved: false } : a)));
            toast({ title: '❌ Artist Rejected', description: 'Artist access has been revoked.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setActionLoading(id + '-delete');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            setArtists((prev) => prev.filter((a) => a._id !== id));
            toast({ title: 'User Deleted', description: 'User has been removed.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const pendingArtists = artists.filter((a) => a.approvalStatus === 'pending' || (!a.isApproved && a.approvalStatus !== 'rejected'));

    const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
        {
            id: 'pending',
            label: 'Pending Approval',
            count: pendingArtists.length,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            id: 'artists',
            label: 'All Artists',
            count: artists.length,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            id: 'users',
            label: 'All Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            id: 'bookings',
            label: 'Global Bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-16'
                    } transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    {sidebarOpen && (
                        <div className="overflow-hidden">
                            <p className="text-white font-bold text-sm leading-none">Indifolks</p>
                            <p className="text-violet-400 text-xs tracking-widest uppercase">Admin</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-auto text-gray-500 hover:text-gray-300 transition-colors"
                        title="Toggle sidebar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {sidebarOpen && (
                                <>
                                    <span className="truncate">{item.label}</span>
                                    {item.count !== undefined && (
                                        <span
                                            className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.id === 'pending' && item.count > 0
                                                ? 'bg-amber-500/20 text-amber-300'
                                                : 'bg-gray-700 text-gray-400'
                                                }`}
                                        >
                                            {item.count}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-3 border-t border-gray-800">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
                            <img
                                src={user?.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                                alt={user?.name}
                                className="w-7 h-7 rounded-full object-cover border border-gray-600"
                            />
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {sidebarOpen && 'Sign Out'}
                    </button>
                    {sidebarOpen && (
                        <Link
                            to="/"
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-400 transition-colors"
                        >
                            ← Main site
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="bg-gray-900/60 border-b border-gray-800 backdrop-blur px-6 py-4 flex items-center gap-4">
                    <div>
                        <h1 className="text-white font-bold text-xl">
                            {activeTab === 'pending' && 'Pending Approvals'}
                            {activeTab === 'artists' && 'All Artists'}
                            {activeTab === 'users' && 'All Users'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'pending' && `${pendingArtists.length} artist(s) awaiting review`}
                            {activeTab === 'artists' && `${artists.length} total artists registered`}
                            {activeTab === 'users' && `${users.length} total users`}
                            {activeTab === 'bookings' && `${bookings.length} total bookings`}
                        </p>
                    </div>
                    <button
                        onClick={() => { fetchArtists(); if (activeTab === 'users') fetchUsers(); }}
                        className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </header>

                <div className="p-6">

                    {/* ── PENDING ARTISTS ── */}
                    {activeTab === 'pending' && (
                        <div>
                            {isLoadingArtists ? (
                                <LoadingSpinner />
                            ) : pendingArtists.length === 0 ? (
                                <EmptyState icon="✅" title="All caught up!" desc="No artists are pending approval right now." />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {pendingArtists.map((artist) => (
                                        <ArtistCard
                                            key={artist._id}
                                            artist={artist}
                                            actionLoading={actionLoading}
                                            onApprove={approveArtist}
                                            onReject={rejectArtist}
                                            onDelete={deleteUser}
                                            onViewDetails={(a) => setSelectedArtist(a)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ALL ARTISTS ── */}
                    {activeTab === 'artists' && (
                        <div>
                            {isLoadingArtists ? (
                                <LoadingSpinner />
                            ) : artists.length === 0 ? (
                                <EmptyState icon="🎨" title="No artists yet" desc="Artists who register will appear here." />
                            ) : (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Artist</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Specialty</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">State</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Joined</th>
                                                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {artists.map((artist) => (
                                                <tr key={artist._id} className="hover:bg-gray-800/40 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={artist.profileImage}
                                                                alt={artist.name}
                                                                className="w-9 h-9 rounded-full object-cover border border-gray-700"
                                                            />
                                                            <div>
                                                                <p className="text-white text-sm font-medium">{artist.name}</p>
                                                                <p className="text-gray-500 text-xs">{artist.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-300 text-sm">{artist.specialty || '—'}</td>
                                                    <td className="px-5 py-3 text-gray-300 text-sm">{artist.state || '—'}</td>
                                                    <td className="px-5 py-3">
                                                        <StatusBadge approved={artist.isApproved} status={artist.approvalStatus} />
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(artist.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!artist.isApproved ? (
                                                                <ActionButton
                                                                    onClick={() => approveArtist(artist._id)}
                                                                    loading={actionLoading === artist._id + '-approve'}
                                                                    variant="approve"
                                                                    label="Approve"
                                                                />
                                                            ) : (
                                                                <ActionButton
                                                                    onClick={() => rejectArtist(artist._id)}
                                                                    loading={actionLoading === artist._id + '-reject'}
                                                                    variant="reject"
                                                                    label="Revoke"
                                                                />
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedArtist(artist)}
                                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <ActionButton
                                                                onClick={() => deleteUser(artist._id)}
                                                                loading={actionLoading === artist._id + '-delete'}
                                                                variant="delete"
                                                                label="Delete"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ALL USERS ── */}
                    {activeTab === 'users' && (
                        <div>
                            {isLoadingUsers ? (
                                <LoadingSpinner />
                            ) : users.length === 0 ? (
                                <EmptyState icon="👥" title="No users yet" desc="Registered users will appear here." />
                            ) : (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">User</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Role</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Joined</th>
                                                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {users.map((u) => (
                                                <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={u.profileImage}
                                                                alt={u.name}
                                                                className="w-9 h-9 rounded-full object-cover border border-gray-700"
                                                            />
                                                            <div>
                                                                <p className="text-white text-sm font-medium">{u.name}</p>
                                                                <p className="text-gray-500 text-xs">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <RoleBadge role={u.role} />
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {u.role === 'artist' ? <StatusBadge approved={!!u.isApproved} /> : <span className="text-gray-500 text-xs">—</span>}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setSelectedUser(u)}
                                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            {u.role !== 'admin' && (
                                                                <ActionButton
                                                                    onClick={() => deleteUser(u._id)}
                                                                    loading={actionLoading === u._id + '-delete'}
                                                                    variant="delete"
                                                                    label="Delete"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── GLOBAL BOOKINGS ── */}
                    {activeTab === 'bookings' && (
                        <div>
                            {isLoadingBookings ? (
                                <LoadingSpinner />
                            ) : bookings.length === 0 ? (
                                <EmptyState icon="📅" title="No bookings yet" desc="All bookings across the platform will appear here." />
                            ) : (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Customer</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Artist</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Price</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Venue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {bookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-800/40 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img src={booking.customer?.profileImage} className="w-7 h-7 rounded-full object-cover" />
                                                            <div>
                                                                <p className="text-white text-xs font-medium">{booking.customer?.name}</p>
                                                                <p className="text-gray-500 text-[10px]">{booking.customer?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img src={booking.artist?.profileImage} className="w-7 h-7 rounded-full object-cover" />
                                                            <div>
                                                                <p className="text-white text-xs font-medium">{booking.artist?.name}</p>
                                                                <p className="text-gray-500 text-[10px]">{booking.artist?.specialty}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-300 text-xs">
                                                        {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                            booking.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-white text-xs font-bold">₹{booking.price?.toLocaleString()}</td>
                                                    <td className="px-5 py-3 text-gray-500 text-xs truncate max-w-[150px]">{booking.location}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Artist Detail Modal */}
            {selectedArtist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <img src={selectedArtist.profileImage} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-700" />
                                <div>
                                    <h2 className="text-white font-bold text-2xl">{selectedArtist.name}</h2>
                                    <p className="text-gray-400 text-sm">{selectedArtist.email} • {selectedArtist.state}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedArtist(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Professional Summary</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">{selectedArtist.bio || 'No bio provided.'}</p>
                                    </section>
                                    <section>
                                        <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Art Form & Specialty</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{selectedArtist.artForm}</Badge>
                                            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">{selectedArtist.specialty}</Badge>
                                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{selectedArtist.experience}</Badge>
                                        </div>
                                    </section>
                                    <section className="bg-gray-800/40 p-4 rounded-2xl border border-gray-700/50">
                                        <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">Pricing Breakdown</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Artist Price:</span>
                                                <span className="text-white">₹{selectedArtist.price?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Admin Commission (10%):</span>
                                                <span className="text-emerald-400">+₹{selectedArtist.adminFee?.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-700 flex justify-between">
                                                <span className="text-white font-bold">Total Customer Price:</span>
                                                <span className="text-violet-400 font-bold text-lg">₹{selectedArtist.totalPrice?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Aadhar Number</h3>
                                        <p className="text-white font-mono">{selectedArtist.aadharNumber || 'Not provided'}</p>
                                    </section>
                                </div>
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">The Artist's Story</h3>
                                        <p className="text-gray-400 text-sm italic">"{selectedArtist.story || 'No story provided.'}"</p>
                                    </section>
                                    {selectedArtist.awards && (
                                        <section>
                                            <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Awards & Recognition</h3>
                                            <p className="text-gray-300 text-sm">{selectedArtist.awards}</p>
                                        </section>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Preview */}
                            {selectedArtist.gallery?.length > 0 && (
                                <section>
                                    <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-4">Gallery ({selectedArtist.gallery.length})</h3>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {selectedArtist.gallery.map((img: any, i: number) => (
                                            <img key={i} src={img.url} className="aspect-square rounded-lg object-cover border border-gray-800 hover:border-violet-500/50 transition-colors cursor-pointer" />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex gap-3">
                            {!selectedArtist.isApproved ? (
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 rounded-xl"
                                    onClick={() => { approveArtist(selectedArtist._id); setSelectedArtist(null); }}
                                    disabled={!!actionLoading}
                                >
                                    Approve Profile
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-6 rounded-xl"
                                    onClick={() => { rejectArtist(selectedArtist._id); setSelectedArtist(null); }}
                                    disabled={!!actionLoading}
                                >
                                    Revoke Approval
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                className="px-8 py-6 rounded-xl font-bold"
                                onClick={() => { deleteUser(selectedArtist._id); setSelectedArtist(null); }}
                                disabled={!!actionLoading}
                            >
                                Delete Artist
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <img src={selectedUser.profileImage} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-700" />
                                <div>
                                    <h2 className="text-white font-bold text-xl">{selectedUser.name}</h2>
                                    <div className="flex gap-2 items-center mt-1">
                                        <RoleBadge role={selectedUser.role} />
                                        <p className="text-gray-500 text-xs">ID: {selectedUser._id}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <section>
                                    <h3 className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address</h3>
                                    <p className="text-white text-sm break-all">{selectedUser.email}</p>
                                </section>
                                <section>
                                    <h3 className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Joined System</h3>
                                    <p className="text-white text-sm">{new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </section>
                                <section>
                                    <h3 className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Identification (Aadhar)</h3>
                                    <p className="text-white text-sm font-mono">{selectedUser.aadharNumber || 'Not Provided'}</p>
                                </section>
                                {selectedUser.role === 'artist' && (
                                    <section>
                                        <h3 className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Artistic Specialty</h3>
                                        <p className="text-white text-sm">{selectedUser.specialty || selectedUser.artForm || '—'}</p>
                                    </section>
                                )}
                            </div>

                            {selectedUser.bio && (
                                <section>
                                    <h3 className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">User Bio</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">{selectedUser.bio}</p>
                                </section>
                            )}

                            {selectedUser.role === 'artist' && selectedUser.totalPrice && (
                                <section className="bg-violet-500/5 p-4 rounded-xl border border-violet-500/10">
                                    <h3 className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-2">Financial Snapshot</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-gray-500 text-[10px]">Base Price</p>
                                            <p className="text-white font-semibold">₹{selectedUser.price?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-[10px]">Admin Fee</p>
                                            <p className="text-emerald-400 font-semibold">+₹{selectedUser.adminFee?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-[10px]">Customer Total</p>
                                            <p className="text-violet-400 font-bold italic">₹{selectedUser.totalPrice?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                className="border-gray-700 text-gray-400 hover:text-white"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close Details
                            </Button>
                            {selectedUser.role !== 'admin' && (
                                <Button
                                    variant="destructive"
                                    onClick={() => { deleteUser(selectedUser._id); setSelectedUser(null); }}
                                    disabled={!!actionLoading}
                                >
                                    Delete Account
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Sub-components ── */

function ArtistCard({
    artist,
    actionLoading,
    onApprove,
    onReject,
    onDelete,
    onViewDetails,
}: {
    artist: Artist;
    actionLoading: string | null;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete: (id: string) => void;
    onViewDetails: (artist: Artist) => void;
}) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-200">
            {/* Card top accent */}
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={artist.profileImage}
                        alt={artist.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-gray-700 shadow-lg"
                    />
                    <div className="overflow-hidden">
                        <p className="text-white font-semibold text-base truncate">{artist.name}</p>
                        <p className="text-gray-500 text-xs truncate">{artist.email}</p>
                        <span className="inline-block mt-1 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                            ⏳ Pending
                        </span>
                    </div>
                </div>

                <div className="space-y-1.5 mb-5">
                    {artist.specialty && (
                        <Info label="Specialty" value={artist.specialty} />
                    )}
                    {artist.state && (
                        <Info label="State" value={artist.state} />
                    )}
                    {artist.bio && (
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{artist.bio}</p>
                    )}
                    {artist.awards && (
                        <Info label="Awards" value={artist.awards} />
                    )}
                </div>

                <div className="text-xs text-gray-600 mb-4">
                    Registered: {new Date(artist.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                <div className="flex gap-2">
                    <ActionButton
                        onClick={() => onApprove(artist._id)}
                        loading={actionLoading === artist._id + '-approve'}
                        variant="approve"
                        label="Approve"
                        fullWidth
                    />
                    <ActionButton
                        onClick={() => onViewDetails(artist)}
                        loading={false}
                        variant="reject"
                        label="Details"
                        fullWidth
                    />
                    <ActionButton
                        onClick={() => onDelete(artist._id)}
                        loading={actionLoading === artist._id + '-delete'}
                        variant="delete"
                        label=""
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs w-16 flex-shrink-0">{label}:</span>
            <span className="text-gray-300 text-xs truncate">{value}</span>
        </div>
    );
}

function StatusBadge({ approved, status }: { approved: boolean; status?: string }) {
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Rejected
            </span>
        );
    }
    return approved ? (
        <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Approved
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending
        </span>
    );
}

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        admin: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
        artist: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        customer: 'bg-gray-700/50 text-gray-400 border-gray-600/40',
    };
    return (
        <span className={`inline-block text-xs border px-2.5 py-1 rounded-full font-medium capitalize ${styles[role] || styles.customer}`}>
            {role}
        </span>
    );
}

function ActionButton({
    onClick,
    loading,
    variant,
    label,
    fullWidth,
    icon,
}: {
    onClick: () => void;
    loading: boolean;
    variant: 'approve' | 'reject' | 'delete';
    label: string;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}) {
    const styles = {
        approve: 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60',
        reject: 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 hover:border-amber-500/60',
        delete: 'bg-red-600/15 hover:bg-red-600/30 text-red-400 border border-red-500/20 hover:border-red-500/50',
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${fullWidth ? 'flex-1' : ''}`}
        >
            {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
                <>
                    {icon}
                    {label}
                </>
            )}
        </button>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
    );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
        </div>
    );
}
