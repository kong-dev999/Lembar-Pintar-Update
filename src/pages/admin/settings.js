import { useState, useEffect } from "react";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";

function AdminSettings({ user }) {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [systemSettings, setSystemSettings] = useState({
        enableRegistration: true,
        maxFileSize: 10,
        allowedFileTypes: 'jpg,jpeg,png,gif,svg,pdf'
    });
    const [activeTab, setActiveTab] = useState('security');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load system settings from localStorage (simple implementation)
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
            setSystemSettings({ ...systemSettings, ...JSON.parse(savedSettings) });
        }
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSystemChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSystemSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleChangePassword = async () => {
        // Validasi password
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Semua field password harus diisi!' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Password baru dan konfirmasi password tidak sama!' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password baru minimal 8 karakter!' });
            return;
        }

        setLoading(true);
        try {
            // Simulate API call - in real app, this would call /api/admin/change-password
            setTimeout(() => {
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setMessage({ type: 'success', text: 'Password berhasil diubah!' });
                setLoading(false);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }, 1000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal mengubah password' });
            setLoading(false);
        }
    };

    const handleSaveSystem = () => {
        try {
            localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
            setMessage({ type: 'success', text: 'Pengaturan sistem berhasil disimpan!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan sistem' });
        }
    };

    const tabs = [
        { id: 'security', name: 'Keamanan', icon: <SecurityIcon className="w-5 h-5" /> },
        { id: 'system', name: 'Sistem', icon: <SystemIcon className="w-5 h-5" /> }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Pengaturan Keamanan</h3>
                        </div>

                        {/* Change Password */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-base font-medium text-gray-900">Ubah Password</h4>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <LockIcon className="w-4 h-4" />
                                    )}
                                    <span>Ubah Password</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password Saat Ini
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Masukkan password saat ini"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Minimal 8 karakter"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ulangi password baru"
                                    />
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">Persyaratan Password:</p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li className="flex items-center">
                                        <CheckCircleIcon className={`w-4 h-4 mr-2 ${passwordData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                                        Minimal 8 karakter
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className={`w-4 h-4 mr-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                                        Mengandung huruf besar
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className={`w-4 h-4 mr-2 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                                        Mengandung angka
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className={`w-4 h-4 mr-2 ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                                        Password dan konfirmasi sama
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Session Management */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">Manajemen Sesi</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Sesi Aktif Saat Ini</p>
                                        <p className="text-xs text-gray-500">Login: {new Date().toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">Logout dari semua perangkat</p>
                                        <p className="text-xs text-gray-500">Akan mengakhiri semua sesi login</p>
                                    </div>
                                    <button className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors">
                                        Logout Semua
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">Informasi Keamanan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-gray-500">Keamanan tambahan untuk akun</p>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Belum Aktif</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Login Terakhir</p>
                                        <p className="text-gray-500">{new Date().toLocaleString('id-ID')}</p>
                                    </div>
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">IP Address</p>
                                        <p className="text-gray-500">192.168.1.1</p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Lokal</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Browser</p>
                                        <p className="text-gray-500">Chrome / Edge</p>
                                    </div>
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'system':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Pengaturan Sistem</h3>
                            <button
                                onClick={handleSaveSystem}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <SaveIcon className="w-4 h-4" />
                                <span>Simpan Pengaturan</span>
                            </button>
                        </div>

                        {/* User Management */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Manajemen Pengguna</h4>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">Registrasi Publik</p>
                                    <p className="text-xs text-gray-500">Izinkan pengguna baru mendaftar</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="enableRegistration"
                                        checked={systemSettings.enableRegistration}
                                        onChange={handleSystemChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* File Upload Settings */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Pengaturan Upload</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maksimal Ukuran File (MB)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxFileSize"
                                        value={systemSettings.maxFileSize}
                                        onChange={handleSystemChange}
                                        min="1"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipe File yang Diizinkan
                                    </label>
                                    <input
                                        type="text"
                                        name="allowedFileTypes"
                                        value={systemSettings.allowedFileTypes}
                                        onChange={handleSystemChange}
                                        placeholder="jpg,png,gif,svg,pdf"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma</p>
                                </div>
                            </div>

                            {/* File Type Preview */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">Preview Tipe File:</p>
                                <div className="flex flex-wrap gap-2">
                                    {systemSettings.allowedFileTypes.split(',').map((type, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                        >
                                            .{type.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Informasi Sistem</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Database:</p>
                                    <p className="font-medium">PostgreSQL</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Environment:</p>
                                    <p className="font-medium">{process.env.NODE_ENV || 'development'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Auth Provider:</p>
                                    <p className="font-medium">NextAuth.js</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Admin User:</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AdminLayout title="Pengaturan">
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto py-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Admin</h1>
                            <p className="text-gray-600 mt-1">Kelola profil dan konfigurasi sistem</p>
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

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Tabs */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Menu Pengaturan</h3>
                                    <nav className="space-y-1">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {tab.icon}
                                                <span>{tab.name}</span>
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                {renderTabContent()}
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

const UserIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const SystemIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

const SecurityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const LockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default withAdminAuth(AdminSettings);