from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

import openai
import os
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

openai.api_key = os.getenv("OPENAI_API_KEY")


model = ChatOpenAI(temperature=0.5)


def query(schema, query):
    """
    Queries the OpenAI language model with the given schema and query
    schema: the schema to use for the query
    query: the query to be used
    """
    parser = JsonOutputParser(pydantic_object=schema)

    prompt = PromptTemplate(
        template="Answer the user query.\n{format_instructions}\n{query}\n",
        input_variables=["query"],
        partial_variables={
            "format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | model | parser

    return chain.invoke({"query": query})
