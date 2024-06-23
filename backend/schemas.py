from langchain_core.pydantic_v1 import BaseModel, Field


class Article(BaseModel):
    author: str = Field(description="the author of the article")
    title: str = Field(description="the title of the article")
    description: str = Field(description="a brief description of the article")
    content: str = Field(description="the content of the article")
    publishedAt: str = Field(description="the date the article was published")


class ArticleContent(BaseModel):
    content: str = Field(description="the content of the article")
