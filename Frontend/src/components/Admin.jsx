import React, { useState, useEffect } from 'react';

const CANDIDATE_API = `${import.meta.env.VITE_API_BASE_URL}/candidate`;
const ADMIN_API = `${import.meta.env.VITE_API_BASE_URL}/admin`;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [message, setMessage] = useState('');

  const [votingWindow, setVotingWindow] = useState({ start: '', end: '' });
  const [savingWindow, setSavingWindow] = useState(false);
  
  const [registrationDueDate, setRegistrationDueDate] = useState('');
  const [savingDueDate, setSavingDueDate] = useState(false);

  const fetchPending = async () => {
    const res = await fetch(`${CANDIDATE_API}/pending`, { headers: { 'x-admin-pass': ADMIN_PASS } });
    const data = await res.json();
    if (res.ok) setPending(data.candidates);
  };

  const fetchVotingWindow = async () => {
    const res = await fetch(`${ADMIN_API}/get-voting-window`, { headers: { 'x-admin-pass': ADMIN_PASS } });
    if (res.ok) {
      const data = await res.json();
      setVotingWindow({ start: data.start ? data.start.slice(0,16) : '', end: data.end ? data.end.slice(0,16) : '' });
    }
  }

  const fetchRegistrationDueDate = async () => {
    const res = await fetch(`${ADMIN_API}/get-due-date`, { headers: { 'x-admin-pass': ADMIN_PASS } });
    if (res.ok) {
      const data = await res.json();
      setRegistrationDueDate(data.dueDate ? data.dueDate.slice(0,16) : '');
    }
  }

  useEffect(() => { fetchPending(); fetchVotingWindow(); fetchRegistrationDueDate(); }, []);

  const action = async (id, act) => {
    setMessage('');
  const res = await fetch(`${CANDIDATE_API}/${id}/${act}`, { method: 'POST', headers: { 'x-admin-pass': ADMIN_PASS } });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      fetchPending();
    } else {
      setMessage(data.message || 'Error');
    }
  };

  const remove = async (id) => {
  const res = await fetch(`${CANDIDATE_API}/${id}`, { method: 'DELETE', headers: { 'x-admin-pass': ADMIN_PASS } });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      fetchPending();
    } else setMessage(data.message || 'Error');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        
        {/* Registration Due Date Section */}
        <div className="mb-8 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Registration Due Date</h3>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setSavingDueDate(true);
              setMessage('');
              const res = await fetch(`${ADMIN_API}/set-due-date`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-pass': ADMIN_PASS },
                body: JSON.stringify({ dueDate: registrationDueDate })
              });
              const data = await res.json();
              if (res.ok) setMessage(data.message);
              else setMessage(data.message || 'Error saving due date');
              setSavingDueDate(false);
            }}
            className="grid md:grid-cols-2 gap-4 items-end"
          >
            <label className="flex flex-col text-sm">Registration Deadline
              <input 
                type="datetime-local" 
                value={registrationDueDate} 
                onChange={e=>setRegistrationDueDate(e.target.value)} 
                className="mt-1 border rounded px-2 py-1" 
                required 
              />
            </label>
            <button disabled={savingDueDate} className="bg-red-600 text-white px-4 py-2 rounded h-10 mt-4 md:mt-0">
              {savingDueDate ? 'Saving...' : 'Save Due Date'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">Candidates cannot register after this date.</p>
        </div>

        {/* Voting Window Section */}
        <div className="mb-8 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Voting Window</h3>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setSavingWindow(true);
              setMessage('');
              const body = {
                start: votingWindow.start,
                end: votingWindow.end || undefined
              };
              const res = await fetch(`${ADMIN_API}/set-voting-window`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-pass': ADMIN_PASS },
                body: JSON.stringify(body)
              });
              const data = await res.json();
              if (res.ok) setMessage(data.message);
              else setMessage(data.message || 'Error saving window');
              setSavingWindow(false);
            }}
            className="grid md:grid-cols-3 gap-4 items-end"
          >
            <label className="flex flex-col text-sm">Start
              <input type="datetime-local" value={votingWindow.start} onChange={e=>setVotingWindow(v=>({...v,start:e.target.value}))} className="mt-1 border rounded px-2 py-1" required />
            </label>
            <label className="flex flex-col text-sm">End (optional)
              <input type="datetime-local" value={votingWindow.end} onChange={e=>setVotingWindow(v=>({...v,end:e.target.value}))} className="mt-1 border rounded px-2 py-1" />
            </label>
            <button disabled={savingWindow} className="bg-blue-600 text-white px-4 py-2 rounded h-10 mt-4 md:mt-0">{savingWindow?'Saving...':'Save Window'}</button>
          </form>
          <p className="text-xs text-gray-500 mt-2">Users can request OTP / vote only within the start–end window.</p>
        </div>
        
        {/* Pending Candidates Section */}
        <div className="mb-8 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Pending Candidates ({pending.length})</h3>
          {message && <div className="mb-4 text-sm text-green-700">{message}</div>}
          <div className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending candidates</p>
            ) : (
              pending.map(c => (
                <div key={c._id} className="bg-gray-50 p-4 rounded border flex items-center">
                  <img src={c.photoUrl} alt="photo" className="w-24 h-24 object-cover rounded mr-4" />
                  <div className="flex-1">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-gray-600">{c.usn} — {c.position}</div>
                    <div className="text-sm text-gray-600">{c.email}</div>
                    {c.gender && <div className="text-sm text-gray-500">Gender: {c.gender}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => action(c._id, 'approve')} 
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => action(c._id, 'reject')} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => remove(c._id)} 
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
