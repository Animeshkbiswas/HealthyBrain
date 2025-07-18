from tracemalloc import stop
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM, TextGenerationPipeline
import torch
import tempfile
from emotion import emotion
import cv2 as cv
from flask import Response
import time
import threading
import sqlite3

app = Flask(__name__)
CORS(app)
# Remove whisper import and model loading
score_container = {'value': None}
frame_container = {'frame': None}
concentration_thread = None
stop_view=False
stop_emotion_flag = threading.Event()



# Load the tokenizer and model
print("Loading model...")
model_name = "lavanyamurugesan123/Llama3.2-3B-Instruct-finetuned-Therapy-oriented"

tokenizer = AutoTokenizer.from_pretrained(model_name)

# Load the model and move to GPU if available
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
if torch.cuda.is_available():
    model = model.to("cuda")

# Set device: 0 for GPU, -1 for CPU
device = 0 if torch.cuda.is_available() else -1
generator = TextGenerationPipeline(model=model, tokenizer=tokenizer, device=device)

# def monitor_concentration():
#     global concentration_triggered
#     concentration_triggered = emotion(score_container,frame_container)

def monitor_concentration():
    global stop_emotion_flag
    stop_emotion_flag.clear()
    emotion(score_container, frame_container, stop_emotion_flag,stop_view)

@app.route("/stop", methods=["POST"])
def stop_emotion_detection():
    global stop_emotion_flag
    stop_view = True
    stop_emotion_flag.set()
    # print(stop_emotion_detection.is_set())
    return jsonify({"status": "Emotion detection stopped"})

@app.route('/video_feed')
def video_feed():
    """Video streaming route that reads from frame_container."""
    def generate():
        while True:
            if frame_container['frame'] is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_container['frame'] + b'\r\n')
            time.sleep(0.033)  
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/score_feed')
def score_feed():
    def event_stream():
        while True:
            score = score_container['value']
            yield f"data: {score}\n\n"
            time.sleep(0.5)

    return Response(event_stream(), mimetype='text/event-stream')


@app.route("/start", methods=["POST"])
def start_emotion_detection():
    global concentration_thread, stop_emotion_flag
    stop_emotion_flag.clear()
    concentration_thread = threading.Thread(target=monitor_concentration)
    concentration_thread.start()
    concentration_thread.join()
    return jsonify({"status": "Emotion detection started"})


@app.route("/llama", methods=["POST"])
def llama_chat():
    data = request.get_json()
    emotion_score = score_container['value']
    user_message = data.get("prompt", "give a one-liner response")

    try:
        print("Generating response...")

        # Convert emotion scores into string format
        if emotion_score:
            emotion_probs = ", ".join([f"{k}: {round(v * 100, 1)}%" for k, v in emotion_score.items()])
        else:
            emotion_probs = "Unavailable"

        # Build the custom prompt
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a Psychology Assistant, designed to answer users' questions in a kind, empathetic, and respectful manner, drawing from psychological principles and research to provide thoughtful support. DO NOT USE THE NAME OF THE PERSON IN YOUR RESPONSE."""
        if emotion_score:
            prompt += f"\nThe user's current facial emotion probabilities are: {emotion_probs}"
        prompt += f"<|eot_id|><|start_header_id|>user<|end_header_id|>\n{user_message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

        # Generate output
        output = generator(
            prompt,
            max_new_tokens=80,  # Keep it short and to the point
            do_sample=True,
            temperature=0.7,
        )

        full_output = output[0]["generated_text"]

        if "<|start_header_id|>assistant<|end_header_id|>" in full_output:
            response_text = full_output.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
        else:
            response_text = full_output.strip()
        # response_text = output[0]["generated_text"]
        print("Response:", response_text)

        # If you want to extract only the assistant part, optionally post-process here
        return jsonify({"response": response_text.strip()})

    except Exception as e:
        print("Error:", e)
        return jsonify({"response": "An error occurred during generation."})

# --- SQLite Setup ---
def init_db():
    conn = sqlite3.connect('chat_messages.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            report TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Message Storage Endpoints ---
@app.route('/save_message', methods=['POST'])
def save_message():
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    message = data.get('message')
    if not message:
        return jsonify({'status': 'error', 'message': 'No message provided'}), 400
    conn = sqlite3.connect('chat_messages.db')
    c = conn.cursor()
    c.execute('INSERT INTO messages (user_id, message) VALUES (?, ?)', (user_id, message))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get_messages', methods=['GET'])
def get_messages():
    user_id = request.args.get('user_id', 'default')
    conn = sqlite3.connect('chat_messages.db')
    c = conn.cursor()
    c.execute('SELECT message, timestamp FROM messages WHERE user_id = ? ORDER BY timestamp', (user_id,))
    messages = [{'message': row[0], 'timestamp': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify({'messages': messages})

# --- Medical Report Generation Endpoint ---
@app.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    conn = sqlite3.connect('chat_messages.db')
    c = conn.cursor()
    c.execute('SELECT message FROM messages WHERE user_id = ? ORDER BY timestamp', (user_id,))
    messages = [row[0] for row in c.fetchall()]
    conn.close()
    if not messages:
        return jsonify({'status': 'error', 'message': 'No messages found for user'}), 404
    # Use the LLM to generate a report
    chat_history = '\n'.join(messages)
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>\nYou are a medical assistant. Based on the following chat history, generate a concise medical report summarizing the user's mental health status, concerns, and any recommendations.\n<|eot_id|><|start_header_id|>user<|end_header_id|>\n{chat_history}\n<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""
    output = generator(
        prompt,
        max_new_tokens=200,
        do_sample=True,
        temperature=0.7,
    )
    full_output = output[0]["generated_text"]
    if "<|start_header_id|>assistant<|end_header_id|>" in full_output:
        report_text = full_output.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
    else:
        report_text = full_output.strip()
    # Save the report
    conn = sqlite3.connect('chat_messages.db')
    c = conn.cursor()
    c.execute('INSERT INTO reports (user_id, report) VALUES (?, ?)', (user_id, report_text))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'report': report_text})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)






# import torch
# print(torch.cuda.is_available())   # should be True
# print(torch.cuda.device_count())   # should be > 0
# print(torch.cuda.get_device_name(0))  # should print your GPU name
