import os

from flask import Flask
from flask_cors import CORS
import configparser
config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))

from routes import api_v1
from authentication.auth_routes import auth_v1

from flask_mail import Mail, Message

def create_app():
    app = Flask(__name__)
    

    app = Flask(__name__)
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
    session_key_file = open("./authentication/session_key.txt", "r")
    app.config['SECRET_KEY'] = session_key_file.read()
    session_key_file.close()

    return app