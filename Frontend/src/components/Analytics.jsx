import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positionDetails, setPositionDetails] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/position/analytics`);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositionDetails = async (positionName) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/position/analytics/${encodeURIComponent(positionName)}`);
      const data = await response.json();
      setPositionDetails(data);
      setSelectedPosition(positionName);
    } catch (error) {
      console.error('Error fetching position details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBarWidth = (voteCount, maxVotes) => {
    return maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;
  };

  const getBarColor = (index) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (selectedPosition && positionDetails) {
    const maxVotes = Math.max(...positionDetails.candidateAnalytics.map(c => c.voteCount), 1);
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {positionDetails.position.displayName} - Detailed Analytics
            </h1>
            <button
              onClick={() => setSelectedPosition(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              ← Back to Overview
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{positionDetails.totalCandidates}</div>
              <div className="text-gray-600">Total Candidates</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{positionDetails.totalVotes}</div>
              <div className="text-gray-600">Total Votes Cast</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {positionDetails.totalVotes > 0 ? 
                  (positionDetails.totalVotes / positionDetails.totalCandidates).toFixed(1) : '0'}
              </div>
              <div className="text-gray-600">Avg Votes per Candidate</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Vote Distribution</h2>
            <div className="space-y-4">
              {positionDetails.candidateAnalytics.map((candidate, index) => (
                <div key={candidate.candidate.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {candidate.candidate.photoUrl && (
                        <img 
                          src={candidate.candidate.photoUrl} 
                          alt={candidate.candidate.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{candidate.candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.candidate.usn}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{candidate.voteCount}</div>
                      <div className="text-sm text-gray-500">
                        {positionDetails.totalVotes > 0 ? 
                          ((candidate.voteCount / positionDetails.totalVotes) * 100).toFixed(1) : '0'}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className={`h-4 rounded-full ${getBarColor(index)} transition-all duration-500`}
                      style={{ width: `${getBarWidth(candidate.voteCount, maxVotes)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {candidate.voteCount} votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Voting Analytics Overview</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.map((positionData, index) => {
            const maxVotes = Math.max(...positionData.candidateVotes.map(c => c.voteCount), 1);
            
            return (
              <div key={positionData.position} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{positionData.positionDisplay}</h2>
                  <button
                    onClick={() => fetchPositionDetails(positionData.position)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    View Details
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{positionData.totalCandidates}</div>
                    <div className="text-sm text-gray-600">Candidates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{positionData.totalVotes}</div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {positionData.candidateVotes.slice(0, 3).map((candidate, candidateIndex) => (
                    <div key={candidate.candidateId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">{candidate.candidateName}</div>
                        <div className="text-xs text-gray-500">{candidate.candidateUsn}</div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${getBarColor(candidateIndex)} transition-all duration-500`}
                            style={{ width: `${getBarWidth(candidate.voteCount, maxVotes)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-2 text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                        {candidate.voteCount}
                      </div>
                    </div>
                  ))}
                  {positionData.candidateVotes.length > 3 && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                      +{positionData.candidateVotes.length - 3} more candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {analytics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No voting data available yet</div>
            <div className="text-gray-400 text-sm mt-2">Data will appear once voting begins</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
