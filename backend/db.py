
from flask import current_app, g, session
from werkzeug.local import LocalProxy
from flask_pymongo import PyMongo

def get_db():
    """
    Configuration method to return db instance
    """
    db = getattr(g, "_database", None)

    if db is None:

        db = g._database = PyMongo(current_app).db
       
    return db


# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)

def get_controllers():
    try:
        return list(db.Controllers.find({}))
    except Exception as e:
        return e
    
def get_users():
    try:
        return list(db.Users.find({}))
    except Exception as e:
        return e

def get_user_by_id(user_id):
    try:
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        return user
    except Exception as e:
        return e
    
def get_email(user_id):
    try:
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        return user['email']
    except Exception as e:
        return e


def get_nozzles():
    try:
        return list(db.Nozzles.find({}))
    except Exception as e:
        return e

def get_guns():
    try:
        return list(db.Guns.find({}))
    except Exception as e:
        return e

def get_projects_by_user(user):
    try:
        return list(user['projects'])
    except Exception as e:
        return e
    
def get_user_recent_runs(user):
    try:
        return list(user['recent_runs'])
    except Exception as e:
        return e
    
def does_project_exist(user_id, pid):
    try:
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        projects = list(user['projects'])
        for project in projects:
            if(project['project_id'] == pid):
                return True
        return False
    except Exception as e:
        return e
    
def find_user_max_project_id(user_id):
    try:
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        projects = get_projects_by_user(user)
        if(not projects or len(projects) == 0):
            return 0
        return projects[len(projects)-1]['project_id']
    except Exception as e:
        return e
    
def save_new_project(user_id, projectJSON):
    try:
        projectJSON['project_id'] = find_user_max_project_id(user_id) + 1
        print(projectJSON)
        db.Users.update_one(
            {"_id": user_id},
            {"$push": {"projects": projectJSON}}
        )
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        return user
    except Exception as e:
        return e
    
def overwrite_existing_project(user_id, projectJSON):
    try:
        db.Users.update_one(
            {"_id": user_id, "projects.project_id": projectJSON['project_id']},
            { "$set": { "projects.$" : projectJSON } }
        )
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        return user
    except Exception as e:
        return e

def delete_project(user_id, project_id):
    try:
        if(user_id == 1 or project_id == 0):
            return None
        db.Users.update_one(
            {"_id": user_id},
            {"$pull": {"projects": {"project_id": project_id}}}
        )
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        return user
    except Exception as e:
        return e   

def push_recent_project(user_id, project_id, projectJSON):
    try:
        if(project_id == 0):
            return None
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        if(len(user['recent_runs']) >= 30):
            db.Users.update_one(
                {"_id": user_id},
                {"$pop": {"recent_runs": -1}}
            )
        db.Users.update_one(
            {"_id": user_id},
            {"$push": {"recent_runs": projectJSON}}
        )
        user = db.Users.find_one({'_id': user_id})
        return user
    except Exception as e:
        return e

def get_recents_for_this_project(user_id, project_id):
    try:
        user = db.Users.find_one({'_id': user_id}, {'pass_hash':0})
        recents = get_user_recent_runs(user)
        recents = list(filter(lambda run: run['project_id'] == project_id, recents))
        return recents
    except Exception as e:
        return e