import { createContext, useContext, useState } from 'react';

// Workspace-only state (Auth moved to AuthContext)
const initialState = {
  setWorkspace: () => { },
  workspace: null,
};

const WorkspaceContext = createContext(initialState);

export const useWorkspace = () => useContext(WorkspaceContext);

// Workspace provider - only manages workspace state
const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspaceState] = useState(null);

  const setWorkspace = (workspace) => {
    setWorkspaceState(workspace);
  };

  const value = {
    setWorkspace,
    workspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;