from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db
from initconfig import initialize_firebase_admin, initialize_pyrebase

initialize_firebase_admin()
auth = initialize_pyrebase()
db = db.reference()

app = Flask(__name__)


@app.route('/apis/delete_project', methods=['POST'])
def delete_project():
    data = request.get_json()
    user_id = data.get('user_id')
    project_id = data.get('project_id')
    
    try:
        if(project_id and user_id):
            db.child("PROJECT").child(project_id).delete()
            user_data = db.child("USER").child(user_id).get()
            
            user_projects = []
            if "project_ids" in user_data:
                user_projects = user_data["project_ids"]
                if project_id in user_projects:
                    user_projects.remove(project_id)

            db.child('USER').child(user_id).set({
                'channel_url': user_data["channel_url"],
                'user_email': user_data["user_email"],
                'user_name': user_data["user_name"],
                'project_ids': user_projects,
            })

            return jsonify({"success": "True", "message": f"Deleted Project: {project_id} for User: {user_id}"}), 200
        
        else:
            return jsonify({"success": "False", "message": f"Missing Project ID"}), 404
        
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500
        
    

if __name__ == '__main__':
    app.run(debug=True)