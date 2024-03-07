from openai import OpenAI

# openai.api_key = open_api_key  # Set the API key for authentication

client = OpenAI()  # Correct the OpenAI client initialization
completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a highschool teacher, skilled in explaining complex concepts with simple words."},
        {"role": "user", "content": "Explain what is calculus"}
    ]
)

print(completion.choices[0].message)
