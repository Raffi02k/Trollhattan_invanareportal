import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RoleGate } from "./components/RoleGate";
import { TokenInspector } from "./components/TokenInspector";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Internal Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <RoleGate allowedRoles={["Admin", "Staff"]} fallback={<div className="p-6 bg-slate-800 rounded-xl border border-white/5">You are a generic user.</div>}>
            <div className="p-6 bg-slate-800 rounded-xl border border-white/5">
              <h2 className="text-xl font-semibold mb-4 text-indigo-300">Staff Area</h2>
              <p className="text-slate-400">This content is only visible to Staff and Admins.</p>
            </div>
          </RoleGate>

          <RoleGate allowedRoles={["Admin"]}>
            <div className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30">
              <h2 className="text-xl font-semibold mb-4 text-white">Admin Control Panel</h2>
              <p className="text-indigo-200">Exclusive controls for Administrators.</p>
            </div>
          </RoleGate>
        </div>

        <div className="p-6 bg-slate-800 rounded-xl border border-white/5 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Your Profile</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Username</span>
              <span className="text-slate-200">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method</span>
              <span className="text-slate-200 capitalize">{user?.authMethod}</span>
            </div>
          </div>
        </div>
      </div>

      <TokenInspector />
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading Auth...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
