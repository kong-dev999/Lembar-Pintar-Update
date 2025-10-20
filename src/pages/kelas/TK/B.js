import React, { useMemo } from 'react';
import Sidebar from '@/pages/account/sidebar';
import { Menu, Search } from 'lucide-react';
import Meta from '@/components/Meta';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
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
          `/images/materi/TK/TK A/TKA${(i + 1).toString().padStart(2, '0')}.png`
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
          active="template"
        />

        {/* MAIN */}
        <div
          className="flex-1 flex flex-col overflow-y-auto"
          style={{
            background:
              'linear-gradient(180deg, #000000 0%, #22063a 22%, #6225e7 48%, #22063a 80%, #000000ff 100%)',
          }}
        >
          <div className="text-center pt-6 mt-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              TK Paud - Kelas B
            </h2>
          </div>

          {/* Searching */}
          <div className="flex flex-col items-center pt-6 pb-4 px-4 justify-center pb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi pembelajaran, aktivitas, dll..."
              className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4b15fcff]"
            />
          </div>

          {/* Category Bar */}
          <div className="flex justify-center gap-2 md:gap-4 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold border transition-all duration-150 shadow-sm
                  ${selectedCategory === cat ? 'bg-[#4b15fcff] text-white border-[#4b15fcff]' : 'bg-white text-[#4b15fcff] border-gray-200 hover:bg-blue-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <main className="p-5 space-y-6">
            {/* Grid Asset Gambar */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {shuffledTemplates
                .filter((src) =>
                  src.toLowerCase().includes(search.toLowerCase())
                )
                .map((src, i) => (
                  <div
                    key={i}
                    className="break-inside-avoid rounded-xl bg-white shadow-lg p-3 mb-6"
                  >
                    <img
                      src={src}
                      alt={`TKA ${i + 1}`}
                      className="w-full rounded-lg object-cover mb-3"
                    />
                    <span className="font-medium text-[#4b15fcff]">
                      TKA {i + 1}
                    </span>
                  </div>
                ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
