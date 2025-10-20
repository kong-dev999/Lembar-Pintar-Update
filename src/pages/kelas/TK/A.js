import Navbar from '../../pelajari/navbar';
import { Menu, ChevronRight } from 'lucide-react';
import Meta from '@/components/Meta';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/pages/account/sidebar';
import SearchButton from '@/components/ui/SearchButton';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function DesignDashboard() {
  const user = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: '/images/gender/male.png',
    },
  };

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAccountRoute = useMemo(() => {
    if (!mounted) return false;
    if (!router || !router.asPath) return false;
    return router.asPath.startsWith('/account');
  }, [mounted, router?.asPath]);

  const { signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!isAccountRoute) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    }
  }, [isAccountRoute]);

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

  // Build template list. Files in the public folder should be named using prefixes
  // to indicate category: hurufXX.png, angkaXX.png, hewanXX.png. For backwards
  // compatibility, we still include any TKAXX.png files as 'huruf' by default.
  const templates = useMemo(() => {
    // In the real project these files live in /public/images/materi/TK/TK A/
    // We'll create a representative list combining different prefixes.
    const list = [];
    // Add some 'huruf' prefixed files
    for (let i = 1; i <= 8; i++) {
      const name = `huruf${i.toString().padStart(2, '0')}.png`;
      list.push({ src: `/images/materi/TK/TK A/${name}`, prefix: 'huruf' });
    }
    // Add some 'angka' prefixed files
    for (let i = 1; i <= 7; i++) {
      const name = `angka${i.toString().padStart(2, '0')}.png`;
      list.push({ src: `/images/materi/TK/TK A/${name}`, prefix: 'angka' });
    }
    // Add some 'hewan' prefixed files
    for (let i = 1; i <= 6; i++) {
      const name = `hewan${i.toString().padStart(2, '0')}.png`;
      list.push({ src: `/images/materi/TK/TK A/${name}`, prefix: 'hewan' });
    }

    return list;
  }, []);

  const shuffledTemplates = useMemo(
    () => templates.slice().sort(() => Math.random() - 0.5),
    [templates]
  );

  // Category and search state (moved above the filteredTemplates computation so
  // they can be referenced safely inside the memo).
  const categories = ['Semua Template', 'Kategori'];
  const [selectedCategory, setSelectedCategory] = useState('Semua Template');
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const kategoriRef = useRef(null);
  const kategoriCloseTimeoutRef = useRef(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  // Kategori is considered active when any subcategory is selected
  const isKategoriActive = selectedCategory !== 'Semua Template';

  // Compute templates to display based on selectedCategory and search text.
  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (selectedCategory === 'Semua Template') {
      return shuffledTemplates.filter((t) => t.src.toLowerCase().includes(q));
    }

    // Map selectedCategory text to prefix used in filenames
    let prefix = null;
    if (selectedCategory.toLowerCase().includes('huruf')) prefix = 'huruf';
    if (selectedCategory.toLowerCase().includes('angka')) prefix = 'angka';
    if (selectedCategory.toLowerCase().includes('hewan')) prefix = 'hewan';

    if (!prefix)
      return shuffledTemplates.filter((t) => t.src.toLowerCase().includes(q));

    return shuffledTemplates.filter(
      (t) => t.prefix === prefix && t.src.toLowerCase().includes(q)
    );
  }, [shuffledTemplates, selectedCategory, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!kategoriRef.current) return;
      if (!kategoriRef.current.contains(e.target)) setKategoriOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openModal = (item) => {
    setModalItem(item);
    // set isFavorited based on whether the item is already in favorites
    const exists = favoriteItems.some((f) => f.src === item.src);
    setIsFavorited(exists);
    setShareCopied(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  const handleToggleFavorite = () => setIsFavorited((s) => !s);

  // Toggle favorite for current modalItem and persist to localStorage
  const toggleFavoriteForModal = () => {
    if (!modalItem) return;
    const exists = favoriteItems.some((f) => f.src === modalItem.src);
    let next = [];
    if (exists) {
      next = favoriteItems.filter((f) => f.src !== modalItem.src);
      setIsFavorited(false);
    } else {
      next = [
        { src: modalItem.src, prefix: modalItem.prefix },
        ...favoriteItems,
      ];
      setIsFavorited(true);
    }
    setFavoriteItems(next);
    try {
      if (typeof window !== 'undefined')
        window.localStorage.setItem('lp_favorites', JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const openFavorites = () => setFavoritesOpen(true);
  const closeFavorites = () => setFavoritesOpen(false);

  const removeFavorite = (src) => {
    const next = favoriteItems.filter((f) => f.src !== src);
    setFavoriteItems(next);
    try {
      if (typeof window !== 'undefined')
        window.localStorage.setItem('lp_favorites', JSON.stringify(next));
    } catch (e) {}
  };

  // load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('lp_favorites');
      if (raw) setFavoriteItems(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleShare = async () => {
    if (!modalItem) return;
    const url =
      typeof window !== 'undefined'
        ? window.location.origin + modalItem.src
        : modalItem.src;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (typeof window !== 'undefined') {
        // fallback
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  useEffect(
    () => () => {
      if (kategoriCloseTimeoutRef.current)
        clearTimeout(kategoriCloseTimeoutRef.current);
    },
    []
  );

  return (
    <>
      <Meta />
      <div className="flex h-screen bg-gray-50">
        {isAccountRoute && (
          <Sidebar
            sidebarOpen={sidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebarCollapse={toggleSidebarCollapse}
            user={user}
            signOut={signOut}
            active="template"
          />
        )}

        <div
          ref={scrollContainerRef}
          className="flex-1 flex flex-col overflow-y-auto"
          style={{
            background: isAccountRoute
              ? 'linear-gradient(180deg, #000000 0%, #22063a 22%, #360e8cff 48%, #22063a 80%, #000000ff 100%)'
              : 'linear-gradient(180deg, #000000 0%, #22063a 15%, #360e8cff 48%, #22063a 100%)',
          }}
        >
          {!isAccountRoute && (
            <Navbar scrollContainerRef={scrollContainerRef} />
          )}

          {/* Favorites list modal */}
          {favoritesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={closeFavorites}
              />
              <div className="relative max-w-4xl w-[92%] bg-[#111] text-white rounded-lg shadow-xl overflow-hidden z-10 p-6">
                <button
                  aria-label="close favorites"
                  className="absolute top-3 right-3 text-black bg-white rounded-full p-2"
                  onClick={closeFavorites}
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

                <h3 className="text-xl font-bold mb-4">
                  Daftar Favorit ({favoriteItems.length})
                </h3>
                {favoriteItems.length === 0 ? (
                  <div className="text-gray-400">Belum ada favorit.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favoriteItems.map((f) => (
                      <div
                        key={f.src}
                        className="bg-white rounded-md overflow-hidden shadow-sm"
                      >
                        <img
                          src={f.src}
                          alt={f.src.split('/').pop()}
                          className="w-full h-40 object-cover cursor-pointer"
                          onClick={() => {
                            closeFavorites();
                            openModal(f);
                          }}
                        />
                        <div className="p-2 flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {f.prefix || 'Umum'}
                          </span>
                          <button
                            className="text-sm text-red-600"
                            onClick={() => removeFavorite(f.src)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isAccountRoute && (
            <header className="h-24 py-2 border-b px-10 flex text-white justify-between bg-[#000000]">
              <div className="flex items-center gap-4">
                {isAccountRoute && (
                  <button
                    onClick={toggleMobileSidebar}
                    className="md:hidden p-2 rounded-md text-black bg-white hover:text-white hover:bg-[#4b15fcff] -ml-6"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                <h1 className="text-xl font-semibold">Template</h1>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`relative transition-all duration-200 ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
          )}

          <div
            className={`text-center pt-8  mt-10 md:mt-2 ${!isAccountRoute ? 'pt-20 md:pt-20' : ''}`}
            style={{ transition: 'padding 200ms ease' }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              TK Paud - Kelas A
            </h2>
          </div>

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
          <div className="flex justify-center gap-2 md:gap-4 pb-4">
            {categories.map((cat) => {
              if (cat === 'Kategori') {
                return (
                  <div
                    key="kategori"
                    className="relative"
                    ref={kategoriRef}
                    onMouseEnter={
                      typeof window !== 'undefined' && window.innerWidth >= 768
                        ? () => {
                            if (kategoriCloseTimeoutRef.current) {
                              clearTimeout(kategoriCloseTimeoutRef.current);
                              kategoriCloseTimeoutRef.current = null;
                            }
                            setKategoriOpen(true);
                          }
                        : undefined
                    }
                    onMouseLeave={
                      typeof window !== 'undefined' && window.innerWidth >= 768
                        ? () => {
                            if (kategoriCloseTimeoutRef.current)
                              clearTimeout(kategoriCloseTimeoutRef.current);
                            kategoriCloseTimeoutRef.current = setTimeout(() => {
                              setKategoriOpen(false);
                              kategoriCloseTimeoutRef.current = null;
                            }, 160);
                          }
                        : undefined
                    }
                  >
                    <button
                      onClick={() => setKategoriOpen((s) => !s)}
                      className={`px-4 py-2 rounded-full font-semibold border transition-all duration-150 shadow-sm flex items-center gap-2 ${isKategoriActive ? 'bg-[#5122ff] text-white border-white border-2' : 'bg-white text-black'}`}
                    >
                      <span className="text-sm">Kategori</span>
                      <ChevronRight
                        className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${kategoriOpen ? 'rotate-90' : 'rotate-0'}`}
                      />
                    </button>

                    {kategoriOpen && (
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-md shadow-lg z-40 overflow-hidden"
                        onMouseEnter={() => {
                          if (kategoriCloseTimeoutRef.current) {
                            clearTimeout(kategoriCloseTimeoutRef.current);
                            kategoriCloseTimeoutRef.current = null;
                          }
                          setKategoriOpen(true);
                        }}
                        onMouseLeave={() => {
                          if (kategoriCloseTimeoutRef.current)
                            clearTimeout(kategoriCloseTimeoutRef.current);
                          kategoriCloseTimeoutRef.current = setTimeout(() => {
                            setKategoriOpen(false);
                            kategoriCloseTimeoutRef.current = null;
                          }, 160);
                        }}
                      >
                        <button
                          className="w-full text-center px-4 py-2 text-sm font-bold hover:bg-[#5122ff] hover:text-white"
                          onClick={() => {
                            setSelectedCategory('Huruf & Bahasa');
                            setKategoriOpen(false);
                          }}
                        >
                          Huruf & Bahasa
                        </button>
                        <button
                          className="w-full text-center px-4 py-2 text-sm font-bold hover:bg-[#5122ff] hover:text-white"
                          onClick={() => {
                            setSelectedCategory('Angka & Berhitung');
                            setKategoriOpen(false);
                          }}
                        >
                          Angka & Berhitung
                        </button>
                        <button
                          className="w-full text-center px-4 py-2 text-sm font-bold hover:bg-[#5122ff] hover:text-white"
                          onClick={() => {
                            setSelectedCategory('Hewan & Tumbuhan');
                            setKategoriOpen(false);
                          }}
                        >
                          Hewan & Tumbuhan
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-semibold border transition-all duration-150 shadow-sm hover:bg-[#5122ff] hover:text-white ${selectedCategory === cat ? 'bg-[#5122ff] text-white border-white border-2' : 'bg-white text-black'}`}
                  // on mobile, keep buttons compact and centered
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick buttons */}
          <div className="flex justify-center gap-6 mt-2 mb-2">
            <div className="flex flex-col items-center">
              <button className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
                <i className="fa-solid fa-fire text-lg"></i>
              </button>
              <span className="text-sm text-white mt-2">Populer</span>
            </div>

            <div className="flex flex-col items-center">
              <button className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
                <i className="fa-solid fa-image text-lg"></i>
              </button>
              <span className="text-sm text-white mt-2">Gambar</span>
            </div>

            <div className="flex flex-col items-center">
              <button className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
                <i className="fa-solid fa-video text-lg"></i>
              </button>
              <span className="text-sm text-white mt-2">Video</span>
            </div>

            <div className="flex flex-col items-center">
              <button className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md">
                <i className="fa-solid fa-file-alt text-lg"></i>
              </button>
              <span className="text-sm text-white mt-2">Dokumen</span>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={openFavorites}
                className="relative w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-md"
              >
                <i className="fa-solid fa-star text-lg"></i>
                {favoriteItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-semibold rounded-full px-1">
                    {favoriteItems.length}
                  </span>
                )}
              </button>
              <span className="text-sm text-white mt-2">Favorit</span>
            </div>
          </div>

          <main className="p-5 space-y-6">
            {/* Masonry-like multi-column layout. Use 2 columns by default (mobile),
                increase to 3 on md and 4 on lg to match previous behavior. */}
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {filteredTemplates.map((t, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-md shadow-sm overflow-hidden cursor-pointer"
                  style={{ marginBottom: 12 }}
                  onClick={() => openModal(t)}
                >
                  <div className="bg-white p-1">
                    <img
                      src={t.src}
                      alt={t.src.split('/').pop()}
                      className="w-full block rounded-md object-cover"
                      style={{ display: 'block', lineHeight: 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Modal */}
          {modalOpen && modalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={closeModal}
              />

              <div className="relative max-w-5xl w-[92%] bg-[#252627] text-white rounded-lg shadow-xl overflow-hidden z-10 pr-10 md:pr-12">
                <button
                  aria-label="close"
                  className="absolute top-3 right-3 text-black bg-white rounded-full p-2 hover:bg-gray-100"
                  onClick={closeModal}
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

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/3 p-4 flex items-center justify-center">
                    <img
                      src={modalItem.src}
                      alt={modalItem.src.split('/').pop()}
                      className="max-h-[70vh] w-auto rounded-md object-contain"
                    />
                  </div>

                  <div className="md:w-1/3 p-6 flex flex-col gap-4">
                    {/* Title - generate human friendly title by prefix */}
                    <h3 className="text-2xl font-extrabold">
                      {(() => {
                        const s = modalItem.prefix || '';
                        if (s.includes('huruf'))
                          return 'Huruf dan Hewan Alfabet';
                        if (s.includes('angka')) return 'Angka dan Buah-buahan';
                        if (s.includes('hewan'))
                          return 'Hewan & Tumbuhan - Seri Edukasi';
                        return modalItem.src.split('/').pop();
                      })()}
                    </h3>

                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-gray-800 text-sm rounded-full">
                        {modalItem.prefix || 'Umum'}
                      </span>
                      <span className="px-3 py-1 bg-gray-800 text-sm rounded-full">
                        Kelas TK
                      </span>
                    </div>

                    <p className="text-sm text-gray-300">
                      Versi: Ini adalah deskripsi singkat unik dari template.
                      Cocok untuk pembelajaran awal, aktivitas mewarnai, dan
                      latihan pengenalan huruf/angka.
                    </p>

                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push('/editor')}
                          className="px-11 py-2 rounded-md bg-[#5122ff] text-white"
                        >
                          Kustom Template ini
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleFavoriteForModal}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md ${isFavorited ? 'bg-yellow-500 text-black' : 'bg-white text-black'}`}
                        >
                          <i className="fa-solid fa-star"></i>
                          <span>Favorit</span>
                        </button>

                        <button
                          onClick={handleShare}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700"
                        >
                          <i className="fa-solid fa-link"></i>
                          <span>
                            {shareCopied ? 'Link disalin' : 'Bagikan'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
