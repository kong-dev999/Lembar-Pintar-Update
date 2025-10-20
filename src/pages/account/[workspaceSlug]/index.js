import { useState } from "react";

// Mock data for frontend development
const mockWorkspace = {
  name: "My Workspace",
  slug: "my-workspace"
};

// Simple layout component for workspace pages
const AccountLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-gray-900">{mockWorkspace.name}</h1>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  </div>
);

// Simple content components
const ContentTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
  </div>
);

const ContentDivider = () => <div className="border-t border-gray-200 my-6"></div>;

const ContentContainer = ({ children = null }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
    {children || (
      <div className="text-center py-10">
        <p className="text-gray-500">Workspace content will be displayed here</p>
      </div>
    )}
  </div>
);

const Workspace = () => {
  const [workspace] = useState(mockWorkspace);

  return (
    workspace && (
      <AccountLayout>
        <title>{`LembarKerja - ${workspace.name} | Dashboard`}</title>
        <ContentTitle
          title={workspace.name}
          subtitle="This is your project's workspace"
        />
        <ContentDivider />
        <ContentContainer />
      </AccountLayout>
    )
  );
};

export default Workspace;
