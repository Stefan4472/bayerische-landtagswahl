# Command-line interface for managing our MySQL Landtagswahl database.
# Will provide functions to import election results from XML.
import click
import pathlib
import time
import database as db
import data_parser
import data_importer


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
    database = db.Database(
        host,
        user,
        password,
    )

    click.echo('Executing script..')
    database.execute_script(schema_script)
    database.commit()
    click.echo('Done')


# Note: We could use the `click.password_option()` to hide the password in console
@click_cli.command(name='import_data')
@click.argument('info_path', type=click.Path(exists=True, readable=True))
@click.argument('results_path', type=click.Path(exists=True, readable=True))
@click.option('--year', type=int, required=True)
@click.option('--password', type=str, required=True)  
@click.option('--db_name', type=str, required=True)
@click.option('--host', type=str, default='localhost')
@click.option('--user', type=str, default='root')
def cmd_import_data(
    info_path: str,
    results_path: str,
    year: int,
    host: str,
    user: str,
    password: str,
    db_name: str,
):
    click.echo('Reading xml...', nl=False)
    start_xml_time = time.time()
    # Parse xml files
    xml_info = data_parser.parse_info_xml(pathlib.Path(info_path))
    xml_results = data_parser.parse_results_xml(pathlib.Path(results_path))
    # Report results
    end_xml_time = time.time()
    click.echo('Done ({} seconds)'.format(end_xml_time - start_xml_time))

    click.echo('Connecting to database...')
    database = db.Database(
        host,
        user,
        password,
        database_name=db_name,
    )

    # TODO: WOULD BE SUPER COOL TO HAVE PROGRESS INDICATORS
    click.echo('Importing data and generating vote records...', nl=False)
    start_import_time = time.time()
    data_importer.run_import(
        database,
        xml_info,
        xml_results,
        year,
    )
    end_import_time = time.time()
    click.echo('Done ({} seconds)'.format(end_import_time - start_import_time))

    database.get_cursor().execute('SELECT * FROM Kandidat')
    print(database.get_cursor().fetchall())

if __name__ == '__main__':
    click_cli()
