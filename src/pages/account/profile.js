import Sidebar from './sidebar';
import { Menu } from 'lucide-react';
import Meta from '@/components/Meta';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilDashboard() {
  // Mock user data for frontend development
  const user = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: '/images/gender/male.png',
    },
  };
  const router = useRouter();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop
  const [dropdownOpen, setDropdownOpen] = useState(false); // dropdown menu

  const toggleMobileSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  // Close dropdown when clicking outside or when clicking other buttons
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

  // Renamed the second `user` variable to `userData` to avoid conflict
  const [userData, setUserData] = useState({
    name: 'Indra Pratama',
    email: 'indrapratama@gmail.com',
    photo: '/images/gender/male.png',
  });

  const fileInputRef = useRef(null);

  const handlePhotoChange = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Selected file: ${file.name}`);
    }
  };

  const handlePasswordChange = (event) => {
    setUserData({ ...userData, password: event.target.value });
  };

  const handleConfirmPasswordChange = (event) => {
    setUserData({ ...userData, confirmpassword: event.target.value });
  };

  const handleSave = () => {
    alert('Profile saved successfully');
  };

  return (
    <>
      <Meta />
      <div className="flex h-screen bg-gray-50">
        {/* Backdrop Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
            onClick={toggleMobileSidebar}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          user={user}
          signOut={signOut}
          active="profile"
        />

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <header className="h-24 py-2 border-b px-10 flex text-white justify-between bg-[#000000]">
            <div className="flex items-center gap-4">
              {/* Mobile Sidebar */}
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden p-2 rounded-md text-black bg-white hover:text-white hover:bg-[#4b15fcff] -ml-6"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">Edit Profil</h1>
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

          <main className="p-5 space-y-6">
            {/* Header */}
            <div className="min-h-screen text-white flex items-center justify-center">
              <div className="w-full max-w-md p-6 bg-gray-900 bg-opacity-80 rounded-lg">
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Your Profile
                </h1>

                <div className="space-y-6">
                  {/* Profile Photo Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={userData.photo}
                      alt="Profile Photo"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    <button
                      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                      onClick={handlePhotoChange}
                    >
                      Change photo
                    </button>
                  </div>

                  {/* Name Section */}
                  <div className="space-y-2 text-between">
                    <label className="block text-sm text-gray-200">Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(event) =>
                        setUserData({ ...userData, name: event.target.value })
                      }
                      className="w-full px-3 py-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mx-auto"
                    />
                  </div>

                  {/* Email Section */}
                  <div className="space-y-2 text-between">
                    <label className="block text-sm text-gray-200">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(event) =>
                        setUserData({ ...userData, email: event.target.value })
                      }
                      className="w-full px-3 py-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mx-auto"
                    />
                  </div>

                  {/* Password Section */}
                  <div className="space-y-2 text-between">
                    <label className="block text-sm text-gray-200">
                      Password
                    </label>
                    <input
                      type="password"
                      value={userData.password}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mx-auto"
                    />
                  </div>

                  <div className="space-y-2 text-between">
                    <label className="block text-sm text-gray-200">
                      Confirm Password
                    </label>
                    <input
                      type="confirmpassword"
                      value={userData.confirmpassword}
                      onChange={handleConfirmPasswordChange}
                      className="w-full px-3 py-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mx-auto"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="text-center">
                    <button
                      className="w-64 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 mx-auto"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
