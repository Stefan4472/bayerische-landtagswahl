import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import typing
import dataclasses as dc
import util


@dc.dataclass
class StimmkreisInfo:
    id: int
    name: str
    number: int


@dc.dataclass
class StimmkreisWinner:
    first_name: str
    last_name: str


class Database:
    def __init__(
            self,
            host: str,
            user: str,
            password: str,
            database_name: str,
    ):
        """Postgres database utility class."""
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
        """Create database with the specified name."""
        self._conn.autocommit = True
        self._cursor.execute('CREATE DATABASE ' + db_name)
        self._conn.autocommit = False

    def drop_database(
            self,
            db_name: str,
    ):
        """Drop database with the specified name.

        WARNING: you cannot drop the database you are currently connected to.
        """
        self._conn.autocommit = True
        self._cursor.execute('DROP DATABASE IF EXISTS ' + db_name)
        self._conn.autocommit = False

    def disable_triggers(
            self,
            table_name: str,
    ):
        """Disable all triggers for the specified table in the current database."""
        self._cursor.execute('ALTER TABLE {} DISABLE TRIGGER ALL'.format(table_name))

    def enable_triggers(
            self,
            table_name: str,
    ):
        """Enable all triggers for the specified table in the current database."""
        self._cursor.execute('ALTER TABLE {} ENABLE TRIGGER ALL'.format(table_name))

    def run_script(
            self,
            script: str,
    ):
        """Run the provided Postgres script, which must be SQL.

        WARNING: cannot be used to create or drop a database. For that,
        use the `create_database()` or `drop_database() methods.
        """
        self._cursor.execute(script)

    def has_wahl(
            self,
            wahl_year: int,
    ) -> bool:
        query = 'SELECT * ' \
                'FROM Wahl ' \
                'WHERE Jahr = %s'
        values = (wahl_year,)
        self._cursor.execute(query, values)
        return bool(self._cursor.fetchall())

    def get_wahl_id(
            self,
            wahl_year: int,
    ) -> int:
        query = 'SELECT * ' \
                'FROM Wahl ' \
                'WHERE Jahr = %s'
        values = (wahl_year,)
        self._cursor.execute(query, values)
        return self._cursor.fetchone()[0]

    def add_wahl(
            self,
            wahl_year: int,
    ) -> int:
        query = 'INSERT INTO Wahl (Jahr) ' \
                'VALUES (%s) ' \
                'RETURNING id'
        val = (wahl_year,)
        self._cursor.execute(query, val)
        return self._cursor.fetchone()[0]

    def add_stimmkreis(
            self,
            wahl_id: int,
            stimmkreis: util.StimmKreis,
    ) -> int:
        print('Adding Stimmkreis {}'.format(stimmkreis))
        query = 'INSERT INTO Stimmkreis (Name, Wahlkreis, Nummer, NumBerechtigter, WahlID) ' \
                'VALUES (%s, %s, %s, %s, %s) ' \
                'RETURNING id'
        # TODO: BETTER LOOKUP OF WAHLKREIS ID'S (CURRENTLY HARDCODED)\
        vals = (
            stimmkreis.name,
            stimmkreis.get_wahlkreis().value,
            stimmkreis.number,
            stimmkreis.num_eligible_voters,
            wahl_id,
        )
        self._cursor.execute(query, vals)
        return self._cursor.fetchone()[0]

    # TODO: SHOULD THE OBJECT THAT GOES IN BE THE SAME AS THE OBJECT THAT COMES OUT?
    def get_stimmkreise(
            self,
            wahl_id: int,
    ) -> list[StimmkreisInfo]:
        """Return basic information about all Stimmkreise for the specified
        `wahl_id`.
        """
        query = 'SELECT id, name, nummer ' \
                'FROM Stimmkreis ' \
                'WHERE WahlID = %s ' \
                'ORDER BY Nummer ASC'
        values = (wahl_id,)
        self._cursor.execute(query, values)
        return [StimmkreisInfo(rec[0], rec[1], rec[2]) for rec in self._cursor.fetchall()]

    def get_stimmkreis_id(
            self,
            wahl_id: int,
            stimmkreis_nr: int,
    ) -> int:
        query = 'SELECT * FROM Stimmkreis ' \
                'WHERE WahlID = %s and Nummer = %s'
        values = (wahl_id, stimmkreis_nr)
        self._cursor.execute(query, values)
        return self._cursor.fetchone()[0]

    # TODO: USE WAHL_ID
    def get_stimmkreis_turnout(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> float:
        query = 'SELECT wahlbeteiligung ' \
                'FROM WahlbeteiligungUI ' \
                'WHERE StimmkreisID = %s'
        values = (stimmkreis_id,)
        self._cursor.execute(query, values)
        return float(self._cursor.fetchone()[0])

    def get_stimmkreis_winner(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> StimmkreisWinner:
        query = 'SELECT vorname, nachname ' \
                'FROM DirektkandidatenUI ' \
                'WHERE StimmkreisID = %s'
        values = (stimmkreis_id,)
        self._cursor.execute(query, values)
        rec = self._cursor.fetchone()
        return StimmkreisWinner(rec[0], rec[1])

    def get_stimmkreis_erststimmen(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> dict[str, tuple[str, str, int]]:
        # Return dictionary indexed by party name. Tuples are
        # (firstname, lastname, numvotes)
        query = 'SELECT parteiname, vorname, nachname, anzahl ' \
                'FROM ErstimmenKandidatStimmkreisUI ' \
                'WHERE stimmkreis = %s'
        values = (stimmkreis_id,)
        self._cursor.execute(query, values)
        return {rec[0]: (rec[1], rec[2], int(rec[3])) for rec in self._cursor.fetchall()}

    def get_stimmkreis_gesamtstimmen(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> dict[str, int]:
        # Return dictionary mapping (party name: num votes)
        query = 'SELECT parteiname, gesamtstimmen ' \
                'FROM Gesamtstimmen_Partei_StimmkreisUI ' \
                'WHERE StimmkreisID = %s'
        values = (stimmkreis_id,)
        self._cursor.execute(query, values)
        return {rec[0]: int(rec[1]) for rec in self._cursor.fetchall()}

    def has_party(
            self,
            party_name: str,
    ) -> bool:
        query = 'SELECT * ' \
                'FROM Partei ' \
                'WHERE ParteiName = %s'
        values = (party_name,)
        self._cursor.execute(query, values)
        return bool(self._cursor.fetchall())

    def get_party_id(
            self,
            party_name: str,
    ) -> int:
        query = 'SELECT * ' \
                'FROM Partei ' \
                'WHERE ParteiName = %s'
        values = (party_name,)
        self._cursor.execute(query, values)
        return self._cursor.fetchone()[0]

    def add_party(
            self,
            party_name: str,
    ) -> int:
        print('Adding Party {}'.format(party_name))
        query = 'INSERT INTO Partei (ParteiName) ' \
                'VALUES (%s) ' \
                'RETURNING id'
        vals = (party_name,)
        self._cursor.execute(query, vals)
        return self._cursor.fetchone()[0]

    def add_party_to_election(
            self,
            party_id: int,
            wahl_id: int,
    ):
        query = 'INSERT INTO ParteiZuWahl (Partei, WahlID) ' \
                'VALUES (%s, %s)'
        vals = (party_id, wahl_id,)
        self._cursor.execute(query, vals)

    def add_candidate(
            self,
            wahl_id: int,
            candidate: util.Candidate,
            party_id: int,
    ) -> int:
        print('Adding Candidate {}'.format(candidate))
        # Add Candidate information to the 'Kandidat' table
        query = 'INSERT INTO Kandidat (VorName, Nachname, Partei, WahlID, Wahlkreis) ' \
                'VALUES (%s, %s, %s, %s, %s) ' \
                'RETURNING id'
        vals = (
            candidate.first_name,
            candidate.last_name,
            party_id,
            wahl_id,
            candidate.wahlkreis.value,
        )
        self._cursor.execute(query, vals)
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
            query = 'INSERT INTO DKandidatZuStimmkreis (Kandidat, Stimmkreis) ' \
                    'VALUES (%s, %s)'
            vals = (
                candidate_id,
                stimmkreis_id,
            )
            self._cursor.execute(query, vals)
        return candidate_id

    def generate_erst_stimmen(
            self,
            wahl_id: int,
            candidate_id: int,
            stimmkreis_id: int,
            num_votes: int,
            is_valid: bool = True,
    ):
        self._bulk_insert(
            'Erststimme',
            ('Kandidat', 'Stimmkreis', 'Wahl', 'IsValid'),
            (candidate_id, stimmkreis_id, wahl_id, 1 if is_valid else 0),
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
        self._bulk_insert(
            'Zweitstimme',
            ('Kandidat', 'Stimmkreis', 'Wahl', 'IsValid'),
            (candidate_id, stimmkreis_id, wahl_id, 1 if is_valid else 0),
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
            query = 'INSERT INTO {}({}) VALUES {};'.format(
                table_name,
                columns_string,
                bulk_insert,
            )
            # Execute
            self._cursor.execute(query)
        # Split the insert into a number of calls, each of size `inserts_per_call`
        else:
            inserts_remaining = num_inserts
            # Create bulk insertion string
            bulk_insert = (tuple_string + ',') * (inserts_per_call - 1) + tuple_string
            # Form SQL statement
            query = 'INSERT INTO {}({}) VALUES {};'.format(
                table_name,
                columns_string,
                bulk_insert,
            )
            # Loop
            while inserts_remaining > inserts_per_call:
                self._cursor.execute(query)
                inserts_remaining -= inserts_per_call
            # Insert the remaining number of tuples
            # Create bulk insertion string
            bulk_insert = (tuple_string + ',') * (inserts_remaining - 1) + tuple_string
            # Form SQL statement
            query = 'INSERT INTO {}({}) VALUES {};'.format(
                table_name,
                columns_string,
                bulk_insert,
            )
            # Execute
            self._cursor.execute(query)

    def get_sitz_verteilung(
            self,
            wahl_id: int,
    ) -> dict[str, int]:
        """Returns party name -> number of seats. Only lists those parties
        that won at least one seat."""
        # TODO: ACCOUNT FOR WAHL_ID
        script = 'SELECT parteiname, anzahl_der_sitze ' \
                 'FROM Sitzverteilung'
        self._cursor.execute(script)
        return {rec[0]: rec[1] for rec in self._cursor.fetchall()}

    def get_elected_candidates(
            self,
            wahl_id: int,
    ) -> list[tuple[str, str, str, str]]:
        """Returns party name -> number of seats. Only lists those parties
        that won at least one seat."""
        # TODO: ACCOUNT FOR WAHL_ID
        script = 'SELECT vorname, nachname, partei, wahlkreis ' \
                 'FROM Mitglieder_des_LandtagesUI'
        self._cursor.execute(script)
        return [(rec[0], rec[1], rec[2], rec[3]) for rec in self._cursor.fetchall()]

