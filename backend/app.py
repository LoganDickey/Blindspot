from flask import Flask, request
from news_utils import fetch_real_articles, generate_topics, generate_fake_articles
from random import shuffle, randint

app = Flask(__name__)


@app.route("/")
def status():
    return "Blindspot Backend Online!"


@app.route("/generate_topics", methods=["GET"])
def generate_topics():
    data = request.get_json()

    topic: str = data['topic']

    return generate_topics(topic)


@app.route("/fetch_articles", methods=["GET"])
def fetch_articles():
    data = request.get_json()

    topic: str = data['topic']  # topic of the articles
    amount: int = data['amount']  # number of articles to fetch
    difficulty: int = data['difficulty']  # difficulty of spotting fake (1-10)

    if amount < 1:
        return {"error": "Amount of articles must be greater than 0"}

    real_article_amount = randint(1, amount)
    fake_article_amount = amount - real_article_amount

    real_articles = fetch_real_articles(topic, real_article_amount)
    fake_articles = generate_fake_articles(
        topic, fake_article_amount, difficulty)

    articles = [*real_articles, *fake_articles]
    shuffle(articles)

    return articles


if __name__ == '__main__':
    app.run(port=8080)
