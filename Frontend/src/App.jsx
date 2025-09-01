
import { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Vote from './components/Vote';
import CandidateRegister from './components/CandidateRegister';
import Admin from './components/Admin';
import Analytics from './components/Analytics';

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (email, jwt) => { setUserEmail(email); setToken(jwt); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur border-b p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-wide">Student Election</Link>
          <nav className="flex gap-4 text-sm text-gray-700">
            <Link to="/register" className="hover:text-blue-600">Register</Link>
            <Link to="/vote" className="hover:text-blue-600">Vote</Link>
            <Link to="/analytics" className="hover:text-blue-600">Analytics</Link>
            <Link to="/login" className="hover:text-blue-600">Login</Link>
            {/* Admin link removed for obscurity */}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<CandidateRegister />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/samca2k25-admin" element={<Admin />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/vote" element={userEmail ? <Vote userEmail={userEmail} token={token} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/vote" element={userEmail ? <Vote userEmail={userEmail} token={token} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-gray-500 py-4">&copy; {new Date().getFullYear()} Student Election Portal</footer>
    </div>
  );
}

function Home() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Student Election Portal</h1>
      <p className="text-gray-600 mb-8">Register as a candidate, explore positions, and get ready for voting day.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700">Register as Candidate</Link>
        <Link to="/login" className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium shadow hover:bg-gray-900">Login (Voting Day)</Link>
      </div>
    </div>
  );
}

// ComingSoonLogin component removed; using real Login component now.

function NotFound() {return <div className="p-10 text-center text-gray-600">Page not found.</div>;}

export default App;
