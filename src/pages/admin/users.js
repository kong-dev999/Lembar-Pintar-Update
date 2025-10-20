import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { useRouter } from 'next/router';

function TemplatesMaintenancePage({ user }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Kelola Pengguna</h1>
                    <p className="text-blue-200 mt-1">Fitur dalam Pengembangan</p>
                </div>

                <div className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-24 h-24">
                            {/* Animated SVG Character saying sorry */}
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                {/* Body */}
                                <circle cx="50" cy="60" r="25" fill="#3B82F6" />

                                {/* Eyes */}
                                <circle cx="40" cy="55" r="5" fill="white" />
                                <circle cx="60" cy="55" r="5" fill="white" />
                                <circle cx="38" cy="53" r="2" fill="black" />
                                <circle cx="58" cy="53" r="2" fill="black" />

                                {/* Sad mouth */}
                                <path d="M 40 70 Q 50 75 60 70" stroke="white" strokeWidth="3" fill="none" />

                                {/* Arms in sorry position */}
                                <path d="M 25 55 Q 15 50 20 40" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" className="animate-bounce" style={{ animationDuration: '2s' }} />
                                <path d="M 75 55 Q 85 50 80 40" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />

                                {/* Feet */}
                                <ellipse cx="40" cy="85" rx="8" ry="5" fill="#3B82F6" />
                                <ellipse cx="60" cy="85" rx="8" ry="5" fill="#3B82F6" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sedang Dalam Perbaikan</h2>
                    <p className="text-gray-600 mb-4">
                        Halaman ini sedang dalam pengembangan. Developer sedang bekerja keras untuk menyediakan pengalaman terbaik untuk pengelolaan para admin.
                    </p>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-medium">Maaf ya!</span> Developer kami sedang libur sebentar karena capek kerja sendirian terus. Tapi jangan khawatir, hal baik akan segera muncul untuk memperbaiki hal-hal keren untuk Anda!
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Perkiraan selesai:</span> 1-2 Bulan
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/admin')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Yasudah deh !
                    </button>

                </div>
            </div>
        </div>
    );
}

export default withAdminAuth(TemplatesMaintenancePage);