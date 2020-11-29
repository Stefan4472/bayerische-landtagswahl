import mysql.connector
import database as db
import data_parser


# TODO: SOME KIND OF "ELECTION_RESULTS" CONTAINER TO AGGREGATE ALL INFO FROM INFO AND RESULTS XML (AND YEAR)
def run_import(
    database: db.Database,
    info_xml: data_parser.ParsedInfoXML,
    results_xml: data_parser.ParsedResultsXML,
    year: int,
):
    cur = database.get_cursor()

    # Insert
    # sql = 'INSERT INTO Wahl (Jahr) VALUES (%s)'
    # val = (2018,)
    # cur.execute(sql, val)
    # database.commit()

    # sql = 'INSERT INTO Kandidaten (id, vorname, nachname) VALUES (%s, %s, %s)'
    # val = (1, 'Vlad', 'Kolesnykov')
    # mycursor.execute(sql, val)

    # mydb.commit()

    # Select
    cur.execute('SELECT * FROM Wahl')
    for record in cur.fetchall():
        print(record)

        