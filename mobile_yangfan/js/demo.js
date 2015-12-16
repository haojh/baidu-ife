var EditFlag=true;//true代表的是添加条目 false代表的是编辑条目
var EditIndex=0;//代表的是编辑的条目在ul中的index

/***********账目列表页面的处理*************/

///账目列表界面的函数处理设计
var BillListInit=function(){
	//on函数的含义是对于前面bill-list对象中的每个li元素都设置一个函数名为dealSwipe的swipeleft和swiperight的事件
	//手指在条目上左右滑动触发的事件
	$(".bill-list").on("swipeLeft swipeRight","li",DisplaySwipe);
	//手指点击删除条目
	$(".bill-list").on("click",".icon-trash",delBill);
	//手指点击编辑条目
	$(".bill-list").on("click",".icon-pencil",showEditList);

	//点击界面中的不同icon时的处理函数
	$(".head").on("click",".icon-menu, .icon-cancel, .icon-pencil",function(){
		if(this.className=="icon-menu")//如果出现的是menu，那么显示ul并且将menu改为cancel
		{
			$(".menu").show().height("3.2rem");
			$(this).removeClass('icon-menu').addClass('icon-cancel');
		}
		else if(this.className=="icon-cancel")//如果出现的是cancel，那么隐藏ul并且将cancel改为menu
		{
			$(".menu").hide().height(0);//隐藏出ul
			$(this).removeClass('icon-cancel').addClass('icon-menu');
		}
		else if(this.className=="icon-pencil")//如果出现的是pencil，那么隐藏head ul list-content 展示edit-head和edit-content
		{
			ExitBillList();
		}
	});
	
	//点击ul中的两个li事件
	//如果点击的是账目列表
	$("#Blist").on("click",function(){
		this.className="active";
		$("#Bgraph").removeClass('active');
		$(".menu").hide().height(0);//隐藏ul
		$(".head .icon-cancel")[0].click();//将icon-cancel改变为icon-menu
		$(".head .icon-pencil").css("visibility",'visible');//有pencel这个icon
		hideGraph();
		showList();
	});
	//点击的是账目图表
	$("#Bgraph").on("click",function(){
		this.className="active";
		$("#Blist").removeClass('active');
		$(".menu").hide().height(0);//将ul隐藏
		$(".head .icon-cancel")[0].click();//将icon-cancel改变为icon-menu
		$(".head .icon-pencil").css("visibility",'hidden');//隐藏pencil的icon
		hideList();
		showGraph();
		//图表页面的初始化
		//graphInit();
		loadChartList.init();
	});
	//初始化bill-list的div账目条目
	initBillList();
};
//手指在条目上左右滑动的函数处理
function DisplaySwipe(event)
{
	$(this).siblings().each(function(index,item){
		if(item.style.transform == "translate(-8.8rem,0px)")
		{
			item.style.transform="translate(0px,0px)";
		}
	});

	if(event.type=="swipeLeft")
	{
		$(this).css({'transform':"translate(-8.8rem,0px)"});
	}
	else
	{
		$(this).css({'transform':"translate(0px,0px)"});
	}
}
//手指点击删除条目
function delBill(){
	//删除这个li的内容
	var liCon=$(this).parents("li");
	var pos=liCon.index();//index可以获取当前li在整个ul的li中的index
	//初始化billItem和billMoney
	var billItem=JSON.parse(localStorage.billItem);
	var billMoney=JSON.parse(localStorage.billMoney);

	var temp=billItem[pos];//获取这个index下原来的对象
	
	//如果删除了账目条目那么花费的钱就有改变
	if(temp.icon=="icon-money")//如果删除的收入的账目
	{
		billMoney.income -= parseFloat(temp.num);
	}
	else//如果删除的花费的账目
	{
		billMoney.spending -= parseFloat(temp.num);
		billMoney.categorylist[temp.icon] -= parseFloat(temp.num);
	}


	billItem.splice(pos,1);//从数组中删除这个对象
	localStorage.billItem=JSON.stringify(billItem);//保存billItem的值
	localStorage.billMoney=JSON.stringify(billMoney);//保存billMoney的值

	//重新初始化bill-list
	initBillList();
}
//点击编辑条目
function showEditList(){
	var toEdit=$(this).parent().prev();//list-item的div 要编辑的那个div的
	//进入编辑条目的状态
	EditFlag=false;
	//隐藏bill-list页面
	hideList();
	
	//显示编辑页面（input中的值要放置刚才那个值）
	showEdit();
	$(".footer").css("display","block");
	//获取要编辑的这个li的index
	var index=$(toEdit).parent().index();
	//editIndex代表的是正在编辑的条目在ul的li中的index，方便更改billItem的值
	EditIndex=index;

	var billItem=JSON.parse(localStorage.billItem);
	var billObj=billItem[index];


	$(".footer").html('<div id="choice">'
				  	+'<i class="'+billObj.icon+'"></i>'
				  	+'<span>'+billObj.name+'</span>'
				  +'</div>'
				  	+'<div class="input_num">'
				  	+'<i class="icon-yen"></i>'
					+'<input type="text" id="itemNum">'
		    	  +'</div>');
	//点击pencil进入编辑界面的时候，input中的值为原来的花费的值
	$(".footer input").val(billObj.num);
	//将状态更改为正在重新编辑账目条目的值
	EditFlag=false;
}

//初始化账目条目
function initBillList()
{
	//获取到billItem
	var billItem=JSON.parse(localStorage.billItem);
	//这里判断十分重要 如果billItem中没有值即还未开始记账的时候，不用初始化账目条目
	if(billItem.length==0)
	{
		return ;
	}
	//console.log(billItem);
	var lihtml='';
	var str="";
	for(var i=0,l=billItem.length;i<l;i++)
	{
		lihtml+='<li>'
				+'<div class="list-item">'
					+'<div>'
						+'<i class="'+billItem[i].icon+'"></i>'
						+'<span>'+billItem[i].name+'</span>'
					+'</div>'
					+'<span class="'+billItem[i].Icolor+'">'+billItem[i].num+'</span>'
					+'<div class="date">'+billItem[i].date+'</div>'
				+'</div>';
		lihtml+='<div class="edit-item">'
		   	     +'<i class="icon-pencil"></i>'
		   	     +'<i class="icon-trash"></i>'
		      +'</div>';

		lihtml+='</li>';
	}
	//更改ul中的html内容
	$(".bill-list").html(lihtml);
	//console.log($(".bill-list").html());
}
//离开账目列表界面
function ExitBillList()
{
	//隐藏bill界面
	hideList();
	//隐藏ul
	$(".menu").hide().height(0);
	//显示编辑界面
	showEdit();
}

/************编辑页面的处理**************/

///编辑页面的处理
var EditInit=function(){
	//编辑页面中点击七个icon出现下面输入对应项花费
	$(".edit-content i").on("click",addItem);
	//点击取消按钮离开编辑页面
	$(".edit-head .icon-cancel").on("click",exitEdit);
	//编辑页面中点击发布按钮的对应处理
	$(".edit-head .commit").on("click",addBill);
};
//编辑页面输入每项花费的函数
function addItem()
{
	var item=JSON.parse(localStorage.item);
	//将footer设置为display为block
	$(".footer").css("display","block");
	var itemid=this.getAttribute("itemid");
	
	$(".footer").html('<div id="choice">'
				  	+'<i class="'+this.className+'"></i>'
				  	+'<span>'+item[itemid].name+'</span>'
				  +'</div>'
				  	+'<div class="input_num">'
				  	+'<i class="icon-yen"></i>'
					+'<input type="text" id="itemNum">'
		    	  +'</div>');
	EditFlag=true;//增加账目条目状态
}
//离开编辑页面的函数
function exitEdit()
{
	//切换到账目列表页面
	hideEdit();
	//将footer设置为display为none
	$(".footer").css("display","none");
	showList();

	//初始化账目条目
	initBillList();
	EditFlag=false;//进入编辑条目状态
};
//添加账目信息
function addBill()
{
	//获取编辑界面的foot的显示状态
	var footDis=$(".footer").css("display");
	//console.log(footDis);//none
	if(footDis==='none')
	{
		alert("请先选择要记录的类别");
	}
	else if(footDis==="block")
	{
		//获取input的值
		var itemVal=$("#itemNum").val();//是个字符串
		itemVal=parseFloat(itemVal).toFixed(2);//浮点数取两位小数点 结果是字符串
		
		if(isNaN(itemVal))//注意这个判断如果input中未输入值，那么itemVal就是isNaN
		{
			alert("请输入金额");
			$("#itemNum").val("");//将input的值清空
		}
		else if(itemVal>1000 || itemVal<=0)
		{
			alert("请输入0到1000的金额");
			$("#itemNum").val("");//将input的值清空
		}
		else
		{
			
			var billItemText=[];
			var billMoneyText={
				"income":0,//总收入
				'spending':0,//所有花费
				'categorylist':{
					'icon-user':0,//衣服花费
					'icon-coffee':0,//饮食花费
					'icon-home':0,//住宿花费
					'icon-flight':0,//交通花费
					'icon-basket':0,//购物花费
					'icon-dollar':0//其他花费
				}
			};

			var storage = window.localStorage;
			
			var billItem = JSON.parse(storage.getItem("billItem")) || [];
	        var billMoney = JSON.parse(storage.getItem("billMoney")) || {
	            "income":0,//总收入
				'spending':0,//所有花费
				'categorylist':{
					'icon-user':0,//衣服花费
					'icon-coffee':0,//饮食花费
					'icon-home':0,//住宿花费
					'icon-flight':0,//交通花费
					'icon-basket':0,//购物花费
					'icon-dollar':0//其他花费
				}
	        };

			//var billItem=JSON.parse(localStorage.billItem);
			//var billMoney=JSON.parse(localStorage.billMoney);
			var choiceItem=document.querySelector("#choice span").innerHTML;
			var iconName=document.querySelector("#choice i").className;
			//console.log(iconName);
			var dateobj=new Date();
			var month=(dateobj.getMonth()+1);
			var date=dateobj.getFullYear()+'/'+month+'/'+dateobj.getDate();
			
			var billObj={
				'name':choiceItem,
				'date':date,
				'icon':iconName,
				'num':itemVal,//字符串
				'month':month
			};
			//console.log(billObj.num);
			if(iconName=='icon-money')
			{
				billObj.Icolor="income-num";
			}
			else
			{
				billObj.Icolor="spending-num";
			}

			//第三个图表页面的处理
			if(billObj.icon=="icon-money")//如果是收入
			{
				billMoney.income += parseFloat(billObj.num);
				if(EditFlag==false)//如果是编辑条目即改变icome的值
				{
					billMoney.income -= parseFloat(billItem[EditIndex].num);
				}
			}
			else//如果是花费方面的改变
			{
				billMoney.spending += parseFloat(billObj.num);
				billMoney.categorylist[billObj.icon] += parseFloat(billObj.num);
				if(EditFlag==false)//如果是编辑花费
				{
					billMoney.spending -= parseFloat(billItem[EditIndex].num);
					billMoney.categorylist[billObj.icon] -= parseFloat(billItem[EditIndex].num);
				}
			}
			//重新编辑账目条目和新建账目条目对billItem的处理是不同的
			if(EditFlag==false)
			{
				billItem.splice(EditIndex,1,billObj);//用billObj对象代替eidtindex位置上的对象
				alert("修改成功");
			}
			else
			{
				billItem.push(billObj);
				alert("记一笔成功");
			}
			/*localStorage.billItem=JSON.stringify(billItem);
			localStorage.billMoney=JSON.stringify(billMoney);*/
			storage.setItem('billItem', JSON.stringify(billItem));
			storage.setItem('billMoney', JSON.stringify(billMoney));
			//将footer设置为display为none
			$(".footer").css("display","none");
		}
	}
}


//初始化数据库
function initDataBase()
{
	var itemText=[
		{
			"id":0,
			"name":"收入",
		},
		{
			"id":1,
			"name":"衣服",
		},
		{
			"id":2,
			"name":"饮食",
		},
		{
			"id":3,
			"name":"住宿",
		},
		{
			"id":4,
			"name":"交通",
		},
		{
			"id":5,
			"name":"购物",
		},
		{
			"id":6,
			"name":"其他",
		}
	];
	
	localStorage.item=JSON.stringify(itemText);
	
}

//编辑页面隐藏
function hideEdit()
{
	$(".edit-head").css("display","none");
	$(".edit-content").css("display","none");
}
//显示编辑页面
function showEdit()
{
	$(".edit-head").css("display","block");
	$(".edit-content").css("display","block");
}
//显示账目列表页面
function showList()
{
	$(".head").css("display","block");
	$(".list-content").css("display","block");
}
//隐藏账目列表页面
function hideList()
{
	$(".head").css("display","none");
	$(".list-content").css("display","none");
}
//显示记账图表内容
function showGraph()
{
	$(".head").css("display","block");
	$(".graph-content").css("display","block");
}
//隐藏记账图表内容
function hideGraph()
{
	$(".graph-content").css("display","none");
}



/****************图表页面的初始化*****************/

//参见网址http://echarts.baidu.com/doc/example.html和里面的文档
var optionMap = {
    mypie: {
        color: ["#f39f61", "#6fb2de", "#fe8988", "#da5a4c", "#c6b29c", "#fdc403"],
        tooltip : {
            trigger: 'item',//触发类型
            formatter: "{b}{c}<br/>({d}%)",//b数据项名称 c数值 d百分比
            backgroundColor: "#e5e5e5",
            padding: 5,
            textStyle: {//文本样式
                color: "#8c8c8c",
            },
        },
        series : [
            {
                type:'pie',
                radius : ['40%', '80%'],
                itemStyle : {//图形样式
                    normal : {//悬浮时的样式
                        label : {
                            show : false
                        },
                        labelLine : {//标签视觉引导线
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true,
                            position : 'center',
                            formatter: "{d}%",//标签样式文本器
                            textStyle : {
                                fontWeight : 'bold'
                            }
                        }
                    }
                },
            }
        ],
    },

    myline: {
        tooltip : {
            trigger: 'item',
            formatter: "{c}",//数值
            backgroundColor: "#e5e5e5",
            padding: 5,
            textStyle: {
                color: "#8c8c8c",
            },
        },      
        legend: {
        	data:['收入','支出']//添加了这个就会出现哪个颜色的线代表收入还是支出
    	},
        xAxis : [
            {
                type : 'category',//坐标轴类型，横轴默认为类目型'category'，纵轴默认为数值型'value'
                boundaryGap : false,//类目起始和结束两端空白策略，见下图，默认为true留空，false则顶头
                data : [],
                axisLine: {//坐标轴线，默认显示
                    lineStyle: {
                        color: "#999",
                        width: 1//线宽
                    }
                },
                splitLine: {//分隔线
                    show: true,
                    lineStyle: {
                        type: "dashed"//线条样式，可选为：'solid' | 'dotted' | 'dashed'
                    }
                },
                axisLabel: {//坐标轴文本标签选项
                    textStyle: {//文本样式
                        color: "#999",
                        fontFamily: "Microsoft YaHei"//字体系列
                    }
                }
            }
        ],
        yAxis : [
            {
                show: false,
                type : 'value',//坐标轴类型，横轴默认为类目型'category'，纵轴默认为数值型'value'
                axisLabel : {
                    formatter: '{value}'//间隔名称格式器：{string}（Template） | {Function}  {string}，模板（Template），其变量为：{value}: 内容或值
                },
                splitLine: {//分隔线
                    show: false
                }
            }
        ],
        series : [
            {
                itemStyle: {
                    normal: {
                        color: "#7fd2a9"
                    }
                },
                name:'收入',//系列名称
                type:'line',//折线
                data:[],
                symbol: "circle",//标识图形类型

            },
            {
                itemStyle: {
                    normal: {
                        color: "#db6c63"
                    }
                },
                name:'支出',
                type:'line',
                data:[],
                symbol: "circle",
            }
        ],
        grid: {
            x: "5%",
            y: "5%",
            width: "90%",
            height: "80%",
            borderWidth: 0
        }
    }

};


/***********图表部分处理************/

var loadChartList = (function(){
    var init = function(){
        getData();

        require.config({
            paths:{ 
                echarts: './js/dist',
            }
        });
        require(
            [
                'echarts',
                'echarts/chart/line',
                'echarts/chart/pie'
            ],
            function (ec) {
                initChart(ec);
            }
        );

    };

    var initChart = function (ec) {
        var chartDomList = $(".graph");
        
        var chartObjList = [];
        for(var i = 0 ; i < chartDomList.length; i++){
            (function(){
                var optionkey = chartDomList[i].dataset.optionkey;
                chartObjList[i] = ec.init(chartDomList[i], {
                    noDataLoadingOption:{  
                        text : '暂无数据',
                        effect : 'bubble',
                        textStyle : {
                            fontFamily: "Microsoft YaHei",
                            fontSize : 14
                        }
                    }  
                });
                chartObjList[i].setOption(optionMap[optionkey]);
            }())
        }
    };

    var getData = function(){

    	//饼图的数据为空
	    optionMap.mypie.series[0].data = [];
	    //折线图的数据为空
	    optionMap.myline.xAxis[0].data = [];
	    optionMap.myline.series[0].data = [];
	    optionMap.myline.series[1].data = [];
	    //获取存储的billItem和billMoney
	    var billItem=JSON.parse(localStorage.billItem);
	    var billMoney=JSON.parse(localStorage.billMoney);
	    if(billItem.length==0)//如果billItem为空 代表还未输入项目 那么退出获取数据
	    {
	    	return ;
	    }
	    //计算剩余的钱
	    var remaining = ((billMoney.income*100 - billMoney.spending*100)/100).toFixed(2);
	    //计算并显示总收入 总支出 总剩余
	    $(".all-income").html("￥"+(billMoney.income).toFixed(2));
	    $(".all-spending").html("￥"+(billMoney.spending).toFixed(2));
	    $(".all-remaining").html("￥"+remaining);

	    var monthArr = ["一月", "二月", "三月", "四月", "五月", "六月", 
	                    "七月", "八月", "九月", "十月", "十一月", "十二月"];
	    var categoryMap = {
	        "icon-user": "衣服",
	        "icon-coffee": "饮食",
	        "icon-home": "住宿",
	        "icon-flight": "交通",
	        "icon-basket": "购物",
	        "icon-dollar": "其他"
	    };
	    //获取分类别花费对象
	    var categorylist = billMoney.categorylist;
	    
	    for(var i in categorylist){
	        var dataItem = {"value": categorylist[i], "name": categoryMap[i]};
	        optionMap.mypie.series[0].data.push(dataItem);
	    }
	    var allZero = optionMap.mypie.series[0].data.every(function(item){
	        return (item.value == 0);
	    });
	    if(allZero){
	        optionMap.mypie.series[0].data = [];
	    }

	    var month = billItem[0].month;
	    var incomeMonthMap = {};//收入的月份对象
	    var spendingMonthMap = {};//支出的月份对象
	    var monthNumArr = [];//月份数组

        //给X轴坐标生成对应的月份
        for(var i = 0; i < 6; i++){
            month = month%12;
                
            if(month<=0)
            //这个地方增加一个判断，例如month=1月份 那么减减可能会小于一 
            // 那么monthArr的index不能小于一 所以避免报错就在month小于等于零的时候加上12
            {
            	month=month+12;
        	}
        	optionMap.myline.xAxis[0].data.unshift(monthArr[--month]);
        	
        	monthNumArr.unshift(month);
        	incomeMonthMap[month] = 0;
            spendingMonthMap[month] = 0;
        }
        	//获取对应月份上的支出和收入的总数值
        for(var i = 0; i < billItem.length; i++)
        {
            var billDail = billItem[i];
            var newMon = billDail.month-1;
            //这个地方对newMon-1的原因是数组里面例如12月份对应的数组的index是11，所以每个都要减去一 否则会出错
            
            if(newMon in incomeMonthMap){
      
                if(billDail.icon == "icon-money"){
                    incomeMonthMap[newMon] += +billDail.num;
                }else {
                    spendingMonthMap[newMon] += +billDail.num;
                }
            }else {
                break;
            }
        }
      
        for(var i = 0; i < 6 ; i++){
    
            optionMap.myline.series[0].data.push( incomeMonthMap[monthNumArr[i]] );
            optionMap.myline.series[1].data.push( spendingMonthMap[monthNumArr[i]] );

        }
    };

    return {init: init};
}());


//全部初始化
function initAll()
{
	initDataBase();//初始化数据库
	//编辑页面的初始化处理
	EditInit();
	//账目列表页面的初始化
	BillListInit();
}

//初始化函数
initAll();

