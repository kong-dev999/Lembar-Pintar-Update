import Link from 'next/link';
import { useState } from 'react';
import Meta from '@/components/Meta';
import { useRouter } from 'next/router';
import { ChevronDown, ChevronRight, ChevronLeft, X } from 'lucide-react';

export default function Sidebar({
  sidebarOpen,
  toggleMobileSidebar,
  sidebarCollapsed,
  toggleSidebarCollapse,
  user,
  signOut,
  active,
}) {
  const effectiveUser =
    typeof user !== 'undefined' && user !== null
      ? user
      : {
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            image: '/images/gender/male.png',
          },
        };
  const router = useRouter();
  const [localOpen, setLocalOpen] = useState(false);
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const mobileOpen =
    typeof sidebarOpen !== 'undefined' ? sidebarOpen : localOpen;
  const collapsed =
    typeof sidebarCollapsed !== 'undefined' ? sidebarCollapsed : localCollapsed;
  const toggleMobile =
    typeof toggleMobileSidebar === 'function'
      ? toggleMobileSidebar
      : () => setLocalOpen((v) => !v);
  const toggleCollapse =
    typeof toggleSidebarCollapse === 'function'
      ? toggleSidebarCollapse
      : () => setLocalCollapsed((v) => !v);

  return (
    <>
      <Meta />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
          onClick={toggleMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-transparent border-r border-transparent flex flex-col transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
        } md:translate-x-0 md:static ${collapsed ? 'md:w-16' : 'md:w-72'}`}
        style={{
          background:
            'linear-gradient(180deg, #000000 0%, #22063a 22%, #360e8cff 48%, #22063a 80%, #000000ff 100%)',
        }}
      >
        <div className="relative flex items-center justify-between px-3 py-2 mb-3">
          <Link href="/" className="flex items-center no-underline">
            <div
              className="w-10 h-10 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/logo.png')" }}
            />
            {!collapsed && (
              <span className="leading-none ml-2">
                <span className="block text-[22px] md:text-[26px] font-extrabold tracking-tight text-white dark:text-black">
                  Lembar Pintar
                </span>
              </span>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="hidden md:inline-flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 p-1 rounded-md text-white bg-[#5122ff] hover:bg-[#440db5] z-10 shadow-md"
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleMobile}
            className="md:hidden p-1 rounded-md bg-[#5122ff] hover:bg-[#440db5] text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!collapsed ? (
          <>
            <button
              onClick={() => router.push('/editor')}
              className="mx-3 mb-3 rounded-xl bg-[#5122ff] hover:bg-[#440db5] text-white px-4 py-2 text-sm font-medium"
            >
              + Buat Baru
            </button>
            <SidebarMenuWithScroll active={active} />
            <div className="mt-auto rounded-xl border bg-white p-3 mx-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={effectiveUser?.user?.image || '/avatar.png'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {effectiveUser?.user?.name || 'Pengguna'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {effectiveUser?.user?.email || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (typeof signOut === 'function') {
                    signOut('/');
                    return;
                  }
                  router.push('/');
                }}
                className="mt-3 w-full rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Keluar
              </button>
            </div>
          </>
        ) : (
          <nav className="flex-1 space-y-4 px-2 pt-2 pb-6 text-white no-underline">
            <Link
              href="/account"
              active={active === 'home'}
              className={`flex items-center justify-center p-2 my-3 rounded-xl bg-white text-black hover:text-blue-600 no-underline focus:outline-none focus-visible:outline-none${active === 'home' ? ' text-blue-600' : ''}`}
            >
              <i className="fa-solid fa-house fa-xl py-4"></i>
            </Link>
            <Link
              href="/account/design"
              active={active === 'design'}
              className={`flex items-center justify-center p-2 my-3 rounded-xl hover:bg-gray-50 bg-white text-black hover:text-blue-600 no-underline focus:outline-none focus-visible:outline-none${active === 'design' ? ' text-blue-600' : ''}`}
            >
              <i className="fa-solid fa-palette fa-xl py-4"></i>
            </Link>
            <button
              type="button"
              className={`flex items-center justify-center p-3 my-3 rounded-xl bg-white text-black hover:text-blue-600 no-underline focus:outline-none focus-visible:outline-none${active === 'template' ? ' text-blue-600' : ''}`}
              onClick={() => {
                if (collapsed) {
                  toggleSidebarCollapse();
                }
                window.setTemplateOpenSidebar = true;
              }}
            >
              <i className="fa-solid fa-layer-group fa-xl py-3"></i>
            </button>
            <Link
              href="/account/payment"
              active={active === 'payment'}
              className={`flex items-center justify-center p-2 my-3 rounded-xl bg-white text-black hover:text-blue-600 no-underline focus:outline-none focus-visible:outline-none${active === 'payment' ? ' text-blue-600' : ''}`}
            >
              <i className="fa-solid fa-credit-card fa-xl py-4"></i>
            </Link>
            <Link
              href="/account/billing"
              active={active === 'billing'}
              className={`flex items-center justify-center p-2 my-3 rounded-xl bg-white text-black hover:text-blue-600 no-underline focus:outline-none focus-visible:outline-none${active === 'billing' ? ' text-blue-600' : ''}`}
            >
              <i className="fa-solid fa-wallet fa-xl py-4"></i>
            </Link>
            <Link
              href="/account/profile"
              active={active === 'profile'}
              className={`flex items-center justify-center p-2 my-3 rounded-xl bg-white text-black hover:text-blue-600 no-underline focus:outline-none focus-visible:outline-none${active === 'profile' ? ' text-blue-600' : ''}`}
            >
              <i className="fa-solid fa-circle-user fa-xl py-4"></i>
            </Link>
          </nav>
        )}
      </aside>
    </>
  );
}

/* ===== Komponen SidebarItem ===== */
function SidebarItem({ href, children, active, useAccountPrefix = false }) {
  function buildHref(href, useAccountPrefix = false) {
    if (!href) return '/';
    if (!useAccountPrefix) return href;
    if (href.startsWith('/account/')) return href;
    if (href.startsWith('/')) return `/account${href}`;
    return `/account/${href}`;
  }

  const validHref = buildHref(href, useAccountPrefix);

  return (
    <Link
      href={validHref}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm no-underline focus:outline-none focus:ring-0 focus-visible:outline-none ${
        active ? 'bg-blue-50 text-black' : 'hover:bg-gray-50 hover:text-black'
      }`}
    >
      <span className="truncate flex items-center gap-2 px-1">
        {children}
      </span>
    </Link>
  );
}

/* ===== Komponen Sidebaritem ===== */
import { useRef, useEffect } from 'react';

function Sidebaritem({
  label,
  children,
  onOpenChange,
  defaultOpen = false,
  isActive = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (typeof onOpenChange === 'function') {
      onOpenChange(open);
    }
  }, [open, onOpenChange]);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-xl transition-colors duration-150
          ${isActive ? 'bg-blue-50 text-black' : 'hover:bg-gray-50 hover:text-black'}
          focus:outline-none focus:ring-0 focus-visible:outline-none relative`}
      >
        <span className="flex items-center gap-2">{label}</span>
        {isActive && (
          <span
            className="absolute right-8 w-2 h-2 rounded-full bg-blue-600 z-0"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          />
        )}
        <span className="relative z-10 ml-2">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {open && (
        <div className="ml-4 pl-2 border-l border-gray-200 space-y-1 mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarMenuWithScroll({ active }) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const router = useRouter();
  if (typeof window !== 'undefined' && window.setTemplateOpenSidebar) {
    setTemplateOpen(true);
    window.setTemplateOpenSidebar = false;
  }
  return (
    <nav
      className={`flex-1 space-y-1 px-3 text-white no-underline ${templateOpen ? 'overflow-y-auto max-h-[340px]' : ''}`}
      style={templateOpen ? { scrollbarWidth: 'thin' } : {}}
    >
      <SidebarItem href="/account" active={active === 'home'}>
        <i className="fa-solid fa-house px-2"></i>
        Beranda
      </SidebarItem>
      <SidebarItem href="/account/design" active={active === 'design'}>
        <i className="fa-solid fa-palette px-2"></i>
        Desain Saya
      </SidebarItem>

      <div className="border-t border-gray-200 my-2 pt-2">
        <Sidebaritem
          label={
            <span className="flex items-center w-full rounded-md">
              <i className="fa-solid fa-layer-group px-2"></i>Template
            </span>
          }
          onOpenChange={setTemplateOpen}
          defaultOpen={active === 'template'}
          isActive={active === 'template'}
        >
          <SidebarItem
            href="/kelas/TK"
            useAccountPrefix={true}
            active={router?.asPath?.startsWith('/account/kelas/TK')}
          >
            <i className="fa-solid fa-school px-2"></i>TK
          </SidebarItem>
          <SidebarItem
            href="/kelas/SD"
            useAccountPrefix={true}
            active={router?.asPath?.startsWith('/account/kelas/SD')}
          >
            <i className="fa-solid fa-school px-2"></i>SD
          </SidebarItem>
          {/* <SidebarItem
            href="/kelas/SMP"
            useAccountPrefix={true}
            active={router?.asPath?.startsWith('/account/kelas/SMP')}
          >
            <i className="fa-solid fa-school px-2"></i>SMP
          </SidebarItem>
          <SidebarItem
            href="/kelas/SMA"
            useAccountPrefix={true}
            active={router?.asPath?.startsWith('/account/kelas/SMA')}
          >
            <i className="fa-solid fa-school px-2"></i>SMA
          </SidebarItem> */}
        </Sidebaritem>
      </div>

      <SidebarItem href="/account/payment" active={active === 'payment'}>
        <i className="fa-solid fa-credit-card px-2"></i>
        Pembayaran
      </SidebarItem>
      <SidebarItem href="/account/billing" active={active === 'billing'}>
        <i className="fa-solid fa-wallet px-2"></i>
        Tagihan
      </SidebarItem>
      <SidebarItem href="/account/profile" active={active === 'profile'}>
        <i className="fa-solid fa-circle-user px-2"></i>
        Profil
      </SidebarItem>
    </nav>
  );
}
