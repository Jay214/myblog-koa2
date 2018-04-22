const router = require('koa-router')();
const userModel = require('../lib/mysql');
const checkUser = require('../midllewares/checkUser');
const moment = require('moment');

router.get('/articles', async(ctx,next)=>{
    if(!checkUser.checkUp(ctx)){    //检查是否登录
        ctx.redirect('/home')
        return false;
    }
    await ctx.render('articles',{
        session:ctx.session 
    })
})
    //发表文章

router.post('/articles',async(ctx,next)=>{
    console.log(ctx.request.body);
 // console.log(ctx.request.body.content)
    let article = {
        type : ctx.request.body.type,
        title : ctx.request.body.title,
        content : ctx.request.body.content,
        author : ctx.session.user,
        time : moment().format('YYYY-MM-DD HH:mm'),
        uid : ctx.session.id,

    }
   
    if(!article.title.length||article.content.length<80){
        ctx.body = 0;
    }else{
        await userModel.insertPost([article.author,article.title,article.content,article.uid,article.time,article.type,ctx.session.avator])
                .then(()=>{
                    ctx.body = 1;
                    console.log('发表成功')
                }).catch((err)=>{
                    console.log(err);
                    ctx.body = 0;
                })
    }
})
//删除文章
router.get('/delete',async(ctx,next)=>{
    let articleId = ctx.query.id;
    console.log(articleId)
    await userModel.deletePost(articleId)
        .then(()=>{
            ctx.redirect('/home');
            console.log('删除成功')
        }).catch(err=>{
            console.log(err)
            ctx.body = false;
        })
})

    //关注
router.get('/follow/:articleAuthor',async(ctx,next)=>{
    console.log(ctx.params.articleAuthor)
    let flag = ctx.query.flag,
        fwid = ctx.params.articleAuthor;
        // follow;
    
        // await userModel.findFollowByUFid([ctx.session.user,fwid])
        //     .then((result)=>{
        //         if(result[0]!=undefined){
        //             console.log(result[0])
        //             follow = result[0]['name']
        //         }else{
        //             follow = null;
        //         }
        //     })
    if(flag==1){
        await userModel.insertFollow([ctx.session.id,fwid])
            .then(()=>{
                console.log('关注成功');
                ctx.body = true;
            }).catch(err=>{
                console.log(err);
                ctx.body = false;
            })
        // await userModel.insertFollower([fwid,ctx.session.id])
        //     .then(()=>{
        //         console.log('guanz成功2')
        //         ctx.body = true;
        //     }).catch(err=>{
        //         console.log(err)
        //     })
    }else{
        await userModel.deleteFollow([ctx.session.id,fwid])
            .then(()=>{
                console.log('取消成功')
                ctx.body = 1;
            }).catch(err=>{ 
                console.log(err);
                ctx.body = 0;
            })
    }
})
    //点赞
router.get('/addHeart/:articleId',async(ctx,next)=>{
    console.log(ctx.query.flag)
    let flag = ctx.query.flag,
        likes,
        likeId,
        articleId = ctx.params.articleId;
        await userModel.findPostById(ctx.params.articleId)
        .then((result)=>{
            likes = parseInt(result[0]['likes']);
        })
    if(flag==1){
        likes += 1;
        await userModel.insertLikes([ctx.session.user,articleId])
            .then(()=>{
                console.log('点赞OK');
            }).catch((err)=>{
                console.log(err);
            })

      await userModel.updatePostLike([likes,articleId])
        .then(()=>{
            ctx.body = true;
            console.log('点赞成功')
        }).catch((err)=>{
            console.log(err)
            ctx.body = false;
        })

    }else if(flag==2){  //取消赞
        await userModel.findLikeByPostId([ctx.session.user,articleId])
            .then((result)=>{
                 likeId = result[0]['id'];
            }).catch(err=>{
                console.log(err);    
            });
        await userModel.poseLikes(likeId)
            .then(()=>{
                console.log('取消赞成功');
            }).catch((err)=>{
                console.log(err);   
            })
             
        likes -= 1;
        await userModel.updatePostLike([likes,articleId])
            .then(()=>{
                ctx.body = true;
                console.log('取消赞了')
            }).catch((err)=>{
                console.log(err)
                ctx.body = false;
            })
    }
})
 //收藏文章、取消收藏
 router.get('/collects/:articleId',async(ctx,next)=>{
        let flag = ctx.query.flag,
            articleId = ctx.params.articleId,
            collects,
            collectId;
            await userModel.findPostById(articleId)
            .then((result)=>{
                collects = result[0]['collection'];
            }).catch(err=>{
                console.log(err)
            })
            if(flag==1){
                await userModel.insertCollection([ctx.session.id,articleId])
                    .then(()=>{
                        console.log('收藏成功1')
                    }).catch((err)=>{
                        console.log(err)
                    })
                
                    collects++;
                await userModel.updatePostCollection([collects,articleId])
                    .then(()=>{
                        console.log('收藏成功')
                        ctx.body = true;
                    }).catch(err=>{
                        console.log(err)
                        ctx.body = false;
                    })
            }else{
                await userModel.findCollectionByNaId([ctx.session.id,articleId])
                    .then(result=>{
                        collectId = result[0]['id'];
                    }).catch(err=>{
                        console.log(err)
                    })
                
                await userModel.deleteCollection(collectId)
                    .then(()=>{
                        console.log('取消成功2')
                    }).catch(err=>{
                        console.log(err)
                    })
                    
                    collects--;
                await userModel.updatePostCollection([collects,articleId])
                    .then(()=>{
                        console.log('取消成功3')
                        ctx.body = true;
                    }).catch(err=>{
                        console.log(err);
                    })
            }
})

//评论
router.post('/comment/:articleId', async(ctx,next)=>{
    console.log('test')
    console.log(ctx.request.body.comments)
       let articleId = ctx.params.articleId,
           content = ctx.request.body.comments,
           name = ctx.session.user,
           avator = ctx.session.avator;
         //  moment = moment().format('YYYY-MM-DD HH:mm');
       let comments = 0;
           await userModel.insertComment([name,content,moment().format('YYYY-MM-DD HH:mm'),articleId,avator])
               .then(result=>{
                   console.log(result[0]);
               }).catch(err=>{
                   console.log(err);
               });
           await userModel.findPostById(articleId)
               .then(result=>{
                  // console.log(result[0]);
                  console.log(result[0]['comments'])
                   comments = parseInt(result[0]['comments']) + 1;

               }).catch(err=>{
                   console.log(err);
               });
           await userModel.updatePostComment([comments,articleId])
               .then(result=>{
                   console.log(result);
                   ctx.body = true;
               }).catch(err=>{
                   console.log(err);
                   ctx.body = false;
               });
})

//评论分页
 router.post('/article/:articleId/commentPage', async(ctx,next)=>{
     let articleId = parseInt(ctx.params.articleId),
        page = parseInt(ctx.request.body.page);
        console.log(articleId,page)
        await userModel.findCommentByPage(page,articleId)
            .then(result=>{
                ctx.body = result;
                console.log(result);
            }).catch(err=>{
                ctx.body = 'error';
                console.log(err);
            })
 })

 //删除评论
 router.get('/deleteComment/:articleId/:commentId', async(ctx,next)=>{
     let commentId = ctx.params.commentId;
     let articleId = ctx.params.articleId,
        comment = 0;
     await userModel.deleteComment(commentId)
        .then(result=>{
            console.log(result);//需更新文章评论数
            
        }).catch(err=>{
            console.log(err);
            ctx.body = false;
        })
     await userModel.findPostById(articleId)
        .then(result=>{
            console.log(result[0]['comments']);
            comment = parseInt(result[0]['comments']) -1;
        }).catch(err=>{
            console.log(err);
        })
     await userModel.updatePostComment([comment,articleId])
        .then(result=>{
            console.log(result);
            ctx.body = true;
        }).catch(err=>{
            console.log(err);
            ctx.body = false;
        })
 })
module.exports = router; 