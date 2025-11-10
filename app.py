import subprocess
import random
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
import webbrowser
import threading

app = Flask(__name__, static_folder='static')


MODEL = "qwen2.5:14b"
VOCAB_FILE = "ressources/voc.txt"

try:
    settings = {}
    with open("settings.txt", 'r') as f:
        for line in f:
            line = line.strip()
            if line and '=' in line:
                key, value = line.split('=', 1)
                settings[key.strip()] = value.strip()

    MODEL = settings.get('MODEL') 
    print(MODEL)
    VOCAB_FILE = settings.get('VOCAB_FILE')
except FileNotFoundError:
    print(f"setting.txt not found")



class Ollama:
    """Interface Ollama"""
    
    @staticmethod
    def run(prompt):
        """Exécute une requête vers Ollama"""
        proc = subprocess.Popen(
            ["ollama", "run", MODEL],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True,
            encoding="utf-8"
        )
        out, _ = proc.communicate(prompt)
        return out.strip()


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get("prompt", "")
    res = Ollama.run(prompt)
    print("Prompt : ", prompt)
    print( "Result : ", res)
    return jsonify({'result': res.strip()})



def open_browser():
    """Ouvre le navigateur après un délai"""
    import time
    time.sleep(2.0)
    webbrowser.open('http://localhost:5000')


if __name__ == "__main__":
    print("=== English Trainer ===")
    print("Démarrage du serveur sur http://localhost:5000")
    print("Appuyez sur Ctrl+C pour arrêter\n")
    
    threading.Thread(target=open_browser, daemon=True).start()
    
    app.run(debug=False, port=5000)