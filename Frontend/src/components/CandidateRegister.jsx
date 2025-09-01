import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api/candidate';

export default function CandidateRegister() {
  const [form, setForm] = useState({ name: '', usn: '', email: '', position: '', gender: '' });
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('usn', form.usn);
      fd.append('email', form.email);
      fd.append('position', form.position);
      fd.append('gender', form.gender);
      if (photo) fd.append('photo', photo);

      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registered successfully and pending approval.');
        setForm({ name: '', usn: '', email: '', position: '', gender: '' });
        setPhoto(null);
      } else {
        setMessage(data.message || 'Error registering candidate.');
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Register as Candidate</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">USN</label>
            <input name="usn" value={form.usn} onChange={handleChange} required className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input name="position" value={form.position} onChange={handleChange} required placeholder="e.g., vice president" className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender (optional)</label>
            <input name="gender" value={form.gender} onChange={handleChange} placeholder="male/female" className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="mt-1" />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Submit Registration</button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
