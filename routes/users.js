var express = require('express');
var router = express.Router();
var zhuce = require('../database/zhuce');
var queModel=require('../database/queModel.js');
var checkSession =require('../jsbean/CheckSession.js');
const formidable =require('formidable');
const path=require('path');


/* GET users listing. */
router.get('/logout', function(req, res, next) {
   req.session.destroy(function(err){
		 res.redirect('/')
	 })
});

router.get('/users-edit', function(req, res, next) {
	 var id=req.query['id'];
	 // 判断修改操作还是渲染操作
	 if(id){
		 queModel.update(req,res,loginbean);
	 }else{
		 // console.log(id)
		 res.render('regist',{link:'/regist',button:'添加',id:id,rs:'',loginbean:loginbean})
	 }

});

router.get('/publish-edit', function(req, res, next) {
  loginbean = checkSession.check(req,res);
  if(!loginbean){
		return;
	};
	var id=req.query['id'];
	if(id){
			 queModel.updatewrite(req,res,loginbean);
	}else{
		   console.log(id)
			 res.render('write',{link:'/users/article-add',button:'添加',id:id});
	}
});
// router.post('/article-add',require('./admin/article-add.js'));

router.post('/article-add',function(req, res, next){
	loginbean = checkSession.check(req,res);
	if(!loginbean){
		return;
	};
	var time=new Date();
	sj=time.getFullYear()+'/'+(time.getMonth()+1)+'/'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()
	const form = new formidable.IncomingForm();
	// 2.配置上传文件的存放位置
	form.uploadDir = path.join(__dirname, '../', 'public', 'uploads');
	// 3.保留上传文件的后缀
	form.keepExtensions = true;
	// 4.解析表单
	form.parse(req, (err, fields, files) => {
		// 1.err错误对象 如果表单解析失败 err里面存储错误信息 如果表单解析成功 err将会是null
		// 2.fields 对象类型 保存普通表单数据
		// 3.files 对象类型 保存了和上传文件相关的数据
		// res.send(files.cover.path.split('public')[1])
		// await Article.create({
		// 	title: fields.title,
		// 	author: fields.author,
		// 	publishDate: fields.publishDate,
		// 	cover: files.cover.path.split('public')[1],
		// 	content: fields.content,
		// });
		
		if(fields.publishtime!=''){
			console.log('11111')
			publishtime=fields.publishtime;
		}else{
			
			publishtime=sj;
			console.log('22222',sj)
		}
		// 将页面重定向到文章列表页面
		queModel.tjwz(req, fields, loginbean,files)
		// res.send(fields);
	})
	res.redirect('/users/publish');
});

router.get('/publish', function(req, res, next) {
  loginbean = checkSession.check(req,res);
  if(!loginbean){
		return;
	};
	
	// res.render('article');
	queModel.check(req,res,loginbean);
});

router.get('/delete-user',function(req, res, next){
	console.log('123123123')
	queModel.deleteuser(req,res)
})

router.get('/delete-article',function(req, res, next){
	queModel.deleteatc(req,res)
})


module.exports = router;
