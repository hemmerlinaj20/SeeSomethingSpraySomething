from flask import Blueprint, request, session, make_response
from authentication.accounts import create_user_account, global_hasher, account_exists
from db import get_user_by_id, get_user_by_id_with_pass
from flask_cors import CORS
import json

auth_v1 = Blueprint(
    'auth_v1', 'auth_v1', url_prefix='/auth/v1')

CORS(auth_v1)

@auth_v1.route("/create/", methods=["POST"])
def create_account():
    incoming_datamap = request.json

    username = incoming_datamap["username"]
    password = incoming_datamap["password"]
    email = incoming_datamap["email"]

    new_uid = create_user_account(username, password, email)

    if new_uid == None:
        return "User already exists", 409
    else:
        session["uid"] = new_uid
        return f'{{"uid":{new_uid}, "username":"{username}", "email":"{email}"}}'


@auth_v1.route("/login/", methods=["POST"])
def login():
    incoming_datamap = request.json

    username = incoming_datamap["username"]
    password = incoming_datamap["password"]
    

    uid = account_exists(username)
    if uid == None:
        return f"username: {username} and password: {password} do not specify a valid account", 401
    
    user_map = get_user_by_id_with_pass(uid)

    if not global_hasher.check_password(password, user_map["pass_hash"]):
        return f"username: {username} and password: {password} do not specify a valid account", 401
    else:
        session["uid"] = uid
        
        responseText = f'{{"uid":{uid}, "username":"{username}", "email":"{user_map["email"]}"}}'
        #print(responseText)
        return responseText, 200

@auth_v1.route("/logout", methods=["POST"])
def logout():
    uid = session.get("uid")

    #if uid == None:
    #    return "Error: you cannot log out without first loggin in", 401
    #else:
    session["uid"] = None
    return "OK", 200
    

