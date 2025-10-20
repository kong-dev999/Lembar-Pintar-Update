'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Dr. Aisyah Putri',
    role: 'Guru SMA — Nganjuk',
    quote:
      'Saya bisa menyiapkan materi kelas dalam hitungan menit. Siswa jauh lebih antusias karena tampilannya modern dan interaktif.',
    img: '/images/gender/female.png',
  },
  {
    name: 'Rian Mahendra',
    role: 'Dosen — Kediri',
    quote:
      'Kolaborasi realtime dan Template AI sangat menghemat waktu. Saya bisa fokus mengajar, bukan pusing soal desain.',
    img: '/images/gender/male.png',
  },
  {
    name: 'Sinta Wulandari',
    role: 'Kreator Edukasi — Yogyakarta',
    quote:
      'Brand Kit + export PDF/PPT bikin semua konten terlihat konsisten dan profesional.',
    img: '/images/gender/female.png',
  },
  {
    name: 'Agus Saputra',
    role: 'Guru SD — Surabaya',
    quote:
      'Template lembar kerja siap pakai benar-benar membantu. Tinggal edit, cetak, selesai.',
    img: '/images/gender/male.png',
  },
  {
    name: 'Maya Prameswari',
    role: 'Guru TK — Nganjuk',
    quote:
      'Integrasi dengan Google membuat alur kerja kami super mulus. Satu klik, semua tersinkron.',
    img: '/images/gender/female.png',
  },
  {
    name: 'Fajar Nugraha',
    role: 'Instruktur Bootcamp',
    quote:
      'UI sederhana, hasilnya rapi. Siswa cepat paham karena materi visualnya kuat.',
    img: '/images/gender/male.png',
  },
  {
    name: 'Putri Oktaviani',
    role: 'Kepala Lab — Malang',
    quote:
      'Scheduler posting membantu saya menjadwalkan konten untuk kelas hybrid dengan mudah.',
    img: '/images/gender/female.png',
  },
  {
    name: 'Nadia Larasati',
    role: 'Guru BK — Semarang',
    quote:
      'Template poster dan infografik sangat memudahkan kampanye literasi sekolah.',
    img: '/images/gender/female.png',
  },
  {
    name: 'Reza Alfian',
    role: 'Guru SD - Nganjuk',
    quote:
      'Tim bisa kolaborasi tanpa ribet. Revisi cepat, arsip rapi, dan tanpa watermark di Pro.',
    img: '/images/gender/male.png',
  },
];

export default function Testimonial() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size untuk responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setVisibleCount(6);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLoadMore = () => {
    if (showAll) {
      setVisibleCount(6);
      setShowAll(false);
    } else {
      setVisibleCount(testimonials.length);
      setShowAll(true);
    }
  };

  const visibleTestimonials = testimonials.slice(0, visibleCount);

  return (
    <section
      className="relative w-full bg-gradient-to-b from-slate-50 to-white py-8 sm:py-12 md:py-12 lg:py-2"
      style={{
        background:
          'linear-gradient(180deg,#050610 5%, #22063a 25%, #3b09a0ff 60%, #19062aff 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Suara Pengguna{' '}
            <span className="bg-gradient-to-r from-[#2763eb] to-[#2763eb] bg-clip-text text-transparent">
              Lembar Pintar
            </span>
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-white">
            Testimoni asli dari pendidik & kreator yang memakai Lembar Pintar
            setiap hari.
          </p>
        </motion.div>

        {/* Grid dengan responsive columns */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 gap-4 sm:gap-6 
                         sm:grid-cols-2 
                         lg:grid-cols-3 
                         xl:grid-cols-3
                         2xl:grid-cols-4"
              layout
            >
              {visibleTestimonials.map((t, idx) => (
                <motion.article
                  key={`${t.name}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(idx * 0.1, 0.8),
                    type: 'spring',
                    stiffness: 100,
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative flex h-full flex-col rounded-xl sm:rounded-2xl 
                           bg-white/90 backdrop-blur-sm
                           p-4 sm:p-6 lg:p-7
                           shadow-lg hover:shadow-2xl
                           ring-1 ring-slate-200 hover:ring-blue-200 
                           transition-all duration-300"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <Image
                        src={t.img}
                        alt={t.name}
                        width={48}
                        height={48}
                        className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 
                                 rounded-full object-cover 
                                 ring-2 ring-blue-500/30 group-hover:ring-blue-500/50
                                 transition-all duration-300"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 
                                    rounded-full bg-green-400 ring-2 ring-white"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                        {t.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">
                        {t.role}
                      </p>
                    </div>
                  </div>

                  <blockquote className="mt-4 sm:mt-5 flex-1">
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed line-clamp-4 sm:line-clamp-none">
                      "{t.quote}"
                    </p>
                  </blockquote>

                  {/* Rating stars */}
                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Accent line */}
                  <div
                    className="pointer-events-none mt-4 sm:mt-6 h-1 w-16 sm:w-24 
                                rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 
                                opacity-70 group-hover:opacity-100 group-hover:w-20 sm:group-hover:w-32
                                transition-all duration-300"
                  />
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button */}
          {testimonials.length > 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 sm:mt-12 text-center"
            >
              <button
                onClick={handleLoadMore}
                className="group relative inline-flex items-center gap-2 
                         rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 
                         px-6 sm:px-8 py-3 sm:py-4
                         text-sm sm:text-base font-semibold text-white 
                         shadow-lg hover:shadow-xl
                         transition-all duration-300 
                         hover:scale-105 active:scale-95"
              >
                <span>
                  {showAll
                    ? 'Tampilkan Lebih Sedikit'
                    : 'Lihat Semua Testimoni'}
                </span>
                <motion.div
                  animate={{ rotate: showAll ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>

                {/* Button glow effect */}
                <div
                  className="absolute inset-0 rounded-full bg-white/20 
                              opacity-0 group-hover:opacity-100 
                              transition-opacity duration-300"
                />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Background decoration - responsive */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px]
                       -translate-x-1/2 -translate-y-1/2 rounded-full 
                       bg-blue-500/5 blur-3xl"
        />
        <div
          className="absolute left-1/4 top-1/4 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px]
                       rounded-full bg-indigo-500/5 blur-2xl"
        />
      </div>
    </section>
  );
}
