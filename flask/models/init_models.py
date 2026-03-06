from flask_pymongo import PyMongo

mongo = PyMongo()

def init_models(app):
    mongo.init_app(app)
