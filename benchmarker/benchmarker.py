# TODO: MAKE INTO ITS OWN PACKAGE
import threading
import terminal


base_url = 'http://localhost:3000/#'
all_work = [
    terminal.WorkRequest('/', 0.25),
    terminal.WorkRequest('/mitglieder', 0.10),
    terminal.WorkRequest('/stimmkreise', 0.25),
    terminal.WorkRequest('/ueberhangmandate', 0.10),
    terminal.WorkRequest('/sieger', 0.10),
    terminal.WorkRequest('/sieger', 0.20),
    # TODO: ADD KNAPPSTE-SIEGER PAGE
]
avg_wait_sec = 0.2
num_terminals = 10
num_requests_per_terminal = 5

terminals = [
    terminal.Terminal(terminal.Workload(
        base_url,
        all_work,
        avg_wait_sec,
        num_requests_per_terminal,
    )) for _ in range(num_terminals)
]

# Create and run threads
threads = [threading.Thread(target=terminal.run) for terminal in terminals]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()

print([t.results for t in terminals])
