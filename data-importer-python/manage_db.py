# Command-line interface for managing our MySQL Landtagswahl database.
# Will provide functions to import election results from XML.
import click
import pathlib
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
    xml_info = data_parser.parse_info_xml(pathlib.Path(info_path))
    xml_results = data_parser.parse_results_xml(pathlib.Path(results_path))
    
    click.echo('Connecting to database...')
    database = db.Database(
        host,
        user,
        password,
        database_name=db_name,
    )

    data_importer.run_import(
        database,
        xml_info,
        xml_results,
        year,
    )


if __name__ == '__main__':
    click_cli()
