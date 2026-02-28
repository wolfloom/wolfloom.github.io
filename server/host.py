from flask import Flask, render_template, send_from_directory, request, redirect, url_for, jsonify
import os, random, datetime, psutil, platform, subprocess

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES_DIR = os.path.join(BASE_DIR, "Files", "Data")
QUOTES_FILE = os.path.join(BASE_DIR, "quotes.txt")

# Ensure Data folder exists
os.makedirs(FILES_DIR, exist_ok=True)

# ---------- Temporary Guide ----------
GUIDE_DIR = os.path.join(BASE_DIR, "HSP_Install_Guide")

@app.route("/guide")
def guide_page():
    return send_from_directory(GUIDE_DIR, "index.html")

# Also serve its static files (CSS/JS)
@app.route("/guide/<path:filename>")
def guide_static(filename):
    return send_from_directory(GUIDE_DIR, filename)

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
    

#------------Notes--------------


# Path to the notes file in static
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NOTES_FILE = os.path.join(BASE_DIR, 'static', 'notes.txt')

# Serve the notes editor page
@app.route('/notes')
def notes_page():
    return render_template('notes_index.html')  # editor page

# Backend API for getting notes
@app.route('/notes_backend', methods=['GET'])
def get_notes():
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        last_modified = os.path.getmtime(NOTES_FILE)
    else:
        content = ""
        last_modified = 0

    return jsonify({
        'content': content,
        'last_modified': last_modified
    })

# Backend API for saving notes
@app.route('/notes_backend', methods=['POST'])
def save_notes():
    data = request.json
    content = data.get('content', '')
    with open(NOTES_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    return jsonify({'status': 'ok'})

    
#-----------Debug----------------
@app.route('/debug')
def debug_page():
    return render_template('debug_task.html', body_class='debug-page')

@app.route('/debug/stats')
def debug_stats():
    # CPU: average across all cores
    cpu_percent = psutil.cpu_percent(interval=None)
    # Memory
    memory_percent = psutil.virtual_memory().percent
    # Swap
    swap_percent = psutil.swap_memory().percent
    # Disk
    disk_percent = psutil.disk_usage('/').percent

    stats = {
        'cpu_percent': cpu_percent,
        'memory_percent': memory_percent,
        'swap_percent': swap_percent,
        'disk_percent': disk_percent
    }

    return jsonify(stats)

# ---------- Files Page ----------
@app.route("/files")
def files_page():
    files = sorted(os.listdir(FILES_DIR))
    file_sizes = {}
    file_dates = {}

    for f in files:
        path = os.path.join(FILES_DIR, f)
        file_sizes[f] = os.path.getsize(path)
        file_dates[f] = os.path.getmtime(path)

    def format_size(size):
        for unit in ['B','KB','MB','GB']:
            if size < 1024:
                return f"{int(size)} {unit}"
            size /= 1024
        return f"{int(size)} GB"

    file_sizes_formatted = {f: format_size(file_sizes[f]) for f in files}
    file_dates_formatted = {
        f: datetime.datetime.fromtimestamp(file_dates[f]).strftime("%d.%m.%y %H:%M")
        for f in files
    }

    return render_template(
        "files_index.html",
        files=files,
        file_sizes=file_sizes_formatted,
        file_dates=file_dates_formatted
    )

# ---------- Serve Files ----------
@app.route("/files/data/<path:filename>")
def serve_file(filename):
    return send_from_directory(FILES_DIR, filename, as_attachment=True)

# ---------- Upload ----------
@app.route("/files/upload", methods=["POST"])
def upload_file():
    uploaded = request.files.get("file")
    if uploaded:
        uploaded.save(os.path.join(FILES_DIR, uploaded.filename))
    return redirect(url_for("files_page"))

# ---------- Delete ----------
@app.route("/files/delete/<filename>", methods=["POST"])
def delete_file(filename):
    path = os.path.join(FILES_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
        return '', 200
    return 'File not found', 404

# ---------- Static Files ----------
@app.route("/static/<path:path>")
def static_proxy(path):
    return send_from_directory(os.path.join(BASE_DIR, "static"), path)

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 80
    print("\033[1;33;44m🚀 Server running at http://0.0.0.0:80/\033[0m")
    app.run(host=host, port=port, debug=True)