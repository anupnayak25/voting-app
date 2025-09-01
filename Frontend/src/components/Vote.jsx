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

  if (submitted) return <div><h2>Thank you for voting!</h2></div>;

  return (
    <div className="vote-container">
      <h2>Cast Your Vote</h2>
      <form onSubmit={handleSubmit}>
        {positions.map(position => (
          <div key={position}>
            <h4>{position}</h4>
            {candidates.filter(c => c.position === position).map(c => (
              <label key={c._id}>
                <input
                  type="radio"
                  name={position}
                  value={c._id}
                  checked={votes[position] === c._id}
                  onChange={() => handleVoteChange(position, c._id)}
                  required
                />
                {c.name} {c.gender ? `(${c.gender})` : ''}
              </label>
            ))}
          </div>
        ))}
        <button type="submit">Submit Vote</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
