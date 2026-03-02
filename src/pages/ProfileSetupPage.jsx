import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../store/useStore';
import { User, Calendar, ArrowRight, AtSign, AlertCircle, MapPin, Plane, Compass, Mountain, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

// Typewriter Hook (same as AuthPage)
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

// Floating Icon Component (same as AuthPage)
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

const ProfileSetupPage = () => {
    const navigate = useNavigate();
    const { updateProfile, googleRegister, user, pendingGoogleUser } = useTrips();

    // Protection: If no user and no pending registration, go to login
    useEffect(() => {
        console.log('ProfileSetupPage State:', { user: !!user, pendingGoogleUser: !!pendingGoogleUser });
        if (!user && !pendingGoogleUser) {
            console.log('Redirecting to login: No session found');
            navigate('/login');
        }
    }, [user, pendingGoogleUser, navigate]);

    const [formData, setFormData] = useState({
        username: pendingGoogleUser?.email.split('@')[0].replace(/[^a-z0-9_]/g, '') || user?.username || '',
        fullName: pendingGoogleUser?.fullName || user?.fullName || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const title = useTypewriter('Complete your Profile', 60);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic username validation
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setError('Username can only contain letters, numbers, and underscores');
            return;
        }

        setLoading(true);

        let result;
        if (pendingGoogleUser) {
            // New Google User — Finalize Registration
            result = await googleRegister({
                ...formData,
                email: pendingGoogleUser.email,
                googleId: pendingGoogleUser.googleId
            });
        } else {
            // Existing User — Just update profile
            result = await updateProfile(formData.fullName, formData.dob, formData.username);
        }

        if (result === true) {
            navigate('/');
        } else {
            setError(result || 'Failed to update profile');
        }
        setLoading(false);
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
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
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
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/20"
                                >
                                    <User className="w-8 h-8 text-white" />
                                </motion.div>

                                <h1 className="text-2xl font-bold text-white mb-2 min-h-[32px]">
                                    {title.displayedText}
                                    {!title.isComplete && (
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
                                    Welcome! Set up your profile to get started with zipTara.
                                </motion.p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-3 bg-red-500/20 border border-red-500/30 backdrop-blur-md text-red-200 text-sm rounded-xl flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Username"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                            minLength={3}
                                            maxLength={30}
                                        />
                                    </div>

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
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full relative overflow-hidden group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all hover:shadow-2xl active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Finish Setup</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="w-full text-center text-xs text-gray-400 hover:text-white mt-4 transition-colors"
                                >
                                    Skip for now
                                </button>
                            </form>
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
            </div>
        </div>
    );
};

export default ProfileSetupPage;
