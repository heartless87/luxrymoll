from flask import Flask, render_template
from backend.home import run_home_logic

app = Flask(__name__)

# 🏠 Home page route
@app.route('/')
def home():
    data = run_home_logic()
    return render_template('index.html', backend_data=data)

# 👤 Profile page route
@app.route('/profile')
def profile():
    return render_template('profile.html')

#Favourate page ke liye
@app.route('/favourites')
def favourites():
    return render_template('favourites.html')

#cart page ke liye
@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/listprodct')
def listprodct():
    return render_template('listprodct.html')

if __name__ == '__main__':
    app.run(debug=True)
