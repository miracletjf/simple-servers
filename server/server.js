let http = require('http');
let fs = require('fs');
let url = require('url');
let port = process.argv[2];

if(!port){
  console.log('请指定端口号！\n例如： node server.js 8890');
  process.exit();
}

let server = http.createServer(function(request,response){
  let parseUrl = url.parse(request.url,true);
  let path = request.url;
  let query;
  
  if(path.indexOf('?') >=0){
    query = path.substring(path.indexOf('?'));
  }

  let pathNoQuery = parseUrl.pathname;
  let pathObject = parseUrl.query;
  let method = request.method.toUpperCase();

  //路由功能
  if(pathNoQuery === '/' || pathNoQuery === '/index.html'){
    let string = fs.readFileSync('../index.html','utf-8');
    let cookies = request.headers.cookie;
    let cookiesHash = {};
    let user = {};
    console.log(cookies);
    cookies.split('; ').forEach(item=>{
      let itemArr = item.split('=');
      cookiesHash[itemArr[0]] = itemArr[1];
    });
    console.log('cookiesHash',cookiesHash);
    let users = JSON.parse(fs.readFileSync('../database/users.json','utf-8'));
    if(typeof users[cookiesHash['email']] !== undefined){
      user['email'] = cookiesHash['email'];
      user['password'] = users[cookiesHash['email']];
      console.log(user);
      string = string.replace('__email__',user['email']);
      string = string.replace('__password__',user['password']);
    }
    response.setHeader('Content-Type','text/html;charset=utf-8');
    response.write(string);
    response.end();
  }else if(pathNoQuery === '/js/main.js'){
    let string = fs.readFileSync('../js/main.js','utf-8');
    response.setHeader('Content-Type','text/javascript;charset=utf-8');
    response.write(string);
    response.end();
  } else if(pathNoQuery === '/ajax'){
    getReauestBodyString(request,(res)=>{
      response.setHeader('Content-Type','application/json;charset=utf-8');
      response.write(res);
      response.end();
    })
  } else if(pathNoQuery === '/userRegist.html' && method === 'GET'){
    let string = fs.readFileSync('../userRegist.html','utf-8');
    response.setHeader('Content-Type','text/html;charset=utf-8');
    response.write(string);
    response.end();
  } else if(pathNoQuery === '/userRegist' && method === 'POST'){
    getReauestBodyString(request,(res)=>{
      let string;
      let hash = {};
      let datasString = fs.readFileSync('../database/users.json','utf-8') || '{}';
      let datas = JSON.parse(datasString)
      response.setHeader('Content-Type','application/json;charset=utf-8');
      res.split('&').forEach(item => {
        let itemArr = item.split('=');
        hash[itemArr[0]] =itemArr[1];
      });
      string = JSON.stringify(hash);
      if(typeof datas[hash['email']] !== 'undefined'){
        response.statusCode = 400;
        response.write('邮箱已存在，请更换邮箱！')
      }else {
        response.statusCode = 200;
        response.setHeader('Set-Cookie',[`email=${hash['email']}`,`Max-Age=${60*60*24*7}`]);
        datas[hash['email']] = hash['password'];
        let datasString = JSON.stringify(datas);
        fs.writeFileSync('../database/users.json' , datasString , 'utf-8');
        response.write(string);
      }
      response.end();
    })
  } else if(pathNoQuery === '/userLogin.html' && method === 'GET'){
    let string = fs.readFileSync('../userLogin.html','utf-8');
    response.setHeader('Content-Type','text/html;charset=utf-8');
    response.write(string);
    response.end();
  } else if(pathNoQuery === '/login' && method === 'POST'){
    let datasString = fs.readFileSync('../database/users.json','utf-8') || '{}';
    let datas = JSON.parse(datasString);
    let user = {};
    getReauestBodyString(request,function(res){
      response.setHeader('Content-Type','application/json;charset=utf-8'); 
      res.split('&').forEach((item)=>{
        let parts = item.split('=');
        user[parts[0]] = parts[1];
      })
      if(typeof datas[user['email']] === 'undefined'){

        response.statusCode = 400;
        response.write(`"邮箱不存在！"`)
      } else if(datas[user['email']] !== user['password']){
        response.statusCode = 400;        
        console.log(user);
        console.log(datas);
        response.write(`"密码不匹配！"`)
      } else {
        response.sendDate = 200;
        response.setHeader('Set-Cookie',[`email=${user['email']}`,`Max-Age=${60*60*24*7}`]);
        response.write(`"登录成功！"`);
      }
      response.end();
    })

  } else if(pathNoQuery === '/css/style.css') {
    let string = fs.readFileSync('../css/style.css','utf-8');
    response.setHeader('Content-Type','text/css;charset=utf-8');
    response.write(string);
    response.end();
  }
}) 

server.listen(port);
console.log(`监听${port}成功\n请打开http://localhose:${port}`);

/* 获取请求体，String形式 */
function getReauestBodyString(req,callback){
  let body = "";

  req.on('data', function (chunk) {
    body += chunk;
  }).on('end', function () {
    callback(body);
  })

}