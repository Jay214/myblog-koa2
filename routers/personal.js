const router = require('koa-router')();
const userModel = require('../lib/mysql.js');
const md5 = require('md5');
const checkUser = require('../midllewares/checkUser');
const userContent = require('../midllewares/userContent');
const fs = require('fs');
const formidable = require('koa-formidable');
const path = require('path');
const moment = require('moment');

//个人主页
router.get('/personal/:author', async(ctx,next)=>{
//if (ctx.request.querystring) {
    //decodeURIComponent(ctx.request.querystring.split('=')[1]),
    let name = ctx.params.author,
        userInfo;
     let userArr = [];
    await userModel.findDataByName(name)
        .then(result => {
            userInfo = result[0];
           // console.log(ctx.session.info)
        }).catch((err)=>{
            console.log(err);
        })

    await userModel.findPostByUser(name)
        .then(result=>{
            //console.log(result[0]);
            userArr.push(result.length);
        }).catch(err=>{
            console.log(err);
        })
    await userModel.findCollectionByUid(userInfo.id)
        .then(result=>{
            userArr.push(result.length);
        }).catch(err=>{
            console.log(err);
        })

        let _sql = `select * from follow where uid = ${userInfo.id}`;
    await userModel.query(_sql)
        .then(result=>{
            userArr.push(result.length);
        })
    
         _sql = `select * from follow where fwid = ${userInfo.id}`;
    await userModel.query(_sql)
        .then(result=>{
            userArr.push(result.length);
        })
    await ctx.render('personal',{      
        session:ctx.session,
        userInfo:userInfo,
        userArr: userArr
    })

   
});
router.get('selfArticles',async(ctx,next)=>{
    
})
//个人信息
router.get('/personalInfo', async(ctx,next)=>{
  console.log(ctx.request.querystring)
   //if(ctx.request.querystring){
       let name = decodeURIComponent(ctx.request.querystring.split('=')[1]);
       let user;
       await userModel.findDataByName(name)
           .then(result => {
               user = result[0];
           }).catch((err)=>{
               console.log(err);
           })
        await ctx.render('personalInformation',{
            session:ctx.session,
           user:user
        })
    //}
    /*else{
        await ctx.render('personalInformation',{
            session:ctx.session,
        })
    }*/
   
})

//个人信息更改
//1.上传头像
router.post('/personalImg', async(ctx,next)=>{
    console.log(ctx.session.id)
    let base64Data = ctx.request.body.avator.replace(/^data:image\/\w+;base64,/, "");
 //  let base64Data = ctx.request.body.avator.substring(22);
  
    let dataBuffer = new Buffer(base64Data, 'base64');
   // let upDate = new Date();
    let getName = (moment().format('YYYY-MM-DD')).toString() + '-' +1000*(Math.random().toFixed(2)) + '.png';
        console.log(getName)
    
    let upload = await new Promise((reslove,reject)=>{
        fs.writeFile('./public/images/' + getName, dataBuffer, err => { 
            if (err) {
                throw err;
                reject(false)
            };
            reslove(true)
         
        });            
    })
    if(upload){
        await userModel.updateUserImg([getName,ctx.session.id])
            .then(result=>{
                console.log(result);
                console.log('头像上传成功') 
                ctx.session.avator = getName;
                ctx.body = true;
            }).catch(err=>{
                console.log(err)
            })
    }else{  
        console.log('上传失败');

    }
   /* console.log(ctx.request.body.avator)
    let form = formidable.parse(ctx.request);
        form.encoding = 'utf-8';
        form.keepExtensions = true;
        let uploadDir = '/public/images'
        let imgPlay = new Promise((resolve, reject) => {
            form((opt, {fields, files})=> {
            let articleId = fields.articleId;
                let filename = files.img.name;
                let avatarName = Date.now() + '_' + filename;
                let readStream = fs.createReadStream(files.img.path)
                let writeStream = fs.createWriteStream(uploadDir + avatarName);
                readStream.pipe(writeStream);
                        // fs.rename(files.file.path, uploadDir + avatarName); //window报错了重命名
                    resolve({
                        url:'http://localhost:8080' + '/' + uploadDir + avatarName
                    })
                    // http://localhost:6001/public/upload/1513523744257_WX20171205-150757.png
            })
            });
            let imageData = await imgPlay;
            ctx.body = {flag: '1' ,msg:'',data: imageData} 
*/
 
    
})
//个人信息更改
router.post('/personalInfo',async(ctx,next)=>{
    console.log(ctx.request.body)
    let user = {
        name : ctx.request.body.username,
        job : ctx.request.body.job,
        company : ctx.request.body.company,
        introduce : ctx.request.body.introduce,
        address : ctx.request.body.address,
        github : ctx.request.body.github
    }
    await userModel.updateUser([user.name,user.job,user.company,user.introduce,user.address,user.github,ctx.session.id])
            .then(res=>{
                console.log('更新成功')
                ctx.body = true;
                ctx.session.user = user.name;
                ctx.session.job = user.job;
                ctx.session.company = user.company;
                ctx.session.introduce = user.introduce;
                ctx.session.address = user.address;
                ctx.session.github = user.github;
            }).catch(err=>{
                console.log(err);
            })
})

//个人文章
router.get('/selfArticle/:userId',async(ctx,next)=>{
    let userId = ctx.params.userId;
    await userModel.findPostByUserId(userId)
        .then(result=>{
                if(result.length>0){
                    ctx.body = userContent.updateArticle(result);
                }else{
                    ctx.body = 0;
                }
        
         //   ctx.headers = 'text/html'
           // return 0;
        //    ctx.body = ctx.render('selfArticles', {
        //     articles: articleLen,
        // })
        })
    
})

//获取收藏文章
router.get('/collections/:userId', async(ctx,next)=>{
    let userId = ctx.params.userId;
    await userModel.findCollectPostByUid(userId)
        .then(result=>{
           if(result.length>0){
            ctx.body = userContent.updateArticle(result);
           }else{
               ctx.body = 0;
           }
           
        }).catch(err=>{
            console.log(err);
        })

})

//获取关注用户
router.get('/follows/:userId', async(ctx,next)=>{
    let userId = ctx.params.userId,
        sessionFw = [],
        fwArr = [];
        
        if(ctx.session.id){
          
            let _sql = `select * from follow where uid=${ctx.session.id}`;
            await userModel.query(_sql)
                .then(result=>{
                    if(result.length>0){
                        sessionFw = result;
                    }
                })
        }
   
    await userModel.findFollowByUid(userId)
        .then(result=>{
            console.log(result);
            if(result.length>0){ 
                if(sessionFw){
                    let len = result.length,
                    len2 = sessionFw.length,
                    flag = 0;

                for(let i = 0;i<len;i++){
                    for(let j = 0;j<len2;j++){
                        if(sessionFw[j]['fwid']==result[i]['id']){
                            flag = 1;
                            break;
                        }
                    }
                    if(flag==1){
                        fwArr.push('已关注');
                        flag = 0;
                    }else{
                        fwArr.push('关注作者');
                    }
                }                
                    
                }
                console.log(fwArr)
                ctx.body = userContent.updateFollow(result,fwArr);
            }else{
                ctx.body = 0;
            }
           
        }).catch(err=>{
            console.log(err);
        })
})

//获取粉丝
router.get('/followers/:userId', async(ctx,next)=>{
    let userId = ctx.params.userId,
        sessionFw = [],
        fwArr = [];
   if(ctx.session.id){
    let _sql = `select * from follow where uid=${ctx.session.id}`;
    await userModel.query(_sql)
        .then(result=>{
             if(result.length>0){
                sessionFw = result;
            }
        })
   }
    await userModel.findFollowerByUid(userId)
        .then(result=>{
            console.log(result);
            if(result.length>0){
                if(sessionFw){
                    let len = result.length,
                    len2 = sessionFw.length,
                    flag = 0;

                for(let i = 0;i<len;i++){
                    for(let j = 0;j<len2;j++){
                        if(sessionFw[j]['fwid']==result[i]['id']){
                            flag = 1;
                            break;
                        }
                    }
                    if(flag==1){
                        fwArr.push('已关注');
                        flag = 0;
                    }else{
                        fwArr.push('关注作者');
                    }
                }                
                    
                }
                console.log(fwArr)
                ctx.body = userContent.updateFollow(result,fwArr);
            }else{
                ctx.body = 0;
            }
          
        }).catch(err=>{
            console.log(err);
        })
})
module.exports = router