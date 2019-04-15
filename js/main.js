function sendAjas(){
  let xhr = new XMLHttpRequest();
  xhr.open('POST','http://localhost:8890/cors');
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencode;charset=utf-8')
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState === 4){
      if(xhr.status === 200) {
        console.log(xhr);
        console.log(xhr.responseText);
      }
    }
  }
  xhr.send('name = test');
}