import os
import jwt
from time import time
from flask import current_app
from flask_mail import Mail, Message
from db import get_email

def get_reset_token(self, expires=500):
         print("getting token")
         return jwt.encode({'reset_password': self.username,
                            'exp':    time() + expires},
                            key=os.getenv('SECRET_KEY_FLASK'))

def send_email(user):
    print("Sending Email")
    token = user.get_reset_token()
    msg = Message("Password Reset Request", 
                  sender = "robertspray883@gmail.com",
    recipients = [get_email(user)] )
    print("Making Message")
    msg.body = f"To reset your password, visit the following link: \n localhost:5173/reset_password?token={token}"
    mail = Mail(current_app)
    mail.send(msg)
    
def verify_reset_token(token):
        try:
            username = jwt.decode(token,
              key=os.getenv('SECRET_KEY_FLASK'))['reset_password']
        except Exception as e:
            print(e)
            return
        return username['email']