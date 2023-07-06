# ChatGPT-3.5-AccessToken-Web
本项目基于使用Access Token的方式实现了网页版 ChatGPT 3.5的前端，不需要openai的api额度，是用<a href="https://github.com/Yidadaa/ChatGPT-Next-Web" target="_blank" title="ChatGPT-Next-Web">
ChatGPT-Next-Web</a>项目进行修改而得，另外本项目需要的后端服务，需要部署<a href="https://github.com/pengzhile/pandora" target="_blank" title="pandora项目">pandora项目</a>


## 主要功能
![Image text](https://github.com/xueandyue/ChatGPT-3.5-AccessToken-Web/blob/main/doc/images/index.jpg)

- 完整的 Markdown 支持：LaTex 公式、Mermaid 流程图、代码高亮等等
- 精心设计的 UI，响应式设计，支持深色模式，支持 PWA
- 极快的首屏加载速度（~100kb），支持流式响应
- 隐私安全，所有数据保存在用户浏览器本地
- 预制角色功能（面具），方便地创建、分享和调试你的个性化对话
- 海量的内置 prompt 列表
- 多国语言支持

## Access Token

* chatgpt官方登录，然后访问 [这里](http://chat.openai.com/api/auth/session) 拿 `Access Token`
* 也可以访问 [这里](http://ai-20230626.fakeopen.com/auth) 拿 `Access Token`
* `Access Token` 有效期 `14` 天，期间访问**不需要梯子**。这意味着你在手机上也可随意使用。



## 部署机器说明
* 在本地或者国内服务器都可以部署，不需要海外服务器


## 部署
* 确保安装了docker，启动了docker
* ${ACCESS_TOKEN}是ACCESS_TOKEN的值，${CODE}是设置密码，如果CODE=""则表示不设置密码
* docker pull xueandyue/next-web-pandora:v1
* docker run -e ACCESS_TOKEN="${ACCESS_TOKEN}" -e CODE="${CODE}" -p 3000:3000 -d xueandyue/next-web-pandora:v1
* 在浏览器访问http://服务器域名(ip):3000/



## 本地如何调试
* 部署的机器安装python3,推荐python3.9 ,至少要python3.7以上版本
* 获取 Access Token
> 部署pandora项目
* 下载pandora项目：git clone https://github.com/pengzhile/pandora.git
* cd pandora
* 新建token.txt文件，把获取到的 Access Token放进去，保存文件
* pip install .
* pandora -s -t token.txt
> 部署本项目
* 安装yarn
* 下载本项目：git clone https://github.com/xueandyue/ChatGPT-3.5-AccessToken-Web.git
* cd ChatGPT-3.5-AccessToken-Web
* 修改.env.local的CODE，如果为空，则表示不需要密码访问
* yarn install && yarn dev
* 在浏览器访问http://localhost:3000/

>PS：如果不是同一机器上部署pandora项目和本项目，又或者部署pandora项目使用非8008端口，那需要修改本项目用到8008端口的url



## 开源协议

> 反对 996，从我开始。
[Anti 996 License](https://github.com/kattgu7/Anti-996-License/blob/master/LICENSE_CN_EN)


## 其他说明


* 项目是站在其他巨人的肩膀上，感谢！
* 喜欢的请给颗星，感谢！
* 不影响PHP是世界上最好的编程语言！
