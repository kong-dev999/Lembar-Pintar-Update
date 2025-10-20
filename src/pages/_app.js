// ==== CSS WAJIB UNTUK POLOTNO/BLUEPRINT (letakkan paling atas) ====

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';
import '../styles/editor.css';
// import '@/styles/sidepanel.css';
// import '@/styles/educational-templates.css';
//import 'polotno/styles/index.css';

import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import { ThemeProvider } from 'next-themes';
import ReactGA from 'react-ga';
import TopBarProgress from 'react-topbar-progress-indicator';
import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '../../amplify_outputs.json';

// i18n
import i18n from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';

// config
import progressBarConfig from '../config/progress-bar';
import swrConfig from '../config/swr';
import WorkspaceProvider from '../providers/workspace';
import { AuthProvider } from '../contexts/AuthContext';

// Configure Amplify
Amplify.configure(amplifyConfig, { ssr: true });

// tailwind/global terakhir
import '../styles/globals.css';

// ===== Inisialisasi i18n sekali =====
try {
  if (!i18n.isInitialized) {
    const rawdata = require('../messages/en.json');
    const langCode = 'id';
    const resources = { [langCode]: { translation: rawdata } };

    i18n.use(initReactI18next).init({
      resources,
      lng: langCode,
      fallbackLng: langCode,
      interpolation: { escapeValue: false },
    });
  }
} catch (e) {
  // abaikan hot-reload warnings
}

// ===== Progress bar style =====
TopBarProgress.config(progressBarConfig());

const App = ({ Component, pageProps }) => {
  const [progress, setProgress] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const swrOptions = swrConfig();

  // GA init (hanya production & jika ID tersedia)
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
    if (process.env.NODE_ENV === 'production' && gaId) {
      ReactGA.initialize(gaId);
    }
  }, []);

  // Router progress bar + GA pageview
  useEffect(() => {
    const start = () => setProgress(true);
    const done = (url) => {
      setProgress(false);
      // kirim pageview jika GA aktif
      if (process.env.NODE_ENV === 'production' && ReactGA.ga) {
        ReactGA.pageview(typeof url === 'string' ? url : router.asPath);
      }
    };

    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', done);
    Router.events.on('routeChangeError', done);

    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', done);
      Router.events.off('routeChangeError', done);
    };
  }, [router.asPath]);

  return (
    <AuthProvider>
      <SWRConfig value={swrOptions}>
        <ThemeProvider attribute="class">
          <WorkspaceProvider>
            {progress && <TopBarProgress />}
            <Component {...pageProps} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { background: '#363636', color: '#fff' },
                success: {
                  duration: 3000,
                  theme: { primary: 'green', secondary: 'black' },
                },
              }}
            />
          </WorkspaceProvider>
        </ThemeProvider>
      </SWRConfig>
    </AuthProvider>
  );
};

export default App;
