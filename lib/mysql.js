

//import { create } from 'domain';

var mysql = require('mysql');
var config = require('../config/default.js')
//建立数据库连接池
var pool = mysql.createPool({
    host: config.database.HOST,
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE
});

let query = function(sql, values) {
    return new Promise((resolve, reject)=>{
        pool.getConnection(function (err,connection) {
            if(err){
                reject(err);
            }else{
                connection.query(sql,values,(err,rows)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(rows);
                    }
                    connection.release(); //为每一个请求都建立一个connection使用完后调用connection.release(); 直接释放资源。
                                          //query用来操作数据库表
                })
            }
         
    })
    })
}
 
var users = `create table if not exists users(
    id INT(200) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    pass VARCHAR(40) NOT NULL,
    avator VARCHAR(100) DEFAULT 'default.jpg', 
    job VARCHAR(40),
    company VARCHAR(40),
    introdu VARCHAR(255),
    userhome VARCHAR(100),
    github VARCHAR(100),
    PRIMARY KEY (id)
);`

var posts = `create table if not exists posts(
    id INT(200) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        uid INT(200) NOT NULL,
        moment VARCHAR(40) NOT NULL,
        comments VARCHAR(255) NOT NULL DEFAULT '0',
        pv VARCHAR(40) NOT NULL DEFAULT '0',
        likes INT(200) NOT NULL DEFAULT '0',
        type VARCHAR(20) NOT NULL,
        avator VARCHAR(100),
        collection INT(200) NOT NULL DEFAULT '0', 
        PRIMARY KEY (id) ,
        FOREIGN KEY (uid) REFERENCES users(id)
        ON DELETE CASCADE

);`

var comment= `create table if not exists comment(
 id INT(200) NOT NULL AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 content TEXT NOT NULL,
 moment VARCHAR(40) NOT NULL,
 postid INT(200) NOT NULL,
 avator VARCHAR(100),
 PRIMARY KEY ( id ),
 FOREIGN KEY (postid) REFERENCES posts(id)
 ON DELETE CASCADE
);`

var likes = `create table if not exists likes(
    id INT(200) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    postid INT(200) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (postid) REFERENCES posts(id)
    ON DELETE CASCADE
);`
 var collection = `create table if not exists collection(
     id INT(200) NOT NULL AUTO_INCREMENT,
     uid VARCHAR(100) NOT NULL,
     postid INT(200) NOT NULL,
     PRIMARY KEY (id),
     FOREIGN KEY (postid) REFERENCES posts(id) 
     ON DELETE CASCADE
 );`
 var follow = `create table if not exists follow(
         id INT(200) NOT NULL AUTO_INCREMENT,
         uid INT(200) NOT NULL,  
         fwid INT(200) NOT NULL DEFAULT '0',
         PRIMARY KEY (id),
         FOREIGN KEY (uid) REFERENCES users(id)
         ON DELETE CASCADE
     )
     `
//  var follow = `create table if not exists follow(
//      id INT(200) NOT NULL AUTO_INCREMENT,
//      uid INT(200) NOT NULL,  
//      fwid INT(200) NOT NULL DEFAULT '0',
//      PRIMARY KEY (id),
//      FOREIGN KEY (uid) REFERENCES users(id)
//      ON DELETE CASCADE
//  )
//  `
//  var follower = `create table if not exists follower(
//      id INT(200) NOT NULL AUTO_INCREMENT,
//      uid INT(200) NOT NULL DEFAULT '0',
//      frid INT(100) NOT NULL DEFAULT '0', 
//      PRIMARY KEY (id),
//      FOREIGN KEY (uid) REFERENCES follow(fwid)
//      ON DELETE CASCADE
//  )
//  `
let createTable = function(sql){
    return query(sql, []);
}

//建表
createTable(users);
createTable(posts);
createTable(comment);
createTable(likes);
createTable(collection);
createTable(follow);
//createTable(follower);
//注册用户
let insertData = function(value){
    let _sql = "insert into users(name,pass) values(?,?);"
    return query(_sql,value);
}
//更新头像
let updateUserImg = function(value){
    let _sql = "update users set avator=? where id=?"
    return query(_sql,value);
}
//更新用户信息
let updateUser = function(value){
    let _sql = "update users set name=?,job=?,company=?,introdu=?,userhome=?,github=? where id=?"
    return query(_sql,value);
}
//发表文章
let insertPost = function(value){
    let _sql = "insert into posts(name,title,content,uid,moment,type,avator) values(?,?,?,?,?,?,?);"
    return query(_sql,value);
}

//更新文章评论数
let updatePostComment = function(value){
    let _sql = "update posts set comments=? where id=?"
    return query(_sql,value);
}

//更新浏览数
let updatePostPv = function(value){
    let _sql = "update posts set pv=? where id=?"
    return query(_sql,value);
}

//更新点赞数
let updatePostLike = function(value){
    let _sql = "update posts set likes=? where id=?"
    return query(_sql,value);
}
//发表评论
let insertComment = function(value){
    let _sql = "insert into comment(name,content,moment,postid,avator) values(?,?,?,?,?);"
    return query(_sql,value);
}
 

//通过文章id查找点赞用户
let findLikeByPostId = function(value){
    let _sql = "select * from likes where name=? and postid=?"
    return query(_sql,value);
} 
//增加点赞
let insertLikes = function(value){
    let _sql = "insert into likes(name,postid) values(?,?);"
    return query(_sql,value);
}

//取消赞
let poseLikes = function(id){
    let _sql = `delete from likes where id = "${id}"`
    return query(_sql);
}

//收藏/取消文章
let insertCollection = function(value){
    let _sql = "insert into collection(uid,postid) values(?,?);"
    return query(_sql,value);
}
let deleteCollection = function (id) { 
    let _sql = `delete from collection where id = "${id}"`
    return query(_sql);
 }
//更新收藏数
let updatePostCollection = function(value){
    let _sql = "update posts set collection=? where id=?"
    return query(_sql,value);
}

//通过用户名查询收藏字段
let findCollectionByData = function(value){
    let _sql = `select * from collection where uid=? and postid=?`
    return query(_sql,value);
}
let findCollectionByUid = function(uid){
    let _sql =`select *from collection where uid="${uid}"`
    return query(_sql);
}
let findCollectPostByUid = function(uid){
    let _sql = `select c.*,p.* from (select * from collection where uid=${uid}) c,posts p where c.postid=p.id`
    return query(_sql);
}

//通过名字查找用户
let findDataByName = function(name){
    let _sql = `SELECT * from users where name="${name}"`
    return query(_sql);
}

//通过文章的名字查找用户
let findPostByUser = function(name){
    let _sql = `SELECT * from posts where name="${name}"`
    return query(_sql);
}

//通过文章id查找
let findPostById = function(id){
    let _sql = `SELECT * from posts where id="${id}"`
    return query(_sql);
}
//通过用户id查找文章
let findPostByUserId = function(uid){
    let _sql = `SELECT * from posts where uid="${uid}"`
    return query(_sql);
}

//通过评论id查找
let findCommentById = function(id){
    let _sql =  `SELECT * from comment where postid="${id}"`
    return query(_sql);
}

//查询所有文章
let findAllPost = function(){
    let _sql = `SELECT * FROM posts`
    return query(_sql);
}
//通过用户名查询点赞记录
let findLikeByName = function(name){
    let _sql = `select * from likes where name="${name}"`
    return query(_sql);
}

// 查询分页文章
let findPostByPage = function(page){
    let _sql = ` select * FROM posts limit ${(page-1)*10},10;`
    return query( _sql)
  }

//更新修改文章
let updatePost = function(values){
    let _sql = `update posts set title=?,content=? where id=?`
    return query(_sql,values);
}

//删除文章
let deletePost = function(id){
    let _sql =  `delete from posts where id="${id}"`
    return query(_sql); 
}

//删除评论
let deleteComment = function(id){
    let _sql = `delete from comment where id = "${id}"`
    return query(_sql);
}

//删除所有评论
let deleteAllPostComment = function(id){
    let _sql = `delete from comment where postid = ${id}`
    return query(_sql);
}

//查找
let findCommentLength = function(id){
    let _sql = `select content from comment where postid in (select id from posts where id=${id})`
    return query(_sql);
}
// 评论分页
let findCommentByPage = (page,articleId) => {
    let _sql = `select * from comment where postid=${articleId} order by id desc limit ${(page-1)*10},10;`
    return query(_sql);
  }


//关注作者
let findFollowByUid = (uid)=>{
    let _sql =  `select f.*,u.* from (select * from follow where uid=${uid}) f,users u where f.fwid=u.id;`
    return query(_sql);
}
let findFollowerByUid = (fwid)=>{
    let _sql = `select f.*,u.* from (select * from follow where fwid=${fwid}) f,users u where f.uid=u.id;`
    return query(_sql);
}
let findFollowerByUFid = (fwid)=>{
    let _sql = `select * from follow where fwid =${fwid}`;
    return query(_sql);
}
let findFollowByUserId = (value)=>{
    let _sql = `select * from follow where uid = ? and fwid = ?`;
    return query(_sql,value);
}
// let findFollowerByUserId = (id)=>{
//     let _sql = `select * from follower where uid = "${id}"`;
//     return query(_sql);
// }
let insertFollow = (value)=>{
    let _sql = `insert into follow(uid,fwid) values(?,?)`
    return query(_sql,value);
}
// let insertFollower = (value)=>{
//     let _sql = `insert into follower(uid,frid) values(?,?)`
//     return query(_sql,value);
// }
let deleteFollow = (value)=>{
    let _sql = `delete from follow where uid = ? and fwid = ?`
    return query(_sql,value);
}
//暴露所有函数接口
module.exports = {
    query,
    createTable,
    insertData,
    updateUserImg,
    updateUser,

    //评论
    insertComment,
    findCommentById,
    deleteComment,
    findCommentLength,
    updatePostComment,
    deleteAllPostComment,
    findCommentByPage,

   //文章
   findDataByName,
   insertPost,
   findAllPost,
   findPostByUser,
   findPostById,
   findPostByUserId,
   updatePost,
   deletePost,
   updatePostPv,
   findPostByPage,

    //收藏
    updatePostCollection,
    findCollectionByUid,
    insertCollection,
    deleteCollection,
    findCollectionByData,
    findCollectPostByUid,
    findFollowByUid,
    findFollowerByUid,

    //点赞
    insertLikes,
    poseLikes,
    findLikeByPostId,
    updatePostLike,
    findLikeByName,

    //关注
    findFollowerByUFid,
    findFollowByUserId,
    // findFollowerByUserId,
    insertFollow,
    // insertFollower,
    deleteFollow,
}
