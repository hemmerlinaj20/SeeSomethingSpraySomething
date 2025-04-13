import os

from flask import Flask
from flask_cors import CORS
import configparser
config = configparser.ConfigParser()
scriptdir = os.path.dirname(os.path.abspath(__file__))
config.read(os.path.abspath(os.path.join(scriptdir, ".ini")))
session_key_path = os.path.abspath(os.path.join(scriptdir, "authentication/session_key.txt"))
static_folder = os.path.abspath(os.path.join(scriptdir, "../dist"))

from routes import api_v1
from authentication.auth_routes import auth_v1

from flask_mail import Mail, Message

def create_app():
    app = Flask(__name__, static_folder='static_folder', static_url_path='/static')

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = "robertspray883@gmail.com"
    app.config['MAIL_PASSWORD'] = "SeeSomethingSprayYOU888"
    mail = Mail(app)

    app.register_blueprint(api_v1)
    app.register_blueprint(auth_v1)
    app.config['MONGO_URI'] = config['PROD']['CLIENT_URI']
    CORS(app, origins=[config['PROD']['BACKEND_URL'],config['PROD']['FRONTEND_URL']], methods=['GET', 'POST'])
    session_key_file = open(session_key_path, "r")
    app.config['SECRET_KEY'] = session_key_file.read()
    session_key_file.close()

    @app.get('/')
    def index():
        return app.send_static_file('index.html')

    return app