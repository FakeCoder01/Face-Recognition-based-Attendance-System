import psycopg2

# Connect to the database
conn = psycopg2.connect(database="fakecoder_postgres", user="fakecoder", password="FakeCoder01", host="localhost", port="5432")

# Create a table to store user information
cur = conn.cursor()
cur.execute('''CREATE TABLE users
               (id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email VARCHAR(50) NOT NULL,
                image BYTEA NOT NULL);''')

# Create a table to store attendance records
cur.execute('''CREATE TABLE attendance
               (id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                date DATE NOT NULL,
                status TEXT NOT NULL);''')

conn.commit()
conn.close()
