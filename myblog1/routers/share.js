const router = require('koa-router')();
const userModel = require('../lib/mysql');
const checkUser = require('../midllewares/checkUser');
const moment = require('moment');

router.get('/share',async(ctx,next)=>{
    await ctx.render('selfArticles',{
        session:ctx.session
    })
})
//资源分享
module.exports = router;
