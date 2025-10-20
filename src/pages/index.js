import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import {
  CallToAction,
  Templateshow,
  Footer,
  Hero,
  Pricing,
  Testimonial,
  Fiture,
  QnA,
} from '@/sections/index';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      const userRole = user.role?.toUpperCase();
      if (userRole === 'SUPER_ADMIN') {
        router.replace('/admin/secret');
      } else if (userRole === 'ADMIN') {
        router.replace('/admin');
      } else if (userRole === 'USER') {
        router.replace('/account');
      }
    }
  }, [user, loading, router]);

  return (
    <LandingLayout>
      <Meta
        title="LembarKerja"
        description="Platform modern untuk membuat materi belajar dan konten kreatif dengan cepat."
      />
      <Hero />
      <Templateshow />
      <Pricing />
      <Fiture />
      <Testimonial />
      <QnA />
      <CallToAction />
      <Footer />
    </LandingLayout>
  );
};

// No getServerSideProps - redirect handled client-side with useAuth

export default Home;
