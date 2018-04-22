
    var xhr = null;
    function ajax(method,url,data,types) {   //封装一个ajax方法
      //  var text;
        if(window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
        }else if(window.ActiveXObject){
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }else {
            alert('你的浏览器不支持ajax');
            return false;
        }
      
        xhr.onerror = function (err) {
            alert("some err have hapened:",err);
        }
        xhr.open(method,url,true);
        if(method=="post"){
            xhr.setRequestHeader("Content-type",types);
         // xhr.setRequestHeader("Conent-Type",'application/json'"application/x-www-form-urlencoded")
        }
        try{
            setTimeout(()=>{
                xhr.send(data);
        },0);
        }catch(err) {
            alert("some error have hapened in font:",err);
        }
        return xhr;
    }
