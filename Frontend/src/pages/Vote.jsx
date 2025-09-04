import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const API_URL = `${API_BASE}/vote`;

export default function Vote({ token, onVoted }) {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [missingPositions, setMissingPositions] = useState([]);
  const firstMissingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/positions-candidates`)
      .then((res) => res.json())
      .then((data) => {
        setPositions(data.positions);
        setCandidates(data.candidates);
      });
  }, []);

  const handleVoteChange = (position, candidateId) => {
    setVotes({ ...votes, [position]: candidateId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    // Determine missing positions
    const missing = positions.filter((p) => !votes[p]);
    if (missing.length) {
      setMissingPositions(missing);
      setShowValidationModal(true);
      // Scroll to first missing section after paint
      requestAnimationFrame(() => {
        if (firstMissingRef.current) {
          firstMissingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return;
    }
    setLoading(true);
    const voteArr = Object.entries(votes).map(([position, candidateId]) => ({ position, candidateId }));
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ votes: voteArr }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setMessage("Vote submitted successfully!");
      } else {
        setMessage(data.message || "Error submitting vote.");
      }
    } catch (err) {
      setMessage("Network error: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!submitted) return;

    const interval = setInterval(() => {
      setRedirectSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          if (onVoted) onVoted(); // clear session here
          navigate("/vote"); // redirect after clearing session
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, onVoted, navigate]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md w-full border border-primary-100">
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Thank You!</h2>
            <p className="text-text-secondary mb-4">Your vote has been successfully submitted.</p>
            <p className="text-sm text-text-muted">Redirecting to vote page in {redirectSeconds}s…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-primary-100">
            <div className="bg-gradient-to-r from-primary-800 to-primary-700 text-white p-6">
              <h2 className="text-3xl text-white font-bold text-center">Cast Your Vote</h2>
              <p className="text-center mt-2 opacity-90">SAMCA Election 2025</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid gap-8">
                {positions.map((position) => {
                  const isMissing = missingPositions.includes(position);
                  return (
                    <div
                      key={position}
                      ref={isMissing && position === missingPositions[0] ? firstMissingRef : null}
                      className={`bg-primary-50 rounded-lg p-6 border-l-4 transition-shadow relative ${
                        isMissing ? "border-red-600 ring-2 ring-red-300" : "border-primary-800"
                      }`}>
                      <h4 className="text-xl font-semibold text-text-primary mb-4 capitalize">
                        {position.replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {candidates
                          .filter((c) => c.position === position)
                          .map((c) => {
                            const selected = votes[position] === c._id;
                            return (
                              <label
                                key={c._id}
                                className={`flex flex-col items-center p-6 bg-white rounded-2xl border-2 transition-all cursor-pointer shadow-sm 
                            ${
                              selected
                                ? "border-accent-500 ring-2 ring-accent-300 shadow-lg"
                                : "border-primary-200 hover:border-accent-400"
                            }`}>
                                <input
                                  type="radio"
                                  name={position}
                                  value={c._id}
                                  checked={selected}
                                  onChange={() => handleVoteChange(position, c._id)}
                                  className="hidden"
                                />
                                {c.photoUrl && (
                                  <img
                                    src={c.photoUrl}
                                    alt={c.name}
                                    className={`w-44 h-44 object-cover rounded-full border-4 mb-4 ${
                                      selected ? "border-accent-500" : "border-primary-200"
                                    }`}
                                    loading="lazy"
                                  />
                                )}
                                <span className="text-text-primary font-semibold text-lg text-center">
                                  {c.name} {c.gender ? `(${c.gender})` : ""}
                                </span>
                              </label>
                            );
                          })}
                      </div>
                      {isMissing && (
                        <p className="mt-4 text-sm font-medium text-red-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 5a7 7 0 100 14 7 7 0 000-14z"
                            />
                          </svg>
                          Selection required
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className=" flex justify-center mt-8 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-800 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  <span>Submit Vote</span>
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`mx-6 mb-6 p-4 rounded-lg text-center font-medium ${
                  message.includes("successfully")
                    ? "bg-accent-50 text-accent-700 border border-accent-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowValidationModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 border border-primary-100 animate-fade-in">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 mr-3 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary">Incomplete Ballot</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Please select one candidate for every position listed below before submitting your vote.
                </p>
              </div>
            </div>
            <ul className="max-h-40 overflow-auto mb-4 divide-y divide-gray-100 rounded border border-gray-100 bg-gray-50">
              {missingPositions.map((p) => (
                <li key={p} className="px-3 py-2 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="font-medium text-gray-700 capitalize">
                    {p.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  if (firstMissingRef.current)
                    firstMissingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-800 text-white hover:bg-primary-700">
                Go to First
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
