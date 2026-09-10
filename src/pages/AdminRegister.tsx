import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminRegister() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: 'admin' }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            toast({ title: 'Admin account created!', description: 'You can now sign in.' });
            navigate('/admin/login');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-xl leading-none">ArtfulBooking</p>
                            <p className="text-violet-400 text-xs font-medium tracking-widest uppercase">Admin Registration</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl p-8">
                    <h1 className="text-2xl font-bold text-white mb-1">Create Admin Account</h1>
                    <p className="text-gray-400 text-sm mb-8">Register a new administrator account</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                            <input
                                id="reg-name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="John Admin"
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                            <input
                                id="reg-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@example.com"
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="reg-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input
                                    id="reg-confirm"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Admin Account'
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/admin/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-4 text-xs text-gray-600">
                    <Link to="/" className="hover:text-gray-400 transition-colors">← Back to main site</Link>
                </p>
            </div>
        </div>
    );
}
