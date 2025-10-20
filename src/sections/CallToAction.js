'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

const CallToAction = () => {
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth movement
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform values for different layers
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

  // Parallax transforms for different elements
  const backgroundX = useTransform(x, [-0.5, 0.5], [-30, 30]);
  const backgroundY = useTransform(y, [-0.5, 0.5], [-15, 15]);

  const glassX = useTransform(x, [-0.5, 0.5], [-10, 10]);
  const glassY = useTransform(y, [-0.5, 0.5], [-5, 5]);

  const floatingX = useTransform(x, [-0.5, 0.5], [20, -20]);
  const floatingY = useTransform(y, [-0.5, 0.5], [10, -10]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseXPos = (event.clientX - rect.left - width / 2) / width;
      const mouseYPos = (event.clientY - rect.top - height / 2) / height;

      mouseX.set(mouseXPos);
      mouseY.set(mouseYPos);
    };

    const section = document.getElementById('cta-glass-section');
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <section
      id="cta-glass-section"
      className="relative flex items-center justify-center w-full min-h-screen py-20 sm:py-28 md:py-32 overflow-hidden"
      style={{
        perspective: '1000px',
        background:
          'linear-gradient(180deg, #4d08ccff 5%, #000000ff 25%, #000000ff 100%)',
      }}
    >
      {/* Animated background glow effects with mouse parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ x: backgroundX, y: backgroundY }}
      >
        {/* Main glow orbs */}
        <motion.div
          className="absolute top-20 left-20 h-96 w-96 rounded-full bg-blue-400/40 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 50, 0],
            y: [0, -80, -40],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-blue-300/50 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.8, 0.5],
            x: [0, -40, 0],
            y: [0, -60, -20],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-blue-200/35 blur-2xl"
          animate={{
            scale: [0.8, 1.3, 0.8],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Additional smaller glows */}
        <motion.div
          className="absolute top-40 right-1/3 h-40 w-40 rounded-full bg-blue-300/40 blur-2xl"
          animate={{
            y: [-30, -10, -30],
            x: [-15, 15, -15],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-40 left-1/3 h-32 w-32 rounded-full bg-blue-100/30 blur-xl"
          animate={{
            y: [20, -30, 20],
            x: [10, -10, 10],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Glassmorphism container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        className="relative z-10 mx-auto max-w-5xl px-6"
      >
        {/* Main glassmorphism card with 3D transform */}
        <motion.div
          className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-12 md:p-16"
          style={{
            x: glassX,
            y: glassY,
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Inner glow effect with depth */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent"
            style={{ transform: 'translateZ(10px)' }}
          />

          {/* Content with layered 3D depth */}
          <div
            className="relative z-10 text-center text-white"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Heading with 3D depth */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl font-extrabold sm:text-5xl md:text-6xl leading-tight mb-6"
              style={{
                transform: 'translateZ(20px)',
                textShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }}
            >
              Temukan cara baru untuk{' '}
              <motion.span
                className="text-white"
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{ transform: 'translateZ(5px)' }}
              >
                Mengajar & Berkreasi
              </motion.span>
            </motion.h2>

            {/* Subheading with depth */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-blue-50 mb-10 max-w-3xl mx-auto leading-relaxed"
              style={{ transform: 'translateZ(15px)' }}
            >
              Mulai gratis hari ini, dan rasakan kemudahan membuat materi
              interaktif hanya dalam hitungan menit.
            </motion.p>

            {/* 3D Interactive Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
              style={{ transform: 'translateZ(25px)' }}
            >
              {/* Primary button with 3D hover */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  rotateX: -5,
                  rotateY: 5,
                  z: 20,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Link
                  href="/auth/login"
                  className="group relative inline-block no-underline"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1559f2] to-[#1559f2] blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl px-8 py-4 text-base font-semibold text-white hover:bg-white/25 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Button shine effect */}
                    <div className="absolute inset-0 translate-x-[-100%] skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10">Mulai Gratis</span>
                  </div>
                </Link>
              </motion.div>

              {/* Secondary button with 3D hover */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  rotateX: -5,
                  rotateY: -5,
                  z: 20,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Link
                  href="/demo"
                  className="group relative inline-block no-underline"
                >
                  <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-8 py-4 text-base font-semibold text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Lihat Demo</span>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative glassmorphism elements */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full backdrop-blur-sm bg-white/5 border border-white/10" />
          <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full backdrop-blur-sm bg-white/5 border border-white/10" />
          <div className="absolute top-1/2 -left-8 w-12 h-12 rounded-full backdrop-blur-sm bg-blue-400/20 border border-blue-300/20" />
          <div className="absolute top-1/4 -right-6 w-14 h-14 rounded-full backdrop-blur-sm bg-blue-400/20 border border-blue-300/20" />
        </motion.div>

        {/* Additional floating glassmorphism cards with mouse parallax */}
        <motion.div
          className="absolute -top-8 left-8 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 w-24 h-24"
          style={{
            x: floatingX,
            y: floatingY,
            transform: 'translateZ(40px)',
          }}
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute -bottom-6 right-12 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 w-20 h-20"
          style={{
            x: useTransform(floatingX, (v) => -v),
            y: useTransform(floatingY, (v) => -v * 0.8),
            transform: 'translateZ(35px)',
          }}
          animate={{
            rotate: [0, -8, 0, 8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-20 -right-4 backdrop-blur-sm bg-gradient-to-br from-blue-400/30 to-blue-600/20 border border-blue-300/30 rounded-full w-16 h-16"
          style={{
            x: useTransform(floatingX, (v) => v * 0.5),
            y: useTransform(floatingY, (v) => v * 0.3),
            transform: 'translateZ(30px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </section>
  );
};

export default CallToAction;
