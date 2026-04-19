$(function() {
	var orderDraftKey = "order_draft";

	function getQueryParam(name) {
		var search = window.location && window.location.search ? window.location.search : "";
		if (!search || search.length <= 1) {
			return null;
		}
		var query = search.substring(1);
		var parts = query.split("&");
		for (var i = 0; i < parts.length; i++) {
			var kv = parts[i].split("=");
			if (kv.length >= 2 && decodeURIComponent(kv[0]) === name) {
				return decodeURIComponent(kv.slice(1).join("="));
			}
		}
		return null;
	}

	function escapeHtml(text) {
		return String(text == null ? "" : text)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	var COUPON_STORAGE_KEY = "coupon_claims_v1";
	var currentUsername = null;
	var selectedCouponId = "";
	var baseTotalPrice = null;

	var coupons = [
		{ id: "c200-20", title: "满200减20", threshold: 200, off: 20 },
		{ id: "c500-80", title: "满500减80", threshold: 500, off: 80 }
	];

	function getCouponClaimsStorageKey(username) {
		return COUPON_STORAGE_KEY + ":" + (username || "anonymous");
	}

	function safeParseJSON(text, fallback) {
		try {
			return JSON.parse(text);
		} catch (e) {
			return fallback;
		}
	}

	function getCurrentUsername(callback) {
		$.ajax({
			url: "/users/get_by_uid",
			type: "GET",
			dataType: "json",
			success: function (json) {
				if (json && json.state === 200 && json.data && json.data.username) {
					callback(json.data.username);
					return;
				}
				callback(null);
			},
			error: function () {
				callback(null);
			}
		});
	}

	function findCouponById(id) {
		for (var i = 0; i < coupons.length; i++) {
			if (coupons[i].id === id) {
				return coupons[i];
			}
		}
		return null;
	}

	function loadClaims(username) {
		var key = getCouponClaimsStorageKey(username);
		return safeParseJSON(localStorage.getItem(key) || "{}", {});
	}

	function saveClaims(username, data) {
		var key = getCouponClaimsStorageKey(username);
		try {
			localStorage.setItem(key, JSON.stringify(data || {}));
		} catch (e) {
		}
	}

	function markCouponUsed(username, couponId) {
		if (!username || !couponId) {
			return;
		}
		var claims = loadClaims(username);
		if (!claims[couponId]) {
			return;
		}
		claims[couponId].status = "used";
		claims[couponId].usedAt = new Date().toISOString();
		saveClaims(username, claims);
	}

	function loadUnusedCoupons(username) {
		var claims = loadClaims(username);
		var list = [];
		for (var i = 0; i < coupons.length; i++) {
			var c = coupons[i];
			if (claims && claims[c.id] && claims[c.id].status === "unused") {
				list.push(c);
			}
		}
		return list;
	}

	function getDiscount(totalPrice, couponId) {
		if (!couponId) {
			return 0;
		}
		var c = findCouponById(couponId);
		if (!c) {
			return 0;
		}
		if (totalPrice >= c.threshold) {
			return c.off;
		}
		return 0;
	}

	function applyCouponToTotal() {
		if (baseTotalPrice == null) {
			var t = parseFloat($("#all-price").text());
			if (!isNaN(t)) {
				baseTotalPrice = t;
			}
		}
		var total = baseTotalPrice == null ? 0 : baseTotalPrice;
		var discount = getDiscount(total, selectedCouponId);
		var finalPrice = total - discount;
		if (finalPrice < 0) {
			finalPrice = 0;
		}
		$("#all-price").text(finalPrice);
		if (discount > 0) {
			$("#coupon-discount-text").text("已优惠¥" + discount);
		} else {
			if (selectedCouponId) {
				$("#coupon-discount-text").text("未满足使用门槛");
			} else {
				$("#coupon-discount-text").text("");
			}
		}
	}

	function initCouponUI() {
		var $select = $("#coupon-select");
		if (!$select.length) {
			return;
		}
		getCurrentUsername(function (username) {
			currentUsername = username;
			$select.find("option").not(":first").remove();
			if (!username) {
				return;
			}
			var unused = loadUnusedCoupons(username);
			for (var i = 0; i < unused.length; i++) {
				var c = unused[i];
				$select.append('<option value="' + c.id + '">' + c.title + '</option>');
			}
		});
		$select.off('change').on('change', function () {
			selectedCouponId = $(this).val() || "";
			applyCouponToTotal();
		});
	}

	function parseIdsCounts() {
		var idsRaw = getQueryParam("ids");
		var countsRaw = getQueryParam("counts");
		var result = [];
		if (idsRaw) {
			var ids = String(idsRaw).split(",");
			var counts = countsRaw ? String(countsRaw).split(",") : [];
			for (var i = 0; i < ids.length; i++) {
				var pid = parseInt(ids[i], 10);
				if (isNaN(pid) || pid <= 0) {
					continue;
				}
				var num = 1;
				if (counts.length > i) {
					var n = parseInt(counts[i], 10);
					if (!isNaN(n) && n > 0) {
						num = n;
					}
				}
				result.push({ pid: pid, num: num });
			}
		}
		return result;
	}

	function getSeckillOverridePrice() {
		var from = getQueryParam("from");
		var sp = getQueryParam("sp");
		if (from === "seckill" && sp && /^\d+(?:\.\d{1,2})?$/.test(sp)) {
			var p = parseFloat(sp);
			if (!isNaN(p)) {
				return p;
			}
		}
		return null;
	}

	function getItemsFromLocalCart() {
		var cart = [];
		try {
			cart = JSON.parse(localStorage.getItem('cart') || '[]');
		} catch (e) {
			cart = [];
		}
		var items = [];
		for (var i = 0; i < cart.length; i++) {
			var it = cart[i];
			var pid = parseInt(it && it.id, 10);
			var num = parseInt(it && it.num, 10);
			if (isNaN(pid) || pid <= 0) {
				continue;
			}
			if (isNaN(num) || num <= 0) {
				num = 1;
			}
			items.push({ pid: pid, num: num });
		}
		return items;
	}

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
		var payload = {
			aid: draft.aid,
			totalPrice: draft.totalPrice,
			items: draft.items
		};
		$.ajax({
			url: "/orders/create",
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(payload),
			dataType: "json",
			success: function (json) {
				if (json && json.state === 200) {
					if (draft && draft.couponId) {
						if (draft.couponUsername) {
							markCouponUsed(draft.couponUsername, draft.couponId);
						} else {
							getCurrentUsername(function (username) {
								markCouponUsed(username, draft.couponId);
							});
						}
					}
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
	initCouponUI();

	function renderOrderItems(items) {
		var $tbody = $("#cart-list");
		if (!$tbody.length) {
			return;
		}
		$tbody.empty();
		var totalCount = 0;
		var totalPrice = 0;
		for (var i = 0; i < items.length; i++) {
			var it = items[i];
			var pid = parseInt(it.pid, 10);
			var num = parseInt(it.num, 10);
			var price = parseFloat(it.price);
			if (isNaN(pid) || pid <= 0) {
				continue;
			}
			if (isNaN(num) || num <= 0) {
				num = 1;
			}
			if (isNaN(price)) {
				price = 0;
			}
			totalCount += num;
			totalPrice += price * num;
			var rowTotal = price * num;
			var image = it.image || "";
			var title = it.title || "";
			var $tr = $("<tr></tr>").attr("data-pid", pid);
			$tr.append('<td><img src="' + escapeHtml(image) + '" class="img-responsive" /></td>');
			$tr.append('<td>' + escapeHtml(title) + '</td>');
			$tr.append('<td>¥<span>' + escapeHtml(price) + '</span></td>');
			$tr.append('<td>' + escapeHtml(num) + '</td>');
			$tr.append('<td><span>' + escapeHtml(rowTotal) + '</span></td>');
			$tbody.append($tr);
		}
		$("#all-count").text(totalCount);
		$("#all-price").text(totalPrice);
		baseTotalPrice = totalPrice;
		applyCouponToTotal();
	}

	function loadOrderItemsFromServer(pidNums) {
		if (!pidNums || pidNums.length === 0) {
			renderOrderItems([]);
			return;
		}
		var seckillPrice = null;
		// 仅“立即购买（单商品）”场景需要覆盖秒杀价
		if (pidNums.length === 1) {
			seckillPrice = getSeckillOverridePrice();
		}
		var requests = [];
		for (var i = 0; i < pidNums.length; i++) {
			(function (pn) {
				requests.push(
					$.ajax({
						url: "/products/" + pn.pid + "/details",
						type: "GET",
						dataType: "json"
					}).then(function (json) {
						if (!json || json.state !== 200 || !json.data) {
							return null;
						}
						var price = parseFloat(json.data.price);
						if (isNaN(price)) {
							price = 0;
						}
						if (seckillPrice != null) {
							price = seckillPrice;
						}
						return {
							pid: pn.pid,
							num: pn.num,
							title: json.data.title,
							image: ".." + json.data.image + "1.jpg",
							price: price
						};
					}, function () {
						return null;
					})
				);
			})(pidNums[i]);
		}

		$.when.apply($, requests).done(function () {
			var items = [];
			for (var j = 0; j < requests.length; j++) {
				var v = arguments[j];
				// 兼容 jQuery 可能把多值 resolve 包成数组的情况
				if ($.isArray(v)) {
					v = v[0];
				}
				items.push(v);
			}
			items = $.grep(items, function (x) { return x != null; });
			renderOrderItems(items);
		});
	}

	(function initOrderItems() {
		var pidNums = parseIdsCounts();
		if (!pidNums || pidNums.length === 0) {
			pidNums = getItemsFromLocalCart();
		}
		loadOrderItemsFromServer(pidNums);
	})();

	function buildOrderItemsFromPage() {
		var items = [];
		if (!$("#cart-list").length) {
			return items;
		}
		$("#cart-list tr").each(function () {
			var pidAttr = $(this).attr("data-pid");
			var pid = parseInt(pidAttr, 10);
			if (isNaN(pid) || pid <= 0) {
				return;
			}
			var $tds = $(this).children("td");
			var image = $tds.eq(0).find("img").attr("src") || "";
			var title = ($tds.eq(1).text() || "").replace(/\s+/g, " ").trim();
			var priceText = $tds.eq(2).find("span").text();
			var numText = $tds.eq(3).text();
			var price = parseFloat(priceText);
			if (isNaN(price)) {
				price = 0;
			}
			var num = parseInt(numText, 10);
			if (isNaN(num) || num <= 0) {
				num = 1;
			}
			items.push({
				pid: pid,
				title: title,
				image: image,
				price: Math.round(price),
				num: num
			});
		});
		return items;
	}

	function saveOrderDraft(aid) {
		var totalText = $("#all-price").text();
		var totalPrice = parseFloat(totalText);
		if (isNaN(totalPrice)) {
			totalPrice = 0;
		}
		var originTotal = baseTotalPrice;
		if (originTotal == null) {
			var t = parseFloat($("#all-price").text());
			originTotal = isNaN(t) ? 0 : t;
		}
		var couponDiscount = getDiscount(originTotal, selectedCouponId);
		var couponIdToSave = couponDiscount > 0 ? selectedCouponId : "";
		var draft = {
			aid: parseInt(aid, 10),
			totalPrice: Math.round(totalPrice),
			couponId: couponIdToSave,
			couponUsername: currentUsername,
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
		var payload = {
			aid: draft.aid,
			totalPrice: draft.totalPrice,
			items: draft.items
		};
		$.ajax({
			url: "/orders/create",
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(payload),
			dataType: "json",
			success: function (json) {
				if (json && json.state === 200) {
					if (draft && draft.couponId) {
						if (draft.couponUsername) {
							markCouponUsed(draft.couponUsername, draft.couponId);
						} else {
							getCurrentUsername(function (username) {
								markCouponUsed(username, draft.couponId);
							});
						}
					}
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