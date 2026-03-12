import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Lock, Mail, ArrowRight, User, Calendar, ArrowLeft, Plane, Compass, Mountain, Camera, Eye, EyeOff } from 'lucide-react';
import { useTrips } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

// Typewriter Hook
const useTypewriter = (text, speed = 80) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));
                i++;
            } else {
                setIsComplete(true);
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return { displayedText, isComplete };
};

// Floating Icon Component
const FloatingIcon = ({ Icon, delay, duration, x, y, size = 24 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
            opacity: [0.3, 0.6, 0.3],
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, 10, -10, 0]
        }}
        transition={{
            delay,
            duration,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        className="absolute text-white/20"
        style={{ left: x, top: y }}
    >
        <Icon size={size} />
    </motion.div>
);

const AuthPage = () => {
    const navigate = useNavigate();
    const { login, register, googleLogin, error } = useTrips();
    const [isLogin, setIsLogin] = useState(true);

    // Step 1: Basic Creds, Step 2: Profile (Only for Register)
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        fullName: '',
        dob: ''
    });
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Google Login handler — uses the authorization code flow
    const handleGoogleLogin = useGoogleLogin({
        flow: 'implicit',
        prompt: 'select_account', // always show account chooser so user can pick the correct email
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            setSubmitError('');
            try {
                // Verify the access_token by fetching user info from Google using v2 endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });

                if (!res.ok) {
                    throw new Error('Failed to verify Google token');
                }

                const profile = await res.json();

                // Send the access_token to our backend which will verify it
                const result = await googleLogin(tokenResponse.access_token);
                if (result.success) {
                    navigate(result.isNewUser ? '/setup-profile' : '/');
                }
            } catch (err) {
                console.error('Google login error:', err);
                setSubmitError('Google login failed. Please try again.');
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: (err) => {
            console.error('Google login error:', err);
            setSubmitError('Google login was cancelled.');
        }
    });

    // Typewriter for titles
    const loginTitle = useTypewriter(isLogin ? 'Welcome Back' : (step === 1 ? 'Start Your Journey' : 'Almost There'), 60);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        // If Registering and on Step 1, just go to Step 2
        if (!isLogin && step === 1) {
            setStep(2);
            return;
        }

        setIsSubmitting(true);

        try {
            let success = false;
            if (isLogin) {
                success = await login(formData.email, formData.password);
                if (success) navigate('/');
            } else {
                // Final Registration Submit
                success = await register(
                    formData.name,
                    formData.email,
                    formData.password,
                    formData.fullName,
                    formData.dob
                );
                if (success) navigate('/'); // Go straight to home, skipping profile setup
            }
        } catch (err) {
            console.error("Auth Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStep(1); // Reset step
        setSubmitError('');
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <motion.img
                    width="100%"
                    height="100%"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{
                        duration: 8,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
            </div>

            {/* Floating Travel Icons */}
            <FloatingIcon Icon={Plane} delay={0} duration={4} x="10%" y="15%" size={32} />
            <FloatingIcon Icon={Compass} delay={1} duration={5} x="85%" y="20%" size={28} />
            <FloatingIcon Icon={Mountain} delay={0.5} duration={4.5} x="8%" y="70%" size={36} />
            <FloatingIcon Icon={Camera} delay={1.5} duration={5.5} x="88%" y="75%" size={30} />
            <FloatingIcon Icon={MapPin} delay={2} duration={4} x="15%" y="45%" size={24} />
            <FloatingIcon Icon={Plane} delay={0.8} duration={5} x="80%" y="50%" size={26} />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                {/* Animated Gradient Border Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative p-[2px] rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)',
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

                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl overflow-hidden">
                        <div className="p-5 sm:p-6">
                            {/* Header Section */}
                            <div className="text-center mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-flex items-center justify-center space-x-2 mb-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-md border border-white/10"
                                >
                                    <MapPin className="w-5 h-5 text-white" />
                                    <span className="text-lg font-bold" style={{ fontFamily: 'Amaranth, sans-serif' }}>
                                        <span className="text-white">zip</span>
                                        <span className="text-red-500">Tara</span>
                                    </span>
                                </motion.div>

                                <h1 className="text-2xl font-bold text-white mb-1 min-h-[32px]">
                                    {loginTitle.displayedText}
                                    {!loginTitle.isComplete && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="text-red-500"
                                        >|</motion.span>
                                    )}
                                </h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-300 text-xs"
                                >
                                    {isLogin
                                        ? 'Enter your details to access your adventures.'
                                        : 'Join the community of explorers today.'}
                                </motion.p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-3 bg-red-500/20 border border-red-500/30 backdrop-blur-md text-red-200 text-sm rounded-xl text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AnimatePresence mode="wait">
                                    {/* STEP 1 FIELDS or LOGIN FIELDS */}
                                    {(isLogin || step === 1) && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-4"
                                        >
                                            {!isLogin && (
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Username"
                                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                                <input
                                                    type={isLogin ? "text" : "email"}
                                                    required
                                                    placeholder={isLogin ? "Username or Email" : "Email Address"}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    autoCapitalize="none"
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    placeholder={isLogin ? "Password" : "Create Password"}
                                                    className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                            {isLogin && (
                                                <div className="text-right mt-1">
                                                    <Link to="/forgot-password" opacity-60 hover:opacity-100 className="text-[10px] text-gray-400 hover:text-red-400 transition-colors font-medium">
                                                        Forgot Password?
                                                    </Link>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* STEP 2 FIELDS (Registration Only) */}
                                    {(!isLogin && step === 2) && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Full Name"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative group">
                                                <label className="block text-gray-400 text-xs mb-1.5 ml-1">Date of Birth</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                                    <input
                                                        type="date"
                                                        required
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all [color-scheme:dark]"
                                                        value={formData.dob}
                                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                    />
                                                </div>
                                            </div>


                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="text-sm text-gray-400 hover:text-white flex items-center mb-2 transition-colors"
                                            >
                                                <ArrowLeft className="w-3 h-3 mr-1" /> Back
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full relative overflow-hidden group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all hover:shadow-2xl active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>{isLogin ? 'Log In' : (step === 1 ? 'Next Step' : 'Create Account')}</span>
                                            {!isLogin && step === 1 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        </>
                                    )}
                                </button>

                                {/* Google Auth — show on login and register step 1 */}
                                {(isLogin || step === 1) && (
                                    <>
                                        <div className="flex items-center gap-3 my-1">
                                            <div className="flex-1 h-px bg-white/20" />
                                            <span className="text-xs text-gray-400 font-medium">OR</span>
                                            <div className="flex-1 h-px bg-white/20" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleGoogleLogin()}
                                            disabled={isGoogleLoading}
                                            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white py-3 rounded-2xl font-medium text-sm transition-all active:scale-[0.98]"
                                        >
                                            {isGoogleLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                    </svg>
                                                    <span>Continue with Google</span>
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </form>

                            <div className="mt-4 pt-3 border-t border-white/10 text-center">
                                <p className="text-[10px] text-gray-400 font-medium mb-0.5">
                                    {isLogin ? "New to zipTara?" : "Already have an account?"}
                                </p>
                                <button
                                    onClick={toggleMode}
                                    className="text-white font-bold hover:text-red-400 transition-colors text-xs hover:underline"
                                >
                                    {isLogin ? "Create an account" : "Log in instead"}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Tagline & Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-3 space-y-2"
                >
                    <div className="text-white/60 text-xs font-medium tracking-wider">
                        Safar hai, To <span style={{ fontFamily: 'Amaranth, sans-serif' }}><span className="text-white">zip</span><span className="text-red-500">Tara</span></span> hai
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs font-medium">
                        <Link to="/about" className="text-white/40 hover:text-white transition-colors">About Us</Link>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <Link to="/contact" className="text-white/40 hover:text-white transition-colors">Contact Us</Link>
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export default AuthPage;
