from flask import Flask

print('hello')
app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello, World!'