import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ziptara.in/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/auth/forgotpassword`, { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans"
            style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>

            {/* Subtle radial glow */}
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

                        {sent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    If <span className="text-white font-medium">{email}</span> is registered, we've sent a reset link. It expires in <strong className="text-white">10 minutes</strong>.
                                </p>
                                <p className="text-gray-500 text-xs mt-3">Didn't get it? Check your spam folder.</p>
                                <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-white mb-1">Forgot Password?</h1>
                                <p className="text-gray-400 text-sm mb-6">No worries! Enter your email and we'll send you a reset link.</p>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl text-center">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            required
                                            placeholder="Your registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                            autoComplete="email"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Send Reset Link'}
                                    </button>
                                </form>

                                <div className="mt-5 pt-4 border-t border-white/10 text-center">
                                    <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Back to Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
