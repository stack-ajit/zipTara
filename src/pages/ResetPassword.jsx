import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, MapPin, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ziptara.in/api';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }

        setIsSubmitting(true);
        try {
            await axios.put(`${API_URL}/auth/resetpassword/${resetToken}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'This link is invalid or has expired. Please request a new one.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans"
            style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>

            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(230,57,70,0.15) 0%, transparent 60%)' }} />

            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative p-[2px] rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, #e63946, #f4a261, #48dbfb, #e63946)',
                        backgroundSize: '300% 100%',
                        animation: 'gradientShift 4s ease infinite'
                    }}
                >
                    <style>{`
                        @keyframes gradientShift {
                            0%, 100% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                        }
                    `}</style>

                    <div className="bg-gray-900/97 backdrop-blur-xl rounded-3xl p-8">
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="text-lg font-extrabold tracking-wide" style={{ fontFamily: 'Amaranth, sans-serif' }}>
                                <span className="text-white">zip</span>
                                <span className="text-red-500">Tara</span>
                            </span>
                        </div>

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
                                <p className="text-gray-300 text-sm">Your password has been updated. Redirecting you to login...</p>
                            </motion.div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
                                <p className="text-gray-400 text-sm mb-6">Choose a strong new password for your account.</p>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl text-center">
                                        {error}
                                        {error.includes('expired') && (
                                            <div className="mt-2">
                                                <Link to="/forgot-password" className="text-red-400 underline hover:text-red-300">
                                                    Request a new link
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                        <input
                                            id="new-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="New Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                        <input
                                            id="confirm-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Reset Password'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
