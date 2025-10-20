import Image from 'next/image';
import Navbar from './navbar';

export default function StudentPage() {
  return (
    <section
      className="w-full min-h-screen py-12"
      style={{
        background:
          'linear-gradient(180deg, #3f0d95ff 0%, #000000ff 23%, #000000ff 35%, #3f0d95ff 45%, #000000ff 73%, #000000ff 93%, #3f0d95ff 100%, #3f0d95ff 35%)',
      }}
    >
      <Navbar />
      <div
        className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center"
        style={{ paddingTop: '130px' }}
      >
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Lembar{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Pintar
            </span>{' '}
            untuk Siswa
          </h1>
          <p className="max-w-2xl text-lg text-white mb-6">
            Dari ruang kelas hingga tempat karier. Raih prestasi akademik,
            tingkatkan aktivitas ekstrakurikuler, dan bersiaplah untuk meraih
            kesuksesan bersama Lembar Pintar.
          </p>
        </div>
        {/* Image Section */}
        <div className="flex-1 flex justify-center md:justify-end">
          <Image
            src="/images/pelajari/student/student01.png"
            alt="Lembar Pintar untuk siswa"
            width={500}
            height={500}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <header className="text-center mb-12 mt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Mulai lebih awal
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white">
            Tingkatkan bahan belajar dan bangun dasar yang kuat untuk karier
            Anda dengan aplikasi komunikasi visual Lembar Pintar. Mulai dari
            proyek kelompok hingga lamaran kerja, Lembar Pintar memberi Anda
            keunggulan kreatif.
          </p>
        </header>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Video Section */}
          <div className="flex justify-center">
            <Image
              src="/images/pelajari/student/student02.png"
              alt="Lembar Pintar untuk siswa"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Text Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-7">
              Tingkatkan nilai, tanpa usaha lebih
            </h2>
            <ul className="list-disc pl-5 text-white space-y-7">
              <li>
                <strong>Wujudkan proyek Anda:</strong> Buat tugas menarik di
                Aplikasi Visual Lembar Pintar dengan Presentasi, Docs, Papan
                Tulis, dan banyak lagi!
              </li>
              <li>
                <strong>Produktivitas yang didukung AI:</strong> Hadirkan visual
                yang memukau dan ubah ukuran desain dengan sekali klik dengan
                alat desain yang didukung AI.
              </li>
              <li>
                <strong>Berkolaborasi sebagai kelompok:</strong> Bekerja sama
                dan taklukkan proyek kelompok dari mana pun, dengan komentar dan
                masukan secara real-time.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
