import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, session, loading: authLoading, isAuthenticated } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        totalAssets: 0,
        totalTemplates: 0,
        assetsToday: 0,
        templatesToday: 0,
        totalStorageSize: '0 MB',
        assetsByType: {
            pro: 0,
            free: 0
        },
        weeklyData: []
    });
    const [dataLoading, setDataLoading] = useState(true);

    // Check auth and admin role
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.replace('/auth/login');
                return;
            }

            const userRole = user?.role?.toUpperCase();
            if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
                router.replace('/403');
                return;
            }

            setIsAuthorized(true);
        }
    }, [authLoading, isAuthenticated, user, router]);

    useEffect(() => {
        if (isAuthorized && session) {
            fetchDashboardData();
        }
    }, [isAuthorized, session]);

    const fetchDashboardData = async () => {
        try {
            // Get token from session (from useAuth hook)
            const token = session?.idToken;
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/admin/dashboard-stats', { headers });
            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    // Show loading while checking auth
    if (authLoading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (dataLoading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="space-y-8">
                        {/* Loading Header */}
                        <div className="bg-white shadow-sm border-b">
                            <div className="px-4 sm:px-6 py-6 sm:py-8">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 sm:px-6">
                            {/* Loading Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 animate-pulse">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Loading Chart */}
                            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 animate-pulse">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 overflow-y-auto">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="px-4 sm:px-6 py-6 sm:py-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Monitoring kinerja dan analisis aplikasi </p>
                                </div>
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="text-xs sm:text-sm text-gray-500">
                                        Last updated: {new Date().toLocaleString('id-ID')}
                                    </div>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <StatCard
                                    title="Total Aset"
                                    value={dashboardData.totalAssets}
                                    subtitle="Semua aset yang diunggah"
                                    icon={<FolderIcon />}
                                    color="blue"
                                    trend="+12% dari bulan lalu"
                                />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <StatCard
                                    title="Total Template"
                                    value={dashboardData.totalTemplates}
                                    subtitle="Template yang dipublikasi"
                                    icon={<TemplateIcon />}
                                    color="purple"
                                    trend="+8% dari bulan lalu"
                                />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <StatCard
                                    title="Assets Hari ini"
                                    value={dashboardData.assetsToday}
                                    subtitle="Telah diterbitkan"
                                    icon={<UploadIcon />}
                                    color="green"
                                    trend="Hari ini"
                                />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <StatCard
                                    title="Templates Hari ini"
                                    value={dashboardData.templatesToday}
                                    subtitle="Telah diterbitkan"
                                    icon={<PublishIcon />}
                                    color="orange"
                                    trend="Hari ini"
                                />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <StatCard
                                    title="Penggunaan Memori"
                                    value={dashboardData.totalStorageSize}
                                    subtitle="Total data"
                                    icon={<StorageIcon />}
                                    color="indigo"
                                    trend="Optimal"
                                />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                <StatCard
                                    title="Distribusi Aset"
                                    value={`${dashboardData.assetsByType.pro} / ${dashboardData.assetsByType.free}`}
                                    subtitle="Aset Pro / Gratis"
                                    icon={<ChartIcon />}
                                    color="emerald"
                                    trend="Rasio Pro vs Gratis"
                                />
                            </div>
                        </div>

                        {/* Weekly Activity Chart */}
                        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Aktivitas Mingguan</h3>
                                <div className="text-xs sm:text-sm text-gray-500">7 hari terakhir</div>
                            </div>
                            <div className="overflow-x-auto">
                                <ResponsiveContainer width="100%" height={300} minWidth={350}>
                                    <LineChart data={dashboardData.weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
                                            }}
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} width={40} />
                                        <Tooltip
                                            labelFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                });
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="assets"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            name="Aset Diunggah"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="templates"
                                            stroke="#8B5CF6"
                                            strokeWidth={3}
                                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                            name="Template Dipublikasi"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Helper Components
const StatCard = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
                            <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]} transform hover:scale-110 transition-transform duration-200`}>
                                <div className="w-5 h-5 sm:w-6 sm:h-6 text-white">
                                    {icon}
                                </div>
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{subtitle}</p>
                        <p className="text-xs text-gray-400">{trend}</p>
                    </div>
                </div>
            </div>
            <div className={`h-1 ${colorClasses[color]}`}></div>
        </div>
    );
};


// SVG Icons
const FolderIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const TemplateIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const UploadIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const PublishIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const StorageIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
);

const ChartIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);



