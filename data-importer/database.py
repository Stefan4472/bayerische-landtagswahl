import mysql.connector
import typing
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
        # - BETTER LOOKUP OF WAHLKREIS ID'S (CURRENTLY HARDCODED)
        vals = (
            stimmkreis.name, 
            int(stimmkreis.number / 100), 
            stimmkreis.number,
            stimmkreis.num_eligible_voters,
            wahl_id,
        )
        self._cursor.execute(sql, vals)
        return self._cursor.lastrowid

    def add_party(
        self,
        wahl_id: int,
        party_name: str,
    ) -> int:
        # print('Adding Party {}'.format(party_name))
        sql = 'INSERT INTO Partei (ParteiName, WahlID) ' \
                'VALUES (%s, %s)'
        vals = (party_name, wahl_id,)
        self._cursor.execute(sql, vals)
        return self._cursor.lastrowid

    def add_candidate(
        self,
        wahl_id: int,
        candidate: util.Candidate,
        party_id: int,
    ) -> int:
        # print('Adding Candidate {}'.format(candidate))
        sql = 'INSERT INTO Kandidat (VorName, Nachname, Partei, WahlID) ' \
                'VALUES (%s, %s, %s, %s)'
        vals = (
            candidate.first_name, 
            candidate.last_name,
            party_id,
            wahl_id,
        )
        self._cursor.execute(sql, vals)
        return self._cursor.lastrowid

    def generate_erst_stimmen(
        self,
        wahl_id: int,
        candidate_id: int,
        stimmkreis_id: int,
        num_votes: int,
    ):
        # print('Generating {} ErstStimmen for candidate {} in {}'.format(
        #     num_votes,
        #     candidate_id,
        #     stimmkreis_id,
        # ))

        self._bulk_insert(
            'Erststimme',
            ('Kandidat', 'Stimmkreis', 'Wahl'),
            (candidate_id, stimmkreis_id, wahl_id),
            num_votes,
        )

    def generate_zweit_stimmen(
        self,
        wahl_id: int,
        candidate_id: int,
        stimmkreis_id: int,
        num_votes: int,
    ):
        # print('Generating {} ZweitStimmen for candidate {} in {}'.format(
        #     num_votes,
        #     candidate_id,
        #     stimmkreis_id,
        # ))

        self._bulk_insert(
            'Zweitstimme',
            ('Kandidat', 'Stimmkreis', 'Wahl'),
            (candidate_id, stimmkreis_id, wahl_id),
            num_votes,
        )

    def generate_zweit_stimmen_ohne_kandidat(
        self,
        wahl_id: int,
        party_id: int,
        stimmkreis_id: int,
        num_votes: int,
    ):
        # print('Generating {} ZweitStimmen for party {} in {}'.format(
        #     num_votes,
        #     party_id,
        #     stimmkreis_id,
        # ))

        self._bulk_insert(
            'ZweitstimmePartei',
            ('Partei', 'Stimmkreis', 'Wahl'),
            (party_id, stimmkreis_id, wahl_id),
            num_votes,
        )

    def _bulk_insert(
        self,
        table_name: str,
        col_names: tuple[str],
        _tuple: tuple[typing.Any],
        num_inserts: int,
        inserts_per_call: typing.Optional[int] = 2000,
    ):
        """Here we do a bulk insert.
        See: https://medium.com/@benmorel/high-speed-inserts-with-mysql-9d3dcd76f723
        Note: Performance might be improved by reducing the number of tuples per insert
        TODO: IS THE `INSERTS_PER_CALL` OPTIMIZATION WORTH THE ADDED CODE COMPLEXITY?
        """
        if num_inserts == 0:
            return

        # Create string to define columns in SQL
        columns_string = ','.join(col_names)
        # Form single tuple string
        tuple_string = '(' + ','.join([str(t) for t in _tuple]) + ')'
        
        if num_inserts < inserts_per_call:
            # Create bulk insertion string
            bulk_insert = (tuple_string + ',') * (num_inserts - 1) + tuple_string
            # Form SQL statement
            sql = 'INSERT INTO {}({}) VALUES {};'.format(
                table_name,
                columns_string,
                bulk_insert,
            )
            # Execute    
            self._cursor.execute(sql)
        # Split the insert into a number of calls, each of size `inserts_per_call`
        else:
            inserts_remaining = num_inserts
            # Create bulk insertion string
            bulk_insert = (tuple_string + ',') * (inserts_per_call - 1) + tuple_string
            # Form SQL statement
            sql = 'INSERT INTO {}({}) VALUES {};'.format(
                table_name,
                columns_string,
                bulk_insert,
            )
            # Loop
            while inserts_remaining > inserts_per_call:
                self._cursor.execute(sql)
                inserts_remaining -= inserts_per_call
            # Insert the remaining number of tuples
            # Create bulk insertion string
            bulk_insert = (tuple_string + ',') * (inserts_remaining - 1) + tuple_string
            # Form SQL statement
            sql = 'INSERT INTO {}({}) VALUES {};'.format(
                table_name,
                columns_string,
                bulk_insert,
            )
            # Execute    
            self._cursor.execute(sql)

