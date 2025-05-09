from flask import Flask
from routes import main_bp
from db import init_db

app = Flask(__name__)

# Ініціалізація бази даних
init_db()

# Реєстрація Blueprint
app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(debug=True)