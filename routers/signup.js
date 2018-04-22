var router = require('koa-router')();
var userModel = require('../lib/mysql.js');
var md5 = require('md5')

    // 注册页面
    /*
router.get('/signup', async(ctx, next) => {
        //await checkNotLogin(ctx)
        await ctx.render('login', {
            session: ctx.session,
        })
    })
    */
    // post 注册
router.post('/signup', async(ctx, next) => {
    console.log(ctx.request.body)
    var user = {
        name: ctx.request.body.username,
        pass: ctx.request.body.pass,
        repeatpass: ctx.request.body.repeatpass
    }
    let flag = 0;
    await userModel.findDataByName(user.name)
        .then(result => {
            console.log(result)
            if (result.length) {
               
                    //处理err
                    console.log('用户已存在')
                    ctx.body = {
                        code: 1
                    };               
                
            } else if (user.pass !== user.repeatpass || user.pass == '') {
                ctx.body = {        //应把这个逻辑放到前端
                    code: 2
                };

            } else {
                flag = 1;             
                
            }
        })
    if(flag==1){
        let res = await  userModel.insertData([user.name, md5(user.pass + 'asd&$BH&*') ])
       console.log(res.insertId)
        await  userModel.findDataByName(user.name)
        .then((result)=>{
            
          //  var res = JSON.parse(JSON.stringify(result))
            console.log(result[0]['avator'])
            ctx.session.id = res.insertId;
            ctx.session.user=user.name;
            ctx.session.avator = 'default.jpg';
            ctx.body = {
            code: 3
            };
            console.log('注册成功')
         })
    }

})
// await (()=>{
//     查找用户是否已存在
// }).then(()={
//     若不存在插入数据库
//     然后查询id
// })

module.exports = router