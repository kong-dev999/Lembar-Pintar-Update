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
  // selection and favorites for overlay actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

  // view mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('grid');
  // type filter: 'any' | 'image' | 'video' | 'document'
  const [typeFilter, setTypeFilter] = useState('any');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      if (!typeRef.current) return;
      if (!typeRef.current.contains(e.target)) setTypeDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [typeRef]);

  const matchesType = (src) => {
    const name = src.split('/').pop() || '';
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (typeFilter === 'any') return true;
    if (typeFilter === 'image')
      return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
    if (typeFilter === 'video') return ['mp4', 'webm', 'mov'].includes(ext);
    if (typeFilter === 'document') return ext === 'pdf';
    return true;
  };

  // whether selection mode is active (show checkboxes on all items)
  const selectionMode = selectedItems.length > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawFav = window.localStorage.getItem('lp_favorites');
      if (rawFav) setFavoriteItems(JSON.parse(rawFav));
    } catch (e) {}
  }, []);

  const toggleSelect = (item) => {
    setSelectedItems((s) =>
      s.includes(item.src) ? s.filter((x) => x !== item.src) : [...s, item.src]
    );
  };

  const toggleFavorite = (item) => {
    setFavoriteItems((prev) => {
      const exists = prev.some((p) => p.src === item.src);
      const next = exists
        ? prev.filter((p) => p.src !== item.src)
        : [{ src: item.src, prefix: item.prefix }, ...prev];
      try {
        if (typeof window !== 'undefined')
          window.localStorage.setItem('lp_favorites', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const removeDesignTemplate = (item) => {
    const next = addedTemplates.filter((a) => a.src !== item.src);
    setAddedTemplates(next);
    try {
      if (typeof window !== 'undefined')
        window.localStorage.setItem(
          'lp_design_templates',
          JSON.stringify(next)
        );
    } catch (e) {}
    // also remove from favorites if present
    const favNext = favoriteItems.filter((f) => f.src !== item.src);
    if (favNext.length !== favoriteItems.length) {
      setFavoriteItems(favNext);
      try {
        if (typeof window !== 'undefined')
          window.localStorage.setItem('lp_favorites', JSON.stringify(favNext));
      } catch (e) {}
    }
  };

  // remove all currently selected items (used by bottom overlay)
  const removeSelectedItems = () => {
    if (selectedItems.length === 0) return;
    // simple confirmation modal
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          `Hapus ${selectedItems.length} item terpilih?`
        );
        if (!ok) return;
      }
    } catch (e) {}

    const next = addedTemplates.filter((a) => !selectedItems.includes(a.src));
    setAddedTemplates(next);
    try {
      if (typeof window !== 'undefined')
        window.localStorage.setItem(
          'lp_design_templates',
          JSON.stringify(next)
        );
    } catch (e) {}

    const favNext = favoriteItems.filter((f) => !selectedItems.includes(f.src));
    if (favNext.length !== favoriteItems.length) {
      setFavoriteItems(favNext);
      try {
        if (typeof window !== 'undefined')
          window.localStorage.setItem('lp_favorites', JSON.stringify(favNext));
      } catch (e) {}
    }

    // clear selection mode
    setSelectedItems([]);
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
              <div className="relative" ref={typeRef}>
                <button
                  onClick={() => setTypeDropdownOpen((s) => !s)}
                  className="rounded-full border border-gray-400 px-5 py-2 text-white bg-transparent flex items-center gap-2 font-semibold hover:bg-[#22063a] transition"
                >
                  {typeFilter === 'any'
                    ? 'Any Type'
                    : typeFilter === 'image'
                      ? 'Gambar'
                      : typeFilter === 'video'
                        ? 'Vedio'
                        : 'Document'}
                  <span className="ml-2">&#9662;</span>
                </button>
                {typeDropdownOpen && (
                  <div className="absolute mt-2 w-56 bg-black/80 rounded shadow-lg py-2 z-40">
                    <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10">
                      Any Type
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                      onClick={() => {
                        setTypeFilter('image');
                        setTypeDropdownOpen(false);
                      }}
                    >
                      Gambar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                      onClick={() => {
                        setTypeFilter('video');
                        setTypeDropdownOpen(false);
                      }}
                    >
                      Vedio
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                      onClick={() => {
                        setTypeFilter('document');
                        setTypeDropdownOpen(false);
                      }}
                    >
                      Document
                    </button>
                  </div>
                )}
              </div>
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
              {/* View toggle (grid / list) */}
              <button
                onClick={() =>
                  setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))
                }
                className={`p-1 rounded-md transition ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/10'}`}
                aria-label="Toggle view"
              >
                {viewMode === 'grid' ? (
                  // show list icon when currently grid (click to switch to list)
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
                ) : (
                  // show grid icon when currently list (click to switch to grid)
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
                    <rect x="3" y="3" width="8" height="8" />
                    <rect x="13" y="3" width="8" height="8" />
                    <rect x="3" y="13" width="8" height="8" />
                    <rect x="13" y="13" width="8" height="8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tampilkan gambar/daftar yang sudah ditambahkan di halaman design.js */}
          {addedTemplates.length > 0 && (
            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-4">
                Template yang sudah ditambahkan
              </h3>
              <div className="max-w-6xl mx-auto px-2">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center items-start">
                    {addedTemplates
                      .filter((a) => matchesType(a.src))
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="relative group flex flex-col items-center mx-3"
                        >
                          <div
                            className="bg-white rounded-xl shadow-md overflow-hidden relative transform transition-transform duration-150 group-hover:scale-105"
                            style={{ width: 180, height: 180 }}
                          >
                            <label
                              className={`absolute top-2 left-2 w-8 h-8 bg-black/50 rounded-md flex items-center justify-center transition-opacity duration-150 ${selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={selectedItems.includes(item.src)}
                                onChange={() => toggleSelect(item)}
                              />
                            </label>

                            {favoriteItems.some((f) => f.src === item.src) && (
                              <div className="absolute top-2 right-2 w-8 h-8 rounded-md bg-yellow-400 text-white flex items-center justify-center z-10 pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-150">
                                <i className="fa-solid fa-star"></i>
                              </div>
                            )}

                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
                              <button
                                title={
                                  favoriteItems.some((f) => f.src === item.src)
                                    ? 'Unfavorite'
                                    : 'Tambah Favorit'
                                }
                                className={`w-8 h-8 rounded-md bg-black/50 flex items-center justify-center ${favoriteItems.some((f) => f.src === item.src) ? 'text-yellow-400' : 'text-white'} cursor-pointer`}
                                onClick={() => toggleFavorite(item)}
                                aria-label="favorite"
                              >
                                <i className="fa-solid fa-star"></i>
                              </button>
                              <button
                                title="Hapus template"
                                className="w-8 h-8 rounded-md bg-black/50 text-red-500 flex items-center justify-center cursor-pointer"
                                onClick={() => removeDesignTemplate(item)}
                                aria-label="hapus"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>

                            <div className="w-full h-full flex items-center justify-center bg-white p-3">
                              <img
                                src={item.src}
                                alt={item.src.split('/').pop()}
                                className="max-w-full max-h-full object-contain rounded"
                              />
                            </div>
                          </div>
                          <span className="mt-2 font-medium text-white text-center break-all w-full text-xs sm:text-sm">
                            {item.prefix === 'huruf'
                              ? 'Huruf & Bahasa'
                              : item.prefix === 'angka'
                                ? 'Angka & Berhitung'
                                : item.prefix === 'hewan'
                                  ? 'Hewan & Tumbuhan'
                                  : 'Umum'}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  // list view
                  <div className="bg-transparent rounded-md overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-white/80">
                          <th className="p-3">Name</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Edited</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addedTemplates
                          .filter((a) => matchesType(a.src))
                          .map((item, idx) => {
                            const name = item.src.split('/').pop();
                            const ext = (
                              name.split('.').pop() || ''
                            ).toLowerCase();
                            let typeLabel = 'File';
                            let typeIcon = '📄';
                            if (
                              ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
                                ext
                              )
                            ) {
                              typeLabel = 'Gambar';
                              typeIcon = '🖼️';
                            } else if (['mp4', 'webm', 'mov'].includes(ext)) {
                              typeLabel = 'Video';
                              typeIcon = '🎬';
                            } else if (ext === 'pdf') {
                              typeLabel = 'Dokumen';
                              typeIcon = '📄';
                            }
                            return (
                              <tr key={idx} className="border-t border-white/5">
                                <td className="p-3 flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={selectedItems.includes(item.src)}
                                    onChange={() => toggleSelect(item)}
                                  />
                                  <img
                                    src={item.src}
                                    alt={name}
                                    className="w-12 h-12 object-contain rounded"
                                  />
                                  <div>
                                    <div className="text-white font-semibold">
                                      {item.prefix === 'huruf'
                                        ? 'Huruf & Bahasa'
                                        : item.prefix === 'angka'
                                          ? 'Angka & Berhitung'
                                          : item.prefix === 'hewan'
                                            ? 'Hewan & Tumbuhan'
                                            : name}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 align-top">
                                  <div className="flex items-center gap-2 text-white">
                                    <span>{typeIcon}</span>
                                    <span>{typeLabel}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-white/70">1 day ago</td>
                                <td className="p-3 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      className={`w-8 h-8 rounded-md bg-transparent flex items-center justify-center ${favoriteItems.some((f) => f.src === item.src) ? 'text-yellow-400' : 'text-white'}`}
                                      onClick={() => toggleFavorite(item)}
                                    >
                                      <i className="fa-solid fa-star"></i>
                                    </button>
                                    <button
                                      className="w-8 h-8 rounded-md bg-transparent text-red-500 flex items-center justify-center"
                                      onClick={() => removeDesignTemplate(item)}
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom action overlay when items are selected */}
          {selectionMode && (
            <div
              className="fixed bottom-14 z-50"
              style={{
                left: 'calc(50% + 50px)',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="bg-black/80 text-white rounded-lg px-4 py-3 flex items-center gap-4 shadow-lg w-[50vw] max-w-2xl">
                <div className="flex-1">{selectedItems.length} Selected</div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700"
                    onClick={() => setSelectedItems([])}
                  >
                    Batal
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-red-600 hover:bg-red-700"
                    onClick={removeSelectedItems}
                    aria-label="Hapus terpilih"
                  >
                    Hapus
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
