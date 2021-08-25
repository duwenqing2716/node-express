var User=require('../database/db').User;
var Quetion = require('../database/db').Question;
var db=require('../database/db').db;
var LoginBean = require("../jsbean/LoginBean");
var Replay = require('../database/db').Replay;
var async = require('async');

var time=new Date();
sj=time.getFullYear()+'/'+(time.getMonth()+1)+'/'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()
module.exports={
	loads(req,res){
		page=1;
		if(req.query['page']!=undefined){
			page=parseInt(req.query['page']);
			if(page<1){
				page=1;
			}
		}
		if(isNaN(req.query['page'])){
			page=1;
		}
		pageSize=4;
		pointStart=(page-1)*pageSize;
		count=0;
		countPage=0;
		async.series({
			one:function(callback){
				 Quetion.countDocuments(function (err, rs) {
					 count=rs;
					 countPage=Math.ceil(count/pageSize);
					 if(page>countPage) {
					     page = countPage;
					     pointStart = (page - 1) * pageSize;
					 }
					 callback(null,rs)
				 })
			},
			two:function(callback){
				Quetion.find(function(err,rs){
					if(err){
						console.log(err.message)
						return;
					}
					callback(null,rs)
				}).skip(pointStart).limit(pageSize)
			}
		},function(err,results){
			rs=results['two'];
			// console.log(loginbean,'-----------------')
			res.render('index',{loginbean:loginbean,page:page,rs:rs,countPage:countPage,count:count});
		})
	},
	replay(req,res){
		var replay =new Replay({});
	  replay.content=req.body['comment']
		if(req.body['comment']==''){
			return res.send("<script>alert('评论内容不能为空');location.href='/'</script>")
		}
	  replay.publishtime=sj
	  replay.pid=subflag
	  replay.uid=loginbean.id
	  replay.author=loginbean.nicheng
		replay.save(function(err,rs){
			if(err){
				console.log(err.message)
				return;
			}
		})
		res.redirect('/index?id='+subflag)
	},
	indexcheck(req,res,loginbean){
		async.series({
			one:function(callback){
				Replay.find({pid:_id},function(err,rs){
					if(err){
						console.log(err.message)
						return;
					}
					callback(null,rs)
				})
			},
			two:function(callback){
				Quetion.find({_id:_id},function(err,rs){
					if(err){
						console.log(err.message)
						return;
				  }
					callback(null,rs)
			  })
		  },
		},function(err,results){
			  rs=results['two'];
				rs1=results['one'];
				console.log(rs1)
			res.render('detail',{rs:rs,rs1:rs1})
		})
	},
	regist(req,res){
		var user =new User({});
		user.email=req.body['email'];
		user.pwd=req.body['pwd'];
		user.uid=req.body['uid'];
		user.role=req.body['role'];
		user.state=req.body['state'];
		user.repwd=req.body['repwd'];
		user.save(function(err){
			if(err){
				errStr=err.message;
				console.log(errStr);
				sendStr = '<script>';
				if(errStr.indexOf('myexpress.user2 index: email_1')>-1){					
					sendStr += "alert('email重复');";
				}else if(errStr.indexOf('myexpress.user2 index: uid_1')>-1){
					sendStr += "alert('昵称重复');";
				}
				sendStr += '</script>';
				return res.send(sendStr);
			}
		})
	},
	zc(req,res){
		User.find({email:email,pwd:pwd},function(err,rs){
			console.log(rs)
			if(rs.length>0){
			    loginbean = new LoginBean();    
			    loginbean.id=rs[0]._id;   
			    loginbean.nicheng = rs[0].uid; 
					loginbean.state=rs[0].state;
					loginbean.role = rs[0].role; 
			    req.session.loginbean = loginbean;
					// console.log(rs,'----------胜多负少的发生的------------');
			  //   //res.send('登录成功');
					// targeturl = req.body['targeturl']; 
					// res.redirect(targeturl);    //跳转回index页
					 if(me!=undefined){
						 console.log('-----------------234234----------')
						 res.redirect(307,'/index?id='+me)
					 }else{
						 res.redirect(307,'/')
					 }
				// res.send('登录cg')
			}else{
				res.send("<script>alert('登录失败,email或者密码不正确');location.href='/login'</script>");
			}
			res.end('')
		})
	},
	updateone(req,res){
		const _id=req.query['id']
		uid=req.body['uid']
		role=req.body['role']
		state=req.body['state']
		email=req.body['email']
		id=loginbean.id
		state1=loginbean.state
		role1=loginbean.role
		pwd=req.body['pwd']
		console.log(loginbean)
		User.findOne({_id:_id},function(err,rs){
			if(_id==id){
			  console.log('为登录账号')
				if(rs.pwd==pwd){
					console.log('密码比对成功')
					loginbean = new LoginBean();
					loginbean.nicheng = uid;  
					loginbean.id = _id; 
					req.session.loginbean = loginbean;
					if(rs['role']=="admin"&&rs['state']=="1"){
					  console.log('是超级管理员')
						loginbean.state=state;
						loginbean.role=role;
						req.session.loginbean = loginbean;
						User.updateOne({_id:_id},{uid:uid,email:email,role:role,state:state},function(err,rs){})
						return res.redirect('/users')
					}else{
						console.log('不是超级管理员',role,rs['role'],state,rs['state'])
						if(role!=rs['role']||state!=rs['state']){
							console.log('企图更改权限')
							return res.send("<script>alert('用户权限不够,无权限修改');location.href='/users'</script>");
						}
						User.updateOne({_id:_id},{uid:uid,email:email},function(err,rs2){})
						return res.redirect('/users')
					}
			  }else{
					console.log('密码比对失败')
						return res.send("<script>alert('密码比对失败,无权限修改');location.href='/users'</script>");
				}
			}else{
				console.log('不是登录账号')
				console.log(id,_id,loginbean,role,state)
				if(role1=="admin"&&state1=="1"){
				  console.log('是超级管理员')
					User.updateOne({_id:_id},{uid:uid,email:email,role:role,state:state},function(err,rs){})
					return res.redirect('/users')
				}else{
					console.log('不是超级管理员')
					return res.send("<script>alert('禁止对他人账号进行操作');location.href='/users'</script>");
				}
			}
		})
	},
	updateatc(req,fields,files){
		console.log('进入成功')
		title = fields.title,
		_id = fields.subflag,
		cover = uploadurl,
		content = fields.content,
		publishtime=sj
		console.log(fields,files,title,content,publishtime,'-----')
		Quetion.findOne({_id:_id},function(err,rs){
			// console.log('-----------22222222------------------')
			Quetion.updateOne({_id:_id},{
				title:title.toString(),
				content:content.toString(),
				cover:cover.toString(),
				publishtime:publishtime.toString()
			},function(err){
				if(err){
					console.log(err.message)
				}
			})
		
		})
	}
}