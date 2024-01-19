# 使用 Python 3.9 的官方镜像作为基础镜像
FROM python:3.9-buster

# 设置工作目录为 /app
WORKDIR /app

# 将当前目录的内容复制到容器的 /app 目录
COPY . /app

# 更新系统并安装 curl，bash
RUN apt-get update && apt-get install -y curl bash lsof

# 安装 Node.js 和 yarn
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install --global yarn \
    && pip install requests

RUN yarn config set registry https://registry.npm.taobao.org


# 下载和安装项目
RUN cd /app/ChatGPT-AccessToken-Web \
    && yarn install
# 开放端口3000
EXPOSE 3000
# 开放端口8008
EXPOSE 8008

# 环境变量
ENV username=Youruser password=Yourpassowrd CODE=YourCode Jwturl=YourJwt

CMD sh -c 'echo "${username},${password}" > /app/ChatGPT-AccessToken-Web/user.txt && python /app/ChatGPT-AccessToken-Web/get_token.py && cd /app/ChatGPT-AccessToken-Web && yarn build && yarn start'


