import React, { useMemo } from 'react';
import Sidebar from '@/pages/account/sidebar';
import { Menu } from 'lucide-react';
import Meta from '@/components/Meta';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SearchButton from '@/components/ui/SearchButton';

export default function DesignDashboard() {
  const user = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: '/images/gender/male.png',
    },
  };
  const router = useRouter();
  const { signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop

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
  // Asset gambar TK A (created once and shuffled for random order)
  const templates = useMemo(
    () =>
      Array.from(
        { length: 10 },
        (_, i) =>
          `/images/materi/TK/TK A/HURUF${(i + 1).toString().padStart(2, '0')}.png`
      ),
    []
  );

  // shuffle once per mount for random ordering
  const shuffledTemplates = useMemo(() => {
    return templates.slice().sort(() => Math.random() - 0.5);
  }, [templates]);
  // Kategori
  const categories = ['Lembar Pintar Template', 'Kategori'];
  const [selectedCategory, setSelectedCategory] = useState(
    'Lembar Pintar Template'
  );
  const [search, setSearch] = useState('');
  // Tambahkan state dan efek untuk mengambil gambar dari localStorage
  const [addedTemplates, setAddedTemplates] = useState([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('lp_design_templates');
      if (raw) setAddedTemplates(JSON.parse(raw));
    } catch (e) {}
  }, []);
  // Tambahkan state untuk modal gambar
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  // Fungsi untuk membuka modal
  const openImageModal = (item) => {
    setModalItem(item);
    setModalOpen(true);
  };
  const closeImageModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  return (
    <>
      <Meta />
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          user={user}
          signOut={signOut}
          active="design"
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
              <h1 className="text-xl font-semibold">Desain Saya</h1>
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

          <div className="text-center pt-6 mt-2">
            <h2 className="text-3xl md:text-4xl lg:text-3xl font-extrabold tracking-tight text-white mb-4">
              Wujudkan Ide Kreatifmu dengan Lembar Pintar
            </h2>
          </div>

          {/* Searching */}
          <div className="flex flex-col items-center pt-6 pb-4 px-4 justify-center pb-6">
            <div className="relative w-full max-w-3xl px-4">
              <SearchButton
                placeholder="Cari materi pembelajaran, aktivitas, dll..."
                onSearch={(v) => setSearch(v)}
                className="w-full max-w-xl mx-auto"
              />
            </div>
          </div>

          {/* Category Bar */}
          <div className="flex gap-3 pb-4 flex-wrap items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <button className="rounded-full border border-gray-400 px-5 py-2 text-white bg-transparent flex items-center gap-2 font-semibold hover:bg-[#22063a] transition">
                Type <span className="ml-2">&#9662;</span>
              </button>
              <button className="rounded-full border border-gray-400 px-5 py-2 text-white bg-transparent flex items-center gap-2 font-semibold hover:bg-[#22063a] transition">
                Category <span className="ml-2">&#9662;</span>
              </button>
              <button className="rounded-full border border-gray-400 px-5 py-2 text-white bg-transparent flex items-center gap-2 font-semibold hover:bg-[#22063a] transition">
                Owner <span className="ml-2">&#9662;</span>
              </button>
              <button className="rounded-full border border-gray-400 px-5 py-2 text-white bg-transparent flex items-center gap-2 font-semibold hover:bg-[#22063a] transition">
                Date modified <span className="ml-2">&#9662;</span>
              </button>
            </div>
            <div
              className="flex gap-4 items-center ml-auto"
              style={{ marginRight: '32px' }}
            >
              {/* Sort Icon */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 7l5-5 5 5" />
                <path d="M7 17l5 5 5-5" />
              </svg>
              {/* List Icon */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="5" cy="6" r="1" />
                <circle cx="5" cy="12" r="1" />
                <circle cx="5" cy="18" r="1" />
                <line x1="9" y1="6" x2="21" y2="6" />
                <line x1="9" y1="12" x2="21" y2="12" />
                <line x1="9" y1="18" x2="21" y2="18" />
              </svg>
            </div>
          </div>

          {/* Tampilkan gambar yang sudah ditambahkan di halaman design.js */}
          {addedTemplates.length > 0 && (
            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-4">
                Template yang sudah ditambahkan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {addedTemplates.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-md shadow-sm overflow-hidden bg-white cursor-pointer"
                    onClick={() => openImageModal(item)}
                  >
                    <img
                      src={item.src}
                      alt={item.src.split('/').pop()}
                      className="w-full block rounded-md object-cover border-4 border-white"
                      style={{ display: 'block', lineHeight: 0 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal gambar di design.js */}
          {modalOpen && modalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={closeImageModal}
              />
              <div className="relative max-w-xl w-[92%] bg-[#252627] text-white rounded-lg shadow-xl overflow-hidden z-10 p-8">
                <button
                  aria-label="close"
                  className="absolute top-3 right-3 text-black bg-white rounded-full p-2 hover:bg-gray-100"
                  onClick={closeImageModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div className="flex flex-col items-center">
                  <img
                    src={modalItem.src}
                    alt={modalItem.src.split('/').pop()}
                    className="max-h-[60vh] w-auto rounded-md object-contain border-4 border-white"
                  />
                  <button
                    className="mt-6 px-8 py-2 rounded-md bg-[#5122ff] hover:bg-[#440db5] text-white font-bold text-lg flex items-center gap-2"
                    onClick={closeImageModal}
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit Kembali
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
