import openai

open_api_key = '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'
openai.api_key = open_api_key  # Set the API key for authentication

client = openai.OpenAIAPI()  # Correct the OpenAI client initialization
completion = client.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
        {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming."}
    ]
)

print(completion.choices[0].message["content"])
