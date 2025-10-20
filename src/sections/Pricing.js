'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Particles } from '@/components/ui/particles';

const plans = (yearly) => [
  {
    name: 'Free',
    badge: 'Mulai Belajar',
    price: yearly ? 'GRATIS' : 'GRATIS',
    suffix: 'selamanya',
    cta: 'Coba Gratis',
    href: '/signup',
    highlight: false,
    features: [
      'Ribuan template dasar',
      '10 proyek aktif',
      'Penyimpanan cloud 500MB',
      'Akses ke ilustrasi dan ikon dasar',
      'Tanpa kartu kredit',
    ],
  },
  {
    name: 'Pro',
    badge: 'Rekomendasi',
    price: yearly ? 'Rp400.000' : 'Rp35.000',
    suffix: yearly ? '/thn' : '/bln',
    cta: 'Upgrade ke Pro',
    href: '/checkout?plan=pro',
    highlight: true,
    features: [
      'Akses ke semua template gratis',
      'Proyek desain tanpa batas',
      'Brand Kit & Font kustom',
      'Tanpa watermark di hasil desain',
      'Penyimpanan cloud hingga 15GB',
      'Ekspor ke PDF, PNG, dan PowerPoint',
      'Akses ke ribuan ikon & ilustrasi edukatif',
    ],
  },
  {
    name: 'Premium',
    badge: 'Untuk Sekolah/Tim',
    price: yearly ? 'Custom' : 'Rp200.000',
    suffix: yearly ? '/user/thn' : '/user/bln',
    cta: yearly ? 'Hubungi Penjualan' : 'Uprage ke Premium',
    href: '/contact',
    highlight: false,
    features: [
      'Semua fitur PRO',
      'Kolaborasi realtime',
      'Akses ke seluruh template & aset premium',
      'Penyimpanan cloud tanpa batas',
      'Folder & izin anggota',
      'Template institusi',
      'SSO (Google Workspace)',
      'Analytics & audit log',
      'Prioritas dukungan',
    ],
  },
];

function PricingToggle({ value, onChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => onChange(false)}
          className={`relative z-10 w-fit h-10 px-6 py-2 rounded-full font-medium transition-colors ${!value ? 'text-white' : 'text-gray-300'}`}
        >
          {!value && (
            <span className="absolute top-0 left-0 h-10 w-full rounded-full border-2 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600" />
          )}
          <span className="relative">Monthly</span>
        </button>
        <button
          onClick={() => onChange(true)}
          className={`relative z-10 w-fit h-10 px-6 py-2 rounded-full font-medium transition-colors ${value ? 'text-white' : 'text-gray-300'}`}
        >
          {value && (
            <span className="absolute top-0 left-0 h-10 w-full rounded-full border-2 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600" />
          )}
          <span className="relative">Yearly</span>
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      className="relative py-4 bg-neutral-900 text-white"
      style={{
        background:
          'linear-gradient(180deg, #1f0940 5%,  #540fcbff 90%, #050610 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <Particles className="absolute inset-0" />
        <div className="text-center mb-8 space-y-4 md:space-y-4">
          <span
            id="harga"
            className="inline-flex items-center rounded-full bg-white text-black px-4 py-1.5 text-sm font-semibold uppercase tracking-wide"
          >
            Harga Termurah di Kelasnya
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl ">
            Tentukan Paket yang sesuai kebutuhan dalam Mengajar dan Berkarya
          </h2>
          <p className="text-gray-300">
            Fokus pada materi dan hasil pembelajaran. Biarkan kami yang mengurus
            desain, identitas merek, desain visual lainnya
          </p>
        </div>

        <PricingToggle value={isYearly} onChange={setIsYearly} />

        <div className="grid gap-6 md:grid-cols-3">
          {plans(isYearly).map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-6 ${plan.highlight ? 'border-2 border-blue-600 ring-2 ring-blue-500/30 shadow-xl shadow-blue-800/20 bg-gradient-to-b from-neutral-800 to-neutral-900' : 'border border-neutral-800 bg-neutral-900'}`}
            >
              {plan.highlight && (
                <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow">
                  {plan.badge || 'Popular'}
                </div>
              )}

              <div className="pb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="inline-flex items-center rounded-full bg-white text-black px-4 py-1 text-xs font-semibold mt-2">
                  {plan.name === 'Pro' ? 'Paling Populer' : plan.badge}
                </p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-gray-400">{plan.suffix}</span>
                </div>
              </div>

              <div className="mx-0 my-4 flex-1">
                <ul className="space-y-3 text-gray-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon className="mt-1 h-5 w-5 text-green-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Link
                  href={plan.href || '#'}
                  className="relative z-10 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-200 no-underline focus:no-underline hover:text-black hover:bg-none hover:bg-white bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white">
          Harga dapat berubah sewaktu-waktu. Paket Tahunan ditagihkan per tahun.
        </p>
      </div>
    </section>
  );
}
