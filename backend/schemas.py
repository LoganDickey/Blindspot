from langchain_core.pydantic_v1 import BaseModel, Field


class Topics(BaseModel):
    topic1: str = Field(description="the first topic")
    topic2: str = Field(description="the second topic")
    topic3: str = Field(description="the third topic")
    topic4: str = Field(description="the fourth topic")
    topic5: str = Field(description="the fifth topic")


class Article(BaseModel):
    author: str = Field(description="the author of the article")
    title: str = Field(description="the title of the article")
    description: str = Field(description="a brief description of the article")
    content: str = Field(description="the content of the article")
    publishedAt: str = Field(
        description="the date the article was published in ISO 8601 format")


class ArticleContent(BaseModel):
    content: str = Field(description="the content of the article")
