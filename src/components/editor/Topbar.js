import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Topbar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleBackToDashboard = () => {
        router.push('/');
    };

    // Auto-hide functionality - hanya muncul saat mouse di 5px dari atas
    useEffect(() => {
        let hideTimer;

        const handleMouseMove = (e) => {
            // Hanya show jika mouse dalam 5px dari atas layar
            if (e.clientY <= 25) {
                clearTimeout(hideTimer);
                setIsVisible(true);

                // Start timer untuk hide setelah mouse keluar dari area
                hideTimer = setTimeout(() => {
                    setIsVisible(false);
                }, 2000); // 2 detik setelah mouse keluar
            }
            // Jika mouse keluar dari area 5px, langsung hide
            else if (e.clientY > 5) {
                clearTimeout(hideTimer);
                setIsVisible(false);
            }
        };

        // Hanya mouse move yang bisa memunculkan topbar
        window.addEventListener('mousemove', handleMouseMove);

        // Initial state: hidden
        setIsVisible(false);

        return () => {
            clearTimeout(hideTimer);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [sidebarOpen]); // Depend pada sidebarOpen

    // Always show topbar when sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            setIsVisible(true);
        }
    }, [sidebarOpen]);

    // Close sidebar when clicking outside or on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [sidebarOpen]);

    return (
        <>
            {/* Spacer for fixed topbar - hanya muncul saat topbar visible */}
            <div className={`transition-all duration-300 ease-in-out ${isVisible ? 'h-10 sm:h-11 md:h-12' : 'h-0'
                }`}></div>

            {/* Topbar */}
            <div
                className={`fixed top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm h-10 sm:h-11 md:h-12 z-50 transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                    }`}>
                {/* Left: Menu Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="sidebar-toggle p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Center/Right: Logo */}
                <div className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="h-4 sm:h-5 md:h-6 w-auto"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Sidebar Overlay - only show on mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`sidebar fixed top-0 left-0 h-full w-64 sm:w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 lg:hidden"
                        aria-label="Close menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex flex-col p-4">
                    <button
                        className="flex items-center text-left text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        onClick={handleBackToDashboard}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-3 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        </>
    );
};

export default Topbar;
