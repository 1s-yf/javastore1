/*按加号数量增*/
function addNum(rid) {
	var n = parseInt($("#goodsCount"+rid).val());
	$("#goodsCount"+rid).val(n + 1);
	calcRow(rid);
}
/*按减号数量减*/
function reduceNum(rid) {
	var n = parseInt($("#goodsCount"+rid).val());
	if (n == 0)
		return;
	$("#goodsCount"+rid).val(n - 1);
	calcRow(rid);
}
/*全选全不选*/
function checkall(ckbtn) {
	$(".ckitem").prop("checked", $(ckbtn).prop("checked"));
	//calcTotal();
}
//删除按钮
function delCartItem(btn) {
	
	$(btn).parents("tr").remove();
	//calcTotal();
}
//批量删除按钮
function selDelCart() {
	//遍历所有按钮
	for (var i = $(".ckitem").length - 1; i >= 0; i--) {
		//如果选中
		if ($(".ckitem")[i].checked) {
			//删除
			$($(".ckitem")[i]).parents("tr").remove();
		}
	}
	//calcTotal();
}
$(function() {
	//单选一个也得算价格
	$(".ckitem").click(function() {
			//calcTotal();
		})
		//开始时计算价格
		//calcTotal();

	$(document).on("submit", "form[action='orderConfirm.html']", function(e) {
		var form = this;
		e.preventDefault();
		$.ajax({
			url: "/addresses",
			type: "GET",
			dataType: "json",
			success: function(json) {
				if (json && json.state === 200 && $.isArray(json.data)) {
					if (json.data.length === 0) {
						if (window.showNoAddressPrompt) {
							window.showNoAddressPrompt("您还没有收货地址哦……请先添加收货地址后再继续操作~~~");
						}
						return;
					}
					form.submit();
					return;
				}
				form.submit();
			},
			error: function() {
				if (window.showLoginPrompt) {
					window.showLoginPrompt("您还没有登录哦……请先登录后再继续操作~~~");
					return;
				}
				form.submit();
			}
		});
	});
})
//计算单行小计价格的方法
function calcRow(rid) {
	//取单价
	var vprice = parseFloat($("#goodsPrice"+rid).html());
	//取数量
	var vnum = parseFloat($("#goodsCount"+rid).val());
	//小计金额
	var vtotal = vprice * vnum;
	//赋值
	$("#goodsCast"+rid).html("¥" + vtotal);
}
//计算总价格的方法
/*
function calcTotal() {
	//选中商品的数量
	var vselectCount = 0;
	//选中商品的总价
	var vselectTotal = 0;

	//循环遍历所有tr
	for (var i = 0; i < $(".cart-body tr").length; i++) {
		//计算每个商品的价格小计开始
		//取出1行
		var $tr = $($(".cart-body tr")[i]);
		//取单价
		var vprice = parseFloat($tr.children(":eq(3)").children("span").html());
		//取数量
		var vnum = parseFloat($tr.children(":eq(4)").children(".num-text").val());
		//小计金额
		var vtotal = vprice * vnum;
		//赋值
		$tr.children(":eq(5)").children("span").html("¥" + vtotal);
		//计算每个商品的价格小计结束

		//检查是否选中
		if ($tr.children(":eq(0)").children(".ckitem").prop("checked")) {
			//计数
			vselectCount++;
			//计总价
			vselectTotal += vtotal;
		}
		//将选中的数量和价格赋值
		$("#selectTotal").html(vselectTotal);
		$("#selectCount").html(vselectCount);
	}
}*/