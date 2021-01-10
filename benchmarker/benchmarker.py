import click
import threading
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


@click.command(name='run')
# @click.argument('work_file', type=click.Path(exists=True, readable=True))
@click.argument('num_terminals', type=int)
@click.argument('avg_wait', type=float)
@click.argument('requests_per_terminal', type=int)
def cmd_run_benchmark(
        # work_file: str,
        num_terminals: int,
        avg_wait: float,
        requests_per_terminal: int,
):
    # TODO: ADD KNAPPSTE-SIEGER PAGE
    urls = [
        'http://localhost:3000/#/',
        'http://localhost:3000/#/mitglieder',
        'http://localhost:3000/#/stimmkreise',
        'http://localhost:3000/#/ueberhangmandate',
        'http://localhost:3000/#/sieger',
        'http://localhost:3000/#/sieger',
    ]
    frequencies = [0.25, 0.10, 0.25, 0.10, 0.10, 0.20]
    run_benchmark(urls, frequencies, num_terminals, avg_wait, requests_per_terminal)


if __name__ == '__main__':
    cmd_run_benchmark()
