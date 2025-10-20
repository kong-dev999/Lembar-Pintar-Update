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
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Lembar{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Pintar
            </span>{' '}
            untuk Guru
          </h1>
          <p className="max-w-2xl text-lg text-white mb-6">
            Pacu kreativitas di kelas Anda dengan Lembar Pintar – alat yang
            lengkap untuk berkreasi, berkolaborasi, dan menginspirasi. 100%
            gratis untuk guru.
          </p>
        </div>

        {/* Image Section */}
        <div className="flex-1 flex justify-center md:justify-end">
          <Image
            src="/images/pelajari/teacher/teacher01.png"
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
            Libatkan Murid Anda
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white">
            Nikmati alat desain yang andal, kolaborasi tanpa hambatan, template
            tak terbatas, dan AI yang menghemat waktu
          </p>
        </header>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Video Section */}
          <div className="flex justify-center">
            <Image
              src="/images/pelajari/teacher/teacher02.png"
              alt="Lembar Pintar untuk siswa"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Text Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-7">
              Belajar dan mengajar dengan alat serbaguna
            </h2>
            <ul className="list-disc pl-5 text-white space-y-7">
              <li>
                <strong>Desain jadi sederhana:</strong> Buat rencana
                pembelajaran, presentasi, sheet, poster, dan lainnya dengan alat
                seret dan taruh yang mudah.
              </li>
              <li>
                <strong>Akses bawaan untuk siswa:</strong> Ajak siswa untuk
                berkolaborasi dengan lancar menggunakan email sekolah mereka -
                tidak perlu masuk atau perangkat lunak tambahan.
              </li>
              <li>
                <strong>Hemat waktu dengan template:</strong> Sesuaikan desain
                yang sudah dibuat sebelumnya untuk setiap kebutuhan pengajaran
                hanya dengan beberapa klik.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
