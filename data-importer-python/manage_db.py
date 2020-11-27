# Command-line interface for managing our MySQL Landtagswahl database.
# Will provide functions to import election results from XML.
import click
import test_db


# Note: We could use the `click.password_option()` to hide the password in console
@click.command()
@click.argument('datafile', type=click.Path(exists=True, readable=True))
@click.option('--host', type=str, default='localhost')
@click.option('--user', type=str, default='root')
@click.option('--pwd', type=str, required=True)  
@click.option('--database', type=str, required=True)
def cmd_load_datafile(
    datafile: str,
    host: str,
    user: str,
    pwd: str,
    database: str,
):
    test_db.run_db_test(host, user, pwd, database)
    click.echo('Completed database test successfully')


if __name__ == '__main__':
    cmd_load_datafile()