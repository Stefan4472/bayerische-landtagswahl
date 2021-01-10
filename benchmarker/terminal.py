import urllib.request
import random
import time


class Terminal:
    def __init__(
            self,
            urls: list[str],
            frequencies: list[float],
            avg_wait_sec: float,
            num_requests: int,
    ):
        assert(len(urls) == len(frequencies))
        # Determine work plan (URLs to call)
        self._work_plan = random.choices(
            urls,
            weights=frequencies,
            k=num_requests,
        )
        self.avg_wait_sec = avg_wait_sec
        self._results: dict[str, list[float]] = \
            {_url: [] for _url in self._work_plan}

    def get_results(self) -> dict[str, list[float]]:
        return self._results

    def run(self):
        for _url in self._work_plan:
            start_time = time.perf_counter()
            urllib.request.urlopen(_url)
            end_time = time.perf_counter()

            load_time = end_time - start_time
            self._results[_url].append(load_time)

            wait_time = random.uniform(0.8 * self.avg_wait_sec, 1.2 * self.avg_wait_sec)
            time.sleep(wait_time)

