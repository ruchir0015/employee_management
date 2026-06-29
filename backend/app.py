from flask import Flask, request, jsonify
from models import db, User, Employee
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from functools import wraps

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "ems-secret-key-2025"
app.config["JWT_SECRET_KEY"] = "ems-jwt-secret-2025"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

db.init_app(app)
jwt = JWTManager(app)
CORS(app, origins="*")



def current_user():
    identity = get_jwt_identity()
    return User.query.filter_by(username=identity).first()



def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user or user.role != 'admin':
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper




@app.route('/api/register', methods=["POST"])
def register():
    username = request.form.get("username", "").strip()
    email    = request.form.get("email", "").strip()
    password = request.form.get("password", "")
    role     = request.form.get("role", "employee").strip().lower()


    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    if role not in ('admin', 'employee'):
        role = 'employee'

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 409

    if email and User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    user = User(
        username=username,
        email=email or None,
        password=generate_password_hash(password),
        role=role
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"message": "Username not found"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401

    token = create_access_token(identity=user.username)

    return jsonify({
        "access_token": token,
        "role": user.role,
        "username": user.username,
        "message": "Login successful"
    }), 200



@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_me():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = {
        "id":       user.id,
        "username": user.username,
        "email":    user.email,
        "role":     user.role,
    }
    return jsonify(data), 200


@app.route("/api/employees", methods=["POST"])
@admin_required
def create_employee():
    first_name = request.form.get("first_name", "").strip()
    last_name  = request.form.get("last_name", "").strip()
    email      = request.form.get("email", "").strip()
    department = request.form.get("department", "").strip()
    salary_raw = request.form.get("salary", "")

    if not first_name or not last_name or not department or not salary_raw:
        return jsonify({"message": "first_name, last_name, department and salary are required"}), 400

    try:
        salary = int(salary_raw)
        if salary <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"message": "Salary must be a positive integer"}), 400

    employee = Employee(
        first_name=first_name,
        last_name=last_name,
        email=email or None,
        department=department,
        salary=salary
    )
    db.session.add(employee)
    db.session.commit()

    return jsonify({"message": "Employee added", "id": employee.id}), 201


@app.route("/api/employees", methods=["GET"])
@jwt_required()
def get_all_employees():
    employees = Employee.query.all()
    return jsonify([_emp_dict(e) for e in employees]), 200


@app.route("/api/employees/<int:emp_id>", methods=["GET"])
@jwt_required()
def get_employee(emp_id):
    employee = db.session.get(Employee, emp_id)
    if not employee:
        return jsonify({"message": "Employee not found"}), 404
    return jsonify(_emp_dict(employee)), 200


@app.route("/api/employees/<int:emp_id>", methods=["PUT"])
@admin_required
def update_employee(emp_id):
    employee = db.session.get(Employee, emp_id)
    if not employee:
        return jsonify({"message": "Employee not found"}), 404

    employee.first_name = request.form.get("first_name", employee.first_name).strip()
    employee.last_name  = request.form.get("last_name",  employee.last_name).strip()
    employee.email      = request.form.get("email",      employee.email or "").strip() or employee.email
    employee.department = request.form.get("department", employee.department).strip()

    salary_raw = request.form.get("salary")
    if salary_raw is not None:
        try:
            salary = int(salary_raw)
            if salary <= 0:
                raise ValueError
            employee.salary = salary
        except ValueError:
            return jsonify({"message": "Salary must be a positive integer"}), 400

    db.session.commit()
    return jsonify({"message": "Employee updated successfully"}), 200


@app.route("/api/employees/<int:emp_id>", methods=["DELETE"])
@admin_required
def delete_employee(emp_id):
    employee = db.session.get(Employee, emp_id)
    if not employee:
        return jsonify({"message": "Employee not found"}), 404

    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": "Employee deleted successfully"}), 200



@app.route("/api/users", methods=["GET"])
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([_user_dict(u) for u in users]), 200


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


def _emp_dict(e):
    return {
        "id":         e.id,
        "first_name": e.first_name,
        "last_name":  e.last_name,
        "email":      e.email,
        "department": e.department,
        "salary":     e.salary,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }

def _user_dict(u):
    return {
        "id":       u.id,
        "username": u.username,
        "email":    u.email,
        "role":     u.role,
    }


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

# Demo Line fpr repo update