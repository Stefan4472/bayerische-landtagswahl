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

results = {url: [] for url in work_plan}
for url in work_plan:
    test_url = 'http://localhost:3000/#{}'.format(url)

    start_time = time.perf_counter()
    urllib.request.urlopen(test_url)
    end_time = time.perf_counter()

    load_time = end_time - start_time
    results[url].append(load_time)

    wait_time = random.uniform(0.8 * avg_wait_sec, 1.2 * avg_wait_sec)
    time.sleep(wait_time)

print(results)
