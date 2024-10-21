from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db
from initconfig import initialize_firebase_admin, initialize_pyrebase
from datetime import datetime
from flask_cors import CORS


initialize_firebase_admin()
auth = initialize_pyrebase()
db = db.reference()

app = Flask(__name__)
CORS(app)


@app.route('/apis/update_project', methods=['POST'])
def update_project():
    data = request.get_json()
    user_id = data.get('user_id', '')
    project_id = data.get('project_id', '')
    # form fields
    idea_desc = data.get('idea_desc', '')
    idea_title = data.get('idea_title', '')
    script = data.get('script', '')
    video_desc = data.get('video_desc', '')
    video_title = data.get('video_title', '')
    thumbnail_desc = data.get('thumbnail_desc', '')
    date_created = data.get('date_created', '')
    suggested_titles = data.get('suggested_titles', [])  
    selected_title = data.get('selected_title', '')
    suggested_questions = data.get('suggested_questions', [])  
    selected_questions = data.get('selected_questions', [])
    sources = data.get('sources', {})
    
    
    date = datetime.now()
    last_modified_str = date.strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        if(user_id and project_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            
            if existing_proj:
                if not sources:
                    if "sources" in existing_proj:
                        sources = existing_proj["sources"]
                
                if not video_title and not video_desc:
                    if "video_title" in existing_proj:
                        video_title = existing_proj["video_title"]
                        video_desc = existing_proj["video_desc"]
                
                if not thumbnail_desc:
                    if "thumbnail_desc" in existing_proj:
                        thumbnail_desc = existing_proj["thumbnail_desc"]

                if not script:
                    if "script" in existing_proj:
                        script = existing_proj["script"]
                
                if not suggested_titles:
                    if "suggested_titles" in existing_proj:
                        suggested_titles = existing_proj["suggested_titles"]
                
                if not suggested_questions:
                    if "suggested_questions" in existing_proj:
                        suggested_questions = existing_proj["suggested_questions"]

                if not selected_questions:
                    if "selected_questions" in existing_proj:
                        selected_questions = existing_proj["selected_questions"]
                
                if not selected_title:
                    if "selected_title" in existing_proj:
                        selected_title = existing_proj["selected_title"]

                db.child('PROJECT').child(project_id).set({     
                    'user_id': user_id,
                    'idea_title': idea_title,
                    'idea_desc': idea_desc,
                    'script': script,
                    'date_created': date_created,
                    'last_modified': last_modified_str,
                    'video_title': video_title,
                    'video_desc': video_desc,
                    'sources': sources,
                    'thumbnail_desc': thumbnail_desc,
                    'selected_title': selected_title,
                    'selected_questions': selected_questions,
                    'suggested_titles': suggested_titles,
                    'suggested_questions': suggested_questions
                })
                return jsonify({"success": "True", "message": f"Updated Project: {project_id} details successfully"}), 200
            else:
                return jsonify({"success": "False", "message": "Invalid project_id"}), 404
        else:
            return jsonify({"success": "False", "message": "Missing Project/User ID"}), 404
        
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500
        
    

if __name__ == '__main__':
    app.run(debug=True, port=8080)