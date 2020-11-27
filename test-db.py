import mysql.connector

mydb = mysql.connector.connect(
    host='localhost',
    user='root',
    password='2thaW1nD0w',
    database='landtagswahl'
)

with open('schema.sql') as f:
    schema_script = f.read()

mycursor = mydb.cursor()
mycursor.execute(schema_script, multi=True)

# Insert
sql = 'INSERT INTO Wahl (jahr) VALUES (%s)'
val = (2018,)
mycursor.execute(sql, val)

sql = 'INSERT INTO Kandidaten (id, vorname, nachname) VALUES (%s, %s, %s)'
val = (1, 'Vlad', 'Kolesnykov')
mycursor.execute(sql, val)

mydb.commit()

# Select
mycursor.execute('SELECT * FROM Kandidaten')
for record in mycursor.fetchall():
  print(record)