import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/vote';

export default function Vote({ userEmail }) {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/positions-candidates`)
      .then(res => res.json())
      .then(data => {
        setPositions(data.positions);
        setCandidates(data.candidates);
      });
  }, []);

  const handleVoteChange = (position, candidateId) => {
    setVotes({ ...votes, [position]: candidateId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const voteArr = Object.entries(votes).map(([position, candidateId]) => ({ position, candidateId }));
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, votes: voteArr })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setMessage('Vote submitted successfully!');
      } else {
        setMessage(data.message || 'Error submitting vote.');
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your vote has been successfully submitted.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <h2 className="text-3xl font-bold text-center">Cast Your Vote</h2>
            <p className="text-center mt-2 opacity-90">Student Election 2025</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-8">
              {positions.map(position => (
                <div key={position} className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                    {position.replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <div className="space-y-3">
                    {candidates.filter(c => c.position === position).map(c => (
                      <label key={c._id} className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer">
                        <input
                          type="radio"
                          name={position}
                          value={c._id}
                          checked={votes[position] === c._id}
                          onChange={() => handleVoteChange(position, c._id)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 focus:ring-2"
                          required
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          {c.name} {c.gender ? `(${c.gender})` : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button 
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Submit Vote
              </button>
            </div>
          </form>
          
          {message && (
            <div className={`mx-6 mb-6 p-4 rounded-lg text-center font-medium ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
