import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Meta from "@/components/Meta";
import { AuthLayout } from "@/layouts/index";
import { isCognito } from "@/lib/auth/config";
import { signUpWithCognito } from "@/lib/auth/cognito";

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi
        if (formData.password !== formData.confirmPassword) {
            toast.error("Password dan konfirmasi password tidak sama");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password minimal 8 karakter");
            return;
        }

        setIsLoading(true);

        try {
            const useCognitoAuth = isCognito();

            if (useCognitoAuth) {
                // Use Cognito for production
                const result = await signUpWithCognito(
                    formData.email,
                    formData.password,
                    formData.fullName
                );

                if (result.success) {
                    // ✅ Sync user to database immediately after Cognito registration
                    try {
                        const syncResponse = await fetch('/api/auth/cognito-sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: formData.email,
                                name: formData.fullName,
                                cognitoUserId: result.userId,
                                password: formData.password, // Send password to hash and store
                            }),
                        });

                        const syncData = await syncResponse.json();

                        if (syncData.success) {
                            console.log('✅ User synced to database:', syncData.user);
                        } else {
                            console.error('⚠️ Failed to sync user to database:', syncData.error);
                        }
                    } catch (syncError) {
                        console.error('⚠️ Sync error:', syncError);
                        // Continue with registration flow even if sync fails
                    }

                    toast.success("Registrasi berhasil! Silakan cek email untuk verifikasi.");
                    // Redirect to verification page for Cognito
                    router.push(`/auth/verify-cognito?email=${encodeURIComponent(formData.email)}`);
                } else {
                    toast.error(result.error || "Registrasi gagal");
                }
            } else {
                // Use NextAuth for local development
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName: formData.fullName,
                        email: formData.email,
                        password: formData.password
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success("Registrasi berhasil!");
                    // Redirect ke halaman verifikasi dengan email
                    router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}&message=check_email`);
                } else {
                    toast.error(data.message || "Registrasi gagal");
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error("Terjadi kesalahan saat registrasi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Meta
                title="LembarKerja | Daftar Akun"
                description="Buat akun LembarKerja baru"
            />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            LembarKerja
                        </Link>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Daftar Akun Baru
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sudah punya akun?{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan nama lengkap"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Minimal 6 karakter"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Konfirmasi Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ulangi password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? "Mendaftarkan..." : "Daftar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
};

// Disable static generation for auth pages (need client-side only)
export async function getServerSideProps() {
    return { props: {} };
}

export default Register;