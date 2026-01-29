import { useState } from 'react';
import { useTrips } from '../store/useStore';
import Layout from '../components/Layout';
import { User, Lock, Save, ExternalLink, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
    const { user, updateProfile, changePassword } = useTrips();

    // Form States
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // UI States
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const success = await updateProfile(profileData.fullName, profileData.dob);
        if (success) {
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } else {
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        }
        setLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        setLoading(true);
        const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);

        if (res.success) {
            setMessage({ text: 'Password changed successfully!', type: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setMessage({ text: res.msg || 'Failed to change password.', type: 'error' });
        }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
                        <p className="text-gray-500">Manage your account preferences</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                <span>Profile Details</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all mt-1 ${activeTab === 'security'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Lock className="w-5 h-5" />
                                <span>Security</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">

                            {/* Message Alert */}
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                                    ? 'bg-green-50 border-green-100 text-green-700'
                                    : 'bg-red-50 border-red-100 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                                    {/* Read Only Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                                            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium flex items-center">
                                                <span className="text-gray-400 mr-2">@</span>
                                                {user.username}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6"></div>

                                    {/* Editable Fields */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="date"
                                                    value={profileData.dob}
                                                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center disabled:opacity-50"
                                        >
                                            {loading ? 'Updating...' : (
                                                <>
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
