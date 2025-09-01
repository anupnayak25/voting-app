import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/candidate';
const ADMIN_PASS = 'changeme123'; // replace or prompt

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [message, setMessage] = useState('');

  const fetchPending = async () => {
    const res = await fetch(`${API_URL}/pending`, { headers: { 'x-admin-pass': ADMIN_PASS } });
    const data = await res.json();
    if (res.ok) setPending(data.candidates);
  };

  useEffect(() => { fetchPending(); }, []);

  const action = async (id, act) => {
    setMessage('');
    const res = await fetch(`${API_URL}/${id}/${act}`, { method: 'POST', headers: { 'x-admin-pass': ADMIN_PASS } });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      fetchPending();
    } else {
      setMessage(data.message || 'Error');
    }
  };

  const remove = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { 'x-admin-pass': ADMIN_PASS } });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      fetchPending();
    } else setMessage(data.message || 'Error');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin — Pending Candidates</h2>
        {message && <div className="mb-4 text-sm text-green-700">{message}</div>}
        <div className="space-y-4">
          {pending.map(c => (
            <div key={c._id} className="bg-white p-4 rounded shadow flex items-center">
              <img src={c.photoUrl} alt="photo" className="w-24 h-24 object-cover rounded mr-4" />
              <div className="flex-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.usn} — {c.position}</div>
                <div className="text-sm text-gray-600">{c.email}</div>
              </div>
              <div className="space-y-2">
                <button onClick={() => action(c._id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => action(c._id, 'reject')} className="bg-yellow-500 text-white px-3 py-1 rounded">Reject</button>
                <button onClick={() => remove(c._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
