# What Do I Cook?

A minimal web app that helps you decide what to cook. Add your favorite dishes, and let the app pick one for you using a weighted algorithm that favors foods you haven't cooked in a while.

## Features

- Add and manage your food list
- Weighted random selection — foods you haven't cooked in a while are more likely to be picked
- Mark foods as cooked to reset their timer

## Deploy

1. Clone the repo:
   ```bash
   git clone <repo-url> ~/what-do-i-cook
   cd ~/what-do-i-cook
   ```

2. Install dependencies:
   ```bash
   sudo apt update && sudo apt install -y python3 python3-venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Set up the systemd service:
   ```bash
   sudo cp what-do-i-cook.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable what-do-i-cook
   sudo systemctl start what-do-i-cook
   ```

4. Access from any device on your network at `http://<ip>:3000`

## Project Structure

```
app.py                    # Flask application
templates/index.html      # Main page
static/style.css          # Styles
static/app.js             # Frontend logic
data/foods.json           # Persisted food data
what-do-i-cook.service    # systemd service file
requirements.txt          # Python dependencies
```
