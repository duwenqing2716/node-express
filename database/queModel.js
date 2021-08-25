var Quetion = require('../database/db').Question;
var User=require('../database/db').User;
var db = require('../database/db').db;
var async = require('async');
var LoginBean = require("../jsbean/LoginBean");


module.exports = {
	tjwz(req,fields,loginbean,files) {
		var quetion = new Quetion({});
		quetion.title = fields.title,
		quetion.author = loginbean.nicheng,
		quetion.uid = loginbean.id,
		// console.log(files,files.cover.path.split('public')[1])
		quetion.cover = files.cover.path.split('public')[1],
		// quetion.cover = fields.cover,
		quetion.publishtime=publishtime,
		quetion.content = fields.content,
		// console.log(fields)
		quetion.save(function(err) {
			if (err) {
				console.log(err.message)
				return
			}
		})
		// res.redirect(307,'/users')
	},
	check(req,res,loginbean){
		// console.log(req.query['page'])
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
		pageSize=3;
		pointStart=(page-1)*pageSize;
		count=0;
		countPage=0;
		async.series({
			one: function(callback) {
				  uid=loginbean.id
					console.log(uid)
			    Quetion.countDocuments({uid:uid},function (err, rs) {
			        count=rs;
			        countPage=Math.ceil(count/pageSize);
			        if(page>countPage) {
			            page = countPage;
			            pointStart = (page - 1) * pageSize;
			        }
							if(count==0){
								// console.log('------')
								return res.render('article', {loginbean:undefined,rs:undefined,count:undefined});
							}
			        callback(null, rs);
			    })
			},
			two:function(callback){
				// _id=loginbean.id,
				// console.log(_id),
				if(loginbean.id){
					uid=loginbean.id;
				}else{
					return res.send("<script>alert('用户已经注销账号');location.href='/user/publish'</script>");
				}
				Quetion.find({uid:uid},function(err,rs){
					if(err){
						console.log(err);
						return;
					}
					callback(null, rs);
				}).sort({_id:-1}).skip(pointStart).limit(pageSize)
			}
		},function(err, results){
			rs=results['two'];
			// console.log(rs);
			res.render('article', {loginbean:loginbean,page:page,rs:rs,countPage:countPage,count:count});
		})
	},
	userCheck(req,res,loginbean){
		// console.log(req.query['page'])
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
			one: function(callback) {
			    User.countDocuments(function (err, rs) {
			        count=rs;
			        countPage=Math.ceil(count/pageSize);
			        if(page>countPage) {
			            page = countPage;
			            pointStart = (page - 1) * pageSize;
			        }
			        callback(null, rs);
			    })
			},
			two:function(callback){
				User.find(function(err,rs){
					if(err){
						console.log(err);
						return;
					}
					 callback(null, rs);
					 // res.render('user', {rs:rs});
				}).skip(pointStart).limit(pageSize)
			}
		},function(err, results){
			rs=results['two'];
			
			// console.log(rs,loginbean,'--------------------------------这个--------------')
			res.render('user', {loginbean:loginbean,page:page,rs:rs,countPage:countPage,count:count});
		})
	},
	update:function(req,res,loginbean){
		id=req.query['id'];
		User.findOne({_id:id},function(err,rs){
			if(err){
				console.log(err);
				return;
			}
			res.render('regist',{rs:rs,link:"/update?id="+id,button:'修改',id:id})
		})
	},
	deleteuser:function(req,res){
		var subflag=req.query['subflag'];
		_id=loginbean.id;
    async.series({
			one:function(callback){
				User.findOne({_id:_id},function(err,rs){
					if(rs["state"]=='0'||rs["role"]=='user'){
						return res.send("<script>alert('未拥有该权限');location.href='/users'</script>");
					}
					callback(null,rs)
				})
			},
			two:function(callback){
				User.findOneAndDelete({_id:subflag},function(err,rs){
					console.log(subflag,_id)
					if(subflag==_id){
						return res.redirect('/login')
					}
					if(err){
						console.log(err.message);
						return;
					}
					callback(null,rs)
				})
			}
		},function(err, results){
			res.redirect('/users')
		})
		
	},
	updatewrite:function(req,res,loginbean){
		id=req.query['id'];
		// console.log('修改------',id);
		Quetion.findOne({_id:id},function(err,rs){
			if(err){
				console.log(err);
				return;
			}
			res.render('write',{rs:rs,link:"/change?id="+id,button:'修改',id:id})
		})
	},
	deleteatc:function(req,res){
		var subflag=req.query['subflag']
		Quetion.findOneAndDelete({_id:subflag},function(err){
			if(err){
				console.log(err.message);
				return;
			}
		})
		res.redirect('/users/publish')
	}
}
