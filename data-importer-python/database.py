import mysql.connector
import util


class Database:
    def __init__(
        self,
        host: str,
        user: str,
        password: str,
        database_name: str = '',
    ):
        self._db = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database_name,
        )
        self._cursor = self._db.cursor()

    def get_cursor(self) -> mysql.connector.cursor.MySQLCursor:
        return self._cursor

    def execute_script(
        self,
        script: str,
    ):
        # Note: Code from StackOverflow: cursor.execute(script, multi=True) 
        # doesn't seem to work correctly.
        # NOTE: THIS DOES NOT ALLOW MULTI-LINE COMMENTS!!
        # https://stackoverflow.com/a/19159041
        import re
        statement = ''
        for line in script.splitlines():
            if re.match(r'--', line):  # ignore sql comment lines
                continue
            if not re.search(r';$', line):  # keep appending lines that don't end in ';'
                statement = statement + line
            else:  # when you get a line ending in ';' then exec statement and reset for next statement
                statement = statement + line
                #print "\n\n[DEBUG] Executing SQL statement:\n%s" % (statement)
                try:
                    self._cursor.execute(statement)
                except (mysql.connector.OperationalError, mysql.connector.ProgrammingError, mysql.connector.DatabaseError) as e:
                    print("\n[WARN] MySQLError during execute statement \n\tArgs: '{}'".format(str(e.args)))
                statement = ""
        # self._cursor.execute(script, multi=True)
        self._db.commit()

    def commit(self):
        self._db.commit()

    def has_wahl(
        self,
        wahl_year: int,
    ) -> bool:
        sql = 'SELECT * FROM Wahl where Jahr = %s'
        values = (wahl_year,)
        self._cursor.execute(sql, values)
        return bool(self._cursor.fetchall())

    def get_wahl_id(
        self,
        wahl_year: int,
    ) -> int:
        sql = 'SELECT * FROM Wahl where Jahr = %s'
        values = (wahl_year,)
        self._cursor.execute(sql, values)
        return self._cursor.fetchone()[0]

    def add_wahl(
        self,
        wahl_year: int,
    ) -> int:
        sql = 'INSERT INTO Wahl (Jahr) VALUES (%s)'
        val = (2018,)
        self._cursor.execute(sql, val)
        self._db.commit()
        return self._cursor.lastrowid

    def add_stimmkreis(
        self,
        wahl_id: int,
        stimmkreis: util.StimmKreis,
    ) -> int:
        print('Adding Stimmkreis {}'.format(stimmkreis))
        sql = 'INSERT INTO Stimmkreis (Name, Wahlkreis, Nummer, NumBerechtigter, WahlID) ' \
                'VALUES (%s, %s, %s, %s, %s)'
        # TODO:
        # - GET STIMMKREIS NAME FROM SOMEWHERE
        # - RENAME 'REGION_ID' TO 'STIMMKREIS_NR'
        # - BETTER LOOKUP OF WAHLKREIS ID'S (CURRENTLY HARDCODED)
        vals = (
            '', 
            int(stimmkreis.region_id / 100), 
            stimmkreis.region_id,
            stimmkreis.num_eligible_voters,
            wahl_id,
        )
        self._cursor.execute(sql, vals)
        self._db.commit()
        return self._cursor.lastrowid

    # TODO: REMOVE AUTOMATIC COMMIT() CALLS
    def add_party(
        self,
        wahl_id: int,
        party_name: str,
    ) -> int:
        print('Adding Party {}'.format(party_name))
        sql = 'INSERT INTO Partei (ParteiName, WahlID) ' \
                'VALUES (%s, %s)'
        vals = (party_name, wahl_id,)
        self._cursor.execute(sql, vals)
        self._db.commit()
        return self._cursor.lastrowid

    def add_candidate(
        self,
        wahl_id: int,
        candidate: util.Candidate,
        party_id: int,
    ) -> int:
        print('Adding Candidate {}'.format(candidate))
        sql = 'INSERT INTO Kandidat (VorName, Nachname, Partei, WahlID) ' \
                'VALUES (%s, %s, %s, %s)'
        vals = (
            candidate.first_name, 
            candidate.last_name,
            party_id,
            wahl_id,
        )
        self._cursor.execute(sql, vals)
        self._db.commit()
        return self._cursor.lastrowid

    def generate_erst_stimmen(
        self,
        wahl_id: int,
        candidate_id: int,
        stimmkreis_id: int,
        num_votes: int,
    ):
        print('Generating {} votes for candidate {} in {}'.format(
            num_votes,
            candidate_id,
            stimmkreis_id,
        ))

        # Here we do a bulk insert.
        # See: https://medium.com/@benmorel/high-speed-inserts-with-mysql-9d3dcd76f723
        # Note: Performance might be improved by reducing to 1000 tuples per insert
        single_tuple = '({},{},{})'.format(candidate_id, stimmkreis_id, wahl_id)
        bulk_insert = (single_tuple + ',') * (num_votes - 1) + single_tuple
        sql = 'INSERT INTO Erststimme(Kandidat, Stimmkreis, Wahl) VALUES ' + bulk_insert + ';'
        self._cursor.execute(sql)
        self._db.commit()
        print(self._cursor.lastrowid)