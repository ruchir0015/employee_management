from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(100), nullable=False, unique=True)
    email      = db.Column(db.String(150), nullable=True, unique=True)
    password   = db.Column(db.String(200), nullable=False)
    role       = db.Column(db.String(20), nullable=False, default='employee')  # 'admin' | 'employee'

class Employee(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name  = db.Column(db.String(50), nullable=False)
    email      = db.Column(db.String(150), nullable=True)
    department = db.Column(db.String(50), nullable=False)
    salary     = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)