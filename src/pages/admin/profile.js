import { useState, useEffect } from "react";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";

function AdminProfile({ user }) {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        role: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || '',
                image: user.image || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call - in real app, this would call /api/admin/profile/update
            setTimeout(() => {
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
                setLoading(false);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }, 1000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Profil">
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Profil Admin</h1>
                                    <p className="text-gray-600 mt-1">Kelola informasi profil admin</p>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <SaveIcon className="w-4 h-4" />
                                    )}
                                    <span>Simpan Profil</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <div className="flex items-center">
                                {message.type === 'success' ? (
                                    <CheckIcon className="w-5 h-5 mr-2" />
                                ) : (
                                    <ErrorIcon className="w-5 h-5 mr-2" />
                                )}
                                {message.text}
                            </div>
                        </div>
                    )}

                    {/* Profile Content */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Profil Admin</h3>

                        {/* Profile Picture */}
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="relative">
                                {profileData.image ? (
                                    <img
                                        src={profileData.image}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-200">
                                        <span className="text-white text-2xl font-bold">
                                            {(profileData.name || 'A').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">{profileData.name || 'Admin'}</h4>
                                <p className="text-gray-600">{user?.role || 'Administrator'}</p>
                                <p className="text-sm text-gray-500">Status: Online</p>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Foto Profil
                                </label>
                                <input
                                    type="url"
                                    name="image"
                                    value={profileData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">URL gambar untuk foto profil</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={user?.role || 'ADMIN'}
                                    disabled={true}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Role tidak dapat diubah melalui pengaturan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Helper Components
const LoadingSpinner = () => (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// SVG Icons
const SaveIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const ErrorIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default withAdminAuth(AdminProfile);