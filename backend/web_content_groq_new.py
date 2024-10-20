from groq import Groq
import asyncio
import requests
import json
import os
from colorama import Fore, Style, init
init()
from tavily import TavilyClient

os.environ["GROQ_API_KEY"] = "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"
client = Groq(api_key=os.environ.get("GROQ_API_KEY"),)
tavily_client = TavilyClient(api_key="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")

website_formatted_content = []
website_summaries = []
website_final_summary = ""
website_script = []

def get_data(query: str):
    try:
        response = tavily_client.search(query=query, search_depth="advanced", max_results=5, include_raw_content=True)
        count = 0
        for i in range (0, len(response['results'])):
            if (count < 3) and (not response['results'][i]['raw_content'] == None):
                print("\nProcessed: ", response['results'][i]['url'])
                raw_content = response['results'][i]['raw_content']
                print("Original Length Raw Content: \n", len(raw_content))
                if len(raw_content) > 50000:
                    raw_content = raw_content[:50000]
                print("New Length Raw Content: \n", len(raw_content))
                website_formatted_content.append({
                    'webpage_url': response['results'][i]['url'],
                    'webpage_title': response['results'][i]['title'],
                    'webpage_raw_content': raw_content,
                })
                count += 1
            else:
                print(Fore.RED +"Skipped: ", response['results'][i]['url'])

    except Exception as e:
        print("Error Occured: ", str(e))

    print(Fore.LIGHTMAGENTA_EX + "\n\n\n\n\nFormatted Content: \n", website_formatted_content)
    

def get_summaries(website_formatted_content: list, query: str):
    for i in range (0, len(website_formatted_content)):
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional data summarizing assistant who creates extensive summaries for the data that is provided."
                },
                { 
                    "role": "user", 
                    "content": f"Summarize the content: {website_formatted_content[i]["webpage_raw_content"]}. Include all information related to the query {query}. Please keep it as informative as possible. Include all relevant, interesting and unique facts. Do not create your own facts or add your own information."
                }
            ],
            model="llama-3.1-70b-versatile",
        )

        website_summaries.append(chat_completion.choices[0].message.content)

        print(Fore.BLUE + f"\n\n\n\nSummarized Data for {website_formatted_content[i]["webpage_url"]}")
        # print(Fore.GREEN +f"\n\n\n\nSummarized Data: {website_summaries[i]}")
        # print(Style.RESET_ALL + chat_completion.choices[0].message.content)
    
    print(Fore.GREEN +f"\n\n\n\nWebsite Summaries: {website_summaries}")


def get_final_summary(website_summaries: list, query: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional data summarizing assistant who creates extensive summaries for the data that is provided."
            },
            { 
                "role": "user", 
                "content": f"Summarize the content: {website_summaries}. Include all information related to the query {query}. Please keep it as informative as possible. Include all relevant, interesting and unique facts. Do not create your own facts or add your own information."
            }
        ],
        model="llama-3.1-70b-versatile",
    )
    website_final_summary = chat_completion.choices[0].message.content
    print(Fore.LIGHTYELLOW_EX +f"\n\n\n\nFinal Websites' Summary: {website_final_summary}")



def get_script(website_final_summary: str, query: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional youtube video script writer who writes scripts which help in maximizing audience engagement using the summary that is provided related to the query."
            },
            { 
                "role": "user", 
                "content": f"Write a youtube script for a 7 minute video using the following data only: {website_final_summary} for the query {query}. You can include B-roll suggestions wherever necessary. Do not create your own facts. Include relevant information."
            }
        ],
        model="llama-3.1-70b-versatile",
    )
    website_script = chat_completion.choices[0].message.content 
    print(Fore.GREEN + "\n\n\n\nFinal Script:", website_script)
    print(Style.RESET_ALL)


query = "Messi"
get_data(query)
get_summaries(website_formatted_content, query)
get_final_summary(website_summaries)
get_script(website_final_summary, query)
