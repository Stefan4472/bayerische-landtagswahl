*Note: assumes the Flask backend is running on `localhost:5000`.*

Run the API tests for Homework #7:
```
locust -f test_api_hw7.py
```

Now open the Locust interface in your browser: `http://localhost:8089/`. For `Host`, enter `127.0.0.1:5000`. Then enter other parameters as desired, and begin the test.