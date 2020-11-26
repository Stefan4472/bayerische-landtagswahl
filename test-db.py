import mysql.connector

mydb = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='landtagswahl'
)

with open('schema.sql') as f:
    schema_script = f.read()

mycursor = mydb.cursor()
mycursor.execute(schema_script, multi=True)

# Insert
sql = 'INSERT INTO Kandidaten (vorname, nachname) VALUES (%s, %s)'
val = ('Vlad', 'Kolesnykov')
mycursor.execute(sql, val)

mydb.commit()

# Select
mycursor.execute('SELECT * FROM Kandidaten')
for record in mycursor.fetchall():
  print(record)