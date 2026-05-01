let currentFood = null;

const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');

        if (tab.dataset.tab === 'manage') {
            loadFoodList();
        }
    });
});

document.getElementById('btn-cook').addEventListener('click', getRandomFood);
document.getElementById('btn-next').addEventListener('click', getRandomFood);
document.getElementById('btn-accept').addEventListener('click', acceptFood);

async function getRandomFood() {
    const res = await fetch('/api/random');
    if (res.ok) {
        currentFood = await res.json();
        document.getElementById('food-display').textContent = currentFood.name;
        document.getElementById('btn-cook').style.display = 'none';
        document.getElementById('btn-next').style.display = 'inline-block';
        document.getElementById('btn-accept').style.display = 'inline-block';
    }
}

async function acceptFood() {
    if (!currentFood) return;

    await fetch(`/api/cook/${encodeURIComponent(currentFood.name)}`, { method: 'POST' });

    document.getElementById('food-display').textContent = `${currentFood.name} - logged!`;
    document.getElementById('btn-cook').style.display = 'inline-block';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-accept').style.display = 'none';
    currentFood = null;
}

async function loadFoodList() {
    const res = await fetch('/api/foods');
    const foods = await res.json();
    const list = document.getElementById('food-list');
    list.innerHTML = '';

    foods.forEach(food => {
        const li = document.createElement('li');
        const lastCooked = food.last_cooked > 0
            ? `Last cooked: ${new Date(food.last_cooked * 1000).toLocaleDateString()}`
            : 'Never cooked';

        li.innerHTML = `
            <div class="food-info">
                <span class="food-name">${food.name}</span>
                <span class="last-cooked">${lastCooked}</span>
            </div>
            <button class="btn btn-danger" onclick="removeFood('${food.name}')">Remove</button>
        `;
        list.appendChild(li);
    });
}

async function addFood() {
    const input = document.getElementById('food-input');
    const name = input.value.trim();
    if (!name) return;

    const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    if (res.ok) {
        input.value = '';
        loadFoodList();
    }
}

async function removeFood(name) {
    await fetch(`/api/foods/${encodeURIComponent(name)}`, { method: 'DELETE' });
    loadFoodList();
}

document.getElementById('btn-add').addEventListener('click', addFood);
document.getElementById('food-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addFood();
});
