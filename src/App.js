// src/App.js
import './App.css';
import VoiceChatLoop from './components/total.jsx';
import './VoiceChatLoop.css';
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";

function App() {
  return (
    <div className="App">
      <VoiceChatLoop />
      {/* <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas> */}
    </div>
  );
}

export default App;
