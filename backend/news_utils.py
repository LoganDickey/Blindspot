import os
from random import shuffle
import requests
from dotenv import load_dotenv, find_dotenv
import model
import schemas

_ = load_dotenv(find_dotenv())

news_api_key = os.getenv("NEWS_API_KEY")


def generate_topic_list(topic: str):
    prompt = f"""# OBJECTIVE
You are given an [Initial Topic]. From this [Initial Topic], your task is to generate an ordered list of 5 topics.
The first topic should be the [Initial Topic]. If this topic is not found in the news, broaden it to a more general topic.
The second new topic should be closely related to but different from the [Initial Topic]
The third and fourth new topics should be only mildly related to the [Initial Topic]
The fifth topic should be completely different from any of the previous topics.
All topics should be broad and general, and should be something talked about on television.

# EXAMPLES

## Example 1
[Initial Topic]: Cognitive Science
[Generated Topics]: [Cognitive Science, Psychology, Psychiatry, Health, US Economy]

## Example 2
[Initial Topic]: Anime
[Generated Topics]: [Anime, Movies, Hollywood, Basketball, Technology]

## Example 3
[Initial Topic]: Stocks
[Generated Topics]: [Stocks, Business, US Politics, Environmentalism, Fashion]

## TASK
[Initial Topic]: {topic}
[Generated Topics]:
"""

    response = model.query(schemas.Topics, prompt)

    return [response[f'topic{i}'] for i in range(1, 6)]


def fetch_real_articles(topic: str, amount: int):
    """
    Fetches real news articles from the News API
    topic: the topic to search for
    """
    response = requests.get(
        f'https://newsapi.org/v2/everything?q={topic}&apiKey={news_api_key}&language=en&sortBy=relevancy')

    articles = response.json()['articles']
    shuffle(articles)
    articles = articles[:amount]

    extracted_keys = ['author', 'title',
                      'description', 'content', 'publishedAt', 'url']

    for article in articles:
        article['content'] = get_real_article_content(article)

    parsed_articles = [{**{key: d[key]
                        for key in extracted_keys if key in d}, "real": True, "difficulty": 0} for d in articles]

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


def generate_fake_articles(topic: str, amount: int, difficulty: int):
    """
    Generates fake news articles about a given topic
    topic: the topic to generate the fake articles
    amount: the number of articles to generate
    difficulty: the difficulty of the articles to generate
    """

    fake_articles = [generate_fake_article(
        topic, difficulty) for _ in range(amount)]

    return fake_articles


def generate_fake_article(topic: str, difficulty: int):
    """
    Generates fake news article about a given topic
    topic: the topic to generate the fake article
    difficulty: the difficulty of the article to generate
    """

    prompt = f"Task: Given a topic and difficulty, compose a fake news article about the topic.\n"
    prompt += f"The difficulty is between 1 and 10, where 1 is easy to spot as fake by anyone, and 10 is difficult for even experts on the topic to determine fake.\n"
    prompt += f"Choose a very specific thing to write about based on the given topic. Higher difficulties should be about more mundane things. The produced article should be as realistic as possible but still fake.\n"
    prompt += f"DO NOT write about AI, artificial intelligence, or machine learning.\n\n"
    prompt += f"The composed article should have the following fields:\n\n"
    prompt += f"Title: The title of the article. DO NOT include the words 'revolutionary', 'breakthrough', 'new', 'secret', 'hidden', or 'scientist'. Mimic the style of real article titles. Be specific.\n"
    prompt += f"Description: A one or two sentence description of the article.\n"
    prompt += f"Author: A random but believeable name of an author. Use a diverse set of names from any nationality. Do not put 'Dr.' in the name. Occasionally include multiple authors.\n"
    prompt += f"Content: The first two or three paragraphs of the article. Include line breaks between paragraphs. Make up a story about the topic that is highly believable but fake. Use realistic quotes and specific numbers. Do not reveal that the article is fake. Do not include the words 'unprecedented', 'surprising', 'unexpected', or similar. Do not begin the article with the word 'In'.\n"
    prompt += f"PublishedAt: Date the article was published in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ). Make up a date in 2024 before June.\n\n"
    prompt += f"Topic: {topic}\n"
    prompt += f"Difficulty: {difficulty}\n"

    response = model.query(schemas.Article, prompt)

    return {
        "author": response['author'],
        "title": response['title'],
        "description": response['description'],
        "content": response['content'],
        "publishedAt": response['publishedAt'],
        "difficulty": difficulty,
        "real": False,
        "url": None
    }
