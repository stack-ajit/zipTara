import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../store/useStore';
import { User, Calendar, ArrowRight } from 'lucide-react';

const ProfileSetupPage = () => {
    const navigate = useNavigate();
    const { updateProfile, user } = useTrips(); // We will add updateProfile to store
    const [formData, setFormData] = useState({ fullName: '', dob: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await updateProfile(formData.fullName, formData.dob);
        if (success) {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your Profile</h1>
                    <p className="text-gray-500 text-sm">Hi {user?.username}! Tell us a bit more about yourself so we can personalize your experience.</p>
                </div>

                <div className="mb-8 text-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Step 2 of 2</span>
                    <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
                        <div className="w-full h-full bg-indigo-500 rounded-full" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            required
                            placeholder="Full Name"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-gray-50/50"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-gray-50/50 text-gray-600"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] mt-6"
                    >
                        <span>{loading ? 'Saving...' : 'Finish Setup'}</span>
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4"
                    >
                        Skip for now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupPage;
