var express = require('express');
var router = express.Router();
var zhuce = require('../database/zhuce');
var multiparty = require('multiparty'); 
var util = require('util'); 
var fs = require('fs'); 
var checkSession =require('../jsbean/CheckSession.js');
var queModel=require('../database/queModel.js');
var loginbeans=require('../jsbean/loginbean.js');
const formidable =require('formidable');

/* GET home page. */
router.get('/', function(req, res, next) {
	loginbean = req.session.loginbean;
	zhuce.loads(req,res);
});

router.get('/index', function(req, res, next) {
	_id=req.query['id']
	zhuce.indexcheck(req,res,loginbean)
});

router.post('/comment', function(req, res, next) {
	subflag=req.body['subflag']
	zhuce.replay(req,res)
});

router.post('/uploadImg',function(req,res){ 
    var form = new multiparty.Form(); 
    //设置编码 
    form.encoding = 'utf-8'; 
    //设置文件存储路径 
    form.uploadDir = "./uploadtemp/"; 
    //设置单文件大小限制 
    form.maxFilesSize = 2 * 1024 * 1024; 
    //form.maxFields = 1000;  设置所以文件的大小总和 
     
    form.parse(req, function(err, fields, files) { 
        uploadurl='/images/upload/' 
				//获取所有的参数数组
				
        file1 = files['filedata']; 
				// console.log(files,file1)
        //paraname = file1[0].fieldName;  //获取参数名filedata 
        originalFilename = file1[0].originalFilename; //获取原始文件名 
        tmpPath = file1[0].path;//uploads\mrecQCv2cGlZbj-UMjNyw_Bz.txt  读取临时文件
        //fileSize = file1[0].size; //获取文件大小 
         
        var timestamp=new Date().getTime(); //获取当前时间戳 
        uploadurl += timestamp+originalFilename 
        newPath= './public'+uploadurl; //图片的新名称
 
        var fileReadStream = fs.createReadStream(tmpPath);//读出流
        var fileWriteStream = fs.createWriteStream(newPath); //写入流
        fileReadStream.pipe(fileWriteStream); //管道流 在读出图片的同时写入图片
        fileWriteStream.on('close',function(){ //图片写入完毕后所触发的事件
               fs.unlinkSync(tmpPath);    //删除临时文件夹中的图片 
               console.log('copy over');  
               res.send('{"err":"","msg":"'+uploadurl+'"}')  
        }); 
    }); 
      //----------------------------------------- 
    //res.send('上传'); 
});   
router.get('/login', function(req, res, next) {
	
	var subflag=req.query['subflag']
	if(subflag==undefined){
		me=req.query['id']
		res.render('login',{me:me});
	}else{
		email=req.query['email'];
		pwd=req.query['pwd'];
		// console.log(email);
		// 可以直接在前端判断也可以在路由页判断阻止执行，路由页判断更加简单一些
		if(email==''||pwd==''){
		 return	res.send("<script>alert('请重新输入具体的email和密码');location.href='/login'</script>");
		}else{
			zhuce.zc(req,res);
		}
		// 登录失败渲染error页面
		// if(email.trim().length==0||pwd.trim().length==0) 
		// return res.status(400).render('error',{message:'请重新输入具体的email和密码'})
		
		// zhuce.zc(req,res);
	}
})

router.post('/regist',function(req,res,next){
	var subflag=req.body['subflag'];
	console.log(subflag,'-------');
	if(subflag==undefined){
		res.render('regist');
	}else{
		pwd=req.body['pwd'],
		repwd=req.body['repwd'],
		email=req.body['email'],
		uid=req.body['uid'],
		flg=false
		str='';
		if(pwd!==repwd){
			str='密码两次输入不一致!';		
		}else if(!(/^\D.{5,17}$/.test(pwd))){
			str='密码必须6至18个字符,开头非数字!';
		}else if(!(/^\D.{2,7}$/.test(uid))){
			str='用户名必须3至8个字符,开头非数字!';
		}else{
			flg=true;
		}
		if(flg){
			zhuce.regist(req,res)
			loginbean = checkSession.check2(req,res);
			if(!loginbean){
				res.redirect("/login");
			}else{
				res.redirect("/users");
			}	
		}else{
			res.send("<script>alert('"+str+"');location.href='/regist'</script>");
		}
	}
});

router.get('/users', function(req, res, next) {
	loginbean = checkSession.check(req,res);
	if(!loginbean){
		return;
	};
	// console.log(loginbean)
  queModel.userCheck(req,res,loginbean);
});

router.post('/update', function(req, res, next) {
	// console.log('---------')
	zhuce.updateone(req,res)
});

router.post('/change', function(req, res, next) {
	// uploadurl='/uploads/' 
	uploadurl='\\uploads\\'
	
	var form = new multiparty.Form(); 
	
	form.encoding = 'utf-8';
	//设置文件存储路径 
	form.uploadDir = "./uploadtemp/"; 
	//设置单文件大小限制 
	form.maxFilesSize = 2 * 1024 * 1024; 
	
	form.keepExtensions = true;
	
	form.parse(req, (err,fields,files) => {
    file1 = files['cover']; 
		var tmpPath=file1[0].path  //获取临时文件
		var originalFilename=file1[0].originalFilename  //获取初始文件
		// console.log(tmpPath,originalFilename,files)
		var timestamp='upload_'+new Date().getTime(); //获取当前时间戳
		uploadurl += timestamp+originalFilename  
		newPath= './public'+uploadurl; //图片的新名称
		var fileReadStream = fs.createReadStream(tmpPath);//读出流
		var fileWriteStream = fs.createWriteStream(newPath); //写入流
		fileReadStream.pipe(fileWriteStream); //管道流 在读出图片的同时写入图片
		fileWriteStream.on('close',function(){ //图片写入完毕后所触发的事件
		       fs.unlinkSync(tmpPath);    //删除临时文件夹中的图片 
		       console.log('copy over');   
		       // res.send('{"err":"","msg":"'+uploadurl+'"}')  
		}); 
		zhuce.updateatc(req,fields,files)
		res.redirect('/users/publish')	
		// res.send(fields);
	})
});

module.exports = router;
