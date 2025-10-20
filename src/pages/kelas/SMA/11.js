import Image from "next/image";
import Link from "next/link";

export default function Kelas11() {
    return (
        <section className="w-full bg-gradient-to-b from-white to-slate-50 min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-6">
                <header className="flex flex-col items-center text-center mb-12">
                    <Image src="/images/reels/reels03.png" alt="Kelas 11" width={80} height={80} className="mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Kelas 11 SMA</h1>
                    <p className="max-w-2xl text-lg text-slate-600">Materi, tugas, dan aktivitas interaktif untuk siswa Kelas 11 SMA. Semua fitur Lembar Pintar dirancang untuk pembelajaran kreatif dan digital.</p>
                </header>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 4, 7].map((imgIdx, i) => {
                        const imgNum = imgIdx < 10 ? `0${imgIdx}` : `${imgIdx}`;
                        return (
                            <div key={i} className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-center">
                                <Image src={`/images/reels/reels${imgNum}.png`} alt={`Materi ${i + 1}`} width={120} height={120} className="mb-4" />
                                <h2 className="text-xl font-bold mb-2 text-blue-700">Materi Interaktif {i + 1}</h2>
                                <p className="text-slate-600 mb-4 text-center">Contoh materi, tugas, atau aktivitas digital untuk Kelas 11 SMA.</p>
                                <Link href="#" className="rounded bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2 text-white font-semibold shadow hover:brightness-110">Lihat Materi</Link>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-16 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Mulai Belajar & Berkreasi</h3>
                    <p className="text-slate-600 mb-4 text-center max-w-xl">Gabung gratis dan dapatkan akses ke semua fitur, template, dan materi terbaru untuk siswa Kelas 11 SMA.</p>
                    <Link href="/auth/register" className="rounded bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-3 text-white font-semibold shadow hover:brightness-110">Daftar Gratis</Link>
                </div>
            </div>
        </section>
    );
}
