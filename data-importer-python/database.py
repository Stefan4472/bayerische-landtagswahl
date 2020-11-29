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
        self._cursor.execute(script, multi=True)
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
        database.commit()
        return self._cursor.lastrowid
