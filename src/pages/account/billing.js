import Sidebar from './sidebar';
import Meta from '@/components/Meta';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Check,
  Award,
  Receipt,
  Calendar,
  Download,
  AlertCircle,
  RefreshCw,
  Eye,
  User,
  Shield,
  Crown,
  Zap,
} from 'lucide-react';

export default function BillingDashboard() {
  // Mock user data for frontend development
  const user = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: '/images/gender/male.png',
    },
  };
  const router = useRouter();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop
  const [dropdownOpen, setDropdownOpen] = useState(false); // dropdown menu

  const toggleMobileSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(e) {
      if (!dropdownRef.current || !avatarRef.current) return;
      const isClickInsideDropdown = dropdownRef.current.contains(e.target);
      const isClickOnAvatar = avatarRef.current.contains(e.target);
      if (!isClickInsideDropdown && !isClickOnAvatar) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [dropdownRef, avatarRef]);

  const [activeTab, setActiveTab] = useState('overview');

  // Mock current subscription data
  const currentSubscription = {
    plan: 'Pro',
    status: 'active',
    nextBilling: '2025-09-30',
    amount: 350000,
    billingCycle: 'yearly',
    renewalDate: '2025-09-30',
    daysLeft: 31,
  };

  // Mock billing history
  const billingHistory = [
    {
      id: 'INV-2024-001',
      date: '2024-09-30',
      description: 'Pro Plan (Tahunan)',
      amount: 350000,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-002',
      date: '2024-08-30',
      description: 'Pro Plan (Bulanan)',
      amount: 30000,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-003',
      date: '2024-07-30',
      description: 'Pro Plan (Bulanan)',
      amount: 30000,
      status: 'paid',
      downloadUrl: '#',
    },
  ];

  // Mock usage stats
  const usageStats = {
    storage: { used: 2.4, total: 100, unit: 'GB' },
    aiCredits: { used: 25, total: 50, unit: 'credits' },
    projects: { used: 12, total: 'unlimited', unit: 'projects' },
    exports: { used: 156, total: 'unlimited', unit: 'exports' },
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  return (
    <>
      <Meta />
      <div className="flex h-screen bg-gray-50">
        {/* Backdrop Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
            onClick={toggleMobileSidebar}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          user={user}
          signOut={signOut}
          active="billing"
        />

        {/* MAIN */}
        <div
          className="flex-1 flex flex-col overflow-y-auto"
          style={{
            background:
              'linear-gradient(180deg, #000000 0%, #22063a 22%, #360e8cff 48%, #22063a 80%, #000000ff 100%)',
          }}
        >
          <header className="h-24 py-2 border-b px-10 flex text-white justify-between bg-[#000000]">
            <div className="flex items-center gap-4">
              {/* Tombol Mobile Sidebar */}
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden p-2 rounded-md text-black bg-white hover:text-white hover:bg-[#4b15fcff] -ml-6"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">Tagihan</h1>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`relative transition-all duration-200 ${
                  sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                style={{ zIndex: 50 }}
              >
                <img
                  ref={avatarRef}
                  src={user?.user?.image || '/avatar.png'}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  alt="user"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && !sidebarOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-2 mt-2 w-36 bg-white rounded-md"
                  >
                    <div className="py-2">
                      <button
                        className="block w-full px-2 py-2 text-center text-black border-b border-gray-100 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                        onClick={() => router.push('account/profile')}
                      >
                        <i className="fa-solid fa-circle-user"></i>
                        Profil
                      </button>
                      <button
                        className="block w-full px-2 py-2 text-center text-black border-b border-gray-100 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                        onClick={() => {
                          alert('Sign out clicked');
                          if (typeof window !== 'undefined')
                            window.location.href = '/';
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="p-5 space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">
                Billing & Langganan
              </h1>
              <p className="text-white mt-2">
                Kelola langganan dan riwayat pembayaran Anda
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-white mb-8">
              <nav className="flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 bg-white text-black rounded-md'
                      : 'border-transparent text-white hover:bg-white hover:text-black rounded-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Overview
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'subscription'
                      ? 'border-blue-500 bg-white text-black rounded-md'
                      : 'border-transparent text-white hover:bg-white hover:text-black rounded-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Langganan
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-blue-500 bg-white text-black rounded-md'
                      : 'border-transparent text-white hover:bg-white hover:text-black rounded-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Riwayat Pembayaran
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'usage'
                      ? 'border-blue-500 bg-white text-black rounded-md'
                      : 'border-transparent text-white hover:bg-white hover:text-black rounded-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Usage
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Current Subscription Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <h3 className="text-xl font-bold">Langganan Aktif</h3>
                        <p className="opacity-90">
                          Paket {currentSubscription.plan}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          Rp{formatPrice(currentSubscription.amount)}
                        </div>
                        <p className="opacity-90 text-sm">per tahun</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              currentSubscription.status === 'active'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          ></div>
                          <span className="font-semibold text-slate-900">
                            Status
                          </span>
                        </div>
                        <p
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            currentSubscription.status
                          )}`}
                        >
                          {getStatusText(currentSubscription.status)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            Renewal Berikutnya
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {formatDate(currentSubscription.renewalDate)}
                        </p>
                        <p className="text-sm text-blue-600 font-medium">
                          {currentSubscription.daysLeft} hari lagi
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            Siklus Billing
                          </span>
                        </div>
                        <p className="text-slate-600 capitalize">
                          {currentSubscription.billingCycle === 'yearly'
                            ? 'Tahunan'
                            : 'Bulanan'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 flex gap-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                        Ubah Paket
                      </button>
                      <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition">
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-sm">Storage</p>
                        <p className="font-bold text-slate-900">
                          {usageStats.storage.used}/{usageStats.storage.total}{' '}
                          GB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-sm">AI Credits</p>
                        <p className="font-bold text-slate-900">
                          {usageStats.aiCredits.used}/
                          {usageStats.aiCredits.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-sm">Projects</p>
                        <p className="font-bold text-slate-900">
                          {usageStats.projects.used} / ∞
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-sm">Exports</p>
                        <p className="font-bold text-slate-900">
                          {usageStats.exports.used} / ∞
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Aktivitas Terbaru
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">
                            Pembayaran berhasil
                          </p>
                          <p className="text-slate-600 text-sm">
                            Pro Plan (Tahunan) - Rp350.000
                          </p>
                        </div>
                        <span className="text-slate-500 text-sm">
                          30 Sep 2024
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">
                            Paket diupgrade
                          </p>
                          <p className="text-slate-600 text-sm">
                            Dari Free ke Pro Plan
                          </p>
                        </div>
                        <span className="text-slate-500 text-sm">
                          30 Sep 2024
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* Current Plan Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Detail Langganan
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                          <Crown className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">
                            Pro Plan
                          </h4>
                          <p className="text-slate-600">
                            Untuk profesional dan freelancer
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                          Rp{formatPrice(currentSubscription.amount)}
                        </div>
                        <p className="text-slate-600">per tahun</p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-4">
                          Fitur yang Aktif
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span>Export PNG/PDF (1080p)</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span>Tak terbatas proyek</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span>Brand Kit & Font kustom</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span>50 kredit AI Assist / bulan</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span>Scheduler Post (IG/TikTok)</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span>Tanpa watermark</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 mb-4">
                          Informasi Billing
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Status
                            </label>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                currentSubscription.status
                              )}`}
                            >
                              {getStatusText(currentSubscription.status)}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Tanggal Renewal
                            </label>
                            <p className="text-slate-900">
                              {formatDate(currentSubscription.renewalDate)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Siklus Billing
                            </label>
                            <p className="text-slate-900 capitalize">
                              {currentSubscription.billingCycle === 'yearly'
                                ? 'Tahunan'
                                : 'Bulanan'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
                        Ubah ke Paket Lain
                      </button>
                      <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition">
                        Ubah ke Bulanan
                      </button>
                      <button className="border border-red-300 hover:bg-red-50 text-red-700 px-6 py-3 rounded-lg font-medium transition">
                        Batalkan Langganan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Renewal Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Renewal Otomatis
                      </h4>
                      <p className="text-blue-700 mt-1">
                        Langganan Anda akan diperpanjang otomatis pada{' '}
                        {formatDate(currentSubscription.renewalDate)}. Kami akan
                        mengirim reminder 7 hari sebelumnya.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Riwayat Pembayaran
                      </h3>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Download Semua
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-slate-900">
                            Invoice
                          </th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-900">
                            Tanggal
                          </th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-900">
                            Deskripsi
                          </th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-900">
                            Jumlah
                          </th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-900">
                            Status
                          </th>
                          <th className="text-left py-3 px-6 font-semibold text-slate-900">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-4 px-6">
                              <span className="font-mono text-sm text-slate-600">
                                {item.id}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-slate-900">
                                {formatDate(item.date)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-slate-900">
                                {item.description}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-slate-900">
                                Rp{formatPrice(item.amount)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {getStatusText(item.status)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* Usage Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">
                        Storage Usage
                      </h4>
                      <span className="text-sm text-slate-600">
                        {usageStats.storage.used} / {usageStats.storage.total}{' '}
                        GB
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (usageStats.storage.used /
                              usageStats.storage.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {(
                        (usageStats.storage.used / usageStats.storage.total) *
                        100
                      ).toFixed(1)}
                      % terpakai
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">
                        AI Credits
                      </h4>
                      <span className="text-sm text-slate-600">
                        {usageStats.aiCredits.used} /{' '}
                        {usageStats.aiCredits.total} credits
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (usageStats.aiCredits.used /
                              usageStats.aiCredits.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Reset pada {formatDate(currentSubscription.renewalDate)}
                    </p>
                  </div>
                </div>

                {/* Detailed Usage */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Detail Penggunaan Bulan Ini
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-slate-900">
                          {usageStats.storage.used} GB
                        </h4>
                        <p className="text-slate-600 text-sm">
                          Storage Terpakai
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-slate-900">
                          {usageStats.aiCredits.used}
                        </h4>
                        <p className="text-slate-600 text-sm">
                          AI Credits Terpakai
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-slate-900">
                          {usageStats.projects.used}
                        </h4>
                        <p className="text-slate-600 text-sm">Total Projects</p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Download className="w-8 h-8 text-orange-600" />
                        </div>
                        <h4 className="font-semibold text-slate-900">
                          {usageStats.exports.used}
                        </h4>
                        <p className="text-slate-600 text-sm">Total Exports</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="text-center">
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Butuh Bantuan?
                </h4>
                <p className="text-slate-600 mb-4">
                  Tim support kami siap membantu Anda dengan segala pertanyaan
                  terkait billing dan langganan.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Hubungi Support
                  </button>
                  <button className="border border-slate-300 hover:bg-white text-slate-700 px-6 py-3 rounded-lg font-medium transition">
                    Lihat Dokumentasi
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
