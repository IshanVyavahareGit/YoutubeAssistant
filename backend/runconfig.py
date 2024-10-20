from groq import Groq
import asyncio
import requests
import json
import os
from tavily import TavilyClient

def run_groq_tavily_setup():
    os.environ["GROQ_API_KEY"] = "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"
    os.environ["TAVILY_API_KEY"] = "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"
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    tavily_client = TavilyClient(api_key=os.environ.get("TAVILY_API_KEY"))
    return {"groq_client": client, "tavily_client": tavily_client}