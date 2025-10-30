from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Backend is running fine!"

@app.route('/run-upgrade', methods=['GET'])
def run_upgrade():
    try:        
        subprocess.run(["python", "upgrade.py"], check=True)
        return jsonify({"status": "success", "message": "upgrade.py executed successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 👤 Profile page route
@app.route('/profile')
def profile():
    return render_template('profile.html')

# Favourites page
@app.route('/favourites')
def favourites():
    return render_template('favourites.html')

# Cart page
@app.route('/cart')
def cart():
    return render_template('cart.html')

# Product list page
@app.route('/listprodct')
def listprodct():
    return render_template('listprodct.html')


# 🔥 New API route for Chat
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    
    # Example response (replace this with ChatGPT integration if needed)
    reply = f"You said: {message}"
    
    return jsonify({"reply": reply})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

