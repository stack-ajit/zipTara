import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Lock, Mail, ArrowRight, Github, Chrome, User } from 'lucide-react';
import { useTrips } from '../store/useStore';
import { motion } from 'framer-motion';

import travelLoginBg from '../assets/travel_login_bg.png';

const AuthPage = () => {
    const navigate = useNavigate();
    const { login, register, error } = useTrips();
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [submitError, setSubmitError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        try {
            let success = false;
            if (isLogin) {
                success = await login(formData.email, formData.password);
                if (success) navigate('/');
            } else {
                success = await register(formData.name, formData.email, formData.password);
                if (success) navigate('/setup-profile');
            }
        } catch (err) {
            console.error("Auth Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] grid grid-cols-1 lg:grid-cols-2">

                {/* LEFT SIDE - Hero Image */}
                <div className="relative hidden lg:block p-6">
                    <div className="w-full h-full rounded-2xl overflow-hidden relative">
                        <img
                            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop"
                            alt="Travel Landscape"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="w-6 h-6 text-white" />
                                    <span className="text-xl font-bold">
                                        <span className="text-white">zip</span>
                                        <span className="text-red-500">Tara</span>
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold leading-tight max-w-md shadow-sm">
                                    Safar hai, To <span className="text-white">zip</span><span className="text-red-500">Tara</span> hai
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                            <p className="text-gray-500 text-sm">
                                {isLogin ? 'Enter your details to access your trips.' : 'Start your journey by creating a unique username.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Username (Unique)"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-gray-50/50"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={isLogin ? "text" : "email"}
                                    required
                                    placeholder={isLogin ? "Username or Email" : "Email Address"}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-gray-50/50"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    autoCapitalize="none"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder={isLogin ? "Password" : "Create Password"}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-gray-50/50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {isLogin && (
                                <div className="text-right">
                                    <a href="#" className="text-xs font-semibold text-gray-500 hover:text-gray-900">Forgot Password?</a>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
                            >
                                <span>{isLogin ? 'Log In' : 'Next Step'}</span>
                                {!isLogin && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-xs text-gray-500 font-medium">
                            {isLogin ? "New here? " : "Already have a member? "}
                            <button onClick={() => setIsLogin(!isLogin)} className="text-gray-900 font-bold hover:underline">
                                {isLogin ? "Join now" : "Log in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
