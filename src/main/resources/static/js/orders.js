$(function () {
	function formatTime(value) {
		if (!value) {
			return "";
		}
		return value;
	}

	function statusText(status) {
		if (status === 0) return "未支付";
		if (status === 1) return "已支付";
		if (status === 2) return "已取消";
		if (status === 3) return "已关闭";
		if (status === 4) return "已完成";
		return "";
	}

	function renderOrders(list) {
		var $box = $("#orders-list");
		$box.empty();
		if (!list || list.length === 0) {
			$box.append('<div class="panel panel-default"><div class="panel-body">暂无订单</div></div>');
			return;
		}

		for (var i = 0; i < list.length; i++) {
			var o = list[i];
			var header = '' +
				'<div class="panel panel-primary">' +
					'<div class="panel-heading">订单号：' + (o.oid || "") + '&nbsp;&nbsp;状态：' + statusText(o.status) + '</div>' +
					'<div class="panel-body">' +
						'<div>下单时间：' + formatTime(o.orderTime) + '</div>' +
						'<div>收货地址：' + (o.recvProvince || "") + (o.recvCity || "") + (o.recvArea || "") + (o.recvAddress || "") + '</div>' +
						'<div>收货人：' + (o.recvName || "") + '&nbsp;&nbsp;' + (o.recvPhone || "") + '</div>' +
						'<div>订单总价：¥' + (o.totalPrice || 0) + '</div>';

			var itemsHtml = '';
			if (o.items && o.items.length) {
				itemsHtml += '<hr/>';
				for (var j = 0; j < o.items.length; j++) {
					var it = o.items[j];
					itemsHtml += '<div style="margin-bottom:6px;">' +
						(it.title || "") +
						'&nbsp;&nbsp;数量：' + (it.num || 0) +
						'&nbsp;&nbsp;单价：¥' + (it.price || 0) +
					'</div>';
				}
			}

			var footer = '' + itemsHtml + '</div></div>';
			$box.append(header + footer);
		}
	}

	$.ajax({
		url: "/orders",
		type: "GET",
		dataType: "json",
		success: function (json) {
			if (json && json.state === 200) {
				renderOrders(json.data);
				return;
			}
			if (window.showLoginPrompt && json && json.state === 4005) {
				window.showLoginPrompt("您还没有登录哦……请先登录后再继续操作~~~");
				return;
			}
			$("#orders-list").html('<div class="panel panel-default"><div class="panel-body">加载订单失败</div></div>');
		},
		error: function () {
			if (window.showLoginPrompt) {
				window.showLoginPrompt("您还没有登录哦……请先登录后再继续操作~~~");
				return;
			}
			$("#orders-list").html('<div class="panel panel-default"><div class="panel-body">加载订单失败</div></div>');
		}
	});
});
