function mask(text) {
    
    let div1 = document.createElement('div');
    div1.setAttribute('class','login-form-mask');
    let div2 = document.createElement('div');
    div2.setAttribute('class','tip-box');
    div2.innerHTML = text;
    document.body.appendChild(div1);
    document.body.appendChild(div2);
    setTimeout(()=>{
        let dd = document.getElementsByClassName('.login-form-mask')[0];
        console.log(dd);
        document.body.removeChild(document.getElementsByClassName('login-form-mask')[0]);
        document.body.removeChild(document.getElementsByClassName('tip-box')[0]);
    },1500)
 }