# app.py
from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import base64

load_dotenv()

app = Flask(__name__)
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["Product"]
collection = db["Prodlist"]

# Home Page - Infinite Scroll
@app.route('/')
def index():
    return render_template('index.html')

# API for infinite scroll
@app.route('/api/products')
def get_products():
    page = int(request.args.get('page', 1))
    per_page = 12
    skip = (page - 1) * per_page

    products = list(collection.find().skip(skip).limit(per_page))
    
    product_list = []
    for p in products:
        img_data = p.get("image-1", "")
        if img_data and not img_data.startswith("data:"):
            img_data = "data:image/jpeg;base64," + img_data
        
        product_list.append({
            "id": str(p["_id"]),
            "title": p.get("Tittle", "No Title"),
            "original_price": p.get("Orginal-price", 0),
            "sell_price": p.get("Sell-price", 0),
            "image": img_data
        })
    
    return jsonify(product_list)

# Product Detail Page
@app.route('/product/<product_id>')
def product_detail(product_id):
    product = collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return "Product not found", 404

    # Handle all images (image-1 to image-7)
    images = []
    for i in range(1, 8):
        key = f"image-{i}"
        if key in product and product[key]:
            img = product[key]
            if not img.startswith("data:"):
                img = "data:image/jpeg;base64," + img
            images.append(img)

    return render_template('product_detail.html', product=product, images=images)

if __name__ == '__main__':
    app.run(debug=True)
