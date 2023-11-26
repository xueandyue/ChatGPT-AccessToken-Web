python /app/ChatGPT-3.5-AccessToken-Web/autorestart.py
cd /app/pandora
nohup pandora -s 0.0.0.0:8008 -t token.txt > output.log 2>&1 &