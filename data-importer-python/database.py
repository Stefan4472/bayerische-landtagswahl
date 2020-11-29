import mysql.connector


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
        name: str,
        wahlkreis_id: int,
        nummer: int,
    ) -> int:
        sql = 'INSERT INTO Stimmkreis (Name, Wahlkreis, Nummer, WahlID) ' \
                'VALUES (%s, %s, %s, %s)'
        val = (name, wahlkreis_id, nummer, wahl_id,)
        self._cursor.execute(sql, val)
        self._db.commit()
        return self._cursor.lastrowid