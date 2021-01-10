import urllib.request
import random
import time
import dataclasses as dc


@dc.dataclass
class WorkRequest:
    url: str
    fraction: float


@dc.dataclass
class Workload:
    base_url: str
    work: list[WorkRequest]
    avg_wait_sec: float
    num_requests: int


class Terminal:
    def __init__(
            self,
            workload: Workload,
    ):
        self.workload = workload

        # Determine work plan (URLs to call)
        self._work_plan = random.choices(
            [work.url for work in workload.work],
            weights=[work.fraction for work in workload.work],
            k=workload.num_requests,
        )

        self.results = {_url: [] for _url in self._work_plan}

    def run(self):
        for _url in self._work_plan:
            test_url = self.workload.base_url + _url
            print(test_url)

            start_time = time.perf_counter()
            urllib.request.urlopen(test_url)
            end_time = time.perf_counter()

            load_time = end_time - start_time
            self.results[_url].append(load_time)

            wait_time = random.uniform(0.8 * self.workload.avg_wait_sec, 1.2 * self.workload.avg_wait_sec)
            time.sleep(wait_time)
