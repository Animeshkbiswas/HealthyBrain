import React, { useState, useRef, useEffect } from 'react';

const VoiceChatLoop = () => {
  const [listening, setListening] = useState(false);
  const [emotion, setEmotion] = useState(false);
  const [chat, setChat] = useState([]);
  const [scores, setScores] = useState({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const eventSourceRef = useRef(null);

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
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

        // Simulate word-by-word display for transcript
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
        setChat(prev => [...prev, { sender: 'Bot', text: botText }]);

        // Word-by-word TTS display while speaking
        await speakResponse(botText);

        if (listening) startListening(); // continue loop
      } catch (err) {
        console.error("Error in voice loop:", err);
        setListening(false);
      }
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
      // await fetch("http://127.0.0.1:5000/stop", { method: "POST" });
      // if (eventSourceRef.current) {
      //   eventSourceRef.current.close();
      // }
    } else {
      setListening(true);
      // await fetch("http://127.0.0.1:5000/start", { method: "POST" });
      startListening();
      // startEmotionStream();
    }
  };
  const toggleEmotion = async () => {
    if (emotion) {
      // stopListening();
      await fetch("http://127.0.0.1:5000/stop", { method: "POST" });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      setEmotion(false);
      }
    } else {
      setEmotion(true);
      await fetch("http://127.0.0.1:5000/start", { method: "POST" });
      // startListening();
      startEmotionStream();
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
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream', {
      method: 'POST',
      headers: {
        'xi-api-key':  process.env.REACT_APP_ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Display response word-by-word while audio plays
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      const partial = words.slice(0, i + 1).join(" ");
      setChat(prev => [...prev.slice(0, -1), { sender: 'Bot', text: partial }]);
      await new Promise(res => setTimeout(res, 200));
    }

    return new Promise(resolve => {
      audio.onended = resolve;
      audio.play();
    });
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>🎤 Voice Chat with LLaMA + Emotion Detection</h2>

      <div style={{ margin: '20px 0' }}>
        <h3>Chat Log</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
          {chat.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '8px', textAlign: msg.sender === 'You' ? 'right' : 'left' }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>Live Video Feed</h3>
        <img src="http://127.0.0.1:5000/video_feed" alt="Live Video Feed" style={{ width: '100%', borderRadius: '8px' }} />
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>Live Emotion Scores</h3>
        <ul>
          {Object.entries(scores).map(([emotion, value]) => (
            <li key={emotion}>{emotion}: {(value * 100).toFixed(2)}%</li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={toggleListening}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: listening ? '#e74c3c' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {listening ? 'Stop Listening & Emotion' : 'Start Listening & Emotion'}
        </button>
        <button
          onClick={toggleEmotion}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: emotion ? '#e74c3c' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {emotion ? 'Stop Emotion' : 'Start Emotion'}
        </button>
      </div>
    </div>
  );
};

export default VoiceChatLoop;
