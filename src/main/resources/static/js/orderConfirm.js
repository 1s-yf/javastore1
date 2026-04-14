$(function() {
	var orderDraftKey = "order_draft";

	function tryCreateOrderIfOnPaySuccess() {
		var path = window.location && window.location.pathname ? window.location.pathname : "";
		if (path.indexOf("paySuccess.html") === -1) {
			return;
		}
		var draftRaw = null;
		try {
			draftRaw = localStorage.getItem(orderDraftKey);
		} catch (e) {
		}
		if (!draftRaw) {
			return;
		}
		var draft = null;
		try {
			draft = JSON.parse(draftRaw);
		} catch (e) {
			draft = null;
		}
		if (!draft || !draft.aid) {
			return;
		}
		$.ajax({
			url: "/orders/create",
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(draft),
			dataType: "json",
			success: function (json) {
				if (json && json.state === 200) {
					try {
						localStorage.removeItem(orderDraftKey);
					} catch (e) {
					}
				}
			}
		});
	}

	function renderAddressList(list) {
		var $select = $("#address-list");
		if (!$select.length) {
			return;
		}
		$select.empty();
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			var text = (item.name || "") + "\u00A0\u00A0\u00A0" + (item.tag || "") + "\u00A0\u00A0\u00A0" +
				(item.provinceName || "") + (item.cityName || "") + (item.areaName || "") + (item.address || "") +
				"\u00A0\u00A0\u00A0" + (item.phone || "");
			$select.append('<option value="' + item.aid + '">' + text + '</option>');
		}
	}

	function loadAddressList() {
		if (!$("#address-list").length) {
			return;
		}
		$.ajax({
			url: "/addresses",
			type: "GET",
			dataType: "json",
			success: function(json) {
				if (json && json.state === 200 && $.isArray(json.data)) {
					if (json.data.length === 0) {
						renderAddressList([]);
						$("#address-list").append('<option value="">暂无收货地址，请先添加</option>');
						if (window.showNoAddressPrompt) {
							window.showNoAddressPrompt("您还没有收货地址哦……请先添加收货地址后再继续操作~~~");
						}
						return;
					}
					renderAddressList(json.data);
					return;
				}
			},
			error: function() {
			}
		});
	}

	loadAddressList();

	function buildOrderItemsFromPage() {
		var items = [];
		if (!$("#cart-list").length) {
			return items;
		}
		$("#cart-list tr").each(function () {
			var $tds = $(this).children("td");
			var image = $tds.eq(0).find("img").attr("src") || "";
			var title = ($tds.eq(1).text() || "").replace(/\s+/g, " ").trim();
			var priceText = $tds.eq(2).find("span").text();
			var numText = $tds.eq(3).text();
			var price = parseInt(priceText, 10);
			if (isNaN(price)) {
				price = 0;
			}
			var num = parseInt(numText, 10);
			if (isNaN(num) || num <= 0) {
				num = 1;
			}
			items.push({
				pid: 10000017,
				title: title,
				image: image,
				price: price,
				num: num
			});
		});
		return items;
	}

	function saveOrderDraft(aid) {
		var totalText = $("#all-price").text();
		var totalPrice = parseInt(totalText, 10);
		if (isNaN(totalPrice)) {
			totalPrice = 0;
		}
		var draft = {
			aid: parseInt(aid, 10),
			totalPrice: totalPrice,
			items: buildOrderItemsFromPage()
		};
		try {
			localStorage.setItem(orderDraftKey, JSON.stringify(draft));
		} catch (e) {
		}
	}

	$(".link-pay").click(function() {
		var aid = $("#address-list").val();
		if (!aid) {
			if (window.showNoAddressPrompt) {
				window.showNoAddressPrompt("您还没有收货地址哦……请先添加收货地址后再继续操作~~~");
			}
			return;
		}
		saveOrderDraft(aid);
		location.href = "payment.html";
	});

	$(".link-success").click(function() {
		var draftRaw = null;
		try {
			draftRaw = localStorage.getItem(orderDraftKey);
		} catch (e) {
		}
		if (!draftRaw) {
			location.href = "paySuccess.html";
			return;
		}
		var draft = null;
		try {
			draft = JSON.parse(draftRaw);
		} catch (e) {
			draft = null;
		}
		if (!draft || !draft.aid) {
			location.href = "paySuccess.html";
			return;
		}
		$.ajax({
			url: "/orders/create",
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(draft),
			dataType: "json",
			success: function (json) {
				if (json && json.state === 200) {
					try {
						localStorage.removeItem(orderDraftKey);
					} catch (e) {
					}
					location.href = "paySuccess.html";
					return;
				}
				if (window.showLoginPrompt && json && json.state === 4005) {
					window.showLoginPrompt("您还没有登录哦……请先登录后再继续操作~~~");
					return;
				}
				alert("支付失败" + (json && json.message ? ("：" + json.message) : ""));
			},
			error: function (xhr) {
				alert("支付失败");
			}
		});
	});

	tryCreateOrderIfOnPaySuccess();
});