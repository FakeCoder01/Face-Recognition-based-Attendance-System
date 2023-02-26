from fastapi import FastAPI, File, UploadFile, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List, Union
import base64
from io import BytesIO, StringIO
from datetime import date
import psycopg2
import face_recognition
import numpy as np
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
import cv2, random


# Code

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Connect to the database
conn =  psycopg2.connect(
    database="fakecoder_postgres", 
    user="fakecoder", 
    password="FakeCoder01", 
    host="localhost", 
    port="5432"
)


def readBase64Images(base64_string):
    while len(base64_string) % 4 != 0:
        base64_string += "="

    decoded_string = base64.b64decode(base64_string)
    np_array = np.frombuffer(decoded_string, np.uint8)

    img_cv2 = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    # cv2.imwrite(f"img/filename_{str(random.randint(0,25))}.jpg", img_cv2)
    f_img_cv2 = cv2.cvtColor(img_cv2, cv2.COLOR_RGB2BGR)

    return f_img_cv2


# Endpoint to add new user
@app.post("/users/add")
async def add_user(name: str = Form(...), email : str= Form(...), image: UploadFile = File(...)):
    try:    
        # Read image file and convert to numpy array
    
        img_data = await image.read()
        nparr = np.frombuffer(img_data, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # Encode image as base64 string
        img_str = base64.b64encode(img_data).decode("utf-8")

        tmp_img = readBase64Images(img_str)
        if len(face_recognition.face_encodings(tmp_img)) != 1:
            return {
                "status_code" : 402,
                "message" : "Photo not valid"
            }

        # Store user information in database
        cur = conn.cursor()
        cur.execute("INSERT INTO users (name, email, image) VALUES (%s, %s, %s)", (name, email, img_data))
        conn.commit()
        return {
            "status_code" : 200,
            "message": "User added successfully"
        }
    except Exception as err:
        # print(err)
        return {
            "status_code" : 500,
            "message" : "Something went wrong"
        }


# Endpoint to get user information
@app.get("/users")
async def get_user(id: int):
    try:
        cur = conn.cursor()
        cur.execute("SELECT name, email, image FROM users WHERE id = %s", (str(id),))
        row = cur.fetchone()

        if row is None:
            return {
                "status_code" : 404,
                "message": "User not found"
            }

        name, email, img_data = row
        img_str = base64.b64encode(img_data).decode("utf-8")

        return {
            "status_code" : 200,
            "user" : {
                "id" : id,
                "name": name, 
                "email" : email,
                "image": img_str
            }
        }
    except Exception as err:
        print(err)
        return {
            "status_code" : 500,
            "message" : "Something went wrong"
        }


# Endpoint to get user information
@app.get("/all-users")
async def get_all_user():
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, image FROM users;")
        rows = cur.fetchall()

        users = []
        for row in rows:
            user_id, name, email, img_data = row
            img_str = base64.b64encode(img_data).decode("utf-8")

            users.append({
                "id" : user_id,
                "name" : name,
                "email" : email,
                "image" : img_str
            })

        return {
            "status_code" : 200,
            "users" : users
        }
    except Exception as err:
        print(err)
        return {
            "status_code" : 500,
            "message" : "Something went wrong"
        }


# Endpoint to get attendance records for a user
@app.get("/attendance")
async def get_attendance(id: int):
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE id = %s", (str(id),))
        total = cur.fetchall()
        if len(total) != 1:
            return {
                "status_code" : 404,
                "message": "User not found"
            }

        cur.execute("SELECT date, status FROM attendance WHERE user_id = %s", (str(id),))
        rows = cur.fetchall()

        attendance_records = [{
            "date": row[0], 
            "status": row[1]
        } for row in rows]

        return {
            "status_code" : 200,
            "attendance": attendance_records
        }
    except Exception as err:
        print(err)
        return {
            "status_code" : 500,
            "message": "Something went wrong"
        }   


# Render Add User
@app.get('/add-user', response_class=HTMLResponse)
def add_user_form(request: Request):
    context = {
        "request" : request
    }
    return templates.TemplateResponse('add-user.html', context)


# Render Add User
@app.get('/verify', response_class=HTMLResponse)
def verify_user(request: Request):
    context = {
        "request" : request
    }
    return templates.TemplateResponse('main.html', context)


# Render See User Attendance
@app.get('/dash/{id}', response_class=HTMLResponse)
def user_details(request: Request, id: int):
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT name, email, image FROM users WHERE id ={str(id)};")
        row = cur.fetchone()
        if row is not None:
            name, email, img_data = row
            img_str = base64.b64encode(img_data).decode("utf-8")
            context = {
                "request" : request,
                "user" : {
                    "name" : name,
                    "email" : email,
                    "image" : img_str
                },
                "user_id" : id
            }
            return templates.TemplateResponse('attendance.html', context)
        return {
            "status_code" : 404,
            "message" : "User id not found",
        }    
    except Exception as err:
        print(err)
        return {"error" : "something_went_wrong"}    


# Render All user list page
@app.get('/', response_class=HTMLResponse)
def home_page(request: Request):
    # cur.execute("TRUNCATE TABLE users;")
    context = {
        "request" : request
    }
    return templates.TemplateResponse('index.html', context)


# Endpoint to mark attendance
@app.post("/attendance")
async def mark_attendance(image_data: str = File(...)):
    try:
        # Load user images from database
        cur = conn.cursor()
        cur.execute("SELECT id, image FROM users;")
        rows = cur.fetchall()
        user_ids = []
        known_face_encodings = []
        for row in rows:
            user_id, img_data = row
            img_str = base64.b64encode(img_data).decode("utf-8")
            if(user_id == '' or img_str == ''):
                continue
            user_ids.append(user_id)
            tmp_img = readBase64Images(img_str)
            encode = face_recognition.face_encodings(tmp_img)
            if len(encode) > 0:
                known_face_encodings.append(encode[0])

        image_data = image_data.replace('data:image/png;base64,', '')
        user_img = readBase64Images(image_data)    
        user_faces = face_recognition.face_locations(user_img)
        user_encodings = face_recognition.face_encodings(user_img, user_faces)

        for encoded_face, loc_face in zip(user_encodings, user_faces):
            matches = face_recognition.compare_faces(known_face_encodings, encoded_face)
            distance = face_recognition.face_distance(known_face_encodings, encoded_face)
            matchIndex = np.argmin(distance)
    
            if matches[matchIndex]:
                user_id = user_ids[matchIndex]
                # Mark attendance in the database
                cur.execute("INSERT INTO attendance (user_id, date, status) VALUES (%s, %s, %s)", (user_id, date.today(), "present"))
                conn.commit()
                cur.execute("SELECT name, email FROM users WHERE id = %s", (user_id,))
                row = cur.fetchone()
                name, email = row
                return {
                    "status_code" : 200,
                    "message" : "Attendance Marked",
                    "data" : {
                        "name" : name,
                        "email" : email,
                        "date" : str(date.today()),
                        "id" : user_id
                    }
                }
        return {
            "status_code" : 402,
            "message" : "User not matched"
        }
    except Exception as err:
        # print(err)
        return {
            "status_code" : 500,
            "message" : "Something went wrong"
        }


@app.post("/users/delete/{id}")
async def delete_user(id: int):
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM users WHERE id={str(id)};")
        row = cur.fetchone()
        if row is not None:
            cur.execute(f"DELETE FROM users WHERE id={str(id)};")
            return {
                "status_code" : 200,
                "message" : "User has been deleted"
            }
        return {
            "status_code" : 404,
            "message" : "User id not found",
        }    
    except Exception as err:
        print(err)
        return {
            "status_code" : 500,
            "message" : "Something went wrong"
        }    

@app.post("/users/update/{id}")
async def update_user(id: int, name: str = Form(...), email : str= Form(...), image: UploadFile = File(...) ):
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM users WHERE id ={str(id)};")
        row = cur.fetchone()
        if row is not None:
            img_data = await image.read()
            nparr = np.frombuffer(img_data, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img_str = base64.b64encode(img_data).decode("utf-8")
            tmp_img = readBase64Images(img_str)
            if len(face_recognition.face_encodings(tmp_img)) != 1:
                return {
                    "status_code" : 402,
                    "message" : "Photo not valid"
                }
            cur.execute("UPDATE users SET name= %s , email= %s , image = %s WHERE id= %s;", (name, email, img_data, str(id), ))
            return {
                "status_code" : 200,
                "message" : "user has been upated",
                "user" : {
                    "id" : id,
                    "name": name, 
                    "email" : email,
                    "image": img_str
                }
            }
        return{
            "status_code" : 404,
            "message" : "User id not found",
        }    
    except Exception as err:
        print(err)
        return {
            "status_code" : 500,
            "message" : "Something went wrong"
        }    
        