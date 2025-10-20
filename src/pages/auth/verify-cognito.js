import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Meta from "@/components/Meta";
import { AuthLayout } from "@/layouts/index";
import { confirmSignUpWithCognito, resendVerificationCode } from "@/lib/auth/cognito";

const VerifyCognito = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [email, setEmail] = useState("");

    const router = useRouter();

    useEffect(() => {
        // Get email from query params
        if (router.query.email) {
            setEmail(router.query.email);
        }
    }, [router.query]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!verificationCode || verificationCode.length !== 6) {
            toast.error("Masukkan kode verifikasi 6 digit");
            return;
        }

        setIsLoading(true);

        try {
            const result = await confirmSignUpWithCognito(email, verificationCode);

            if (result.success) {
                toast.success("Email berhasil diverifikasi! Silakan login.");
                // Redirect to login
                setTimeout(() => {
                    router.push("/auth/login");
                }, 1500);
            } else {
                toast.error(result.error || "Verifikasi gagal");
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error("Terjadi kesalahan saat verifikasi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);

        try {
            const result = await resendVerificationCode(email);

            if (result.success) {
                toast.success("Kode verifikasi telah dikirim ulang");
            } else {
                toast.error(result.error || "Gagal mengirim ulang kode");
            }
        } catch (error) {
            console.error('Resend error:', error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout>
            <Meta
                title="LembarKerja | Verifikasi Email"
                description="Verifikasi email Anda"
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
                        <p className="mt-2 text-sm text-gray-600">
                            Kami telah mengirim kode verifikasi 6 digit ke email <strong>{email}</strong>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Kode Verifikasi
                            </label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                maxLength="6"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Masukkan 6 digit kode yang dikirim ke email Anda
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? "Memverifikasi..." : "Verifikasi"}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Tidak menerima kode?{" "}
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={isResending}
                                    className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                                >
                                    {isResending ? "Mengirim..." : "Kirim ulang"}
                                </button>
                            </p>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                Kembali ke login
                            </Link>
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

export default VerifyCognito;
