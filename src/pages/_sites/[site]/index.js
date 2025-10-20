import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import DefaultErrorPage from 'next/error';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta';
import {
  getSiteWorkspace,
  getWorkspacePaths,
} from '@/prisma/services/workspace';

const Site = ({ workspace }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  return workspace ? (
    <main className="relative flex flex-col items-center justify-center h-screen space-y-10 text-gray-800 bg-gray-50">
      <Meta title={workspace.name} />
      <div className="flex flex-col items-center justify-center p-10 space-y-5 text-center ">
        <h1 className="text-4xl font-bold">
          Welcome to your workspace&apos;s subdomain!
        </h1>
        <h2 className="text-2xl">
          This is the workspace of <strong>{workspace.name}.</strong>
        </h2>
        <p>You can also visit these links:</p>
        <Link
          href={`https://${workspace.hostname}`}
          className="flex space-x-3 text-blue-600 hover:underline"
          target="_blank"
        >
          <span>{`${workspace.hostname}`}</span>
          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </Link>
        {workspace.domains.map((domain, index) => (
          <Link
            key={index}
            href={`https://${domain.name}`}
            className="flex space-x-3 text-blue-600 hover:underline"
            target="_blank"
          >
            <span>{domain.name}</span>
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </Link>
        ))}
      </div>
    </main>
  ) : (
    <>
      <Meta noIndex />
      <DefaultErrorPage statusCode={404} />
    </>
  );
};

// Mengganti dari getStaticProps ke getServerSideProps untuk SSR
export const getServerSideProps = async ({ params, req, res }) => {
  const { site } = params;

  try {
    const siteWorkspace = await getSiteWorkspace(site, site.includes('.'));
    let workspace = null;

    if (siteWorkspace) {
      // Fallback untuk APP_URL kalau tidak di-set
      const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const { host } = new URL(appUrl);
      workspace = {
        domains: siteWorkspace.domains,
        name: siteWorkspace.name,
        hostname: `${siteWorkspace.slug}.${host}`,
      };
    }

    return {
      props: {
        workspace,
        // Tambahkan timestamp untuk debugging
        timestamp: new Date().toISOString()
      },
    };
  } catch (error) {
    console.error('Error getting site workspace:', error);
    // Return null workspace on error
    return {
      props: {
        workspace: null,
        timestamp: new Date().toISOString()
      },
    };
  }
};

export default Site;
