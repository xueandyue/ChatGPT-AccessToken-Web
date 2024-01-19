# -*- coding: utf-8 -*-

import os
from os import path

import requests


def run():
    current_path = os.getcwd()  # 获取当前工作目录路径
    parent_path = os.path.dirname(current_path)  # 获取父目录路径
    current_dir = path.dirname(path.abspath(__file__))
    credentials_file = path.join(current_dir, 'user.txt')

    tokens_file = './.env.local'

    with open(credentials_file, 'r', encoding='utf-8') as f:
        credentials = f.read().split('\n')
    credentials = [credential.split(',', 1) for credential in credentials]
    print(credentials)
    username=credentials[0][0]
    password=credentials[0][1]

 
    url = "http://8.134.200.247:8080/gpt12345/api/auth/login"
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {
        'username': username,
        'password': password
    }
    
    response = requests.request("POST", url, headers=headers, data=data)
    access_token = response.json()['access_token']
    print(access_token)


    with open(tokens_file, 'w', encoding='utf-8') as f:
            f.write('OPENAI_API_KEY="')
            f.write('{}"\n'.format(access_token))


if __name__ == '__main__':
    run()