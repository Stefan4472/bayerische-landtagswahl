import requests
import string
import random


def generate_key() -> str:
    """https://stackoverflow.com/a/2257449"""
    return ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(64))


key = generate_key()
print(key)
result = requests.post(
    'http://127.0.0.1:5000/api/voting/',
    json={
        'key': key,
        'wahl_id': 1,
        'stimmkreis_nr': 101,
    }
)
print(result)
