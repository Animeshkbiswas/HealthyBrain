import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Avatar from "./Avatar";    // Ensure your Avatar.jsx export is correct

const VoiceChatLoop = () => {
  const [listening, setListening] = useState(false);
  const [emotion, setEmotion] = useState(false);
  const [chat, setChat] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(false);

  // Avatar audio & animation
  const [botAudioUrl, setBotAudioUrl] = useState(null);
  const [avatarAnim, setAvatarAnim] = useState("idle");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const eventSourceRef = useRef(null);

  // --- Backend Video Feed ---
  const [videoFrameUrl, setVideoFrameUrl] = useState("");
  const videoIntervalRef = useRef(null);

  const startVideoStream = () => {
    if (videoIntervalRef.current) return;
    videoIntervalRef.current = setInterval(() => {
      setVideoFrameUrl(`http://127.0.0.1:5000/video_feed?${Date.now()}`);
    }, 100); // Adjust per backend FPS
  };

  const stopVideoStream = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    setVideoFrameUrl("");
  };

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setLoading(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      audioChunksRef.current = [];

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      try {
        const sttResponse = await fetch("http://127.0.0.1:5000/stt", {
          method: "POST",
          body: formData,
        });
        const sttData = await sttResponse.json();
        const userText = sttData.text;
        setChat(prev => [...prev, { sender: 'You', text: userText }]);
        const words = userText.split(" ");
        for (let i = 0; i < words.length; i++) {
          const partial = words.slice(0, i + 1).join(" ");
          setChat(prev => [...prev.slice(0, -1), { sender: 'You', text: partial }]);
          await new Promise(res => setTimeout(res, 150));
        }

        const llamaResponse = await fetch("http://127.0.0.1:5000/llama", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userText }),
        });
        const llamaData = await llamaResponse.json();
        const botText = llamaData.response;
        const word = botText.split(" ");

        const audioBlob = await speakResponse(botText);
        if (botAudioUrl) {
          URL.revokeObjectURL(botAudioUrl);
        }
        const botAudioNewUrl = URL.createObjectURL(audioBlob);
        setBotAudioUrl(botAudioNewUrl);
        setAvatarAnim("talk");
        setChat(prev => [...prev, { sender: 'Bot', text: botText }]);
        for (let i = 0; i < word.length; i++) {
          const partial_ = word.slice(0, i + 1).join(" ");
          setChat(prev => [...prev.slice(0, -1), { sender: 'Bot', text: partial_ }]);
          await new Promise(res => setTimeout(res, 200));
        }

        if (listening) startListening();
      } catch (err) {
        console.error("Error in voice loop:", err);
        setListening(false);
      }
      setLoading(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
  };

  const stopListening = () => {
    setListening(false);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleListening = async () => {
    if (listening) {
      stopListening();
    } else {
      setListening(true);
      startListening();
    }
  };

  const toggleEmotion = async () => {
    if (emotion) {
      await fetch("http://127.0.0.1:5000/stop", { method: "POST" });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      stopVideoStream();
      setEmotion(false);
    } else {
      setEmotion(true);
      await fetch("http://127.0.0.1:5000/start", { method: "POST" });
      startEmotionStream();
      startVideoStream();
    }
  };

  const startEmotionStream = () => {
    eventSourceRef.current = new EventSource("http://127.0.0.1:5000/score_feed");
    eventSourceRef.current.onmessage = (event) => {
      try {
        const scoreData = JSON.parse(event.data.replace(/'/g, '"'));
        setScores(scoreData);
      } catch (err) {
        console.error("Error parsing score feed:", err);
      }
    };
  };

  const speakResponse = async (text) => {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream', {
      method: 'POST',
      headers: {
        // 'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });
    const audioBlob = await response.blob();
    return audioBlob;
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (botAudioUrl) {
        URL.revokeObjectURL(botAudioUrl);
      }
      stopVideoStream();
    };
    // eslint-disable-next-line
  }, []);

  const EmotionModal = () => {
    if (!showEmotionModal) return null;
    return (
      <div className="emotion-modal-overlay" onClick={() => setShowEmotionModal(false)}>
        <div className="emotion-modal" onClick={e => e.stopPropagation()}>
          <button className="emotion-modal-close" onClick={() => setShowEmotionModal(false)}>×</button>
          <h3>🎭 Live Emotion Analysis</h3>
          <div className="emotion-scores">
            {Object.entries(scores).map(([emotion, value]) => (
              <div key={emotion} className="emotion-bar">
                <span>{emotion}</span>
                <div className="bar-wrapper">
                  <div className="bar-fill" style={{ width: `${value * 100}%` }}></div>
                </div>
                <span>{(value * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="voice-chat-container">
      <header className="chat-header">
        <h1>🎤 Empathetic AI Voice Chat</h1>
        <div className="header-controls">
          <button 
            className={`control-btn ${listening ? 'active' : ''}`} 
            onClick={toggleListening}
          >
            {listening ? '🛑' : '🎙️'}
          </button>
          <button 
            className={`control-btn ${emotion ? 'active' : ''}`} 
            onClick={toggleEmotion}
          >
            {emotion ? '😐' : '😊'}
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-section">
            <h3>📹 Live Feed</h3>
            <div className="video-container" style={{ width: "100%", height: "270px" }}>
              <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
                <color attach="background" args={["#ececec"]} />
                <ambientLight />
                <OrbitControls />
                <Environment preset="sunset" />
                <Avatar audioUrl={botAudioUrl} animationCue={avatarAnim} />
              </Canvas>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>🎛️ Controls</h3>
            <div className="control-buttons">
              <button 
                className={`main-control-btn ${listening ? 'listening' : ''}`} 
                onClick={toggleListening}
              >
                {listening ? '🛑 Stop Listening' : '🎙️ Start Listening'}
              </button>
              <button 
                className={`main-control-btn ${emotion ? 'emotion-active' : ''}`} 
                onClick={toggleEmotion}
              >
                {emotion ? '😐 Stop Emotion' : '😊 Start Emotion'}
              </button>
            </div>
          </div>
        </aside>

        {/* Center Chat Area */}
        <main className="chat-main">
          <div className="chat-container">
            <div className="chat-messages">
              {chat.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-content">
                    <h2>👋 Welcome to AI Voice Chat!</h2>
                    <p>Start a conversation by clicking the microphone button</p>
                  </div>
                </div>
              )}
              {chat.map((msg, idx) => (
                <div key={idx} className={`message-container ${msg.sender === "You" ? "you" : "bot"}`}>
                  <div className={`message-bubble ${msg.sender === "You" ? "you" : "bot"}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-container bot">
                  <div className="message-bubble bot">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {/* Backend Video Feed */}
          <div className="sidebar-section">
            <h3>📹 Live Video</h3>
            <div className="video-container" style={{ width: "100%", height: "270px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {emotion ? (
                <img
                  src={videoFrameUrl}
                  alt="Live Video"
                  className="video-feed"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px", background: "#111" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "#222",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  opacity: .7,
                  color: "#bbb"
                }}>
                  Video stopped
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>😊 Live Emotions</h3>
            <div className="emotion-display">
              {Object.entries(scores).slice(0, 5).map(([emotion, value]) => (
                <div key={emotion} className="emotion-item">
                  <div className="emotion-label">{emotion}</div>
                  <div className="emotion-value">{(value * 100).toFixed(1)}%</div>
                  <div className="emotion-bar">
                    <div 
                      className="emotion-fill" 
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {Object.keys(scores).length > 5 && (
                <button 
                  className="view-all-btn"
                  onClick={() => setShowEmotionModal(true)}
                >
                  View All Emotions
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>📊 Chat Stats</h3>
            <div className="stats-display">
              <div className="stat-item">
                <span className="stat-label">Messages</span>
                <span className="stat-value">{chat.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className={`stat-value ${listening ? 'active' : 'inactive'}`}>
                  {listening ? 'Listening' : 'Idle'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Emotion</span>
                <span className={`stat-value ${emotion ? 'active' : 'inactive'}`}>
                  {emotion ? 'Active' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <EmotionModal />
    </div>
  );
};

export default VoiceChatLoop;
