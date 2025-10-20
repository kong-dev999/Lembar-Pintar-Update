import Sidebar from './sidebar';
import Meta from '@/components/Meta';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Check,
  X,
  Award,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Crown,
  Star,
  Zap,
} from 'lucide-react';
import Script from 'next/script';

// Utility function to format prices
const formatPrice = (price) => {
  return price.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });
};

// Utility function to calculate savings
const calculateSavings = (yearly, monthly) => {
  if (!yearly || !monthly) return null;
  const yearlyCost = yearly.price * 12;
  const monthlyCost = monthly.price * 12;
  return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
};

export default function PaymentDashboard() {
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

  const [yearly, setYearly] = useState(true); // billing toggle

  // Add state for selectedPackage
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Paling Populer',
      subtitle: 'Untuk profesional dan freelancer',
      icon: <Zap className="w-6 h-6" />,
      highlight: true,
      pricing: {
        monthly: { price: 30000, original: null },
        yearly: { price: 350000, original: 420000 },
      },
      features: [
        { text: 'Export PNG/PDF (1080p)', included: true },
        { text: 'Tak terbatas proyek', included: true },
        { text: 'Brand Kit & Font kustom', included: true },
        { text: '50 kredit AI Assist / bln', included: true },
        { text: 'Scheduler Post (IG/TikTok)', included: true },
        { text: 'Tanpa watermark', included: true },
        { text: 'Kolaborasi realtime', included: false },
        { text: 'Analytics & audit log', included: false },
      ],
      benefits: [
        'Cocok untuk freelancer',
        'AI-powered tools',
        'Social media ready',
      ],
      limitations: 'Terbatas untuk 1 pengguna',
    },
    {
      id: 'edu',
      name: 'Edu Team',
      badge: 'Untuk Tim / Sekolah',
      subtitle: 'Solusi lengkap untuk institusi',
      icon: <Crown className="w-6 h-6" />,
      highlight: false,
      pricing: {
        monthly: { price: 200000, original: null },
        yearly: { price: 2500000, original: 2880000 },
      },
      features: [
        { text: 'Semua fitur Pro', included: true },
        { text: 'Kolaborasi realtime', included: true },
        { text: 'Folder & izin anggota', included: true },
        { text: 'Template institusi', included: true },
        { text: 'SSO (Google Workspace)', included: true },
        { text: 'Analytics & audit log', included: true },
        { text: 'Prioritas dukungan', included: true },
        { text: 'Custom branding', included: true },
      ],
      benefits: [
        'Multi-user collaboration',
        'Enterprise security',
        'Dedicated support',
      ],
      limitations: 'Minimal 3 pengguna',
    },
  ];

  // Function to handle package selection
  const handleSelectPackage = (plan) => {
    setSelectedPackage(plan);
  };

  // Create order and call Midtrans Snap via server API
  const handlePayment = async (plan) => {
    const pkg = plan || selectedPackage;
    if (!pkg) return alert('Pilih paket terlebih dahulu');

    setLoading(true);
    setProcessingId(pkg.id);

    try {
      // determine price based on selection and billing period
      const pricing = yearly ? pkg.pricing.yearly : pkg.pricing.monthly;
      // Note: Edu team pricing may be per-user; adjust if you collect user count
      const users = pkg.id === 'edu' ? 1 : 1;
      const amount = pricing.price * users;

      const res = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `ORDER-${pkg.id}-${Date.now()}`,
          amount,
          customer: {
            name: user?.user?.name || 'Guest',
            email: user?.user?.email || '',
          },
        }),
      });

      const data = await res.json();

      if (!data?.token) {
        throw new Error('No token returned from server');
      }

      if (!window.snap) {
        // load snap script dynamically if not present
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute(
          'data-client-key',
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
            process.env.NEXT_PUBLIC_CLIENT ||
            ''
        );
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = resolve;
        });
      }

      // set selected package state so UI reflects the choice
      setSelectedPackage(pkg);

      window.snap.pay(data.token, {
        onSuccess: function (result) {
          alert('Pembayaran berhasil');
          console.log(result);
        },
        onPending: function (result) {
          alert('Menunggu pembayaran');
          console.log(result);
        },
        onError: function (result) {
          alert('Pembayaran gagal');
          console.log(result);
        },
        onClose: function () {
          console.log('Midtrans popup closed');
        },
      });
    } catch (err) {
      console.error('payment error', err);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
      setProcessingId(null);
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
          active="payment"
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
              <h1 className="text-xl font-semibold">Pembayaran</h1>
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
                          // perform sign-out actions here (clear tokens, call API, etc.)
                          alert('Sign out clicked');
                          // Use full-page navigation to ensure the app fully resets state
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
            {/* Header Section */}
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4 md:mb-6">
                <Award className="w-4 h-4" />
                Dipercaya 10,000+ pengguna
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                Pilih Paket Premium
              </h2>
              <p className="max-w-2xl mx-auto text-white text-base md:text-lg">
                Tingkatkan produktivitas dengan fitur lengkap. Bayar hanya untuk
                paket yang sesuai dengan kebutuhan Anda.
              </p>

              {/* Billing Toggle */}
              <div className="mt-8 md:mt-10 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setYearly(false)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !yearly
                      ? 'bg-blue-600 text-white'
                      : 'text-black hover:bg-slate-50'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    yearly
                      ? 'bg-blue-600 text-white'
                      : 'text-black hover:bg-slate-50'
                  }`}
                >
                  Tahunan{' '}
                  <span className="ml-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    Hemat 17%
                  </span>
                </button>
              </div>
            </div>

            {/* 🔥 Comparison Free vs Paid - VERSI YANG DIPERBAIKI */}
            <div className="relative mt-16 mb-20">
              <div className="text-center mb-12 md:mb-16">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Gratis atau Berlangganan ?
                </h3>
                <p className="max-w-2xl mx-auto text-white">
                  Gratis hanya sekadar coba. Versi berlangganan membuat Anda
                  produktif, efisien, dan profesional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                {/* Gratis */}
                <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Gratis</h4>
                  </div>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Penyimpanan 50MB</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>AI Assist terbatas (5x/hari)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Tidak ada kolaborasi tim</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>5 template dasar</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Dukungan forum komunitas</span>
                    </li>
                  </ul>
                </div>

                {/* Berbayar */}
                <div className="rounded-2xl md:rounded-3xl border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-xl p-6 md:p-8 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-300" />
                    </div>
                    <h4 className="text-xl font-bold">Berlangganan</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                      <span>Penyimpanan Unlimited</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                      <span>AI Assist tanpa batas</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                      <span>Kolaborasi multi-user realtime</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                      <span>500+ template premium</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                      <span>Dukungan prioritas 24/7</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 mb-16">
              {plans.map((plan) => {
                const currentPricing =
                  plan.pricing[yearly ? 'yearly' : 'monthly'];
                const savings = yearly
                  ? calculateSavings(plan.pricing.yearly, plan.pricing.monthly)
                  : null;

                return (
                  <div
                    key={plan.id}
                    className={[
                      'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg',
                      plan.highlight
                        ? 'border-blue-300 shadow-xl shadow-blue-500/10'
                        : 'border-slate-200 shadow-sm',
                      selectedPackage?.id === plan.id
                        ? 'ring-4 ring-blue-200'
                        : '',
                    ].join(' ')}
                  >
                    {/* Popular Badge */}
                    {plan.highlight && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow">
                        Rekomendasi
                      </div>
                    )}

                    {/* Header */}
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
                          {plan.icon}
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {plan.badge}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900">
                        {plan.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        {plan.subtitle}
                      </p>

                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-extrabold text-slate-900">
                          {formatPrice(currentPricing.price)}
                        </span>
                        <span className="pb-1 text-sm text-slate-500">
                          /
                          {yearly
                            ? plan.id === 'edu'
                              ? 'user/bln (tahunan)'
                              : 'bln (tahunan)'
                            : plan.id === 'edu'
                              ? 'user/bln'
                              : 'bln'}
                        </span>
                      </div>

                      {currentPricing.original && (
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-slate-400 line-through text-sm">
                            {formatPrice(currentPricing.original)}
                          </span>
                          {savings && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                              Hemat {savings}%
                            </span>
                          )}
                        </div>
                      )}

                      {plan.limitations && (
                        <p className="text-orange-600 text-sm font-medium">
                          {plan.limitations}
                        </p>
                      )}
                    </div>

                    <div className="mx-6 h-px bg-slate-200" />

                    {/* Benefits */}
                    <div className="px-6 sm:px-8 py-4">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Keunggulan utama:
                      </h4>
                      <ul className="space-y-2">
                        {plan.benefits.map((benefit, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-slate-600"
                          >
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Features */}
                    <ul className="grid gap-3 px-6 sm:px-8 pb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-slate-700"
                        >
                          {feature.included ? (
                            <Check className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <X className="mt-0.5 h-5 w-5 text-slate-300 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              feature.included
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="p-6 sm:p-8 pt-0">
                      <button
                        onClick={() => handlePayment(plan)}
                        disabled={processingId === plan.id}
                        className={[
                          'inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-center text-sm font-semibold shadow transition',
                          plan.highlight
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:brightness-110'
                            : processingId === plan.id
                              ? 'bg-green-600 text-white'
                              : 'border border-blue-600 text-blue-600 hover:bg-blue-50',
                          'disabled:opacity-75',
                        ].join(' ')}
                      >
                        {processingId === plan.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Memproses...
                          </div>
                        ) : (
                          'Bayar Sekarang'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-8 text-white">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">SSL Terenkripsi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">10,000+ Pengguna</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
              </div>
            </div>

            {/* disini*/}
            {/* Why Subscribe Section */}
            <div className="relative mt-24 mb-20">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white">
                  Kenapa Harus Berlangganan?
                </h3>
                <p className="mt-3 max-w-2xl mx-auto text-white">
                  Kami tidak hanya menyediakan fitur, tapi juga memberikan nilai
                  tambah yang membuat pekerjaan Anda lebih cepat, aman, dan
                  profesional.
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6">
                {/* Card 1 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-2">
                    Produktivitas Maksimal
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Automasi dengan AI Assist, integrasi social media, dan fitur
                    premium lain yang mempercepat workflow Anda.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-2">
                    Keamanan Terjamin
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Semua data terenkripsi dengan standar internasional (SSL
                    256-bit, SOC 2). Privasi Anda adalah prioritas kami.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-2">
                    Kolaborasi Tanpa Batas
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Baik untuk individu maupun tim. Bekerja bersama secara
                    realtime dan tetap sinkron di semua perangkat.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-2">
                    Dukungan Premium
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Tim support selalu siap membantu. Respon cepat untuk Pro,
                    prioritas untuk Edu Team.
                  </p>
                </div>

                {/* Card 5 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-2">
                    Harga Transparan
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Tidak ada biaya tersembunyi. Pilihan fleksibel bulanan atau
                    tahunan dengan diskon hingga 17%.
                  </p>
                </div>

                {/* Card 6 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                    <Star className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-2">
                    Dipercaya Ribuan Pengguna
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Lebih dari 10,000+ profesional dan institusi telah
                    menggunakan layanan kami untuk mendukung produktivitas
                    mereka.
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <p className="mt-8 text-center text-xs text-white">
              Harga dapat berubah sewaktu-waktu. Paket Tahunan ditagihkan per
              tahun. Paket Edu Team minimal 3 pengguna.
            </p>
          </main>
        </div>

        {/* Load Snap.js from Midtrans */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
            process.env.NEXT_PUBLIC_CLIENT
          }
        />
      </div>
    </>
  );
}
