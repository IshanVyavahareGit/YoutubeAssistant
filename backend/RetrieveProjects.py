from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db
from initconfig import initialize_firebase_admin, initialize_pyrebase
from flask_cors import CORS

initialize_firebase_admin()
auth = initialize_pyrebase()
db = db.reference()

app = Flask(__name__)
CORS(app)

@app.route('/apis/retrieve_projects', methods=['POST'])
def retrieve_projects():
    user_data = request.get_json()
    user_id = user_data.get('user_id')
    try:
        if(user_id):
            all_projects = db.child("PROJECT").get()
            print("Here")

            user_projects = []
            if all_projects:
                for project_id, project_data in all_projects.items():
                    if project_data["user_id"] == user_id:
                        user_projects.append(project_data)

            if user_projects:
                return jsonify({"success": "True", "projects": user_projects}), 200
            else:
                return jsonify({"success": "False", "message": "No projects found for the given user"}), 413
        else:
            return jsonify({"success": "False", "message": "Did not receive a valid user_id"}), 413
    
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500

        
    

if __name__ == '__main__':
    app.run(debug=True, port=8080)