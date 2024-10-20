from groq import Groq
import asyncio
import requests
import json
import os
import time
from tavily import TavilyClient
from colorama import Fore, Style, init
init()

os.environ["GROQ_API_KEY"] = "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"
client = Groq(api_key=os.environ.get("GROQ_API_KEY"),)
tavily_client = TavilyClient(api_key="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")

paper_urls = []
research_formatted_content = []
final_research_formatted_content = []
research_summaries = []
research_final_summary = ""
research_script = []

def get_links(query: str):
    url = "https://google.serper.dev/scholar"

    payload = json.dumps({"q": query})
    headers = {
        'X-API-KEY': 'c00f4f87570fe4a8bc6621d348db27ab370186cf',
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = response.text
    data_dict = json.loads(data)

    papers_urls = []
    try:
        for i in range(0, 10):
            research_formatted_content.append({"paper_title": data_dict["organic"][i]["title"], "paper_url": data_dict["organic"][i]["link"], "paper_publication_info": data_dict["organic"][i]["publicationInfo"], "year": data_dict["organic"][i]["year"], "paper_raw_content": ""})
            paper_urls.append(data_dict["organic"][i]["link"])
            print("Added Paper: ", data_dict["organic"][i]["link"])
    except Exception as e:
        print("Error: ", str(e))

    print(Fore.BLUE + "\n\n\n\nPapers to use:\n", research_formatted_content)
    print(Style.RESET_ALL)


    
def get_data(research_formatted_content: list):
    try:
        response = tavily_client.extract(urls=paper_urls)
        i = 0
        for output in response["results"]:
            if i == 3: break
            raw = output["raw_content"]
            if len(raw) > 50000:
                raw = raw[:50000]
            
            for formatted_output in research_formatted_content:
                if output["url"] == formatted_output["paper_url"]:
                    formatted_output["paper_raw_content"] = raw
                    print(f"Processed raw data for: {output["url"]}")
                    i += 1
                    break
        
        for formatted_output in research_formatted_content:
            if "paper_raw_content" in formatted_output and formatted_output["paper_raw_content"]:
                final_research_formatted_content.append(formatted_output)

    except Exception as e:
        print("Error: ", str(e))

    print(Fore.YELLOW +"\n\n\n\nFinal raw research content size: ", len(final_research_formatted_content))
    print(Style.RESET_ALL)
    print("\n\n\n\nRaw research content formed:\n", final_research_formatted_content)



def get_summaries(final_research_formatted_content: list, query: str):
    # print("\n\n\n\nSummaries called.....Length:\n", len(research_formatted_content))
    for i in range (0, len(final_research_formatted_content)):
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional data summarizing assistant who creates detailed summaries for the research data that is provided."
                },
                { 
                    "role": "user", 
                    "content": f"Summarize the content: {final_research_formatted_content[i]['paper_raw_content']}. Include all information related to the query {query}. Please keep it detailed and extensive. Include all relevant, interesting and unique facts. Do not create your own facts or add your own information."
                }
            ],
            model="llama-3.1-70b-versatile",
        )

        research_summaries.append(chat_completion.choices[0].message.content)

        print(Fore.BLUE + f"\n\n\n\nSummarized Research for {final_research_formatted_content[i]["paper_url"]}")
    
    print(Fore.YELLOW +f"\n\n\n\nSummaries Size: {len(research_summaries)}")
    print(Fore.GREEN +f"\n\n\n\nResearch Papers' Summaries: {research_summaries}")


def get_final_summary(research_summaries: list, query: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional data summarizing assistant who creates extensive summaries for the data that is provided."
            },
            { 
                "role": "user", 
                "content": f"Summarize the content: {research_summaries}. Include all information related to the query {query}. Please keep it as informative as possible. Include all relevant, interesting and unique facts. Do not create your own facts or add your own information."
            }
        ],
        model="llama-3.1-70b-versatile",
    )
    research_final_summary = chat_completion.choices[0].message.content
    print(Fore.LIGHTYELLOW_EX +f"\n\n\n\nFinal Research Summary: {research_final_summary}")



def get_script(research_final_summary: str, query: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional youtube video script writer who writes scripts which help in maximizing audience engagement."
            },
            { 
                "role": "user", 
                "content": f"Write a youtube script for a 7 minute video using the following data only: {research_final_summary} for the query {query}. You can include B-roll suggestions wherever necessary. Do not create your own facts. Include relevant information."
            }
        ],
        model="llama-3.1-70b-versatile",
    )
    print(Fore.GREEN + "\n\n\n\n\nFinal Script:")
    print(chat_completion.choices[0].message.content)
    print(Style.RESET_ALL)



query = "Technological Innovations in 2024"
get_links(query)
get_data(research_formatted_content)
get_summaries(final_research_formatted_content, query)
get_final_summary(research_summaries, query)
get_script(research_final_summary, query)

