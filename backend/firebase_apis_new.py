from groq import Groq
import asyncio
import requests
import json
import ast
import os
import string
from datetime import datetime
import random

from flask import Flask, request, jsonify
from flask_cors import CORS

from firebase_admin import credentials, db
from initconfig import initialize_firebase_admin, initialize_pyrebase
initialize_firebase_admin()
auth = initialize_pyrebase()
db = db.reference()

from runconfig import run_groq_tavily_setup
objs = run_groq_tavily_setup()
client = objs["groq_client"]

app = Flask(__name__)
CORS(app)
    

@app.route('/apis/get_idea/<project_id>', methods=['POST'])
def get_idea(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    try:
        if(project_id and user_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 404
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            if not existing_proj["idea_title"] or not existing_proj["idea_desc"]:
                return jsonify({"success": "False", "message": f"Project {project_id} does not have any video idea."}), 413
            
            return jsonify({"success": "True", "message": f"Successfull retrieved idea for project: {project_id}", "idea_title": existing_proj["idea_title"], "idea_desc": existing_proj["idea_desc"], "date_created": existing_proj["date_created"]}), 200
    
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500


@app.route('/apis/finalize_title/<project_id>', methods=['POST'])
def finalize_title(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    # frontend will send in format { 'selected_title': {'type':'generated or custom', 'title':'user selected title'} }
    selected_title = data.get('selected_title')
    
    try:
        if(project_id and selected_title and user_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 413
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            
            date = datetime.now()
            last_modified_str = date.strftime("%Y-%m-%d %H:%M:%S")
            db.child('PROJECT').child(project_id).set({
                'user_id': existing_proj["user_id"],
                'idea_title': existing_proj["idea_title"],
                'idea_desc': existing_proj["idea_desc"],
                'date_created': existing_proj["date_created"],
                'last_modified': last_modified_str,
                'suggested_titles': existing_proj["suggested_titles"],
                'selected_title': selected_title
            })

            return jsonify({"success": "True", "message": f"Successfully finalized title for project: {project_id}", "title": selected_title["title"]}), 200
        else:
            return jsonify({"success": "False", "message": "Missing input(s)"}), 413
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500


@app.route('/apis/get_titles/<project_id>', methods=['POST'])
def get_titles(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    try:
        if(project_id and user_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 404
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            if not existing_proj["suggested_titles"]:
                return jsonify({"success": "False", "message": f"Project {project_id} has not been suggested any titles"}), 413
            
            return jsonify({"success": "True", "message": f"Successfull retrieved titles for project: {project_id}", "titles": existing_proj["suggested_titles"]}), 200
    
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500


@app.route('/apis/gen_titles/<project_id>', methods=['POST'])
def gen_titles(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    try:
        if(project_id and user_id):
            
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 404
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            
            if "idea_title" in existing_proj:
                idea_title = existing_proj["idea_title"]
            else:
                return jsonify({"success": "False", "message": f"idea title missing for the project : {project_id} in database"}), 413
            if "idea_desc" in existing_proj:
                idea_desc = existing_proj["idea_desc"]
            else:
                return jsonify({"success": "False", "message": f"idea desc missing for the project : {project_id} in database"}), 413

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional youtube title generator who generates a youtube title that can get maximum audience attention, from the idea title and idea description that is provided."
                    },
                    { 
                        "role": "user", 
                        "content": f"""
                            Generate a YouTube video title based on the following video idea title and description:
                            Video Idea Title: {idea_title}
                            Video Idea Description: {idea_desc}

                            The title should meet the following criteria:

                            Be accurate and clearly represent the video's content to ensure viewers do not stop watching mid-video.
                            Preferably be 50-60 characters, and no more than 100 characters.
                            Highlight the key benefit or value viewers will gain from the video.
                            Include major keywords or search terms that are frequently searched by users related to this content.
                            Use CAPS to emphasize one or two key words for impact, but avoid excessive use of all caps.
                            Keep the title brief, direct, and to the point, as viewers may only see part of it on YouTube.
                            Consider using brackets or parentheses to add additional context or perceived value, but don’t force it unless it adds clarity.
                            Address challenges or pain points that the target audience has, and create a title that speaks directly to solving those issues.
                            If the content relates to lists or rankings, create a listicle-style title (e.g., '5 Tips for Boosting Productivity').
                            Add a sense of urgency to encourage immediate clicks, if appropriate.
                            Know the target audience and tailor the title to appeal to them.
                            Include a hook or special element to capture attention and distinguish the video from competing content.
                            Clearly communicate what viewers can expect from the video and why it is special or unique.
                            
                            Output format:
                            Return the titles as an array of strings that can be type casted using the python list function
                            Output: Only generate 3 titles in the form of an array of strings in a single line and nothing else.

                            """         
                    }
                ],
                model="llama-3.1-70b-versatile",
            )

            llmoutput = chat_completion.choices[0].message.content
            titles = ast.literal_eval(llmoutput)
            # arrllmoutput = ast.literal_eval(llmoutput)
            # titles = [{"type": "generated", "title": title} for title in arrllmoutput]

            selected_title = {}
            if "selected_title" in existing_proj:
                selected_title = existing_proj["selected_title"]

            date = datetime.now()
            last_modified_str = date.strftime("%Y-%m-%d %H:%M:%S")
            db.child('PROJECT').child(project_id).set({
                'user_id': existing_proj["user_id"],
                'idea_title': existing_proj["idea_title"],
                'idea_desc': existing_proj["idea_desc"],
                'date_created': existing_proj["date_created"],
                'last_modified': last_modified_str,
                'suggested_titles': titles,
                'selected_title': selected_title
            })

            return jsonify({"success": "True", "message": f"Successfull generated titles for project: {project_id}", "titles": titles}), 200
        else:
            return jsonify({"success": "False", "message": "Missing project id"}), 413
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500


@app.route('/apis/finalize_questions/<project_id>', methods=['POST'])
def finalize_questions(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    # frontend will send in array of json format { 'selected_questions': [{'type':'generated or custom', 'question':'selected question'} , ... ] }
    selected_questions = data.get('selected_questions')
    
    try:
        if(project_id and selected_questions and user_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 413
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            
            date = datetime.now()
            last_modified_str = date.strftime("%Y-%m-%d %H:%M:%S")
            db.child('PROJECT').child(project_id).set({
                'user_id': existing_proj["user_id"],
                'idea_title': existing_proj["idea_title"],
                'idea_desc': existing_proj["idea_desc"],
                'date_created': existing_proj["date_created"],
                'last_modified': last_modified_str,
                'suggested_titles': existing_proj["suggested_titles"],
                'selected_title': existing_proj["selected_title"],
                'suggested_questions': existing_proj["suggested_questions"],
                'selected_questions': selected_questions,
            })

            return jsonify({"success": "True", "message": f"Successfully finalized questions for project: {project_id}", "questions": selected_questions}), 200
        else:
            return jsonify({"success": "False", "message": "Missing input(s)"}), 413
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500
    

@app.route('/apis/get_questions/<project_id>', methods=['POST'])
def get_questions(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    try:
        if(project_id and user_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 404
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            if not existing_proj["suggested_questions"]:
                return jsonify({"success": "False", "message": f"Project {project_id} has not been suggested any questions"}), 413
            
            return jsonify({"success": "True", "message": f"Successfull retrieved questions for project: {project_id}", "questions": existing_proj["suggested_questions"]}), 200
    
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500



@app.route('/apis/gen_ques/<project_id>', methods=['POST'])
def gen_ques(project_id):
    data = request.get_json()
    user_id = data.get("user_id")
    
    try:
        if(project_id and user_id):
            existing_proj = db.child("PROJECT").child(project_id).get()
            if not existing_proj:
                return jsonify({"success": "False", "message": f"Project {project_id} does not exist"}), 413
            if existing_proj["user_id"] != user_id:
                return jsonify({"success": "False", "message": f"Unauthorized Access, Project {project_id} not owned by the user {user_id}"}), 401
            
            if "selected_title" in existing_proj:
                selected_title = existing_proj["selected_title"]
            else:
                return jsonify({"success": "False", "message": f"selected title missing for the project : {project_id} in database"}), 413
            if "idea_desc" in existing_proj:
                idea_desc = existing_proj["idea_desc"]
            else:
                return jsonify({"success": "False", "message": f"idea desc missing for the project : {project_id} in database"}), 413

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a scriptwriting assistant, and your task is to generate 5 concise, engaging questions based on the provided video title and idea description. These questions should reflect potential viewers' expectations, concerns, and reasons to watch the video. Assume the role of a curious viewer who is considering watching the video and wants to know what value it offers."
                    },
                    { 
                        "role": "user", 
                        "content": f"""
                            
                            Instructions:
                            Imagine you're a viewer about to click on the video. Based on the title and description, think about what key questions or concerns you would have.
                            Generate 5 distinct and concise questions that reflect a viewer's curiosity.
                            The output must only contain short, distinct questions—no explanations or additional information. Each question should be clear and simple.
                            Format the output exactly as a Python list of strings, with each question as a separate string.
                            Video title: {selected_title}
                            Idea description: {idea_desc}

                            Output format:
                            Return the questions as an array of strings that can be type casted using the python list function
                            Output: Only generate 5 questions in the form of an array of strings in a single line and nothing else.
                            """         
                    }
                ],
                model="llama-3.1-70b-versatile",
            )

            llmoutput = chat_completion.choices[0].message.content
            questions = ast.literal_eval(llmoutput)
            print(questions)

            selected_questions = []
            if "selected_questions" in existing_proj:
                selected_questions = existing_proj["selected_questions"]

            date = datetime.now()
            last_modified_str = date.strftime("%Y-%m-%d %H:%M:%S")
            db.child('PROJECT').child(project_id).set({
                'user_id': existing_proj["user_id"],
                'idea_title': existing_proj["idea_title"],
                'idea_desc': existing_proj["idea_desc"],
                'date_created': existing_proj["date_created"],
                'last_modified': last_modified_str,
                'selected_title': existing_proj["selected_title"],
                'suggested_titles': existing_proj["suggested_titles"],
                'selected_questions': selected_questions,
                'suggested_questions': questions
            })

            return jsonify({"success": "True", "message": f"Successfull generated questions for project: {project_id}", "questions": questions}), 200
        else:
            return jsonify({"success": "False", "message": "Missing project id"}), 413
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500



@app.route('/apis/createproject', methods=['POST'])
def createproject():
    data = request.get_json()
    user_id = data.get('user_id')
    idea_title = data.get('idea_title')
    idea_desc = data.get('idea_desc')
    
    try:
        if(user_id and idea_title and idea_desc):
            if(len(idea_title) <= 100 and len(idea_desc) <= 750):
                id_gen = string.ascii_letters + string.digits
                project_id = ''.join(random.choices(id_gen, k=10))
                date = datetime.now()
                date_created_str = date.strftime("%Y-%m-%d %H:%M:%S")
                last_modified_str = date.strftime("%Y-%m-%d %H:%M:%S")
                db.child('PROJECT').child(project_id).set({
                    'user_id': user_id,
                    'idea_title': idea_title,
                    'idea_desc': idea_desc,
                    'date_created': date_created_str,
                    'last_modified': last_modified_str,
                })
                
                user_data = db.child("USER").child(user_id).get()
                if "project_ids" in user_data:
                    user_projects = user_data["project_ids"]
                else:
                    user_projects = []
                user_projects.append(project_id)
                db.child('USER').child(user_id).set({
                    'channel_url': user_data["channel_url"],
                    'user_email': user_data["user_email"],
                    'user_name': user_data["user_name"],
                    'project_ids': user_projects,
                })

                return jsonify({"success": "True", "message": f"Created New Project", "project_id": project_id, "idea_title": idea_title, "idea_desc": idea_desc}), 200
            
            elif(len(idea_title) > 100 and len(idea_desc) > 750):
                return jsonify({"success": "False", "message": "Title shouldn't be longer than 100 characters and description shouldn't be longer than 750 characters"}), 413
            elif(len(idea_title) > 100):
                return jsonify({"success": "False", "message": "Title shouldn't be longer than 100 characters"}), 413
            elif(len(idea_desc) > 750):
                return jsonify({"success": "False", "message": "Description shouldn't be longer than 750 characters"}), 413
        else:
            return jsonify({"success": "False", "message": "Not a valid input, missing fields"}), 413
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500


@app.route('/apis/getfinaltitle', methods=['POST'])
def getfinaltitle():
    data = request.get_json()
    video_title = data.get('video_title')
    
    try:
        if(video_title):
            if(len(video_title) > 100):
                return jsonify({"success": "False", "message": "Title shouldn't be longer than 100 characters"}), 413
            else:
                return jsonify({"success": "True", "video_title": video_title}), 200
        else:
            return jsonify({"success": "False", "message": "Missing input"}), 413
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500
    

@app.route('/apis/retrieve_projects', methods=['POST'])
def retrieve_projects():
    user_data = request.get_json()
    user_id = user_data.get('user_id')
    try:
        if(user_id):
            all_projects = db.child("PROJECT").get()

            user_projects = []
            if all_projects:
                for project_id, project_data in all_projects.items():
                    if project_data["user_id"] == user_id:
                        project_data["project_id"] = project_id
                        user_projects.append(project_data)

            if user_projects:
                return jsonify({"success": "True", "projects": user_projects}), 200
            else:
                return jsonify({"success": "False", "message": "No projects found for the given user"}), 413
        else:
            return jsonify({"success": "False", "message": "Did not receive a valid user_id"}), 413
    
    except Exception as e:
        return jsonify({"success": "False", "message": f"An error occurred: {e}"}), 500


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