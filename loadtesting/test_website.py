from locust import HttpUser, task
"""Run on port 3000 (React)"""


class WebsiteUser(HttpUser):
    @task(25)
    def homepage(self):
        self.client.get('/')

    @task(25)
    def mitglieder(self):
        self.client.get('/#/mitglieder')

    @task(10)
    def sitzverteilung(self):
        self.client.get('/#/stimmkreise')


    @task(10)
    def ueberhangmandate(self):
        self.client.get('/#/ueberhangmandate')

    @task(10)
    def stimmkreis_sieger(self):
        self.client.get('/#/sieger')
