# Command-line interface for managing our MySQL Landtagswahl database.
# Will provide functions to import election results from XML.
import click
import mysql.connector
import test_db


@click.group()
def click_cli():
    """Create the command group for the Click command-line interface."""
    pass


# TODO: REQUIRE PASSWORD INPUT AS PROMPT
@click_cli.command(name='run_script')
@click.argument('filepath', type=click.Path(exists=True, readable=True))
@click.option('--host', type=str, default='localhost')
@click.option('--user', type=str, default='root')
@click.option('--password', type=str, required=True)  
def cmd_reset_database(
    filepath: str,
    host: str,
    user: str,
    password: str,
):
    click.echo('Reading "{}"'.format(filepath))
    with open(filepath) as sql_file:
        schema_script = sql_file.read()

    click.echo('Connecting to database...')
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
    )

    click.echo('Executing script..')
    mycursor = mydb.cursor()
    mycursor.execute(schema_script, multi=True)
    mydb.commit()
    click.echo('Done')


# Note: We could use the `click.password_option()` to hide the password in console
@click_cli.command(name='import_data')
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
    click_cli()
