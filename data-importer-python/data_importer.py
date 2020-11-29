import mysql.connector
import data_parser


# TODO: SOME KIND OF "ELECTION_RESULTS" CONTAINER TO AGGREGATE ALL INFO FROM INFO AND RESULTS XML (AND YEAR)
def import_data(
    info_xml: data_parser.ParsedInfoXML,
    results_xml: data_parser.ParsedResultsXML,
    year: int,
    host: str,
    user: str,
    password: str,
    db_name: str,
):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
    )

    mycursor = mydb.cursor()

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

        