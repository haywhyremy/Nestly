import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-dvh flex items-center justify-center bg-surface-base">
        <h1 className="text-4xl font-semibold text-ink-primary">Nestly</h1>
      </div>
    </AuthProvider>
  );
}

export default App;
