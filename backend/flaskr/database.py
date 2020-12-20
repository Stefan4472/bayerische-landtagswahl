import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import typing
import util


class Database:
    def __init__(
            self,
            host: str,
            user: str,
            password: str,
            database_name: str,
    ):
        self._conn = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            database=database_name,
        )
        self._cursor = self._conn.cursor()

    def get_cursor(self) -> psycopg2.extensions.cursor:
        return self._cursor

    def commit(self):
        self._conn.commit()

    def close(self):
        self._cursor.close()
        self._conn.close()

    def create_database(
            self,
            db_name: str,
    ):
        self._conn.autocommit = True
        self._cursor.execute('CREATE DATABASE ' + db_name)
        self._conn.autocommit = False

    def drop_database(
            self,
            db_name: str,
    ):
        self._conn.autocommit = True
        self._cursor.execute('DROP DATABASE IF EXISTS ' + db_name)
        self._conn.autocommit = False

    def run_script(
            self,
            script: str,
    ):
        """NOTE: cannot be used to create or drop a database"""
        self._cursor.execute(script)

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
        sql = 'INSERT INTO Wahl (Jahr) VALUES (%s) RETURNING id'
        val = (2018,)
        self._cursor.execute(sql, val)
        return self._cursor.fetchone()[0]

    def get_stimmkreis_id(
            self,
            wahl_id: int,
            stimmkreis_nr: int,
    ) -> int:
        sql = 'SELECT * FROM Stimmkreis WHERE WahlID = %s and Nummer = %s'
        values = (wahl_id, stimmkreis_nr)
        self._cursor.execute(sql, values)
        return self._cursor.fetchone()[0]

    def add_stimmkreis(
            self,
            wahl_id: int,
            stimmkreis: util.StimmKreis,
    ) -> int:
        print('Adding Stimmkreis {}'.format(stimmkreis))
        sql = 'INSERT INTO Stimmkreis (Name, Wahlkreis, Nummer, NumBerechtigter, WahlID) ' \
                'VALUES (%s, %s, %s, %s, %s) ' \
                'RETURNING id'
        # TODO:
        # - BETTER LOOKUP OF WAHLKREIS ID'S (CURRENTLY HARDCODED)\
        vals = (
            stimmkreis.name,
            stimmkreis.get_wahlkreis().value,
            stimmkreis.number,
            stimmkreis.num_eligible_voters,
            wahl_id,
        )
        self._cursor.execute(sql, vals)
        return self._cursor.fetchone()[0]

    def has_party(
            self,
            party_name: str,
    ) -> bool:
        sql = 'SELECT * FROM Partei where ParteiName = %s'
        values = (party_name,)
        self._cursor.execute(sql, values)
        return bool(self._cursor.fetchall())

    def get_party_id(
            self,
            party_name: str,
    ) -> int:
        sql = 'SELECT * FROM Partei where ParteiName = %s'
        values = (party_name,)
        self._cursor.execute(sql, values)
        return self._cursor.fetchone()[0]

    def add_party(
            self,
            party_name: str,
    ) -> int:
        print('Adding Party {}'.format(party_name))
        sql = 'INSERT INTO Partei (ParteiName) VALUES (%s) RETURNING id'
        vals = (party_name,)
        self._cursor.execute(sql, vals)
        return self._cursor.fetchone()[0]

    def add_party_to_election(
            self,
            party_id: int,
            wahl_id: int,
    ):
        sql = 'INSERT INTO ParteiZuWahl (Partei, WahlID) VALUES (%s, %s)'
        vals = (party_id, wahl_id,)
        self._cursor.execute(sql, vals)

    def add_candidate(
            self,
            wahl_id: int,
            candidate: util.Candidate,
            party_id: int,
    ) -> int:
        print('Adding Candidate {}'.format(candidate))
        # Add Candidate information to the 'Kandidat' table
        sql = 'INSERT INTO Kandidat (VorName, Nachname, Partei, WahlID, Wahlkreis) ' \
                'VALUES (%s, %s, %s, %s, %s) ' \
                'RETURNING id'
        vals = (
            candidate.first_name,
            candidate.last_name,
            party_id,
            wahl_id,
            candidate.wahlkreis.value,
        )
        self._cursor.execute(sql, vals)
        # Record ID given to candidate in the table
        candidate_id = self._cursor.fetchone()[0]
        # If candidate is a direct candidate, record their stimmkreis
        # in the 'DKandidatZuStimmkreis' table
        if candidate.is_direct:
            # Look up the ID of the candidate's stimmkreis
            stimmkreis_id = self.get_stimmkreis_id(
                wahl_id,
                candidate.direct_stimmkreis,
            )
            # Create mapping
            sql = 'INSERT INTO DKandidatZuStimmkreis (Kandidat, Stimmkreis) ' \
                    'VALUES (%s, %s)'
            vals = (
                candidate_id,
                stimmkreis_id,
            )
            self._cursor.execute(sql, vals)
        return candidate_id

    def generate_erst_stimmen(
            self,
            wahl_id: int,
            candidate_id: int,
            stimmkreis_id: int,
            num_votes: int,
            is_valid: bool = True,
    ):
        if is_valid:
            self._bulk_insert(
                'Erststimme',
                ('Kandidat', 'Stimmkreis', 'Wahl'),
                (candidate_id, stimmkreis_id, wahl_id),
                num_votes,
            )
        else:
            self._bulk_insert(
                'Erststimme',
                ('Kandidat', 'Stimmkreis', 'Wahl', 'IsValid'),
                (candidate_id, stimmkreis_id, wahl_id, False),
                num_votes,
            )

    def generate_zweit_stimmen(
            self,
            wahl_id: int,
            candidate_id: int,
            stimmkreis_id: int,
            num_votes: int,
            is_valid: bool = True,
    ):
        if is_valid:
            self._bulk_insert(
                'Zweitstimme',
                ('Kandidat', 'Stimmkreis', 'Wahl'),
                (candidate_id, stimmkreis_id, wahl_id),
                num_votes,
            )
        else:
            self._bulk_insert(
                'Zweitstimme',
                ('Kandidat', 'Stimmkreis', 'Wahl', 'IsValid'),
                (candidate_id, stimmkreis_id, wahl_id, False),
                num_votes,
            )

    def generate_zweit_stimmen_ohne_kandidat(
            self,
            wahl_id: int,
            party_id: int,
            stimmkreis_id: int,
            num_votes: int,
    ):
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
        print('Inserting {} values'.format(num_inserts))
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


