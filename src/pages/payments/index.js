import React, { useState } from 'react';
import { Check, X, Star, Users, Zap, Shield, Crown, Award, ChevronDown, XCircle, CheckCircle } from 'lucide-react';

export default function PricingPackages() {
    const [yearly, setYearly] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

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
                yearly: { price: 350000, original: 420000 }
            },
            features: [
                { text: 'Export PNG/PDF (1080p)', included: true },
                { text: 'Tak terbatas proyek', included: true },
                { text: 'Brand Kit & Font kustom', included: true },
                { text: '50 kredit AI Assist / bln', included: true },
                { text: 'Scheduler Post (IG/TikTok)', included: true },
                { text: 'Tanpa watermark', included: true },
                { text: 'Kolaborasi realtime', included: false },
                { text: 'Analytics & audit log', included: false }
            ],
            benefits: ['Cocok untuk freelancer', 'AI-powered tools', 'Social media ready'],
            limitations: 'Terbatas untuk 1 pengguna'
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
                yearly: { price: 2500000, original: 2880000 }
            },
            features: [
                { text: 'Semua fitur Pro', included: true },
                { text: 'Kolaborasi realtime', included: true },
                { text: 'Folder & izin anggota', included: true },
                { text: 'Template institusi', included: true },
                { text: 'SSO (Google Workspace)', included: true },
                { text: 'Analytics & audit log', included: true },
                { text: 'Prioritas dukungan', included: true },
                { text: 'Custom branding', included: true }
            ],
            benefits: ['Multi-user collaboration', 'Enterprise security', 'Dedicated support'],
            limitations: 'Minimal 3 pengguna'
        }
    ];

    const faqs = [
        {
            question: 'Apakah ada uji coba gratis?',
            answer: 'Ya! Semua paket dilengkapi dengan uji coba gratis 14 hari. Anda tidak perlu memasukkan kartu kredit untuk memulai. Setelah masa uji coba berakhir, Anda dapat memilih paket yang sesuai dengan kebutuhan.'
        },
        {
            question: 'Bisakah saya mengubah paket kapan saja?',
            answer: 'Tentu saja! Anda dapat upgrade atau downgrade paket kapan saja melalui dashboard akun Anda. Perubahan akan berlaku segera, dan kami akan menghitung prorata untuk pembayaran yang sudah dilakukan.'
        },
        {
            question: 'Metode pembayaran apa saja yang diterima?',
            answer: 'Kami menerima berbagai metode pembayaran melalui Midtrans: kartu kredit (Visa, Mastercard, JCB), kartu debit, transfer bank, e-wallet (OVO, GoPay, Dana), dan Indomaret/Alfamart.'
        },
        {
            question: 'Apakah data saya aman?',
            answer: 'Keamanan data adalah prioritas utama kami. Semua data dienkripsi dengan SSL 256-bit, disimpan di server yang memenuhi standar SOC 2, dan kami tidak pernah membagikan data Anda kepada pihak ketiga tanpa izin.'
        },
        {
            question: 'Bagaimana dengan dukungan pelanggan?',
            answer: 'Kami menyediakan dukungan pelanggan melalui email, live chat, dan WhatsApp. Pengguna Pro mendapat respon dalam 24 jam, sementara pengguna Edu Team mendapat prioritas dukungan dengan respon dalam 4 jam.'
        },
        {
            question: 'Apakah harga sudah termasuk pajak?',
            answer: 'Harga yang ditampilkan belum termasuk PPN 11%. Pajak akan ditambahkan secara otomatis saat checkout sesuai dengan ketentuan perpajakan Indonesia.'
        },
        {
            question: 'Bisakah saya batalkan langganan?',
            answer: 'Ya, Anda dapat membatalkan langganan kapan saja tanpa penalti. Langganan akan tetap aktif hingga akhir periode billing, dan Anda tetap dapat menggunakan semua fitur premium hingga saat itu.'
        },
        {
            question: 'Apakah ada diskon untuk pembayaran tahunan?',
            answer: 'Ya! Kami memberikan diskon hingga 17% untuk pembayaran tahunan. Selain hemat biaya, Anda juga tidak perlu repot membayar setiap bulan.'
        },
        {
            question: 'Bagaimana cara kerja kredit AI Assist?',
            answer: 'Kredit AI Assist digunakan untuk fitur-fitur berbasis AI seperti generate konten, background remover, dan text-to-image. Setiap paket mendapat kuota bulanan yang akan reset setiap tanggal renewal.'
        },
        {
            question: 'Apakah bisa refund jika tidak puas?',
            answer: 'Kami menawarkan jaminan uang kembali 30 hari untuk semua paket premium. Jika tidak puas dengan layanan kami, silakan hubungi tim dukungan untuk proses refund.'
        },
        {
            question: 'Bagaimana cara menggunakan SSO untuk Edu Team?',
            answer: 'Fitur SSO (Single Sign-On) memungkinkan anggota tim login menggunakan akun Google Workspace atau Microsoft 365 mereka. Setup dapat dilakukan melalui dashboard admin dalam beberapa menit.'
        },
        {
            question: 'Apakah ada batasan ukuran file?',
            answer: 'Pengguna Pro dapat mengupload file hingga 100MB per file. Pengguna Edu Team mendapat limit hingga 500MB per file. Semua format file populer didukung (PNG, JPG, PDF, AI, PSD, dll).'
        }
    ];

    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        // Simulate navigation to checkout
        setTimeout(() => {
            const amount = pkg.pricing[yearly ? 'yearly' : 'monthly'].price;
            const product = `${pkg.name} Plan (${yearly ? 'tahunan' : 'bulanan'})`;
            window.location.href = `/payments/midtrans?amount=${amount}&product=${encodeURIComponent(product)}`;
        }, 500);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    const calculateSavings = (yearlyPkg, monthlyPkg) => {
        if (!yearlyPkg.original) return null;
        const savings = yearlyPkg.original - yearlyPkg.price;
        return Math.round((savings / yearlyPkg.original) * 100);
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="relative w-full py-12 md:py-16">
            {/* Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-indigo-50" />

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4 md:mb-6">
                        <Award className="w-4 h-4" />
                        Dipercaya 10,000+ pengguna
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Pilih Paket <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Premium</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-slate-600 text-base md:text-lg">
                        Tingkatkan produktivitas dengan fitur lengkap. Bayar hanya untuk paket yang sesuai dengan kebutuhan Anda.
                    </p>

                    {/* Billing Toggle */}
                    <div className="mt-8 md:mt-10 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                        <button
                            onClick={() => setYearly(false)}
                            className={[
                                "rounded-full px-4 py-2 text-sm font-medium transition",
                                !yearly ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50",
                            ].join(" ")}
                        >
                            Bulanan
                        </button>
                        <button
                            onClick={() => setYearly(true)}
                            className={[
                                "rounded-full px-4 py-2 text-sm font-medium transition",
                                yearly ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50",
                            ].join(" ")}
                        >
                            Tahunan <span className="ml-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Hemat 17%</span>
                        </button>
                    </div>
                </div>

                {/* 🔥 Comparison Free vs Paid - VERSI YANG DIPERBAIKI */}
                <div className="relative mt-16 mb-20">
                    <div className="text-center mb-12 md:mb-16">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                            Gratis <span className="text-slate-400">atau</span>{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                                Berlangganan ?
                            </span>
                        </h3>
                        <p className="max-w-2xl mx-auto text-slate-600">
                            Gratis hanya sekadar coba. Versi berlangganan membuat Anda produktif, efisien, dan profesional.
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
                        const currentPricing = plan.pricing[yearly ? 'yearly' : 'monthly'];
                        const savings = yearly ? calculateSavings(plan.pricing.yearly, plan.pricing.monthly) : null;

                        return (
                            <div
                                key={plan.id}
                                className={[
                                    "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg",
                                    plan.highlight ? "border-blue-300 shadow-xl shadow-blue-500/10" : "border-slate-200 shadow-sm",
                                    selectedPackage?.id === plan.id ? 'ring-4 ring-blue-200' : ''
                                ].join(" ")}
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

                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <p className="text-slate-600 text-sm mb-4">{plan.subtitle}</p>

                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-4xl font-extrabold text-slate-900">
                                            Rp{formatPrice(currentPricing.price)}
                                        </span>
                                        <span className="pb-1 text-sm text-slate-500">
                                            /{yearly ? (plan.id === 'edu' ? 'user/bln (tahunan)' : 'bln (tahunan)') : (plan.id === 'edu' ? 'user/bln' : 'bln')}
                                        </span>
                                    </div>

                                    {currentPricing.original && (
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-slate-400 line-through text-sm">
                                                Rp{formatPrice(currentPricing.original)}
                                            </span>
                                            {savings && (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                                                    Hemat {savings}%
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {plan.limitations && (
                                        <p className="text-orange-600 text-sm font-medium">{plan.limitations}</p>
                                    )}
                                </div>

                                <div className="mx-6 h-px bg-slate-200" />

                                {/* Benefits */}
                                <div className="px-6 sm:px-8 py-4">
                                    <h4 className="font-semibold text-slate-900 mb-3">Keunggulan utama:</h4>
                                    <ul className="space-y-2">
                                        {plan.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-slate-600">
                                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                                                <span className="text-sm">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Features */}
                                <ul className="grid gap-3 px-6 sm:px-8 pb-6 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-700">
                                            {feature.included ? (
                                                <Check className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0" />
                                            ) : (
                                                <X className="mt-0.5 h-5 w-5 text-slate-300 flex-shrink-0" />
                                            )}
                                            <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <div className="p-6 sm:p-8 pt-0">
                                    <button
                                        onClick={() => handleSelectPackage(plan)}
                                        disabled={selectedPackage?.id === plan.id}
                                        className={[
                                            "inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-center text-sm font-semibold shadow transition",
                                            plan.highlight
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:brightness-110"
                                                : selectedPackage?.id === plan.id
                                                    ? "bg-green-600 text-white"
                                                    : "border border-blue-600 text-blue-600 hover:bg-blue-50",
                                            "disabled:opacity-75"
                                        ].join(" ")}
                                    >
                                        {selectedPackage?.id === plan.id ? (
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
                    <div className="flex items-center justify-center gap-8 opacity-60 text-slate-600">
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
                        <h3 className="text-3xl font-bold text-slate-900">
                            Kenapa Harus <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Berlangganan?</span>
                        </h3>
                        <p className="mt-3 max-w-2xl mx-auto text-slate-600">
                            Kami tidak hanya menyediakan fitur, tapi juga memberikan nilai tambah yang membuat pekerjaan Anda lebih cepat, aman, dan profesional.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6">
                        {/* Card 1 */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-lg text-slate-900 mb-2">Produktivitas Maksimal</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Automasi dengan AI Assist, integrasi social media, dan fitur premium lain yang mempercepat workflow Anda.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-lg text-slate-900 mb-2">Keamanan Terjamin</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Semua data terenkripsi dengan standar internasional (SSL 256-bit, SOC 2). Privasi Anda adalah prioritas kami.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-lg text-slate-900 mb-2">Kolaborasi Tanpa Batas</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Baik untuk individu maupun tim. Bekerja bersama secara realtime dan tetap sinkron di semua perangkat.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                                <Award className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-lg text-slate-900 mb-2">Dukungan Premium</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Tim support selalu siap membantu. Respon cepat untuk Pro, prioritas untuk Edu Team.
                            </p>
                        </div>

                        {/* Card 5 */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                                <Crown className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-lg text-slate-900 mb-2">Harga Transparan</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Tidak ada biaya tersembunyi. Pilihan fleksibel bulanan atau tahunan dengan diskon hingga 17%.
                            </p>
                        </div>

                        {/* Card 6 */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white mb-4">
                                <Star className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-lg text-slate-900 mb-2">Dipercaya Ribuan Pengguna</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Lebih dari 10,000+ profesional dan institusi telah menggunakan layanan kami untuk mendukung produktivitas mereka.
                            </p>
                        </div>
                    </div>
                </div>


                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-3xl font-bold text-center text-slate-900 mb-8">
                        Pertanyaan yang Sering Diajukan
                    </h3>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4">
                                        <div className="h-px bg-slate-200 mb-4"></div>
                                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <p className="mt-8 text-center text-xs text-slate-500">
                    Harga dapat berubah sewaktu-waktu. Paket Tahunan ditagihkan per tahun. Paket Edu Team minimal 3 pengguna.
                </p>
            </div>
        </div>
    );
}