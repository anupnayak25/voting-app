import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage('OTP sent to your email.');
      } else {
        setMessage(data.message || 'Error sending OTP.');
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(email);
      } else {
        setMessage(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Vote</h2>
      {step === 1 && (
        <form onSubmit={handleRequestOtp}>
          <input
            type="email"
            placeholder="College Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit">Request OTP</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
