from flask import Flask, request, jsonify
from news_utils import fetch_real_articles, generate_topic_list, generate_fake_articles
from random import shuffle, randint
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes


@app.route("/")
def status():
    return "Blindspot Backend Online!"


@app.route("/generate_topics", methods=["POST"])
def generate_topics():
    data = request.get_json()

    topic: str = data['topic']

    return jsonify(generate_topic_list(topic))


@app.route("/fetch_articles", methods=["POST"])
def fetch_articles():
    data = request.get_json()

    topic: str = data['topic']  # topic of the articles
    amount: int = data['amount']  # number of articles to fetch
    difficulty: int = data['difficulty']  # difficulty of spotting fake (1-10)

    if amount < 1:
        return jsonify({"error": "Amount of articles must be greater than 0"})

    real_article_amount = randint(1, amount)
    fake_article_amount = amount - real_article_amount

    real_articles = fetch_real_articles(topic, real_article_amount)
    fake_articles = generate_fake_articles(
        topic, fake_article_amount, difficulty)

    articles = [*real_articles, *fake_articles]
    shuffle(articles)

    return jsonify(articles)


if __name__ == '__main__':
    app.run(port=8080)
