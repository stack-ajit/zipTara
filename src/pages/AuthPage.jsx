import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Lock, Mail, ArrowRight, User, Calendar, ArrowLeft, Plane, Compass, Mountain, Camera } from 'lucide-react';
import { useTrips } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { login, register, error } = useTrips();
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
                        duration: 20,
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
                        <div className="p-6 sm:p-8">
                            {/* Header Section */}
                            <div className="text-center mb-5">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-flex items-center justify-center space-x-2 mb-4 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10"
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
                                    className="text-gray-300 text-sm"
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
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
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
                                                    type="password"
                                                    required
                                                    placeholder={isLogin ? "Password" : "Create Password"}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
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
                                    className={`w-full relative overflow-hidden group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all hover:shadow-2xl active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                            </form>

                            <div className="mt-5 pt-4 border-t border-white/10 text-center">
                                <p className="text-xs text-gray-400 font-medium mb-1">
                                    {isLogin ? "New to zipTara?" : "Already have an account?"}
                                </p>
                                <button
                                    onClick={toggleMode}
                                    className="text-white font-bold hover:text-red-400 transition-colors text-sm hover:underline"
                                >
                                    {isLogin ? "Create an account" : "Log in instead"}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Tagline */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-4 text-white/60 text-sm font-medium tracking-wider"
                >
                    Safar hai, To <span style={{ fontFamily: 'Amaranth, sans-serif' }}><span className="text-white">zip</span><span className="text-red-500">Tara</span></span> hai
                </motion.div>
            </div >
        </div >
    );
};

export default AuthPage;
