import React, { useState } from 'react';
// import './PaidProducts.css';

const professionals = [
  {
    id: 1,
    name: 'Dr. Aisha Sharma',
    specialty: 'Psychiatrist',
    languages: ['English', 'Hindi'],
    rating: 4.9,
    profile: 'Experienced in treating depression, anxiety, and burnout. 12+ years of telehealth experience.',
    image: 'https://randomuser.me/api/portraits/women/50.jpg',
    available: true,
  },
  {
    id: 2,
    name: 'Mr. Ravi Kumar',
    specialty: 'Therapist',
    languages: ['English', 'Kannada'],
    rating: 4.8,
    profile: 'CBT expert for anxiety disorders and academic stress.',
    image: 'https://randomuser.me/api/portraits/men/30.jpg',
    available: false,
  },
];

const resources = [
  {
    id: 'r1',
    title: "Advanced Mindfulness Masterclass",
    type: "Video Course",
    url: "#",
  },
  {
    id: 'r2',
    title: "Professional Coping Skills Workbook (PDF)",
    type: "E-Book",
    url: "#",
  },
  {
    id: 'r3',
    title: "Guided Breathing for Stress Relief",
    type: "Audio",
    url: "#",
  },
];

export default function PaidProducts() {
  const [assessment, setAssessment] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [showReportEmail, setShowReportEmail] = useState(false);

  // Mock Assessment Logic
  function handleAssessmentSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const total =
      Number(form.q1.value) + Number(form.q2.value) + Number(form.q3.value);
    let level = "Low";
    if (total >= 6) level = "Severe";
    else if (total >= 4) level = "Moderate";
    else if (total >= 2) level = "Mild";
    setAssessmentResult({ score: total, level });
  }

  // Mock Report Download
  function handleDownloadReport() {
    const mockText = `
      AI Alchemist Chat Report
      
      Key Moments:
      - 20 positive mood statements detected in last 7 days
      - Detected moderate stress and anxiety pattern on 2024-07-10
      - AI Coping Suggestions: Mindful breaks and journaling

      Trends: Improvement in positivity curve (+17%) over 2 weeks
      Top Support Topics: Stress, Motivation, Relationships

      -- End of AI Alchemist Report --
    `;
    const blob = new Blob([mockText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Alchemist_AI_Report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="paid-products-container">
      <header className="paid-header">
        <h1>🪄 AI Alchemist Premium Services</h1>
        <p>Unlock advanced support tools and connect with real professionals, all in a secure space.</p>
      </header>
      <main className="paid-main">
        {/* 1. Connect to Professional */}
        <section className="paid-section">
          <h2>Connect to a Human Psychiatrist or Therapist</h2>
          <div className="pro-list">
            {professionals.map((pro) => (
              <div className="pro-card" key={pro.id}>
                <img src={pro.image} alt={pro.name} />
                <div>
                  <div className="pro-name">{pro.name}</div>
                  <div className="pro-specialty">{pro.specialty}</div>
                  <div className="pro-langs">🌐 {pro.languages.join(', ')}</div>
                  <div className="pro-rating">⭐ {pro.rating.toFixed(1)}</div>
                  <div className="pro-profile">{pro.profile}</div>
                  <div className="pro-actions">
                    <button disabled={!pro.available}>
                      {pro.available ? "Book Video Session" : "Not Available"}
                    </button>
                    <button>Chat Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Reports */}
        <section className="paid-section">
          <h2>Generate AI Chat Report</h2>
          <div className="report-box">
            <p>
              Instantly generate a personalized report of your chat sessions, mood trends, and AI insight. Download as PDF or text, or send to your therapist.
            </p>
            <div className="report-actions">
              <button onClick={handleDownloadReport}>Download Report</button>
              <button onClick={() => setShowReportEmail(!showReportEmail)}>
                {showReportEmail ? "Cancel " : "Send to Professional"}
              </button>
            </div>
            {showReportEmail && (
              <form className="report-email-form" onSubmit={e=>{e.preventDefault();alert("Report sent!");setShowReportEmail(false);}}>
                <input type="email" required placeholder="Therapist's Email"/>
                <button type="submit">Send Report</button>
              </form>
            )}
          </div>
        </section>

        {/* 3. Assessments and Wellness Plan */}
        <section className="paid-section">
          <h2>AI Wellness Plan & Self-Assessments</h2>
          <p className="pad-bottom">
            Take a quick self-assessment and unlock a custom action plan. Your emotional trends and results remain private.
          </p>
          {!assessmentResult ? (
            <form className="assessment" onSubmit={handleAssessmentSubmit}>
              <div>
                <label>Q1. How often have you felt nervous in the last week?</label>
                <select name="q1" required>
                  <option value="0">Rarely</option>
                  <option value="1">Some days</option>
                  <option value="2">Almost every day</option>
                </select>
              </div>
              <div>
                <label>Q2. Have you had trouble falling asleep?</label>
                <select name="q2" required>
                  <option value="0">No</option>
                  <option value="1">Occasionally</option>
                  <option value="2">Often</option>
                </select>
              </div>
              <div>
                <label>Q3. Have you felt low or lost interest?</label>
                <select name="q3" required>
                  <option value="0">No</option>
                  <option value="1">Mildly</option>
                  <option value="2">Frequently</option>
                </select>
              </div>
              <button className="assessment-btn">View Result & Plan</button>
            </form>
          ) : (
            <div className="assessment-result">
              <h4>Your Assessment Result:</h4>
              <div>
                <b>Score:</b> {assessmentResult.score} — <b>Level: </b>
                <span className={`assess-level level-${assessmentResult.level.toLowerCase()}`}>
                  {assessmentResult.level}
                </span>
              </div>
              <p>
                <b>AI Wellness Plan:</b>{" "}
                {assessmentResult.level === "Severe"
                  ? "We recommend you book a session with a professional and try daily mood journaling, relaxation breaks, and supportive peer conversations."
                  : assessmentResult.level === "Moderate"
                  ? "Practice 15 minutes of guided meditation daily. Consider starting a therapy session and keep track of your emotions in journal logs."
                  : "Maintain your positive routines! Keep practicing self-care and mindfulness."}
              </p>
              <button onClick={() => setAssessmentResult(null)}>Retake Assessment</button>
            </div>
          )}
        </section>

        {/* 4. Resource Library */}
        <section className="paid-section">
          <h2>Premium Resource Library</h2>
          <div className="resource-list">
            {resources.map(item => (
              <div className="resource-card" key={item.id}>
                <div>
                  <div className="resource-title">{item.title}</div>
                  <div className="resource-type">{item.type}</div>
                </div>
                <a href={item.url} className="resource-link" target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Priority Support */}
        <section className="paid-section">
          <h2>Priority & 24×7 Support</h2>
          <div className="priority-notice">
            ⏳ <b>Premium users get faster support from both AI and human professionals, 24/7 — never face a crisis alone!</b>
          </div>
        </section>
      </main>
    </div>
  );
}
