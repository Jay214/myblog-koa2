var router = require('koa-router')();
var checkUser = require('../midllewares/checkUser');
router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    console.log('退出成功');
    ctx.body = true;
    ctx.redirect('/home');
    //return;
    //ctx.redirect('/home');
})

module.exports = router