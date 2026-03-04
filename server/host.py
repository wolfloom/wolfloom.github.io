import sys
import os
import random
import datetime
import json
import psutil
from flask import Flask, render_template, send_from_directory, request, redirect, url_for, jsonify

# Detect base folder dynamically
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, template_folder=os.path.join(BASE_DIR, "templates"), static_folder=os.path.join(BASE_DIR, "static"))

FILES_DIR = os.path.join(BASE_DIR, "Files", "Data")
QUOTES_FILE = os.path.join(BASE_DIR, "quotes.txt")
NOTES_FILE = os.path.join(BASE_DIR, "static", "notes.txt")
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")

# Ensure Data folder exists
os.makedirs(FILES_DIR, exist_ok=True)

# ---------- Homepage ----------
@app.route("/")
def home():
    quote = ""
    if os.path.exists(QUOTES_FILE):
        with open(QUOTES_FILE, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
            if lines:
                quote = random.choice(lines)
    return render_template("index.html", quote=quote)

# ---------- Notes ----------
@app.route('/notes')
def notes_page():
    return render_template('notes_index.html')

@app.route('/notes_backend', methods=['GET'])
def get_notes():
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        last_modified = os.path.getmtime(NOTES_FILE)
    else:
        content = ""
        last_modified = 0
    return jsonify({'content': content, 'last_modified': last_modified})

@app.route('/notes_backend', methods=['POST'])
def save_notes():
    data = request.json
    with open(NOTES_FILE, 'w', encoding='utf-8') as f:
        f.write(data.get('content', ''))
    return jsonify({'status': 'ok'})

# ---------- Debug ----------
@app.route('/debug')
def debug_page():
    return render_template('debug_task.html', body_class='debug-page')

@app.route('/debug/stats')
def debug_stats():
    stats = {
        'cpu_percent': psutil.cpu_percent(interval=None),
        'memory_percent': psutil.virtual_memory().percent,
        'swap_percent': psutil.swap_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent
    }
    return jsonify(stats)

# ---------- Files ----------
@app.route("/files")
def files_page():
    files = sorted(os.listdir(FILES_DIR))
    file_sizes = {f: os.path.getsize(os.path.join(FILES_DIR, f)) for f in files}
    file_dates = {f: os.path.getmtime(os.path.join(FILES_DIR, f)) for f in files}

    def fmt_size(size):
        for unit in ['B','KB','MB','GB']:
            if size < 1024: return f"{int(size)} {unit}"
            size /= 1024
        return f"{int(size)} GB"

    sizes = {f: fmt_size(file_sizes[f]) for f in files}
    dates = {f: datetime.datetime.fromtimestamp(file_dates[f]).strftime("%d.%m.%y %H:%M") for f in files}

    return render_template("files_index.html", files=files, file_sizes=sizes, file_dates=dates)

@app.route("/files/data/<path:filename>")
def serve_file(filename):
    return send_from_directory(FILES_DIR, filename, as_attachment=True)

@app.route("/files/upload", methods=["POST"])
def upload_file():
    uploaded = request.files.get("file")
    if uploaded:
        uploaded.save(os.path.join(FILES_DIR, uploaded.filename))
    return redirect(url_for("files_page"))

@app.route("/files/delete/<filename>", methods=["POST"])
def delete_file(filename):
    path = os.path.join(FILES_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
        return '', 200
    return 'File not found', 404

# ---------- Main ----------
if __name__ == "__main__":
    # Defaults
    host, port = "0.0.0.0", 5000

    # Override from CLI args
    if len(sys.argv) >= 3:
        host = sys.argv[1]
        port = int(sys.argv[2])
    elif os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                c = json.load(f)
                host = c.get("host", host) or host
                port = int(c.get("port", port) or port)
        except Exception as e:
            print("Config load failed, using defaults:", e)

    print(f"🚀 Server running at http://{host}:{port}/")
    app.run(host=host, port=port, debug=False, use_reloader=False)