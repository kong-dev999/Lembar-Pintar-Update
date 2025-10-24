import { Menu, ChevronRight, Layers, GraduationCap, Star } from 'lucide-react';
import Meta from '@/components/Meta';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/pages/account/sidebar';
import SearchButton from '@/components/ui/SearchButton';
import { useAuth } from '@/contexts/AuthContext';

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

  const templates = useMemo(() => {
    const list = [];

    // Add some 'huruf' prefixed files
    for (let i = 1; i <= 11; i++) {
      const name = `huruf${i.toString().padStart(2, '0')}.png`;
      list.push({
        src: `/images/template/${name}`,
        prefix: 'huruf',
      });
    }

    // Add some 'angka' prefixed files
    for (let i = 1; i <= 7; i++) {
      const name = `angka${i.toString().padStart(2, '0')}.png`;
      list.push({
        src: `/images/template/${name}`,
        prefix: 'angka',
      });
    }

    // Add some 'hewan' prefixed files
    for (let i = 1; i <= 6; i++) {
      const name = `hewan${i.toString().padStart(2, '0')}.png`;
      list.push({
        src: `/images/template/${name}`,
        prefix: 'hewan',
      });
    }

    for (let i = 1; i <= 20; i++) {
      const name = `seni (${i}).png`;
      list.push({
        src: `/images/template/${name}`,
        prefix: 'seni',
      });
    }

    return list;
  }, []);

  const [orderedTemplates, setOrderedTemplates] = useState(templates);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const key = 'lp_template_order';
      const raw = window.localStorage.getItem(key);

      if (raw) {
        const order = JSON.parse(raw);
        const map = new Map(templates.map((t) => [t.src, t]));
        const next = order.map((src) => map.get(src)).filter(Boolean);

        // Append any new templates that weren't in saved order
        templates.forEach((t) => {
          if (!order.includes(t.src)) next.push(t);
        });

        setOrderedTemplates(next);
      } else {
        // Create a shuffled copy using Fisher-Yates
        const arr = templates.slice();
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const order = arr.map((t) => t.src);
        window.localStorage.setItem(key, JSON.stringify(order));
        setOrderedTemplates(arr);
      }
    } catch (e) {
      // ignore any localStorage errors and keep default order
      setOrderedTemplates(templates);
    }
  }, [templates]);

  const categories = ['Template', 'Kelas', 'Favorit'];

  const [selectedCategory, setSelectedCategory] = useState(
    'Taman Kanak - Kanak (TK)'
  );
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const kategoriRef = useRef(null);
  const kategoriCloseTimeoutRef = useRef(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const templateRef = useRef(null);
  const templateCloseTimeoutRef = useRef(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [FavCopied, setFavCopied] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Kategori is considered active when any subcategory is selected
  const templateOptions = [
    'Taman Kanak - Kanak (TK)',
    'Sekolah Dasar (SD)',
    'Sekolah Menengah Pertama (SMP)',
    'Sekolah Menengah Atas (SMA)',
  ];

  const kelasOptions = [
    'Seni & Kreativitas',
    'Hewan & Tumbuhan',
    'Huruf & Bahasa',
    'Angka & Berhitung',
  ];

  // selected specific kelas (e.g. 'Kelas 1', 'Kelas A')
  const [selectedKelasOption, setSelectedKelasOption] = useState(null);

  const isTemplateActive = templateOptions.includes(selectedCategory);
  const isKelasActive = Boolean(selectedKelasOption);

  // return kelas options depending on currently selected template
  const getKelasOptionsForTemplate = (template) => {
    if (!template) return [];
    if (template.includes('Taman Kanak')) return ['Kelas A', 'Kelas B'];
    if (template.includes('Sekolah Dasar'))
      return ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
    if (template.includes('Sekolah Menengah Pertama'))
      return ['Kelas 7', 'Kelas 8', 'Kelas 9'];
    if (template.includes('Sekolah Menengah Atas'))
      return ['Kelas 10', 'Kelas 11', 'Kelas 12'];

    return ['Kelas A', 'Kelas B'];
  };

  // Compute templates to display based on selectedCategory and search text
  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (selectedCategory === 'Template') {
      return orderedTemplates.filter((t) => t.src.toLowerCase().includes(q));
    }

    // Map selectedCategory text to prefix used in filenames
    let prefix = null;
    if (selectedCategory.toLowerCase().includes('huruf')) prefix = 'huruf';
    if (selectedCategory.toLowerCase().includes('angka')) prefix = 'angka';
    if (selectedCategory.toLowerCase().includes('hewan')) prefix = 'hewan';
    if (selectedCategory.toLowerCase().includes('seni')) prefix = 'seni';

    if (!prefix)
      return orderedTemplates.filter((t) => t.src.toLowerCase().includes(q));

    return orderedTemplates.filter(
      (t) => t.prefix === prefix && t.src.toLowerCase().includes(q)
    );
  }, [orderedTemplates, selectedCategory, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (kategoriRef.current && !kategoriRef.current.contains(e.target)) {
        setKategoriOpen(false);
      }
      if (templateRef.current && !templateRef.current.contains(e.target)) {
        setTemplateOpen(false);
      }
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
        {
          src: modalItem.src,
          prefix: modalItem.prefix,
        },
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
      if (templateCloseTimeoutRef.current)
        clearTimeout(templateCloseTimeoutRef.current);
    },
    []
  );

  const openModalFromFavorites = (item) => {
    setModalItem(item);
    setModalOpen(true);
  };

  // Fix issue with navigating to categories from the favorites page
  const navigateToCategory = (category) => {
    setSelectedCategory(category);
    if (templateOptions.includes(category)) {
      const defaults = getKelasOptionsForTemplate(category);
      if (defaults && defaults.length > 0) {
        setSelectedKelasOption(defaults[0]);
      } else {
        setSelectedKelasOption(null);
      }
    }
    if (category === 'Favorit') {
      setFavoritesOpen(true);
    } else {
      setFavoritesOpen(false);
    }
  };

  const categoryIcons = {
    Template: <Layers className="h-4 w-4" />,
    Kelas: <GraduationCap className="h-4 w-4" />,
    Favorit: <Star className="h-4 w-4 " />,
  };

  const headingTitle = templateOptions.includes(selectedCategory)
    ? selectedCategory
    : 'Taman Kanak - Kanak (TK)';

  const templateButtonLabel = templateOptions.includes(selectedCategory)
    ? selectedCategory
    : 'Template';

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
                  className={`relative transition-all duration-200 ${
                    sidebarOpen
                      ? 'opacity-0 pointer-events-none'
                      : 'opacity-100'
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
            className={`text-center pt-8 mt-10 md:mt-2 ${
              !isAccountRoute ? 'pt-20 md:pt-20' : ''
            }`}
            style={{ transition: 'padding 200ms ease' }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              {headingTitle}
            </h2>
          </div>

          <div className="flex flex-col items-center pt-6 pb-4 px-4 justify-center pb-6">
            <div className="relative w-full max-w-3xl px-4">
              <SearchButton
                placeholder="Cari Kelas pembelajaran, aktivitas, dll..."
                onSearch={(v) => setSearch(v)}
                className="w-full max-w-xl mx-auto"
              />
            </div>
          </div>

          {/* Category Bar - responsive: Template on top for mobile/iPad, Kelas+Favorit below */}
          <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-4 pb-4 w-full px-4">
            {/* Template button - full width on small, auto on md+ */}
            <div
              className="relative w-full md:inline-block md:w-auto"
              ref={templateRef}
              onMouseEnter={
                typeof window !== 'undefined' && window.innerWidth >= 768
                  ? () => {
                      if (templateCloseTimeoutRef.current) {
                        clearTimeout(templateCloseTimeoutRef.current);
                        templateCloseTimeoutRef.current = null;
                      }
                      setTemplateOpen(true);
                    }
                  : undefined
              }
              onMouseLeave={
                typeof window !== 'undefined' && window.innerWidth >= 768
                  ? () => {
                      if (templateCloseTimeoutRef.current)
                        clearTimeout(templateCloseTimeoutRef.current);
                      templateCloseTimeoutRef.current = setTimeout(() => {
                        setTemplateOpen(false);
                        templateCloseTimeoutRef.current = null;
                      }, 160);
                    }
                  : undefined
              }
            >
              <button
                onClick={() => setTemplateOpen((s) => !s)}
                className={`w-full md:w-auto px-4 py-2 rounded-full font-semibold border transition-all duration-150 shadow-sm flex items-center gap-2 justify-center ${
                  isTemplateActive
                    ? 'bg-[#5122ff] text-white border-white border-2'
                    : 'bg-white text-black'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{categoryIcons['Template']}</span>
                  <span className="text-sm">{templateButtonLabel}</span>
                </span>
                <ChevronRight
                  className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                    templateOpen ? 'rotate-90' : 'rotate-0'
                  }`}
                />
              </button>

              {templateOpen && (
                <div
                  className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg z-40 overflow-hidden"
                  onMouseEnter={() => {
                    if (templateCloseTimeoutRef.current) {
                      clearTimeout(templateCloseTimeoutRef.current);
                      templateCloseTimeoutRef.current = null;
                    }
                    setTemplateOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (templateCloseTimeoutRef.current)
                      clearTimeout(templateCloseTimeoutRef.current);
                    templateCloseTimeoutRef.current = setTimeout(() => {
                      setTemplateOpen(false);
                      templateCloseTimeoutRef.current = null;
                    }, 160);
                  }}
                >
                  <button
                    className="block w-full text-center px-3 py-2 text-sm font-semibold hover:bg-[#5122ff] hover:text-white"
                    onClick={() => {
                      navigateToCategory('Taman Kanak - Kanak (TK)');
                      setTemplateOpen(false);
                    }}
                  >
                    Taman Kanak - Kanak (TK)
                  </button>
                  <button
                    className="block w-full text-center px-3 py-2 text-sm font-semibold hover:bg-[#5122ff] hover:text-white"
                    onClick={() => {
                      navigateToCategory('Sekolah Dasar (SD)');
                      setTemplateOpen(false);
                    }}
                  >
                    Sekolah Dasar (SD)
                  </button>
                  <button
                    className="block w-full text-center px-3 py-2 text-sm font-semibold hover:bg-[#5122ff] hover:text-white"
                    onClick={() => {
                      navigateToCategory('Sekolah Menengah Pertama (SMP)');
                      setTemplateOpen(false);
                    }}
                  >
                    Sekolah Menengah Pertama (SMP)
                  </button>
                  <button
                    className="block w-full text-center px-3 py-2 text-sm font-semibold hover:bg-[#5122ff] hover:text-white"
                    onClick={() => {
                      navigateToCategory('Sekolah Menengah Atas (SMA)');
                      setTemplateOpen(false);
                    }}
                  >
                    Sekolah Menengah Atas (SMA)
                  </button>
                </div>
              )}
            </div>

            {/* Sub-row for Kelas and Favorit: flex row on small (share width), auto on md */}
            <div className="flex w-full gap-2 md:w-auto md:items-center">
              {/* Kelas */}
              <div
                className="relative flex-1 md:flex-none"
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
                  className={`w-full md:w-auto px-3 py-2 min-w-[6rem] rounded-full font-semibold border transition-all duration-150 shadow-sm flex items-center justify-center gap-2 ${
                    isKelasActive
                      ? 'bg-[#5122ff] text-white border-white border-2'
                      : 'bg-white text-black'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{categoryIcons['Kelas']}</span>
                    <span className="text-sm">
                      {selectedKelasOption ? selectedKelasOption : 'Kelas'}
                    </span>
                  </span>
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                      kategoriOpen ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                </button>

                {kategoriOpen && (
                  <div
                    className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-40 overflow-hidden md:w-full"
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
                    {/* Kelas options depend on selected template */}
                    {getKelasOptionsForTemplate(selectedCategory).map(
                      (opt, idx) => (
                        <button
                          key={idx}
                          className="w-full text-center px-4 py-2 text-sm font-bold hover:bg-[#5122ff] hover:text-white"
                          onClick={() => {
                            setSelectedKelasOption(opt);
                            setKategoriOpen(false);
                          }}
                        >
                          {opt}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Favorit */}
              <div className="flex-1 md:flex-none">
                <button
                  onClick={() => navigateToCategory('Favorit')}
                  className={`w-full px-4 py-1.5 rounded-full font-semibold border transition-all duration-150 shadow-sm hover:bg-[#5122ff] hover:text-white ${
                    selectedCategory === 'Favorit'
                      ? 'bg-[#5122ff] text-white border-white border-2'
                      : 'bg-white text-black'
                  }`}
                >
                  <span className="flex items-center gap-2 justify-center">
                    <span className="text-sm">{categoryIcons['Favorit']}</span>
                    <span className="text-sm">Favorit</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          {favoritesOpen && (
            <main className="p-5 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Favorit Saya</h2>

                {favoriteItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      width="128"
                      height="128"
                    >
                      {/* Bookmark Background */}
                      <path
                        d="M128 32c-8.8 0-16 7.2-16 16v416c0 6.4 3.8 12.2 9.6 14.8s12.8 1.6 17.6-3l126.4-115.2 126.4 115.2c4.8 4.6 11.8 5.6 17.6 3s9.6-8.4 9.6-14.8V48c0-8.8-7.2-16-16-16H128z"
                        fill="#ffb52e"
                        stroke="#ffffff"
                        stroke-width="24"
                        stroke-linejoin="round"
                      />
                      {/* Centered Star */}
                      <path
                        d="M266 185 L286 231 L336 236 L300 271 L310 321 L266 297 L222 321 L232 271 L196 236 L246 231 Z"
                        fill="#000000"
                        stroke="#ffffff"
                        stroke-width="16"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <p className="text-white text-lg font-semibold">
                      Folder masih kosong
                    </p>
                    <p className="text-gray-400 text-sm">
                      Item yang Anda tandai akan muncul di sini.{' '}
                      <a
                        href="#"
                        className="text-blue-400 underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedCategory('Template');
                          setFavoritesOpen(false);
                        }}
                      >
                        Mulai menjelajah
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {favoriteItems.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-md shadow-sm overflow-hidden cursor-pointer"
                        style={{ marginBottom: 12 }}
                        onClick={() => openModalFromFavorites(item)}
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
                )}
              </div>
            </main>
          )}

          {/* Main Content */}
          {!favoritesOpen && (
            <main className="p-5 space-y-6">
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
          )}

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
                          onClick={() => {
                            // Simpan gambar ke localStorage
                            try {
                              if (typeof window !== 'undefined' && modalItem) {
                                const raw = window.localStorage.getItem(
                                  'lp_design_templates'
                                );
                                let arr = [];
                                if (raw) arr = JSON.parse(raw);

                                // Cek duplikat
                                if (!arr.some((t) => t.src === modalItem.src)) {
                                  arr.unshift({
                                    src: modalItem.src,
                                    prefix: modalItem.prefix,
                                  });
                                  window.localStorage.setItem(
                                    'lp_design_templates',
                                    JSON.stringify(arr)
                                  );
                                }
                              }
                            } catch (e) {}

                            // Tampilkan popup
                            setShowAddPopup(true);
                            setTimeout(() => setShowAddPopup(false), 2000);

                            // Hapus
                            router.push('/account/design');
                          }}
                          className="px-11 py-2 rounded-md bg-[#5122ff] hover:bg-[#440db5] text-white flex items-center gap-2"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                          <span>Kustom Template ini</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            toggleFavoriteForModal();
                            setFavCopied(!isFavorited);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                            isFavorited
                              ? 'bg-yellow-500 text-black'
                              : 'bg-white text-black'
                          }`}
                        >
                          {isFavorited ? (
                            <>
                              <i className="fa-solid fa-star"></i>
                              <span>Unfavorit</span>
                            </>
                          ) : (
                            <>
                              <i className="fa-regular fa-star"></i>
                              <span>Favorit</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleShare}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700"
                        >
                          {shareCopied ? (
                            <i className="fa-solid fa-link"></i>
                          ) : (
                            <i className="fa-regular fa-share-from-square"></i>
                          )}
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

          {showAddPopup && (
            <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-bold text-lg flex items-center gap-3">
              <i className="fa-solid fa-square-check text-2xl"></i>
              Template berhasil di tambahkan
            </div>
          )}
        </div>
      </div>
    </>
  );
}
