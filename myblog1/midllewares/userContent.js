
// 实现局部加载的文档片段

//个人文章&收藏文章
module.exports = {
    updateArticle:(result)=>{
        let str = '';
        result.forEach(function(post){
            str += '<article class="article-list">' +
  '<div class="content">' +
       '<a href="/personal/' + post.name + '" title="' + post.name + '" class="post-author">' +
           '<span class="author">' + post.name + '&nbsp;&nbsp;</span>' +
           '<span class="times">' + post.moment + '</span>' +
      ' </a>' +
       '<a href="/articledetail/' + post.id + '">' +           
           '<h4 class="title">' +  post.title + '</h4>' +
       '</a>' +
      ' <div class="content-fo"><span class="glyphicon glyphicon-heart"></span><span>' + post.likes + 
      '</span><span class="glyphicon glyphicon-comment"></span><span>' + post.comments +
      '</span>&nbsp;&nbsp;&nbsp;<span class="pv-item">阅读量&nbsp;<span class="pv">' + post.pv + '</span></span>' +
       '</div></div>  </article>'
        })
        return str;
    },

    //关注用户，粉丝
    updateFollow:(result,fwArr)=>{
        let str = '';
       
        result.forEach(function(users,i){
            str +=  '<div class="head"><a href="/personal/' +  users.name + '" title="' + users.name + '" target="_blank">' +
            '<img src="/images/' + users.avator + '" class="img-circle imgs"/>' +
            '<div class="user-title">' +
                '<h3>' + users.name + '</h3>' + 
                '<p class="job"><span class="glyphicon glyphicon-hdd"></span>' + (users.job!=null?users.job:'...') + '</p>' +
                '<p class="introduce"><span class="glyphicon glyphicon-hand-right"></span>' + (users.introdu!=null?users.introdu:'...') + '</p>' +
            '</div>' +                               
            '</a>' +                   
            '<p class="edit">' +                 
            '<button data-id="' + users.id + '" class="btn fw info" onclick="addfollow(event)">' + fwArr[i] +'</button>' +
                 '</p>' +       
             '</div>' 
        
        })

        return str;
    }

}