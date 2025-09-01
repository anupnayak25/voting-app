
import { useState } from 'react';
import Login from './Login';
import Vote from './Vote';

function App() {
  const [userEmail, setUserEmail] = useState(null);

  return (
    <div className="min-h-screen">
      {!userEmail ? (
        <Login onLogin={setUserEmail} />
      ) : (
        <Vote userEmail={userEmail} />
      )}
    </div>
  );
}

export default App;
