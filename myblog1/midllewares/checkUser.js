module.exports = {
    
    checkUp: (ctx)=>{
        if(ctx.session.user){
            return true;    //已登录
        }else{
            return false;   ///未登录
        }
    }
}
