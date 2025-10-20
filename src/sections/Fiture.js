'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import StarButton from '@/components/ui/star-button';

const tabs = [
  {
    key: 'animations',
    title: 'Animasi',
    heading: 'Desain dengan Animasi',
    desc: 'Hidupkan materi pembelajaranmu dengan animasi halus. Sesuaikan gaya, kecepatan, dan efek transisi dengan sekali klik — tanpa perlu pengalaman desain.',
    img: '/images/fitur/animasi.png', // Asset Animasi theme
    cta: 'Coba Sekarang',
  },
  {
    key: 'assets',
    title: 'Asset Edukasi',
    heading: 'Akses Ribuan Asset Gratis',
    desc: 'Gunakan koleksi ikon, ilustrasi, dan elemen visual yang siap pakai untuk mempercantik materi kelas dan presentasi.',
    img: '/images/fitur/asset.png', // Asset Edukasi theme
    cta: 'Lihat Koleksi',
  },
  {
    key: 'collaboration',
    title: 'Kolaborasi',
    heading: 'Kolaborasi Realtime',
    desc: 'Kerjakan proyek bersama tim atau siswa secara langsung. Semua perubahan terlihat seketika dengan alur kerja modern.',
    img: '/images/fitur/kolaborasi.png', // Kolaborasi theme
    cta: 'Mulai Kolaborasi',
  },
  {
    key: 'ai-assist',
    title: 'AI Assist',
    heading: 'Bantuan AI Otomatis',
    desc: 'Biarkan AI menyusun draft materi, teks, dan layout secara instan. Kamu cukup fokus pada ide dan pengajaran.',
    img: '/images/fitur/ai_assist.png', // AI Assist theme
    cta: 'Gunakan AI',
  },
];

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState('animations');

  const tabData = tabs.find((t) => t.key === activeTab);

  return (
    <section
      id="fitur"
      className="w-full bg-gradient-to-b from-slate-50 to-white py-6"
      style={{
        background:
          'linear-gradient(180deg,#050610 15%, #22063a 36%, #6b22ff 65%, #050610 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Anchor for scroll offset */}
        <div
          id="fitur-tabs-anchor"
          style={{ marginTop: '-48px', height: '48px' }}
        ></div>
        <h2 className="mb-8 text-center text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
          Fitur yang Membuat{' '}
          <span className="bg-gradient-to-r from-[#2763eb] to-[#2763eb] bg-clip-text text-transparent">
            Desain Lebih Mudah
          </span>
        </h2>

        {/* Tabs */}
        <div
          className="flex justify-start md:justify-center gap-6 overflow-x-auto border-b pb-4 py-2 px-4 sm:px-0"
          id="fitur-tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold flex-shrink-0 min-w-max ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-white hover:text-blue-600'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Content */}
        {tabData && (
          <motion.div
            key={tabData.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 grid grid-cols-1 items-center gap-8 md:grid-cols-2"
          >
            <div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                {tabData.heading}
              </h3>
              <p className="mt-4 text-white">{tabData.desc}</p>
              <StarButton className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold shadow hover:brightness-110">
                {tabData.cta}
              </StarButton>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
              <Image
                src={tabData.img}
                alt={tabData.heading}
                width={600}
                height={400}
                className="h-auto w-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
