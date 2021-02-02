import click
import requests
import string
import random


def generate_key() -> str:
    """Generates a random, 64-character string of uppercase letters and digits.

    https://stackoverflow.com/a/2257449
    """
    return ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(64))


@click.command()
@click.argument('year', type=int)
@click.argument('stimmkreis_nr', type=int)
@click.option('-n', '--num_keys', type=int, default=1)
@click.option('-a', '--address', type=str, default='http://127.0.0.1:5000')
def run(
        year: int,
        stimmkreis_nr: int,
        num_keys: int,
        address: str,
):
    """Create and register voter keys with the website.

    Example usage: generate and register 10 voter keys for the
    2018 election in Stimmkreis #105:
    `python voter_setup.py 2018 105 -n 10`
    """
    # Generate and register keys
    for _ in range(num_keys):
        key = generate_key()
        result = requests.post(
            address + '/api/voting/',
            json={
                'key': key,
                'wahl_year': year,
                'stimmkreis_nr': stimmkreis_nr,
            }
        )
        if result.status_code == 200:
            print(key)
        else:
            print('Error')


if __name__ == '__main__':
    run()
