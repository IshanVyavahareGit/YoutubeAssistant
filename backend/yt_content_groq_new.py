import asyncio
import json
import os
from youtubesearchpython.__future__ import VideosSearch
from youtube_transcript_api import YouTubeTranscriptApi, _errors
from youtube_transcript_api.formatters import TextFormatter
from groq import Groq
import requests
from colorama import Fore, Style, init
init()

os.environ["GROQ_API_KEY"]="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"
client = Groq(api_key=os.environ.get("GROQ_API_KEY"),)

yt_formatted_content = []
yt_summaries = []
yt_final_summary = ""
yt_script = []

async def get_videos(searchTerm):
    videosSearch = VideosSearch(searchTerm, limit = 3)
    videosResult = await videosSearch.next()
    return videosResult

def get_data(query: str):
        try:
            ids = []
            titles = []
            links = []
            transcripts = []

            result = asyncio.run(get_videos(query))

            videos = result["result"]
            for vid in videos:
                print("Title:", vid["title"])
                print("Link:", vid["link"])
                print("ID:", vid["id"])
                print("Published Time:", vid["publishedTime"])
                print("Duration:", vid["duration"])
                print("Views:", vid["viewCount"]["text"])
                print("\n")
                ids.append(vid["id"])
                titles.append(vid["title"])
                links.append(vid["link"])

            txt_formatter = TextFormatter()
            for id, title, link in zip(ids, titles, links):
                try:
                    temp = YouTubeTranscriptApi.list_transcripts(id)
                    if 'en-US' in temp._manually_created_transcripts or 'en' in temp._generated_transcripts:
                        transcript = YouTubeTranscriptApi.get_transcript(id, languages=['en-US', 'en'])
                        print("******")
                        print(type(transcript))
                        # print(transcript.translation_languages)
                        formatted_transcript_txt = txt_formatter.format_transcript(transcript)
                    else:
                        temp2 = []
                        if len(temp._manually_created_transcripts) > 0:
                            temp2.append(next(iter(temp._manually_created_transcripts)))
                        if len(temp._generated_transcripts) > 0:
                            temp2.append(next(iter(temp._generated_transcripts)))

                        # transcript = YouTubeTranscriptApi.get_transcript(id, languages=temp2)
                        transcript = ""
                        for tmp in temp:
                            transcript = tmp.translate('en').fetch()
                            break
                        print("--------------")
                        print(type(transcript))
                        # print(transcript.translation_languages)
                        formatted_transcript_txt = txt_formatter.format_transcript(transcript)
                    
                    if(len(formatted_transcript_txt) > 50000):
                        formatted_transcript_txt = formatted_transcript_txt[:50000]
                    
                    transcripts.append(formatted_transcript_txt)
                    yt_formatted_content.append({"yt_title":title, "yt_url": link, "transcript": formatted_transcript_txt})
                    print("Success\n")

                except _errors.TranscriptsDisabled:
                    print("Transcript for video titled \"" + title + "\" doesn't exist. ID: " + id)
            
            print(Fore.LIGHTMAGENTA_EX + "\n\n\n\nFormatted YT Data:\n", yt_formatted_content)
        
        except Exception as e:
            return str(e)
    

def get_summaries(yt_formatted_content: list, query: str):
    for i in range (0, len(yt_formatted_content)):
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional data summarizing assistant who creates detailed summaries for the youtube video transcript data that is provided."
                },
                { 
                    "role": "user", 
                    "content": f"Summarize the content: {yt_formatted_content[i]["transcript"]}. Include all information related to the query {query}. Please keep it detailed and extensive. Include all relevant, interesting and unique facts. Do not create your own facts or add your own information."
                }
            ],
            model="llama-3.1-70b-versatile",
        )

        yt_summaries.append(chat_completion.choices[0].message.content)

        print(Fore.BLUE + f"\n\n\n\nSummarized Transcripts for {yt_formatted_content[i]["yt_url"]}")
    
    print(Fore.GREEN +f"\n\n\n\nTranscripts' Summaries: {yt_summaries}")


def get_final_summary(yt_summaries: list, query: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional data summarizing assistant who creates extensive summaries for the data that is provided."
            },
            { 
                "role": "user", 
                "content": f"Summarize the content: {yt_summaries}. Include all information related to the query {query}. Please keep it as informative as possible. Include all relevant, interesting and unique facts. Do not create your own facts or add your own information."
            }
        ],
        model="llama-3.1-70b-versatile",
    )
    yt_final_summary = chat_completion.choices[0].message.content
    print(Fore.LIGHTYELLOW_EX +f"\n\n\n\nFinal Websites' Summary: {yt_final_summary}")



def get_script(yt_final_summary: str, query: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional youtube video script writer who writes scripts which help in maximizing audience engagement using the summary that is provided related to the query."
            },
            { 
                "role": "user", 
                "content": f"Write a youtube script for a 7 minute video using the following data only: {yt_final_summary} for the query {query}. You can include B-roll suggestions wherever necessary. Do not create your own facts. Include relevant information."
            }
        ],
        model="llama-3.1-70b-versatile",
    )
    yt_script = chat_completion.choices[0].message.content 
    print(Fore.GREEN + "\n\n\n\nFinal Script:", yt_script)
    print(Style.RESET_ALL)


query = "2024 Italian Grand Prix"
get_data(query)
get_summaries(yt_formatted_content, query)
get_final_summary(yt_summaries, query)
get_script(yt_final_summary, query)



# class YouTubeTranscriptFetcherTool(BaseTool):
#     # "Tool that "
#     name: str = "Youtube Transcript Fetcher"
#     # def _init_(self, api_key: str):
#     #     self.api_key = api_key
#     # description: str = "A tool that fetches transcripts from the top 3 YouTube videos related to a given search query."
#     description: str = "A tool that accepts a string that contains the search query and returns a list with 3 strings. These 3 strings are transcripts of 3 videos based on the search query."

#     def _run(self, search_query: str, **kwargs) -> str:
#         try:
#             ids = []
#             titles = []
#             transcripts = []
#             # search_query = "Elon Musk net worth"

#             print("tool called...\n\n")

#             async def get_videos(searchTerm):
#                 videosSearch = VideosSearch(searchTerm, limit = 3)
#                 videosResult = await videosSearch.next()
#                 return videosResult

#             result = asyncio.run(get_videos(search_query))
#             videos = result["result"]
#             for vid in videos:
#                 print("Title:", vid["title"])
#                 print("ID:", vid["id"])
#                 print("Published Time:", vid["publishedTime"])
#                 print("Duration:", vid["duration"])
#                 print("Views:", vid["viewCount"]["text"])
#                 print("\n")
#                 ids.append(vid["id"])
#                 titles.append(vid["title"])

#             txt_formatter = TextFormatter()
#             for id, title in zip(ids, titles):
#                 try:
#                     # # print(YouTubeTranscriptApi.list_transcripts(id))
#                     # transcript = YouTubeTranscriptApi.get_transcript(id, languages=['en-US', 'en'])
#                     # formatted_transcript_txt = txt_formatter.format_transcript(transcript)
#                     # transcripts.append(formatted_transcript_txt)
#                     # f = open("./outputs/"+search_query+id+".txt", "w")
#                     # f.write(title + "\n\n\n\n" + formatted_transcript_txt)
#                     # print("Success: ", "./outputs/"+search_query+id+".txt")
#                     temp = YouTubeTranscriptApi.list_transcripts(id)
#                     if 'en-US' in temp._manually_created_transcripts or 'en' in temp._generated_transcripts:
#                         transcript = YouTubeTranscriptApi.get_transcript(id, languages=['en-US', 'en'])
#                         print("******")
#                         print(type(transcript))
#                         # print(transcript.translation_languages)
#                         formatted_transcript_txt = txt_formatter.format_transcript(transcript)
#                         transcripts.append(formatted_transcript_txt)
#                         f = open("./outputs/"+search_query+id+".txt", "w")
#                         f.write(title + "\n\n\n\n" + formatted_transcript_txt)
#                         print("Success: ", "./outputs/"+search_query+id+".txt")
#                     else:
#                         temp2 = []
#                         if len(temp._manually_created_transcripts) > 0:
#                             temp2.append(next(iter(temp._manually_created_transcripts)))
#                         if len(temp._generated_transcripts) > 0:
#                             temp2.append(next(iter(temp._generated_transcripts)))

#                         # transcript = YouTubeTranscriptApi.get_transcript(id, languages=temp2)
#                         transcript = ""
#                         for tmp in temp:
#                             transcript = tmp.translate('en').fetch()
#                             break
#                         print("--------------")
#                         print(type(transcript))
#                         # print(transcript.translation_languages)
#                         formatted_transcript_txt = txt_formatter.format_transcript(transcript)
#                         transcripts.append(formatted_transcript_txt)
#                         f = open("./outputs/"+search_query+id+".txt", "w")
#                         f.write(title + "\n\n\n\n" + formatted_transcript_txt)
#                         print("Success: ", "./outputs/"+search_query+id+".txt")
#                 except _errors.TranscriptsDisabled:
#                     print("Transcript for video titled \"" + title + "\" doesn't exist. ID: " + id)
#             # Search for YouTube videos related to the query
#             # video_ids = search_youtube(search_query, api_key=self.api_key, max_results=3)

#             # # Fetch the transcripts for the top 3 videos
#             # transcripts = []
#             # for video_id in video_ids:
#             #     transcript = YouTubeTranscriptApi.get_transcript(video_id)
#             #     full_transcript = " ".join([item['text'] for item in transcript])
#             #     transcripts.append(full_transcript)

#             # Return the transcripts as a list of strings
#             return transcripts
#         except Exception as e:
#             return str(e)

# youtube_tool = YouTubeTranscriptFetcherTool()

# # llm = Ollama(
# #     model = "llama3",
# #     base_url = "http://localhost:11434")

# youtube_transcript_fetcher = Agent(
#   role='YouTube Transcript Fetcher',
#   goal='Use the youtube transcript fetcher tool to get transcripts of youtube videos related to the given topic.',
#   backstory='You are an experienced youtube transcript fetcher with a passion for getting relevant information about the topic. You use the youtube transcript fetcher tool to get the transcripts of 3 youtube videos related to the topic. You usually do not use the tool more than once. You only use it if the information that you get from it is actually not enough. You pass a search query/string to this tool, which is used to find videos online. The transcripts that you give is used by other agents, who can not gather any extra information or use any tools. The output that you generated is directly sent to a summarizer that creates a detailed summary of the transcripts.',
# #   You make sure that the search query that you form is enough to fetch relevant videos and the transcripts contain most of the necessary information, if not all of it
#   tools=[youtube_tool],
#   llm = normal_llm,
#   verbose = True,
#   allow_delegation=False,
#   cache = False
# )

# youtube_transcript_summarizer = Agent(
#   role='YouTube Transcript Summarizer',
#   goal='Create detailed summaries of the given information obtained from youtube transcripts.',
#   backstory='You are an experienced summarizer with a passion for giving relevant information about the topic. You create a detailed summary of transcripts of youtube videos, which is used by the YouTube Script Writer. You get the transcripts of a few YouTube videos, you then read them and prepare a detailed summary, which contains relevant information about the topic. You only use the information that you get from these transcripts and never add anything new. You never make anything up. You do not create new facts. You make sure that your summary contains all the information that the youtube script writer needs as the writer can not access any other information.',
#   llm = normal_llm,
#   verbose = True,
#   allow_delegation=False,
#   cache = False
# )

# script_writer = Agent(
#   role='YouTube Script Writer',
#   goal='Draft the final script of about 250 words, based on the information provided by the youtube transcript summarizer',
#   backstory='You are an experienced YouTube Script Writer, with a talent for crafting compelling narratives and engaging scripts. You get information about the topic from the YouTube Transcript Summarizer, and based on this information, you write your scripts. You only use the information that you get from these transcripts and never add anything new. You never make anything up. You do not create new facts.',
#   llm = normal_llm,
#   verbose = True,
#   allow_delegation=False,
#   cache = False
# )

# fetch_transcripts_task = Task(
#     description='Gather relevant YouTube video transcripts on the given topic using the youtube transcript fetcher tool. Do not make anything up. Do not create new facts.',
#     expected_output='A list of YouTube Video Transcripts',
#     agent = youtube_transcript_fetcher,
#     tools=[youtube_tool]
# )

# summary_task = Task(
#     description='Based on the transcripts received, make a detailed comprehensive summary, which will be used to write a script for a YouTube video. Do not make anything up. Do not create new facts. Make sure that the summary only contains the information that is related to the topic.',
#     expected_output='A comprehensive and detailed summary.',
#     agent = youtube_transcript_summarizer,
#     context = [fetch_transcripts_task]
#     )

# script_task = Task(
#     description='Based on the summarized information provided by the summarizer, write a script for a YouTube video related to the topic. Only include the information received from the summarizer. Do not make anything up. Do not create new facts.',
#     expected_output='Final YouTube video script of about 250 words.',
#     agent = script_writer,
#     context = [summary_task]
#     )

# # Define the manager agent
# manager = Agent(
#     role="Project Manager",
#     goal="Efficiently manage the crew and ensure high-quality task completion",
#     backstory="You're an experienced project manager, skilled in overseeing complex projects and guiding teams to success. You manage the creation of a script for a YouTube video based on the topic " +  video_topic + ". Your goal is to make sure that a proper script is generated for the YouTube video. You make sure that the output of all the members is always related to the topic of the YouTube video. You make sure that all the information that the summarizer and script writer agents generate are actually based on the input that they get. Your role is to coordinate the efforts of the crew members, ensuring that each task is completed on time and to the highest standard. Add \"approved by the manager\" at the end of the result so that I know that you have verified the final output.",
#     allow_delegation=True,
#     llm = normal_llm,
#     verbose = True
# )

# # Instantiate your crew with a custom manager
# crew = Crew(
#     agents=[youtube_transcript_fetcher, youtube_transcript_summarizer, script_writer],
#     tasks=[fetch_transcripts_task, summary_task, script_task],
#     share_crew = False,
#     manager_agent=manager,
#     process=Process.hierarchical,
#     output_log_file=True,
#     verbose = 2,
#     memory = True,
#     embedder={
#         "provider": "gpt4all",
#         "config":{
#                 "model": 'all-MiniLM-L6-v2.gguf2.f16.gguf'
#             }
#         }
# )

# # Start the crew's work
# result = crew.kickoff()
# print(result)
# print(crew.usage_metrics)