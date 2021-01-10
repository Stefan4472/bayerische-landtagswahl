# TODO: MAKE INTO ITS OWN PACKAGE
import urllib.request
import time
import dataclasses as dc
import random


@dc.dataclass
class WorkRequest:
    url: str
    fraction: float


@dc.dataclass
class Workload:
    work: list[WorkRequest]
    avg_wait_sec: float


all_work = [
    WorkRequest('/', 0.25),
    WorkRequest('/mitglieder', 0.10),
    WorkRequest('/stimmkreise', 0.25),
    WorkRequest('/ueberhangmandate', 0.10),
    WorkRequest('/sieger', 0.10),
    WorkRequest('/sieger', 0.20),
    # TODO: ADD KNAPPSTE-SIEGER PAGE
]
avg_wait_sec = 0.2
# num_terminals = 10
num_requests_per_terminal = 10

# Determine work plan (URLs to call)
work_plan = random.choices(
    [work.url for work in all_work],
    weights=[work.fraction for work in all_work],
    k=num_requests_per_terminal,
)

for url in work_plan:
    start_time = time.perf_counter()
    urllib.request.urlopen('http://localhost:3000/#{}'.format(url))
    end_time = time.perf_counter()
    print('{}'.format(end_time - start_time))
