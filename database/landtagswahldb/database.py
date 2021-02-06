import psycopg2
import psycopg2.pool
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import typing
import hashlib
from . import util
from . import database_dtos as dto


class Database:
    def __init__(
            self,
            host: str,
            user: str,
            password: str,
            database_name: str,
            secret_key: str,
            conn=None,
    ):
        """Postgres database utility class.

        Note: automatically hashes voter keys, using the provided secret_key
        for "encryption".
        """
        if conn:
            self._conn = conn
        else:
            self._conn = psycopg2.connect(
                host=host,
                user=user,
                password=password,
                database=database_name,
            )
        self._secret_key = secret_key
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

    def _hash_voterkey(
            self,
            voterkey: str,
    ) -> str:
        return hashlib.sha1((voterkey + self._secret_key).encode('utf-8')).hexdigest()

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
        result = self._cursor.fetchone()
        if result:
            return result[0]
        else:
            raise ValueError('Provided `wahl_year` ({}) does not exist in database'.format(wahl_year))

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

    def get_wahl_jahre(self) -> list[int]:
        query = 'SELECT Jahr ' \
                'FROM Wahl ' \
                'ORDER BY Jahr ASC'
        self._cursor.execute(query)
        return [int(rec[0]) for rec in self._cursor.fetchall()]

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

    def get_stimmkreis(
            self,
            stimmkreis_id: int,
    ) -> dto.StimmkreisInfo:
        query = 'SELECT id, name, nummer ' \
                'FROM Stimmkreis ' \
                'WHERE ID = %s'
        values = (stimmkreis_id,)
        self._cursor.execute(query, values)
        result = self._cursor.fetchone()
        if result:
            return dto.StimmkreisInfo(result[0], result[1], result[2])
        else:
            raise ValueError('Provided `stimmkreis_id` ({}) does not exist in database'.format(
                stimmkreis_id,
            ))

    # TODO: SHOULD THE OBJECT THAT GOES IN BE THE SAME AS THE OBJECT THAT COMES OUT?
    def get_stimmkreise(
            self,
            wahl_id: int,
    ) -> list[dto.StimmkreisInfo]:
        """Return basic information about all Stimmkreise for the specified
        `wahl_id`.
        """
        query = 'SELECT id, name, nummer ' \
                'FROM Stimmkreis ' \
                'WHERE WahlID = %s ' \
                'ORDER BY Nummer ASC'
        values = (wahl_id,)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.StimmkreisInfo(rec[0], rec[1], rec[2]) for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_stimmkreis_id(
            self,
            wahl_id: int,
            stimmkreis_nr: int,
    ) -> int:
        query = 'SELECT * FROM Stimmkreis ' \
                'WHERE WahlID = %s AND Nummer = %s'
        values = (wahl_id, stimmkreis_nr)
        self._cursor.execute(query, values)
        result = self._cursor.fetchone()
        if result:
            return result[0]
        else:
            raise ValueError('Provided `wahl_id`, `stimmkreis_nr` pair ({}, {}) does not exist in database'.format(wahl_id, stimmkreis_nr))

    def get_stimmkreis_turnout(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> float:
        query = 'SELECT wahlbeteiligung ' \
                'FROM WahlbeteiligungUI ' \
                'WHERE WahlID = %s AND StimmkreisID = %s'
        values = (wahl_id, stimmkreis_id)
        self._cursor.execute(query, values)
        result = self._cursor.fetchone()
        if result:
            return float(result[0])
        else:
            raise ValueError('Provided `wahl_id`, `stimmkreis_id` pair ({}, {}) does not exist in database'.format(wahl_id, stimmkreis_id))

    def get_stimmkreis_winner(
            self,
            wahl_id: int,
            stimmkreis_nr: int,
    ) -> dto.StimmkreisWinner:
        query = 'SELECT vorname, nachname, parteiname ' \
                'FROM DirektkandidatenUI ' \
                'WHERE WahlID = %s AND StimmkreisNr = %s'
        values = (wahl_id, stimmkreis_nr)
        self._cursor.execute(query, values)
        result = self._cursor.fetchone()
        if result:
            return dto.StimmkreisWinner(result[0], result[1], result[2])
        else:
            raise ValueError('Provided `wahl_id`, `stimmkreis_id` pair ({}, {}) does not exist in database'.format(wahl_id, stimmkreis_id))

    def get_stimmkreis_erststimmen(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> list[dto.StimmkreisErststimmen]:
        query = 'SELECT parteiname, vorname, nachname, anzahl ' \
                'FROM ErststimmenKandidatStimmkreisUI ' \
                'WHERE WahlID = %s AND stimmkreis = %s'
        values = (wahl_id, stimmkreis_id)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.StimmkreisErststimmen(rec[0], rec[1], rec[2], int(rec[3]))
                    for rec in result]
        else:
            raise ValueError('Provided `wahl_id`, `stimmkreis_id` pair ({}, {}) does not exist in database'.format(wahl_id, stimmkreis_id))

    def get_stimmkreis_gesamtstimmen(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> list[dto.StimmkreisGesamtstimmen]:
        query = 'SELECT parteiname, gesamtstimmen, prozent ' \
                'FROM Gesamtstimmen_Partei_StimmkreisUI ' \
                'WHERE WahlID = %s AND StimmkreisID = %s'
        values = (wahl_id, stimmkreis_id)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.StimmkreisGesamtstimmen(rec[0], int(rec[1]), float(rec[2]))
                    for rec in result]
        else:
            raise ValueError('Provided `wahl_id`, `stimmkreis_id` pair ({}, {}) does not exist in database'.format(wahl_id, stimmkreis_id))

    def get_stimmkreis_change(
            self,
            wahl_jahr: int,
            stimmkreis_id: int,
    ) -> typing.Optional[dict[str, float]]:
        # TODO: DON'T HARDCODE THE YEARS
        if wahl_jahr == 2018:
            query = 'SELECT ParteiName, Diferenz ' \
                    'FROM Entwicklung_Stimmen_2018_zum_2013UI ' \
                    'WHERE StimmkreisID = %s'
            values = (stimmkreis_id,)
            self._cursor.execute(query, values)
            result = self._cursor.fetchall()
            if result:
                return {rec[0]: float(rec[1]) for rec in result}
            else:
                raise ValueError('Provided `stimmkreis_id` ({}) does not exist in database'.format(stimmkreis_id))
        else:
            return None

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
        result = self._cursor.fetchone()
        if result:
            return result[0]
        else:
            raise ValueError('Provided `party_name` ({}) does not exist in database'.format(party_name))

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
    ) -> list[dto.Sitzverteilung]:
        """Returns party name -> number of seats. Only lists those parties
        that won at least one seat."""
        # TODO: ACCOUNT FOR WAHL_ID
        query = 'SELECT parteiname, anzahl_der_sitze ' \
                'FROM Sitzverteilung ' \
                'WHERE WahlID = %s'
        vals = (wahl_id,)
        self._cursor.execute(query, vals)
        result = self._cursor.fetchall()
        if result:
            return [dto.Sitzverteilung(rec[0], rec[1]) for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_mitglieder(
            self,
            wahl_id: int,
    ) -> list[dto.Mitglied]:
        """Returns party name -> number of seats. Only lists those parties
        that won at least one seat."""
        self._cursor.execute('SELECT * FROM Mitglieder_des_LandtagesUI')
        # print([d[0] for d in self._cursor.description])
        query = 'SELECT Vorname, Nachname, Partei, Wahlkreis, Direktkandidat, StimmkreisNr, Stimmkreis ' \
                'FROM Mitglieder_des_LandtagesUI ' \
                'WHERE WahlID = %s' \
                'ORDER BY nachname'
        vals = (wahl_id,)
        self._cursor.execute(query, vals)
        result = self._cursor.fetchall()
        if result:
            return [dto.Mitglied(rec[0], rec[1], rec[2], rec[3], bool(rec[4]), rec[5], rec[6]) for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_ueberhangmandate(
            self,
            wahl_id: int,
    ):
        query = 'SELECT ParteiName, Wahlkreis, sitze, ueberhangmandate, ausgleichsmandate ' \
                'FROM UeberhangmandateUI ' \
                'WHERE WahlID = %s ' \
                'ORDER BY Wahlkreisid, sitze DESC'
        vals = (wahl_id,)
        self._cursor.execute(query, vals)
        result = self._cursor.fetchall()
        if result:
            return [dto.Ueberhangmandat(rec[0], rec[1], int(rec[2]), int(rec[3]), int(rec[4])) for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_stimmkreis_sieger(
            self,
            wahl_id: int,
    ) -> list[dto.StimmkreisSieger]:
        query = 'SELECT Wahlkreis, Stimmkreis, StimmkreisNr, ParteiName, Erststimmen, Zweitstimmen, Prozent ' \
                'FROM StimmkreissiegerUI ' \
                'WHERE WahlID = %s' \
                'ORDER BY StimmkreisNr'
        vals = (wahl_id,)
        self._cursor.execute(query, vals)
        # print([d[0] for d in self._cursor.description])
        result = self._cursor.fetchall()
        if result:
            return [dto.StimmkreisSieger(rec[0], rec[1], int(rec[2]), rec[3], int(rec[4]), int(rec[5]), float(round(rec[6], 1)))
                    for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_knappste_sieger(
            self,
            wahl_id: int,
    ):
        query = 'SELECT Stimmkreis, StimmkreisNr, ParteiName, Vorname, Nachname, Vorsprung ' \
                'FROM KnappsteSiegerUI ' \
                'WHERE WahlID = %s'
        values = (wahl_id,)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.KnappsteSieger(rec[0], int(rec[1]), rec[2], rec[3], rec[4], int(rec[5]))
                    for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_knappste_verlierer(
            self,
            wahl_id: int,
    ):
        query = 'SELECT Stimmkreis, StimmkreisNr, ParteiName, Vorname, Nachname, Rueckstand ' \
                'FROM KnappsteVerliererUI ' \
                'WHERE WahlID = %s'
        values = (wahl_id,)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.KnappsteVerlierer(rec[0], int(rec[1]), rec[2], rec[3], rec[4], int(rec[5]))
                    for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_party_beststimmkreise(
        self,
        wahl_id: int,
    ):
        query = 'SELECT ParteiName, Stimmkreis, StimmkreisNr, Gesamtstimmen, Prozent ' \
                'FROM Beste_Stimmkreise_ParteiUI ' \
                'WHERE WahlID = %s'
        values = (wahl_id,)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.PartyBestStimmkreis(rec[0], rec[1], int(rec[2]), int(rec[3]), float(rec[4]))
                    for rec in result]
        else:
            raise ValueError('Provided `wahl_id` ({}) does not exist in database'.format(wahl_id))

    def get_biggest_swings(
            self,
            wahl_jahr: int,
    ) -> typing.Optional[list[dto.StimmkreisSwing]]:
        # TODO: DON'T HARDCODE THE YEARS
        if wahl_jahr == 2018:
            query = 'SELECT Stimmkreis, StimmkreisNr, Wahlkreis, change_left, change_right ' \
                    'FROM Partei_Einordnung_AnalyseUI'
            self._cursor.execute(query)
            result = self._cursor.fetchall()
            if result:
                return [dto.StimmkreisSwing(rec[0], int(rec[1]), rec[2], float(rec[3]), float(rec[4])) for rec in result]
            else:
                raise ValueError('Database error')
        else:
            return []

    def add_voter(
            self,
            voter_key: str,
            wahl_id: int,
            stimmkreis_id: int,
    ):
        query = 'INSERT INTO VoteRecords (Key, Wahl, Stimmkreis) ' \
                'VALUES (%s, %s, %s)'
        values = (self._hash_voterkey(voter_key), wahl_id, stimmkreis_id)
        self._cursor.execute(query, values)
        self.commit()

    def get_voter_info(
            self,
            voter_key: str,
    ) -> dto.VoterInfo:
        query = 'SELECT Wahl, Stimmkreis, HasVoted ' \
                'FROM VoteRecords ' \
                'WHERE Key = %s'
        values = (self._hash_voterkey(voter_key),)
        self._cursor.execute(query, values)
        result = self._cursor.fetchone()
        if result:
            return dto.VoterInfo(result[0], result[1], result[2])
        else:
            raise ValueError('Provided `voter_key` ({}) does not exist in database'.format(voter_key))

    def has_voted(
            self,
            voter_key: str,
    ) -> bool:
        query = 'SELECT HasVoted ' \
                'FROM VoteRecords ' \
                'WHERE Key = %s'
        values = (self._hash_voterkey(voter_key),)
        self._cursor.execute(query, values)
        result = self._cursor.fetchone()
        if result:
            return bool(result[0])
        else:
            raise ValueError('Provided `voter_key` ({}) does not exist in database'.format(voter_key))

    def submit_vote(
            self,
            voter_key: str,
            dcandidate_id: typing.Optional[int],
            lcandidate_id: typing.Optional[int],
            party_id: typing.Optional[int],
    ):
        if lcandidate_id and party_id:
            raise ValueError('Can\'t vote for a list candidate AND a party')

        voter_info = self.get_voter_info(voter_key)
        if voter_info.has_voted:
            raise ValueError('A vote has already been submitted for this voter key ({})'.format(voter_key))
        else:
            # Register direct vote
            if dcandidate_id:
                query = 'INSERT INTO Erststimme (Kandidat, Stimmkreis, Wahl, IsValid) ' \
                        'VALUES (%s, %s, %s, %s)'
                values = (
                    dcandidate_id,
                    voter_info.stimmkreis_id,
                    voter_info.wahl_id,
                    1,
                )
                self._cursor.execute(query, values)
                print('Inserted dcandidate values: {}'.format(values))
            else:
                # No candidate provided: register invalid vote
                query = 'INSERT INTO Erststimme (Stimmkreis, Wahl, IsValid) ' \
                        'VALUES (%s, %s, %s)'
                values = (
                    voter_info.stimmkreis_id,
                    voter_info.wahl_id,
                    0,
                )
                self._cursor.execute(query, values)
                print('Registered invalid Erststimme')
            # Register party vote
            if party_id:
                query = 'INSERT INTO ZweitstimmePartei (Partei, Stimmkreis, Wahl) ' \
                        'VALUES (%s, %s, %s)'
                values = (
                    party_id,
                    voter_info.stimmkreis_id,
                    voter_info.wahl_id,
                )
                self._cursor.execute(query, values)
                print('Inserted party vote: {}'.format(values))
            # Register list vote
            elif lcandidate_id:
                query = 'INSERT INTO Zweitstimme (Kandidat, Stimmkreis, Wahl) ' \
                        'VALUES (%s, %s, %s)'
                values = (
                    lcandidate_id,
                    voter_info.stimmkreis_id,
                    voter_info.wahl_id,
                )
                self._cursor.execute(query, values)
                print('Inserted lcandidate values: {}'.format(values))
            else:
                # No candidate provided: register invalid vote
                query = 'INSERT INTO Zweitstimme (Stimmkreis, Wahl, IsValid) ' \
                        'VALUES (%s, %s, %s)'
                values = (
                    voter_info.stimmkreis_id,
                    voter_info.wahl_id,
                    0,
                )
                self._cursor.execute(query, values)
                print('Registered invalid Zweitstimme')
            # TODO: SUPPORT PARTY-LIST VOTE

            # Mark the voterkey as having voted
            query = 'UPDATE VoteRecords ' \
                    'SET HasVoted = %s ' \
                    'WHERE Key = %s'
            values = (
                True,
                self._hash_voterkey(voter_key),
            )
            self._cursor.execute(query, values)
            self.commit()

    def get_dcandidates(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> list[dto.BallotKandidat]:
        """Return all direct candidates running for election in
        the specified election and Stimmkreis"""
        query = 'SELECT KandidatID, Parteiname, Vorname, Nachname ' \
                'FROM erststimmeWahlzettel(%s, %s)'
        values = (2018, stimmkreis_id)
        self._cursor.execute(query, values)
        # print([d[0] for d in self._cursor.description])
        result = self._cursor.fetchall()
        if result:
            return [dto.BallotKandidat(rec[0], rec[1], rec[2], rec[3])
                    for rec in result]
        else:
            raise ValueError()

    def get_lcandidates(
            self,
            wahl_id: int,
            stimmkreis_id: int,
    ) -> list[dto.BallotKandidat]:
        """Return all list candidates running for election in
        the specified election and Stimmkreis"""
        query = 'SELECT KandidatID, Parteiname, Vorname, Nachname ' \
                'FROM zweitstimmeWahlzettel(%s, %s)'
        values = (2018, stimmkreis_id)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.BallotKandidat(rec[0], rec[1], rec[2], rec[3])
                    for rec in result]
        else:
            raise ValueError()

    def get_parties(
            self,
            wahl_id: int,
    ) -> list[dto.BallotPartei]:
        # TODO: ADD AS MATERIALIZED VIEW
        query = 'SELECT Partei.ID, Partei.ParteiName ' \
                'FROM Partei ' \
                'JOIN ParteiZuWahl ON Partei.ID = ParteiZuWahl.Partei ' \
                'WHERE WahlID = %s'
        values = (wahl_id,)
        self._cursor.execute(query, values)
        result = self._cursor.fetchall()
        if result:
            return [dto.BallotPartei(int(rec[0]), rec[1]) for rec in result]
        else:
            raise ValueError()


# class SimpleDatabaseConnection:
#     def __init__(
#             self,
#             host: str,
#             user: str,
#             password: str,
#             database_name: str,
#             secret_key: str,
#     ):
#         self._conn = psycopg2.connect(
#             host=host,
#             user=user,
#             password=password,
#             database=database_name,
#         )
#
#     def open_conn(self):
#         return Database(self._conn)
#
#     def close_conn(self, db: Database):
#         db.close()


class PooledDatabaseConnection:
    def __init__(
            self,
            host: str,
            user: str,
            password: str,
            database_name: str,
            secret_key: str,
    ):
        self.host = host
        self.user = user
        self.password = password
        self.db_name = database_name
        self.secret_key = secret_key
        self._pool = psycopg2.pool.SimpleConnectionPool(
            1,
            100,
            host=host,
            user=user,
            password=password,
            database=database_name,
        )

    def open_conn(self) -> Database:
        return Database(
            self.host,
            self.user,
            self.password,
            self.db_name,
            self.secret_key,
            conn=self._pool.getconn(),
        )

    def close_conn(self, db: Database):
        self._pool.putconn(db._conn)
