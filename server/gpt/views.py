from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
# from openai import OpenAI

# open_api_key = "your_openai_api_key"  # 用您实际的OpenAI API密钥替换
# openai_client = OpenAI(api_key=open_api_key)

@csrf_exempt
def get_openai_response(request):
    if request.method == 'POST':
        
        # [NOTES] Use print to quickly test the content at a stage of the data flow.
        print(json.loads(request.body))

        # [NOTES] To simplify debugging for server-client connection, first isolate
        # other complex parts such as this API connection to OpenAI.

        # user_input = request.POST.get('user_input')
        # 使用提供的用户输入调用OpenAI API
        # completion = openai_client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[
        #         {"role": "system", "content": "You are a highschool teacher, skilled in explaining complex concepts with simple words."},
        #         {"role": "user", "content": user_input}
        #     ]
        # )
        # response = completion.choices[0].message['content']

        # [NOTES] Simply echo the response in JSON format to frontend for testing.
        response = {'The user input is': json.loads(request.body)['user_input']}
        return JsonResponse({'response': response})
    else:
        return JsonResponse({'error': 'Invalid request method'})
