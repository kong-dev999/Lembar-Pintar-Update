import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Meta from "@/components/Meta/index";
import { AuthLayout } from "@/layouts/index";

const VerifyEmail = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const { email, token, message } = router.query;

        if (email) {
            setEmail(decodeURIComponent(email));
        }

        if (message === 'check_email') {
            setMessage("Silakan cek email Anda untuk tautan verifikasi");
        }

        if (email && token) {
            handleVerification(decodeURIComponent(email), token);
        }
    }, [router.query]);

    const handleVerification = async (userEmail, token) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    token: token
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsVerified(true);
                toast.success("Email berhasil diverifikasi!");
            } else {
                toast.error(data.message || "Verifikasi gagal");
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Verifikasi gagal. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async () => {
        if (!email) {
            toast.error("Email tidak tersedia");
            return;
        }

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Email verifikasi telah dikirim ulang! Silakan cek inbox Anda.");
            } else {
                toast.error(data.message || "Gagal mengirim email verifikasi");
            }
        } catch (error) {
            console.error("Resend error:", error);
            toast.error("Gagal mengirim email verifikasi");
        }
    };

    return (
        <AuthLayout>
            <Meta
                title="LembarKerja | Verifikasi Email"
                description="Verifikasi alamat email Anda"
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
                            Verifikasi Email
                        </h2>
                        {message && (
                            <p className="mt-2 text-sm text-green-600">{message}</p>
                        )}
                    </div>

                    <div className="text-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600">Memverifikasi email...</p>
                            </div>
                        ) : isVerified ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <p className="text-green-600 font-semibold">Email Berhasil Diverifikasi!</p>
                                <p className="text-gray-600">Email {email} telah berhasil diverifikasi.</p>
                                <Link
                                    href="/auth/login"
                                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Lanjutkan ke Login
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <p className="text-gray-700 font-semibold">Menunggu Verifikasi Email</p>
                                <p className="text-gray-600">
                                    {email ? `Kami telah mengirim tautan verifikasi ke ${email}. ` : ''}
                                    Silakan klik tautan dalam email untuk menyelesaikan pendaftaran.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={resendVerification}
                                        className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Kirim Ulang Email Verifikasi
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        Tidak menerima email? Periksa folder spam atau pastikan email yang Anda masukkan benar.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center pt-4 border-t">
                        <Link
                            href="/auth/login"
                            className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

// Disable static generation for auth pages (need client-side only)
export async function getServerSideProps() {
    return { props: {} };
}

export default VerifyEmail;