const mongoose = require('mongoose');
const mongodb =require('mongodb');
// 导入bcrypt
const bcrypt = require('bcrypt');


mongoose.Promise=global.Promise;
mongoose.set('useCreateIndex', true) //加上这个
// mongoose.connect('mongodb://localhost:27017/myexpress');
var db=mongoose.connect('mongodb://localhost:27017/myexpress',{ useUnifiedTopology: true,useNewUrlParser: true });


var User=mongoose.model('users1',new mongoose.Schema({
	uid:{
		type:String,
		required:true,
		minlength:2,
		maxlength:8,
		unique:true
	},
	email:{
		type:String,
		required:true,
		unique:true
	},
	pwd:{
		type:String,
		required:true
	},
	repwd:{
		type:String,
		required:true
	},
	role:{
		type:String,
		required:true
	},
	state:{
		type:Number,
		default:0
	}
},{_id:true}));

// async function createUser () {
// 	const salt = await bcrypt.genSalt(10);
// 	const pass = await bcrypt.hash('123456', salt);
// 	const user = await User.create({
// 		uid: 'iteheima',
// 		email: 'itheima@itcast.cn',
// 		pwd:pass,
// 		repwd:pass,
// 		role: 'admin',
// 		state: 0
// 	});
// }

var Question=mongoose.model('que',new mongoose.Schema({
	title:{
		type:String,
		required:[true,'请填写文字标题'],
		minlength:4,
		maxlength:40
	},
	author:{
		type:String
		// ref:'User'
		// required:[true,'请输入作者名称']
	},
	uid:{
		type:String
	},
	publishtime:{
		type:String
		// default:Date.now
	},
	cover:{
		type:String,
		default:null
	},
	content:{
		type:String
	},
},{_id:true}));


var Replay=mongoose.model('comments',new mongoose.Schema({
	uid:{
		type:String //自己
	},
	pid:{
		type:String //别人
 	},
	content:{
		type:String
	},
	author:{
		type:String
	},
	publishtime:{
		type:String
	},
},{_id:true}));

exports.User=User;
exports.db=db;
exports.Replay=Replay;
exports.Question=Question;