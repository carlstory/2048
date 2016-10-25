/*为元素设置class属性
	1. 网页中一切元素都是对象
	2. HTML标准属性都可用对象.方式访问
	3. html中的class-->className
	(class属性默认表示一个对象的类型名，是内部属性)
*/
//兼容性
function $(id){
	return document.getElementById(id);
}

var game={
	data:[],//保存4*4个单元格的2维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,//分数
	top:0,//最高分
	state:1,//运行状态
	Runing:1,//运行
	Gameover:0,//结束
	Playing:2,//动画播放中
	
	init:function(){//初始化所有格子div的HTML代码
		//设置宽高
		$("gridPanel").style.width=this.CN*116+16+"px";
		$("gridPanel").style.height=this.RN*116+16+"px";
		var grids=[];
		var cells=[];
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				grids.push('<div id="g'+r+c+'" class="grid"></div>');
				cells.push('<div id="c'+r+c+'" class="cell"></div>');
			}
		}
		$("gridPanel").innerHTML=grids.join("")+cells.join("")
	},

	start:function(){//开始方法
		var self=this;//留住this,运用闭包
		//将data初始化为RN*CN的2维数组，每个元素初始化为0
		this.init();
		animation.init();
		//this.data=[];
		for(var r=0;r<self.RN;r++){
			self.data.push(new Array);
			for(var c=0;c<self.CN;c++){
				self.data[r].push(0);
			}
		}

		self.score=0;//分数重置;
		$("top").innerHTML="最高分："+this.getTop();
		$("gameOver").style.display="none";
		self.state=self.Runing;

		self.randomNum();
		self.randomNum();
		self.updataView();

		//绑定键盘事件:当键盘按下时，自动触发
		document.onkeydown=function(){
		if(self.state==self.Runing){
			var e=window.event||arguments[0];
			switch(e.keyCode){
				case 37:self.moveLeft();break;
				case 38:self.moveTop();break;
				case 39:self.moveRight();break;
				case 40:self.moveDown();break;
				}
			}
		}	
	},
	
	setTop:function(value){//将value写入cookie中的top
		var now=new Date();
		now.setFullYear(now.getFullYear()+1);
		document.cookie="top="+value+";expires"+
						now.toGMTString();
	},
	
	getTop:function(){//读取cookie中的top
		var top=parseInt(document.cookie.slice(4));
		return isNaN(top)?0:top;
	},

	isGameOver:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0)
				{return false;}
				else if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]){
					return false
				}
				else if(c<this.CN-1&&this.data[r][c]==this.data[r][c+1]){
					return false
				}
			}
		}
		return true;
	},
	
	randomNum:function(){//生成一个随机数
		do{
			var r=Math.round((Math.random())*(this.RN-1));
			var c=Math.round((Math.random())*(this.CN-1));
			if(this.data[r][c]==0){
				this.data[r][c]=(Math.random()<0.5)?2:4;
				break;
			}
		}while(true)
	},

	updataView:function(){//更新界面
		//遍历data中的每个元素
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var id="c"+r+c;
				if(this.data[r][c]==0){
					$(id).innerHTML="";
					$(id).className="cell";
				}else{
					$(id).innerHTML=this.data[r][c];
					$(id).className="cell n"+this.data[r][c];
				}
			}
		}
		$("score").innerHTML="分数为："+this.score;//获取分数
		//判断死了
		//console.log(this.score)
		if(this.isGameOver()){
			//设置当前游戏对象的状态为GAMEOVER
			this.state=this.Gameover;
			//找到id为finalScore的span，将游戏的score放入内容中
			$("finalScore").innerHTML=this.score;
			//找到id为gameOver的div，设置display属性为block
			$("gameOver").style.display="block";
			/*if(this.score>this.top){
				this.setTop(this.score);
				this.top=this.score;
			}*/
			if(this.score>this.getTop()){
				this.setTop(this.score);
			}
		}
	},
	
	move:function(interator){
		var before=this.data.toString();
		interator.call(this);
		var after=this.data.toString();//现数组
		if(before!=after){//如果移动，
			////修改游戏状态为播放动画状态
			//播放动画状态下，不响应键盘事件
			this.State=this.Playing;
			//启动动画，传入回调函数
			//回调函数在动画播放完成后，自动执行
			//动画完成后，生成随机数，更新页面，修改动画状态为运行状态，才可继续响应按键事件
			//回调函数要提前绑定this为game对象。
			animation.start(function(){
				this.randomNum();//生成一个随机数，更新界面
				this.updataView();
				this.state=this.Runing;
			}.bind(this));	
		}
	},
	//*****************右移****************
	moveRight:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveRightInRow(r);
			}
		});
	},
	
	moveRightInRow:function(row){
		for(var c=this.CN-1;c>0;c--){//遍历data
			var nextc=this.getLeftInRow(row,c);
			//查找指定位置左侧下一个不为0的位置下标
			if(nextc==-1){break;}
			else if(this.data[row][c]==0){
				this.data[row][c]=this.data[row][nextc];
				this.data[row][nextc]=0;
				animation.addTask(
					$("c"+row+nextc),row,nextc,row,c);
				c++;
			}else if(this.data[row][c]==this.data[row][nextc]){
				this.data[row][c]*=2;
				this.data[row][nextc]=0;
				this.score+=this.data[row][c];
				animation.addTask(
					$("c"+row+nextc),row,nextc,row,c);
			}
		}
	},

	getLeftInRow:function(r,cow){
		var nextc=cow-1;
		for(;nextc>=0;nextc--){
			if(this.data[r][nextc]!=0){return nextc}
		}
		return -1
	},

	//*****************左移*********************
	moveLeft:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
			this.moveLeftInRow(r);
			}
		})
	},

	moveLeftInRow:function(row){//仅移动指定一行
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getRightInRow(row,c)
				//查找指定位置右侧下一个不为0的位置下标
			if(nextc==-1){break;}
			else if(this.data[row][c]==0){
				this.data[row][c]=this.data[row][nextc];
				this.data[row][nextc]=0;
				animation.addTask(
					$("c"+row+nextc),row,nextc,row,c);
				c--;//c留在原地
			}else if(this.data[row][c]==this.data[row][nextc]){
				this.data[row][c]*=2;
				this.data[row][nextc]=0;
				this.score+=this.data[row][c];
				animation.addTask(
					$("c"+row+nextc),row,nextc,row,c);
			}
		}
	},

	getRightInRow:function(r,cow){//查找指定位置右侧下一个不为0的位置下标
		var nextc=cow+1;
		for(;nextc<this.CN;nextc++){
			if(this.data[r][nextc]!=0){return nextc}
		}
		return -1;
	},
	//*************上移动*********************
	moveTop:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
			this.moveTopInCol(c);
			}
		})	
	},

	moveTopInCol:function(c){
		for(var r=0;r<this.RN;r++){
			var nextr=this.getDownInCol(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c);
				r--;
			}else if(this.data[r][c]==this.data[nextr][c]){
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c)
			}
		}
	},

	getDownInCol:function(row,c){
		var nextr=row+1;
		for(;nextr<this.RN;nextr++){
			if(this.data[nextr][c]!=0){return nextr}
		}
		return -1;
	},
	//***********下移动**************
	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
			this.moveDownInCol(c)
			}
		})
	},
	moveDownInCol:function(c){
		for(var r=this.RN-1;r>0;r--){
			var nextr=this.getTopInCol(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c);
				r++;
			}else if(this.data[r][c]==this.data[nextr][c]){
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				this.score+=this.data[r][c];
				animation.addTask($("c"+nextr+c),nextr,c,r,c)
			}
		}
	},
	getTopInCol:function(r,c){
		var nextr=r-1;
		for(;nextr>=0;nextr--){
			if(this.data[nextr][c]!=0){return nextr}
		}
		return -1
	}
}
//页面加载后事件：页面加载后自动触发！
window.onload=function(){
	game.start();
	//绑定键盘事件:当键盘按下时，自动触发
	/*document.onkeydown=function(){
		if(game.state==game.Runing){
			var e=window.event||arguments[0];
			switch(e.keyCode){
				case 37:game.moveLeft();break;
				case 38:game.moveTop();break;
				case 39:game.moveRight();break;
				case 40:game.moveDown();break;
			}
		}
	}*/
}
