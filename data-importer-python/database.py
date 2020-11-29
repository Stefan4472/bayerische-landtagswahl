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
        print(type(self._cursor))

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