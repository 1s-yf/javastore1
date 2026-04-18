//修改这个变量为实际控制器的地址，如../showGoods.do
var reqpath = "search.html"

/*电脑商城商品分类数据*/
var typelist = [
	/* ===== 一级分类 (parentId: "0") ===== */
	{"id":"1","parentId":"0","name":"笔记本电脑"},
	{"id":"2","parentId":"0","name":"台式机"},
	{"id":"3","parentId":"0","name":"显示器"},
	{"id":"4","parentId":"0","name":"电脑配件"},
	{"id":"5","parentId":"0","name":"外设产品"},
	{"id":"6","parentId":"0","name":"办公设备"},
	{"id":"7","parentId":"0","name":"网络产品"},

	/* ===== 笔记本电脑 子分类 (parentId: "1") ===== */
	{"id":"101","parentId":"1","name":"游戏本"},
	{"id":"102","parentId":"1","name":"轻薄本"},
	{"id":"103","parentId":"1","name":"商务本"},

	/* ===== 台式机 子分类 (parentId: "2") ===== */
	{"id":"201","parentId":"2","name":"整机"},
	{"id":"202","parentId":"2","name":"组装机"},

	/* ===== 显示器 子分类 (parentId: "3") ===== */
	{"id":"301","parentId":"3","name":"办公显示器"},
	{"id":"302","parentId":"3","name":"游戏显示器"},

	/* ===== 电脑配件 子分类 (parentId: "4") ===== */
	{"id":"401","parentId":"4","name":"CPU / 主板"},
	{"id":"402","parentId":"4","name":"内存 / 硬盘"},
	{"id":"403","parentId":"4","name":"显卡"},

	/* ===== 外设产品 子分类 (parentId: "5") ===== */
	{"id":"501","parentId":"5","name":"键鼠套装"},
	{"id":"502","parentId":"5","name":"耳机音箱"},
	{"id":"503","parentId":"5","name":"摄像头"},

	/* ===== 办公设备 子分类 (parentId: "6") ===== */
	{"id":"601","parentId":"6","name":"打印机"},
	{"id":"602","parentId":"6","name":"投影仪"},

	/* ===== 网络产品 子分类 (parentId: "7") ===== */
	{"id":"701","parentId":"7","name":"路由器"},
	{"id":"702","parentId":"7","name":"交换机"}
]

/*加载一级分类到左侧菜单*/
function initMenu() {
	for (var i = 0; i < typelist.length; i++) {
		if (typelist[i].parentId == "0") {
			$(".index-menu").append(
				$("<li data='" + typelist[i].id + "'>" + typelist[i].name + "</li>")
			)
		}
	}
}

/* 判断某个分类 id 下是否有三级子分类 */
function hasChildren(parentId) {
	for (var i = 0; i < typelist.length; i++) {
		if (typelist[i].parentId == String(parentId)) {
			return true;
		}
	}
	return false;
}

/*
 * 跳转到首页对应分类区块。
 * 若当前已在首页，则平滑滚动；否则跳转到 index.html#cat-{catId}
 */
function navigateToCat(catId) {
	var hash   = "#cat-" + catId;
	var target = $(hash);
	if (target.length) {
		$("html, body").animate({ scrollTop: target.offset().top - 10 }, 400);
		$("#showIndex").hide();
		$("#showSecond").hide();
	} else {
		window.location.href = "index.html" + hash;
	}
}

window.addEventListener("load", function() {
	initMenu();

	var lunh = $("#myCarousel").height();
	var lih  = (lunh - 10) / 7;
	$(".index-menu li").css("height", lih + "px")

	var btnt = Math.floor($("#myCarousel").height() / 2 - 30);
	$(".left").css("margin-top",  btnt + "px");
	$(".right").css("margin-top", btnt + "px");

	/* 一级菜单 hover → 显示二级面板 */
	$(".index-menu").hover(function() {
		$("#showIndex").show();
	}, function() {
		$("#showIndex").hide();
	})

	/* 二级面板自身 hover 保持显示 */
	$("#showIndex").hover(function() {
		$("#showIndex").show();
	}, function() {
		$("#showIndex").hide();
	})

	/* 三级面板自身 hover 保持显示 */
	$("#showSecond").hover(function() {
		$("#showIndex").show();
		$("#showSecond").show();
	}, function() {
		$("#showIndex").hide();
		$("#showSecond").hide();
	})

	/* 一级分类 li hover → 加载二级菜单 */
	var offTop  = -100;
	var offLeft = 0;

	$(".index-menu li").hover(function() {
		$(".second-menu").empty();
		for (var i = 0; i < typelist.length; i++) {
			if ($(this).attr("data") == typelist[i].parentId) {
				$(".second-menu").append(
					$("<li class='second-menu-li' data='" + typelist[i].id + "'>"
						+ typelist[i].name + "</li>")
				)
			}
		}
		offLeft = $(this).width() + $(this).offset().left;
		offTop  = $(this).offset().top;
		$("#showIndex").css("top",  offTop  - 2 + "px")
		$("#showIndex").css("left", offLeft - 1 + "px")
		$(this).css("background-color", "#f5f5f5");
		$(this).css("color", "#4288c3");
	}, function() {
		$(this).css("background-color", "");
		$(this).css("color", "");
	})

	/* 一级分类 li 点击 → 跳转首页对应区块 */
	$(".index-menu li").on("click", function() {
		navigateToCat($(this).attr("data"));
	});

	/* 二级分类 li hover：有三级子项才显示三级面板，否则隐藏 */
	$(".second-menu-li").live("mouseover", function() {
		var itemId = $(this).attr("data");
		$(".third-menu").empty();

		if (hasChildren(itemId)) {
			/* 加载三级菜单项 */
			for (var i = 0; i < typelist.length; i++) {
				if (typelist[i].parentId == itemId) {
					$(".third-menu").append(
						$("<li class='third-menu-li' data='" + typelist[i].id + "'>"
							+ typelist[i].name + "</li>")
					)
				}
			}
			var ot = $(document).scrollTop() == $(this).offset().top
				? offTop : $(this).offset().top;
			var ol = $(this).width() + $(this).offset().left;
			$("#showSecond").css("top",  ot - 2 + "px");
			$("#showSecond").css("left", ol + "px");
			$("#showSecond").show();
		} else {
			/* 无三级子项：隐藏三级面板，不显示空框 */
			$("#showSecond").hide();
		}

		$(this).css("background-color", "#4288c3");
		$(this).css("color", "#f5f5f5");
	})

	$(".second-menu-li").live("mouseout", function() {
		$(this).css("background-color", "");
		$(this).css("color", "");
	})

	$(".third-menu-li").live("mouseover", function() {
		$(this).css("background-color", "#dddddd");
		$(this).css("color", "#000000");
	})
	$(".third-menu-li").live("mouseout", function() {
		$(this).css("background-color", "");
		$(this).css("color", "");
	})

	/* 二级分类 li 点击 → 跳转首页对应一级分类区块 */
	$(document).on("click", ".second-menu-li", function() {
		var itemId   = $(this).attr("data");
		var parentId = null;
		for (var i = 0; i < typelist.length; i++) {
			if (typelist[i].id == itemId) {
				parentId = typelist[i].parentId;
				break;
			}
		}
		if (!parentId) { return; }
		navigateToCat(parentId);
	});
})