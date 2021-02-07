A simple multi-threaded benchmarking script. 

NOTE: We are now using Locust for benchmarking. Please see the `loadtesting` directory.

Usage:
```
python benchmarker.py [WORKFILE] [NUM_THREADS] [AVG_WAIT] [NUM_REQUESTS]
```

Use `127.0.0.1` rather than `localhost` (requests go *much* faster)