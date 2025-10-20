import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const menu = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/design", label: "Desain" },
    { href: "/admin/assets", label: "Aset" },
    { href: "/admin/templates", label: "Template" },
    { href: "/admin/request", label: "Permintaan" },
    { href: "/admin/users", label: "Kelola Pengguna" },
    { href: "/admin/teams", label: "Kelola Team" },
    { href: "/admin/workspaces", label: "Workspace" },
    { href: "/admin/trash", label: "Sampah" }
];

export default function Sidebar() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (href) => {
        return router.pathname === href;
    };

    return (
        <>
            {/* Tombol toggle sidebar - muncul di semua ukuran layar */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-700 hover:bg-gray-100 bg-white shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Backdrop untuk sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - slide dari kiri, disembunyikan secara default */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Administrator</span>
                        <h1 className="text-xl font-bold">
                            <span className="text-gray-800">Lembar</span>
                            <span className="text-blue-600">Pintar</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-2 space-y-1">
                        {menu.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${isActive(item.href)
                                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                    } block px-3 py-2 rounded-r-md text-base font-medium transition-colors duration-150`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>
                <div className="p-4 border-t">
                    <Link href="/admin/editor" className="w-full">
                        <button
                            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-150"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Buat sekarang
                        </button>
                    </Link>
                </div>
            </div>

            {/* Konten utama - margin kiri untuk memberi ruang saat sidebar terbuka */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                {/* Konten halaman akan dirender di sini */}
            </div>
        </>
    );
}