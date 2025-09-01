
import { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Vote from './components/Vote';
import CandidateRegister from './components/CandidateRegister';
import Admin from './components/Admin';

function App() {
  const [userEmail, setUserEmail] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur border-b p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-wide">Student Election</Link>
          <nav className="flex gap-4 text-sm text-gray-700">
            <Link to="/register" className="hover:text-blue-600">Register</Link>
            <Link to="/vote" className="hover:text-blue-600">Vote</Link>
            <Link to="/admin" className="hover:text-blue-600">Admin</Link>
            <Link to="/login" className="hover:text-blue-600">Login</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<CandidateRegister />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<ComingSoonLogin />} />
          <Route path="/vote" element={userEmail ? <Vote userEmail={userEmail} /> : <Navigate to="/login" replace />} />
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

function ComingSoonLogin() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">Voting Day Login</h2>
      <p className="text-gray-600 max-w-md mb-6">The login and OTP-based voting access will open on the official voting day. Stay tuned!</p>
      <div className="space-y-2">
        <div className="inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">Coming Soon</div>
        <p className="text-sm text-gray-500">Prepare by reviewing candidate profiles.</p>
      </div>
    </div>
  );
}

function NotFound() {return <div className="p-10 text-center text-gray-600">Page not found.</div>;}

export default App;
