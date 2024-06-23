import os
import requests
from dotenv import load_dotenv, find_dotenv
import model
import schemas

_ = load_dotenv(find_dotenv())

news_api_key = os.getenv("NEWS_API_KEY")


def fetch_real_articles(topic: str, amount: int):
    """
    Fetches real news articles from the News API
    topic: the topic to search for
    """
    response = requests.get(
        f'https://newsapi.org/v2/everything?q={topic}&apiKey={news_api_key}&pageSize={amount}&language=en')

    print(response.json())
    articles = response.json()['articles']

    extracted_keys = ['author', 'title',
                      'description', 'content', 'publishedAt']

    for article in articles:
        article['content'] = get_real_article_content(article)

    parsed_articles = [{key: d[key]
                        for key in extracted_keys if key in d} for d in articles]

    return parsed_articles


def get_real_article_content(article: dict):
    """
    Extracts the content of a real news article
    article: the article to extract the content from
    """

    prompt = f"Given the following article, write the first two paragraphs of the content:\n\n"
    prompt += f"Title: {article['title']}\n"
    prompt += f"Description: {article['description']}\n"
    prompt += f"Author: {article['author']}\n"
    prompt += f"Start of Content: {article['content']}\n\n"
    prompt += "Complete the first two paragraphs of the content. Ensure accuracy. Aim for 200 words.\n"

    response = model.query(schemas.ArticleContent, prompt)

    return response['content']


def generate_fake_article(real_article: dict):
    """
    Generates a fake news article based on the given real article
    real_article: the real article to base the fake article on
    """
    return "Fake news article"
