import './App.css';
import './VoiceChatLoop.css';
import './Marketplace.css';
import './PaidProducts.css'
import VoiceChatLoop from './components/total.jsx';
import Marketplace from './components/Marketplace.jsx';
import PaidProducts from './components/PaidProducts.jsx';
import Sidebar from './components/slidebar'; 

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { account } from "./appwrite";
import Total from "./components/total";

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState('chat'); // chat | marketplace | paidproducts

  useEffect(() => {
    account.get()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await account.deleteSession("current");
    setUser(null);
    window.location.reload();
  };

  let MainComponent = null;
  if (selected === 'chat') {
    MainComponent = <Total />;
  } else if (selected === 'marketplace') {
    MainComponent = <Marketplace />;
  } else if (selected === 'paidproducts') {
    MainComponent = <PaidProducts />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            user ? (
              <div>
                <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
                  &#9776;
                </button>
                <Sidebar
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  onSelect={opt => { setSelected(opt); setSidebarOpen(false); }}
                  selected={selected}
                  onLogout={handleLogout}
                />
                <div className={`main-content-area${sidebarOpen ? " blur" : ""}`}>
                  {MainComponent}
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
