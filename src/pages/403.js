import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Forbidden() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h1 className="text-6xl font-bold text-red-600">403</h1>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Access Forbidden
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Kembali
                        </button>
                    </div>
                    <div>
                        <Link href="/account" className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Ke Dashboard User
                        </Link>
                    </div>
                    <div>
                        <Link href="/auth/logout" className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}