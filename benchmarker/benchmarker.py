import click
import threading
import json
from terminal import Terminal


def run_benchmark(
        urls: list[str],
        frequencies: list[float],
        num_terminals: int,
        avg_wait_sec: float,
        num_requests_per_terminal: int,
):
    # Create terminals
    terminals = [
        Terminal(
            urls,
            frequencies,
            avg_wait_sec,
            num_requests_per_terminal,
        ) for _ in range(num_terminals)
    ]

    # Create and run threads
    threads = [threading.Thread(target=terminal.run) for terminal in terminals]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    # Compose results
    composed_results = {_url: [] for _url in urls}
    for terminal in terminals:
        for url, load_times in terminal.get_results().items():
            composed_results[url] += load_times
    print(composed_results)

    averages = {url: sum(load_times) / len(load_times) for url, load_times in composed_results.items()}
    print(averages)


def read_workload_file(
        filepath: str,
) -> tuple[list[str], list[float]]:
    """Reads JSON work-definition file"""
    with open(filepath) as f:
        _json = json.load(f)
        return list(_json.keys()), list(_json.values())


@click.command(name='run')
@click.argument('workfile', type=click.Path(exists=True, readable=True))
@click.argument('num_terminals', type=int)
@click.argument('avg_wait', type=float)
@click.argument('requests_per_terminal', type=int)
def cmd_run_benchmark(
        workfile: str,
        num_terminals: int,
        avg_wait: float,
        requests_per_terminal: int,
):
    # TODO: ADD KNAPPSTE-SIEGER PAGE
    urls, frequencies = read_workload_file(workfile)
    run_benchmark(
        urls,
        frequencies,
        num_terminals,
        avg_wait,
        requests_per_terminal,
    )


if __name__ == '__main__':
    cmd_run_benchmark()
