import './App.css';
import './VoiceChatLoop.css';
import './Marketplace.css';
import './PaidProducts.css'
import VoiceChatLoop from './components/total.jsx';
import Marketplace from './components/Marketplace.jsx';
import PaidProducts from './components/PaidProducts.jsx';
import Sidebar from './components/slidebar'; 




import { useState } from 'react';

// function Marketplace() {
//   return <div style={{padding: 32, color: '#222'}}>Marketplace content here...</div>;
// }

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState('chat'); // chat | marketplace | ...

  let MainComponent = null;
  if (selected === 'chat') {
    MainComponent = <VoiceChatLoop />;
  } else if (selected === 'marketplace') {
    MainComponent = <Marketplace />;
  } else if (selected === 'paidproducts') {
    MainComponent = <PaidProducts />;
  } 

  return (
    <div className="App">
      <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
        ☰
      </button>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={opt => { setSelected(opt); setSidebarOpen(false); }}
        selected={selected}
      />
      <div className={`main-content-area ${sidebarOpen ? "blur" : ""}`}>
        {MainComponent}
      </div>
    </div>
  );
}

export default App;
