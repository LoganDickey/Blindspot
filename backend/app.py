from flask import Flask, request
from news_utils import fetch_real_articles

app = Flask(__name__)


@app.route("/")
def status():
    return "Blindspot Backend Online!"


@app.route("/fetch_articles", methods=["GET"])
def fetch_articles():
    data = request.get_json()
    topic: str = data['topic']
    amount: str = data['amount']

    # find the real news
    real_articles = fetch_real_articles(topic, amount)

    # use the model to make fake news

    # combine the real and fake news, randomize the order

    return real_articles


if __name__ == '__main__':
    app.run(port=8080)
