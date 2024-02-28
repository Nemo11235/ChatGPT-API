from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
import json

open_api_key = "your_openai_api_key"  # 用您实际的OpenAI API密钥替换
openai_client = OpenAI(api_key=open_api_key)

@csrf_exempt
def get_openai_response(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input')
        # 使用提供的用户输入调用OpenAI API
        completion = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a highschool teacher, skilled in explaining complex concepts with simple words."},
                {"role": "user", "content": user_input}
            ]
        )
        response = completion.choices[0].message['content']
        return JsonResponse({'response': json.response})
    else:
        return JsonResponse({'error': 'Invalid request method'})
