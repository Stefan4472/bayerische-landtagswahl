import random
import time
from locust import HttpUser, task

'''
Locustfile for Homework #7. This exercises most of the API.
'''

# List of all Stimmkreis numbers in 2018
STIMMKREISE_2018 = [
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
    201, 202, 203, 204, 205, 206, 207, 208, 209,
    301, 302, 303, 304, 305, 306, 307, 308,
    401, 402, 403, 404, 405, 406, 407, 408,
    501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512,
    601, 602, 603, 604, 605, 606, 607, 608, 609, 610,
    701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713,
]


# Average time to wait between requests by a user
WAIT_TIME_SEC = 1.0


def randwait(avg_time: float) -> float:
    return random.uniform(0.8 * avg_time, 1.2 * avg_time)


class APIUser(HttpUser):
    @task(25)
    def stimmkreis(self):
        time.sleep(randwait(WAIT_TIME_SEC))
        stimmkreis_nr = random.choice(STIMMKREISE_2018)
        self.client.get(
            '/api/results/2018/stimmkreis/{}'.format(stimmkreis_nr),
            name='/api/results/2018/stimmkreis',
        )

    @task(10)
    def sitzverteilung(self):
        time.sleep(randwait(WAIT_TIME_SEC))
        self.client.get('/api/results/2018/sitzverteilung')

    @task(25)
    def mitglieder(self):
        time.sleep(randwait(WAIT_TIME_SEC))
        self.client.get('/api/results/2018/mitglieder')

    @task(10)
    def ueberhangmandate(self):
        time.sleep(randwait(WAIT_TIME_SEC))
        self.client.get('/api/results/2018/ueberhangmandate')

    @task(10)
    def stimmkreis_sieger(self):
        time.sleep(randwait(WAIT_TIME_SEC))
        self.client.get('/api/results/2018/stimmkreis-sieger')

    # TODO: Q6
