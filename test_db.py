import mysql.connector

def run_db_test(
    host: str,
    user: str,
    password: str,
    database: str,
):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

    # with open('schema.sql') as f:
    #     schema_script = f.read()

    mycursor = mydb.cursor()
    # mycursor.execute(schema_script, multi=True)

    # # Insert
    # sql = 'INSERT INTO Wahl (jahr) VALUES (%s)'
    # val = (2018,)
    # mycursor.execute(sql, val)

    # sql = 'INSERT INTO Kandidaten (id, vorname, nachname) VALUES (%s, %s, %s)'
    # val = (1, 'Vlad', 'Kolesnykov')
    # mycursor.execute(sql, val)

    # mydb.commit()

    # Select
    mycursor.execute('SELECT * FROM Kandidaten')
    for record in mycursor.fetchall():
        print(record)