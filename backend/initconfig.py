import firebase_admin
from firebase_admin import credentials, db
from pyrebase import pyrebase

# Firebase Admin SDK initialization for normal db operations
def initialize_firebase_admin():
    cred = credentials.Certificate("./nextjs-ai-agents-firebase-adminsdk-fib2s-9b27d1d7a9.json")
    firebase_admin.initialize_app(cred, {"databaseURL": "https://nextjs-ai-agents-default-rtdb.firebaseio.com/"})


# Pyrebase configuration and initialization for sign in and sign up operations
firebaseConfig = {
    "apiKey": "AIzaSyAf-6ibcHILLcvNnq5KgjykXGj_ZzNmzM8",
    "authDomain": "nextjs-ai-agents.firebaseapp.com",
    "projectId": "nextjs-ai-agents",
    "storageBucket": "nextjs-ai-agents.appspot.com",
    "messagingSenderId": "626861763274",
    "appId": "1:626861763274:web:36e38920aee26e99f56233",
    "measurementId": "G-9LT5C3QG1H",
    "databaseURL": "https://nextjs-ai-agents-default-rtdb.firebaseio.com/"
}
def initialize_pyrebase():
    firebase = pyrebase.initialize_app(firebaseConfig)
    auth = firebase.auth()
    return auth
