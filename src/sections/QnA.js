import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: 'Apakah ada uji coba gratis?',
    answer: 'Ya! Semua paket dilengkapi dengan uji coba gratis 14 hari. Anda tidak perlu memasukkan kartu kredit untuk memulai. Setelah masa uji coba berakhir, Anda dapat memilih paket yang sesuai dengan kebutuhan.'
  },
  {
    question: 'Bisakah saya mengubah paket kapan saja?',
    answer: 'Tentu saja! Anda dapat upgrade atau downgrade paket kapan saja melalui dashboard akun Anda. Perubahan akan berlaku segera, dan kami akan menghitung prorata untuk pembayaran yang sudah dilakukan.'
  },
  {
    question: 'Metode pembayaran apa saja yang diterima?',
    answer: 'Kami menerima berbagai metode pembayaran melalui Midtrans: kartu kredit (Visa, Mastercard, JCB), kartu debit, transfer bank, e-wallet (OVO, GoPay, Dana), dan Indomaret/Alfamart.'
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Keamanan data adalah prioritas utama kami. Semua data dienkripsi dengan SSL 256-bit, disimpan di server yang memenuhi standar SOC 2, dan kami tidak pernah membagikan data Anda kepada pihak ketiga tanpa izin.'
  },
  {
    question: 'Bagaimana dengan dukungan pelanggan?',
    answer: 'Kami menyediakan dukungan pelanggan melalui email, live chat, dan WhatsApp. Pengguna Pro mendapat respon dalam 24 jam, sementara pengguna Edu Team mendapat prioritas dukungan dengan respon dalam 4 jam.'
  },
  {
    question: 'Apakah harga sudah termasuk pajak?',
    answer: 'Harga yang ditampilkan belum termasuk PPN 11%. Pajak akan ditambahkan secara otomatis saat checkout sesuai dengan ketentuan perpajakan Indonesia.'
  },
  {
    question: 'Bisakah saya batalkan langganan?',
    answer: 'Ya, Anda dapat membatalkan langganan kapan saja tanpa penalti. Langganan akan tetap aktif hingga akhir periode billing, dan Anda tetap dapat menggunakan semua fitur premium hingga saat itu.'
  },
  {
    question: 'Apakah ada diskon untuk pembayaran tahunan?',
    answer: 'Ya! Kami memberikan diskon hingga 17% untuk pembayaran tahunan. Selain hemat biaya, Anda juga tidak perlu repot membayar setiap bulan.'
  }
];


function QnA() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      id="QnA"
      style={{
        background: 'linear-gradient(180deg, #19062aff  10%, #4d08ccff 100%)',
      }}
    >
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto my-12">
        <h3 className="text-3xl text-white font-bold text-center text-slate-900 mb-8">
          Pertanyaan yang Sering Diajukan
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <div className="h-px bg-slate-200 mb-4"></div>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QnA;
