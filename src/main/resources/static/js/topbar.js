$(function () {
	var skipKey = "skip_login_prompt";
	var cachedLoggedIn = false;
	var modalHandlersBound = false;

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
