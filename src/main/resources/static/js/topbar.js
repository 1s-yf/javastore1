$(function () {
	var skipKey = "skip_login_prompt";
	var cachedLoggedIn = false;
	var modalHandlersBound = false;

	function patchTopNavLinks() {
		var map = {
			"秒杀": "seckill.html",
			"优惠券": "coupon.html",
			"电脑VIP": "vip.html",
			"外卖": "takeout.html",
			"超市": "market.html"
		};
		$(".top-nav ul.nav-pills a").each(function () {
			var $a = $(this);
			var text = ($a.text() || "").replace(/\s+/g, "").trim();
			if (!text) {
				return;
			}
			var target = map[text];
			if (!target) {
				return;
			}
			var href = $a.attr("href") || "";
			if (href === "#" || href === "") {
				$a.attr("href", target);
			}
		});
	}

	function cleanupFooterLinks() {
		$("footer.footer a").each(function () {
			var $a = $(this);
			var text = ($a.text() || "").replace(/\s+/g, "").trim();
			if (text !== "关于圆心") {
				return;
			}
			var $li = $a.closest("li");
			if ($li.length) {
				$li.remove();
			} else {
				$a.remove();
			}
		});

		$("footer.footer .fa-wechat, footer.footer .fa-weibo").each(function () {
			var $icon = $(this);
			var $li = $icon.closest("li");
			if ($li.length) {
				$li.remove();
			} else {
				$icon.remove();
			}
		});
	}

	function markPersonalCenterNavItem() {
		var $btn = $("button.btn-link.dropdown-toggle[data-toggle='dropdown']");
		if ($btn.length) {
			$btn.closest("li").addClass("top-center-li");
		}
		var $span = $("#top-dropdown-btn");
		if ($span.length) {
			$span.closest("li").addClass("top-center-li");
		}
	}

	markPersonalCenterNavItem();
	patchTopNavLinks();
	cleanupFooterLinks();

	function bindLoginModalHandlers() {
		if (modalHandlersBound) {
			return;
		}
		modalHandlersBound = true;
		$(document).on("click", "#btn-go-login", function () {
			location.href = "login.html";
		});
		$(document).on("click", "#btn-skip-login", function () {
			sessionStorage.setItem(skipKey, "1");
		});
	}

	function ensureLoginModal() {
		if ($("#login-prompt-modal").length) {
			bindLoginModalHandlers();
			return;
		}
		var modalHtml = '' +
			'<div class="modal fade" id="login-prompt-modal" tabindex="-1" role="dialog" aria-labelledby="loginPromptLabel">' +
				'<div class="modal-dialog" role="document">' +
					'<div class="modal-content">' +
						'<div class="modal-header">' +
							'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							'<h4 class="modal-title" id="loginPromptLabel">提示</h4>' +
						'</div>' +
						'<div class="modal-body">' +
							'<p id="login-prompt-text">您还没有登录哦……请先登录后再继续操作~~~</p>' +
						'</div>' +
						'<div class="modal-footer">' +
							'<button type="button" class="btn btn-primary" id="btn-go-login">立即登录/注册</button>' +
							'<button type="button" class="btn btn-default" id="btn-skip-login" data-dismiss="modal">暂不登录</button>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
		$("body").append(modalHtml);
		bindLoginModalHandlers();
	}

	window.showLoginPrompt = function (text) {
		ensureLoginModal();
		$("#login-prompt-text").text(text || "您还没有登录哦……请先登录后再继续操作~~~");
		$("#login-prompt-modal").modal({ backdrop: 'static', keyboard: false });
	};

	function bindNoAddressModalHandlers() {
		$(document).on("click", "#btn-go-add-address", function () {
			location.href = "addAddress.html";
		});
	}

	function ensureNoAddressModal() {
		if ($("#no-address-modal").length) {
			return;
		}
		var modalHtml = '' +
			'<div class="modal fade" id="no-address-modal" tabindex="-1" role="dialog" aria-labelledby="noAddressLabel">' +
				'<div class="modal-dialog" role="document">' +
					'<div class="modal-content">' +
						'<div class="modal-header">' +
							'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							'<h4 class="modal-title" id="noAddressLabel">提示</h4>' +
						'</div>' +
						'<div class="modal-body">' +
							'<p id="no-address-text">您还没有收货地址哦……请先添加收货地址后再继续操作~~~</p>' +
						'</div>' +
						'<div class="modal-footer">' +
							'<button type="button" class="btn btn-primary" id="btn-go-add-address">立即添加</button>' +
							'<button type="button" class="btn btn-default" id="btn-skip-add-address" data-dismiss="modal">暂不添加</button>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
		$("body").append(modalHtml);
		bindNoAddressModalHandlers();
	}

	window.showNoAddressPrompt = function (text) {
		ensureNoAddressModal();
		$("#no-address-text").text(text || "您还没有收货地址哦……请先添加收货地址后再继续操作~~~");
		$("#no-address-modal").modal({ backdrop: 'static', keyboard: false });
	};

	function isLoggedIn(callback) {
		$.ajax({
			url: "/users/status",
			type: "GET",
			dataType: "json",
			success: function (json) {
				callback(json.state === 200 && json.data === true);
			},
			error: function () {
				callback(false);
			}
		});
	}

	function setTopBarLoggedOut() {
		var $center = $("#top-center-text");
		if ($center.length) {
			$center.text("个人中心");
		}
		var $loginText = $("#top-login-text");
		if ($loginText.length) {
			$loginText.text("登录");
		}
		var $link = $("#link-login-logout");
		if ($link.length) {
			$link.attr("href", "login.html");
		}
	}

	function setTopBarLoggedIn(username) {
		var $center = $("#top-center-text");
		if ($center.length) {
			$center.text("个人中心（" + username + "）");
		}
		var $loginText = $("#top-login-text");
		if ($loginText.length) {
			$loginText.text("退出");
		}
		var $link = $("#link-login-logout");
		if ($link.length) {
			$link.attr("href", "#");
		}
	}

	function loadUsernameAndUpdateTopBar() {
		$.ajax({
			url: "/users/get_by_uid",
			type: "GET",
			dataType: "json",
			success: function (json) {
				if (json.state === 200 && json.data && json.data.username) {
					setTopBarLoggedIn(json.data.username);
				} else {
					setTopBarLoggedOut();
				}
			},
			error: function () {
				setTopBarLoggedOut();
			}
		});
	}

	function refreshTopBar() {
		$.ajax({
			url: "/users/status",
			type: "GET",
			dataType: "json",
			success: function (json) {
				cachedLoggedIn = (json.state === 200 && json.data === true);
				if (cachedLoggedIn) {
					loadUsernameAndUpdateTopBar();
				} else {
					setTopBarLoggedOut();
				}
			},
			error: function () {
				cachedLoggedIn = false;
				setTopBarLoggedOut();
			}
		});
	}

	refreshTopBar();

	$(document).on("click", "#link-login-logout", function (e) {
		e.preventDefault();
		isLoggedIn(function (loggedIn) {
			if (!loggedIn) {
				location.href = "login.html";
				return;
			}
			$.ajax({
				url: "/users/logout",
				type: "POST",
				dataType: "json",
				success: function () {
					sessionStorage.removeItem(skipKey);
					location.href = "index.html";
				},
				error: function () {
					location.href = "index.html";
				}
			});
		});
	});

	$(document).on("click", "#top-dropdown-btn, .top-dropdown-ul a", function (e) {
		if (cachedLoggedIn) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		window.showLoginPrompt("您还没有登录哦……请先登录后再继续操作~~~");
		return false;
	});

	$(document).on("click", "a", function (e) {
		if (!cachedLoggedIn) {
			return;
		}
		var href = $(this).attr("href") || "";
		if (href.indexOf("address.html") === -1) {
			return;
		}
		if (href.indexOf("addAddress.html") !== -1) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		$.ajax({
			url: "/addresses",
			type: "GET",
			dataType: "json",
			success: function (json) {
				if (json && json.state === 200 && $.isArray(json.data)) {
					if (json.data.length === 0) {
						window.showNoAddressPrompt("您还没有收货地址哦……请先添加收货地址后再继续操作~~~");
						return;
					}
					location.href = "address.html";
					return;
				}
				location.href = "address.html";
			},
			error: function () {
				location.href = "address.html";
			}
		});
		return false;
	});

	$(document).on("click", "button.btn-link.dropdown-toggle[data-toggle='dropdown']", function (e) {
		if (cachedLoggedIn) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		window.showLoginPrompt("您还没有登录哦……请先登录后再继续操作~~~");
		return false;
	});
});
