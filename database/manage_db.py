import click
import pathlib
import time
from landtagswahldb import database as db
from landtagswahldb import data_parser
from landtagswahldb import data_importer


@click.group()
def click_cli():
    """Create the command group for the Click command-line interface."""
    pass


# TODO: REQUIRE PASSWORD INPUT AS PROMPT
@click_cli.command(name='reset')
@click.argument('filepath', type=click.Path(exists=True, readable=True))
@click.option('--host', type=str, default='localhost')
@click.option('--user', type=str, default='postgres')
@click.option('--password', type=str, required=True, prompt=True, hide_input=True)
@click.option('--db_name', type=str, required=True)
def cmd_reset_database(
        filepath: str,
        host: str,
        user: str,
        password: str,
        db_name: str,
):
    with open(filepath) as sql_file:
        schema_script = sql_file.read()

    # Connect to the default database
    database = db.Database(
        host,
        user,
        password,
        'postgres',
        'dev',
    )

    # Drop and then create the desired database
    database.drop_database(db_name)
    database.create_database(db_name)

    # Disconnect
    database.close()

    # Reconnect, this time to the reset-database
    database = db.Database(
        host,
        user,
        password,
        db_name,
        'dev',
    )
    database.run_script(schema_script)
    database.commit()
    click.echo('Done')


@click_cli.command(name='runscript')
@click.argument('filepath', type=click.Path(exists=True, readable=True))
@click.option('--host', type=str, default='localhost')
@click.option('--user', type=str, default='postgres')
@click.option('--password', type=str, required=True, prompt=True, hide_input=True)
@click.option('--db_name', type=str, required=True)
def cmd_reset_database(
        filepath: str,
        host: str,
        user: str,
        password: str,
        db_name: str,
):
    with open(filepath) as sql_file:
        script = sql_file.read()

    # Connect to the database
    database = db.Database(
        host,
        user,
        password,
        db_name,
        'dev',
    )

    # Run script, commit, then close connection
    database.run_script(script)
    database.commit()
    database.close()
    click.echo('Done')


@click_cli.command(name='import_data')
@click.argument('info_path', type=click.Path(exists=True, readable=True))
@click.argument('results_path', type=click.Path(exists=True, readable=True))
@click.option('--year', type=int, required=True)
@click.option('--password', type=str, required=True, prompt=True, hide_input=True)
@click.option('--db_name', type=str, required=True)
@click.option('--host', type=str, default='localhost')
@click.option('--user', type=str, default='postgres')
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
        db_name,
        'dev',
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


if __name__ == '__main__':
    click_cli()
