import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Meta from '@/components/Meta';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';
import Link from 'next/link';

export default function AccountDashboard() {
  const user = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: '/images/gender/male.png',
    },
  };
  const router = useRouter();
  const { signOut } = useAuth();
  const [tab, setTab] = useState('education');
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

  const features = {
    education: [
      {
        title: 'Infografis',
        desc: 'Visual ringkas untuk materi pembelajaran.',
        img: '/images/dashboard/edu01.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Video Edukasi',
        desc: 'Video singkat untuk menjelaskan konsep.',
        img: '/images/dashboard/edu02.png',
        badge: 'Populer',
        href: '#',
      },
      {
        title: 'Animasi',
        desc: 'Pembelajaran interaktif dengan animasi.',
        img: '/images/dashboard/edu03.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Materi Interaktif',
        desc: 'Konten interaktif untuk melatih pemahaman.',
        img: '/images/dashboard/edu04.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Kuis',
        desc: 'Uji pemahaman dengan soal singkat.',
        img: '/images/dashboard/edu05.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Poster Edukatif',
        desc: 'Poster visual untuk meningkatkan literasi.',
        img: '/images/dashboard/edu06.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Hari Pendidikan',
        desc: 'Konten spesial untuk momen penting pendidikan.',
        img: '/images/dashboard/edu07.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Slide Pembelajaran',
        desc: 'Buat presentasi materi dengan mudah.',
        img: '/images/dashboard/edu08.png',
        badge: null,
        href: '#',
      },
      {
        title: 'Kutipan Inspiratif',
        desc: 'Kutipan motivasi untuk semangat belajar.',
        img: '/images/dashboard/edu09.png',
        badge: null,
        href: '#',
      },
    ],

    ecommerce: [
      {
        title: 'Avatar e-com',
        desc: 'Iklan & ulasan produk otomatis.',
        img: '/images/dashboard/ecom01.png',
        badge: 'Baru',
        href: '#',
      },
      {
        title: 'Katalog Produk',
        desc: 'Template katalog produk siap posting.',
        img: '/images/dashboard/ecom02.png',
        badge: null,
        href: '#',
      },
    ],
  };

  return (
    <>
      <Meta />

      <div className="flex h-screen bg-gray-50">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          user={user}
          signOut={signOut}
          active="home"
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
              <h1 className="text-xl font-semibold">Buat Postingan Baru</h1>
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
            {/* Hero */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <HeroCard
                title="Avatar Advertisement"
                desc={
                  <>
                    Buat video UGC untuk{' '}
                    <a className="underline" href="#">
                      bercerita
                    </a>{' '}
                    dan{' '}
                    <a className="underline" href="#">
                      iklan
                    </a>
                  </>
                }
                img="/images/dashboard/vedio_avatar.png"
                tone="red"
              />
              <HeroCard
                title="Avatar Animation"
                desc={
                  <>
                    Auto-Generate{' '}
                    <a className="underline" href="#">
                      Iklan video produk
                    </a>{' '}
                    &{' '}
                    <a className="underline" href="#">
                      Ulasan Produk
                    </a>{' '}
                    dengan AI
                  </>
                }
                img="/images/dashboard/avatar_ecom.png"
                tone="blue"
              />
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex items-center gap-6 px-1">
                <TabButton
                  active={tab === 'education'}
                  onClick={() => setTab('education')}
                >
                  Pendidikan
                </TabButton>

                <TabButton
                  active={tab === 'ecommerce'}
                  onClick={() => setTab('ecommerce')}
                >
                  E-Commerce
                </TabButton>

                <div className="ml-auto"></div>
              </div>
            </div>

            {/* Grid fitur */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {features[tab].map((f, i) => (
                <FeatureCard key={i} {...f} />
              ))}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

/* ===== Komponen lain ===== */
function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative py-2 text-sm text-white hover:bg-white/10 px-3 rounded-lg"
    >
      {children}
      {active && (
        <span className="absolute left-0 -bottom-px h-[3px] w-full rounded-full bg-blue-600" />
      )}
    </button>
  );
}

function HeroCard({
  title,
  desc,
  img,
  tone = 'pink',
  titleRightOffset = '4',
  descRightOffset = '8',
}) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg bg-${tone}-100 p-5`}
    >
      <img
        src={img}
        alt={title}
        className="w-full h-40 object-cover rounded-lg"
      />
      <div className="absolute top-6 right-6 bg-opacity-90 bg-white p-2 rounded-lg shadow-md w-[90%]">
        <h3
          className={`text-lg font-bold text-gray-800 right-${titleRightOffset}`}
        >
          {title}
        </h3>
        <p className={`text-sm text-gray-800 right-${descRightOffset}`}>
          {desc}
        </p>
        <div className="mt-2 text-white bg-[#5122ff] hover:bg-[#440db5] hover:text-white rounded-md inline-block">
          <button className="text-white text-sm font-medium px-4 py-2 rounded-md">
            Buat Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, img, href, badge }) {
  return (
    <div className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="h-40 w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{title}</h4>
          {badge && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-black">{desc}</p>
        <div className="pt-2">
          <Link
            href={href}
            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white bg-[#5122ff] hover:bg-[#440db5] hover:text-white no-underline"
          >
            Buat sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
