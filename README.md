# ChatGPT-AccessToken-Web
本项目基于使用Access Token的方式实现了网页版 ChatGPT的前端，不需要openai的api额度，是用<a href="https://github.com/Yidadaa/ChatGPT-Next-Web" target="_blank" title="ChatGPT-Next-Web">
ChatGPT-Next-Web</a>项目进行修改而得，默认Main分支对接gpt3.5的模型，gpt4分支对接gpt4模型。另外本项目需要的后端服务是pandora项目,
项目是站在ChatGPT-Next-Web和pandora项目的作者肩膀上，感谢他们！
# 示例网站
<a href="43.136.103.186:3000/" target="_blank" title="示例网站">点击这里查看示例网站</a>


## 主要功能
![Image text](https://github.com/xueandyue/ChatGPT-3.5-AccessToken-Web/blob/main/doc/images/index.jpg)
- 不需要openai的api额度，解决了api体验额度（1分钟只能调用3次api）用完后，频繁买号更改apikey，重启服务的痛点，成本更低
- 完整的 Markdown 支持：LaTex 公式、Mermaid 流程图、代码高亮等等
- 精心设计的 UI，响应式设计，支持深色模式，支持 PWA
- 极快的首屏加载速度（~100kb），支持流式响应
- 隐私安全，所有数据保存在用户浏览器本地
- 预制角色功能（面具），方便地创建、分享和调试你的个性化对话
- 海量的内置 prompt 列表
- 多国语言支持



## 下一步计划
* 支持vercel部署，进度：0% 

## Access Token

* chatgpt官方登录，然后访问 [这里](http://chat.openai.com/api/auth/session) 拿 `Access Token`
* 也可以访问 [这里](http://ai-20230626.fakeopen.com/auth) 拿 `Access Token`

## 关于GPT Plus
* 本项目有个gpt4分支，但后续该分支不会更新

## 账号，密码

* 只支持chatgpt官方账号，不支持Google,Microsoft,apple第三方登录
* 也可以访问 [这里](https://ai-20230626.fakeopen.com/auth1)验证账号密码。期间访问**不需要梯子**。这意味着你在手机上也可随意使用。



## 部署机器说明
* 在本地或者国内服务器都可以部署，不需要海外服务器。提供的docker镜像，是基于默认的Main分支（gpt3.5模型）


## 部署一(利用账号和密码部署)暂时不可用，恢复日期待定
* 确保有chatgpt官方账号
* 确保安装了docker，启动了docker
* CODE是设置的访问密码，如果CODE=""则表示不设置密码，如果CODE="123456",则设置密码为123456
* docker pull xueandyue/next-web-pandora:latest
* docker run -e username="你的gpt账号" -e password="你的gpt账号密码" -e CODE="123456" -p 3000:3000 -d xueandyue/next-web-pandora:latest
* 等待5分钟左右，在浏览器访问http://服务器域名(ip):3000/

## 备用部署(利用access_token)

* 先获取Jwt的url, [在这里拿Jwturl](https://dash.pandoranext.com/) ，注意 Jwturl要去掉 "> license.jwt"部分
  ![Image text](https://github.com/xueandyue/ChatGPT-3.5-AccessToken-Web/blob/main/doc/images/20231127090820.png)
* 确保安装了docker，启动了docker
* docker pull xueandyue/next-web-pandora:accessToken
* docker run -e ACCESS_TOKEN="你的access_token" -e CODE="要设置的访问密码" -e Jwturl="你的Jwturl" -p 3000:3000 -d xueandyue/next-web-pandora:accessToken
* 如果CODE=""则表示不设置密码
* 在浏览器访问http://服务器域名(ip):3000/
* 等待5分钟左右，在浏览器访问http://服务器域名(ip):3000/


## 不支持的部署方式
* 不支持k8s部署和Vercel部署



## 开源协议

> 反对 996，从我开始。
[Anti 996 License](https://github.com/kattgu7/Anti-996-License/blob/master/LICENSE_CN_EN)


## 其他说明


* 项目是站在其他巨人的肩膀上，感谢！
* 喜欢的请给颗星，感谢！
* 不影响PHP是世界上最好的编程语言！
