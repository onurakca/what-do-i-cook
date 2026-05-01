import json
import os
import random
import time
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DATA_FILE = os.path.join(DATA_DIR, 'foods.json')


def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def load_foods():
    ensure_data_dir()
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            return data.get('foods', [])
    return []


def save_foods(foods):
    ensure_data_dir()
    with open(DATA_FILE, 'w') as f:
        json.dump({'foods': foods}, f, indent=2)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/foods', methods=['GET'])
def get_foods():
    return jsonify(load_foods())


@app.route('/api/foods', methods=['POST'])
def add_food():
    data = request.json
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    foods = load_foods()
    if any(f['name'].lower() == name.lower() for f in foods):
        return jsonify({'error': 'Food already exists'}), 409

    foods.append({'name': name, 'last_cooked': 0})
    save_foods(foods)
    return jsonify({'name': name, 'last_cooked': 0}), 201


@app.route('/api/foods/<name>', methods=['DELETE'])
def remove_food(name):
    foods = load_foods()
    original_count = len(foods)
    foods = [f for f in foods if f['name'].lower() != name.lower()]

    if len(foods) == original_count:
        return jsonify({'error': 'Food not found'}), 404

    save_foods(foods)
    return jsonify({'message': f'{name} removed'})


@app.route('/api/random', methods=['GET'])
def get_random():
    foods = load_foods()
    if not foods:
        return jsonify({'error': 'No foods available'}), 404

    now = time.time()
    weighted_foods = []
    weights = []

    for food in foods:
        last_cooked = food.get('last_cooked', 0)
        if last_cooked == 0:
            weight = 9999
        else:
            days_since = (now - last_cooked) / 86400
            weight = max(1, days_since ** 2)
        weighted_foods.append(food)
        weights.append(weight)

    chosen = random.choices(weighted_foods, weights=weights, k=1)[0]
    return jsonify(chosen)


@app.route('/api/cook/<name>', methods=['POST'])
def mark_cooked(name):
    foods = load_foods()
    for food in foods:
        if food['name'].lower() == name.lower():
            food['last_cooked'] = time.time()
            save_foods(foods)
            return jsonify(food)

    return jsonify({'error': 'Food not found'}), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
