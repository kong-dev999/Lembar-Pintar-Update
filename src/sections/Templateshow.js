'use client';

import Image from 'next/image';
import React from 'react';
import { SparklesText } from '@/components/ui/sparkles-text';

/** ——— data bisa kamu ganti sesuai asetmu ——— */
const ROWS = [
  {
    dir: 'left', // kiri
    duration: 60, // diperlambat sedikit untuk lebih smooth
    items: [
      { src: '/images/reels/reels01.png', alt: 'Reels 1' },
      { src: '/images/reels/reels02.png', alt: 'Reels 2' },
      { src: '/images/reels/reels03.png', alt: 'Reels 3' },
      { src: '/images/reels/reels04.png', alt: 'Reels 4' },
      { src: '/images/reels/reels05.png', alt: 'Reels 5' },
      { src: '/images/reels/reels06.png', alt: 'Reels 6' },
    ],
  },
  {
    dir: 'right', // kanan
    duration: 60,
    items: [
      { src: '/images/reels/reels07.png', alt: 'Reels 7' },
      { src: '/images/reels/reels08.png', alt: 'Reels 8' },
      { src: '/images/reels/reels09.png', alt: 'Reels 9' },
      { src: '/images/reels/reels10.png', alt: 'Reels 10' },
      { src: '/images/reels/reels11.png', alt: 'Reels 11' },
      { src: '/images/reels/reels12.png', alt: 'Reels 12' },
    ],
  },
];

export default function TemplateShowcase() {
  return (
    <section
      className="relative w-full pt-0 pb-16 sm:pt-4 sm:pb-8 md:pt-6 md:pb-6"
      style={{
        background:
          'linear-gradient(180deg, #1f0940 20%, #660dffff 42%, #040432ff 60%, #660dffff 78%, #1f0940 90%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-2">
        <div className="mb-2 sm:mb-6 md:mb-8 text-center">
          <div className="inline-block">
            <SparklesText
              text={
                'Buat Materi, Poster, dan Ciptakan Karya Sekolahmu Sendiri dalam Hitungan Menit'
              }
              className={
                'text-xl sm:text-2xl md:text-4xl font-extrabold flecha-medium tracking-tight text-white'
              }
            />
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="w-full py-8 md:py-6">
          <div className="w-full grid gap-10">
            {ROWS.map((row, i) => (
              <MarqueeRow
                key={i}
                items={row.items}
                direction={row.dir}
                duration={row.duration}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeRow({ items, direction = 'left', duration = 40 }) {
  // Gunakan 3 set item untuk memastikan kontinuitas
  const tripled = [...items, ...items, ...items];

  return (
    <div className="group relative overflow-hidden">
      {/* darker gradient edges to match background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#12021a] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#12021a] to-transparent z-10" />

      {/* Container marquee */}
      <div
        className={`flex ${
          direction === 'left'
            ? 'animate-infinite-scroll-left'
            : 'animate-infinite-scroll-right'
        }`}
        style={{
          animationDuration: `${duration}s`,
          width: `${items.length * 320 * 3}px`, // Lebar dinamis berdasarkan jumlah item
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running';
        }}
      >
        {tripled.map((it, idx) => (
          <Card key={`${it.src}-${idx}`} src={it.src} alt={it.alt} />
        ))}
      </div>
    </div>
  );
}

function Card({ src, alt }) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="mx-3 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10 shadow-lg transition-transform duration-300 hover:scale-105">
      <div className="h-[120px] w-[220px] md:h-[150px] md:w-[280px] relative">
        {!imgError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 180px, 220px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent flex items-center justify-center">
            <span className="text-white font-medium text-lg">{alt}</span>
          </div>
        )}
      </div>
    </div>
  );
}
