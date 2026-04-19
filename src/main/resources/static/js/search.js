$(function() {
	function safeParseJson(text, fallback) {
		try {
			return JSON.parse(text);
		} catch (e) {
			return fallback;
		}
	}

	function loadFavorites() {
		return safeParseJson(localStorage.getItem('favorites') || '[]', []);
	}

	function saveFavorites(arr) {
		localStorage.setItem('favorites', JSON.stringify(arr || []));
	}

	function loadCart() {
		return safeParseJson(localStorage.getItem('cart') || '[]', []);
	}

	function saveCart(arr) {
		localStorage.setItem('cart', JSON.stringify(arr || []));
	}

	$(document).on('mouseenter', '.goods-panel', function () {
		$(this).css('box-shadow', '0px 0px 8px #888888');
	});
	$(document).on('mouseleave', '.goods-panel', function () {
		$(this).css('box-shadow', '');
	});

	$(document).on('click', '.add-fav', function () {
		var $btn = $(this);
		var id = parseInt($btn.attr('data-id'), 10);
		if (isNaN(id) || id <= 0) {
			return;
		}
		var title = $btn.attr('data-title') || '';
		var price = parseFloat($btn.attr('data-price'));
		if (isNaN(price)) price = 0;
		var image = $btn.attr('data-img') || '';

		var favorites = loadFavorites();
		var idx = -1;
		for (var i = 0; i < favorites.length; i++) {
			if (parseInt(favorites[i] && favorites[i].id, 10) === id) {
				idx = i;
				break;
			}
		}
		if (idx >= 0) {
			favorites.splice(idx, 1);
			saveFavorites(favorites);
			$btn.html("<span class='fa fa-heart-o'></span>加入收藏");
			alert('已取消收藏');
			return;
		}
		favorites.unshift({ id: id, title: title, price: price, image: image });
		saveFavorites(favorites);
		$btn.html("<span class='fa fa-heart'></span>取消收藏");
		alert('✅ 加入收藏成功');
	});

	$(document).on('click', '.add-cart', function () {
		var $btn = $(this);
		var id = parseInt($btn.attr('data-id'), 10);
		if (isNaN(id) || id <= 0) {
			return;
		}
		var title = $btn.attr('data-title') || '';
		var price = parseFloat($btn.attr('data-price'));
		if (isNaN(price)) price = 0;
		var image = $btn.attr('data-img') || '';

		var cart = loadCart();
		var idx = -1;
		for (var i = 0; i < cart.length; i++) {
			if (parseInt(cart[i] && cart[i].id, 10) === id) {
				idx = i;
				break;
			}
		}
		if (idx >= 0) {
			var num = parseInt(cart[idx].num, 10);
			if (isNaN(num) || num <= 0) num = 0;
			cart[idx].num = num + 1;
		} else {
			cart.unshift({ id: id, title: title, price: price, num: 1, image: image });
		}
		saveCart(cart);
		alert('✅ 加入购物车成功');
	});
})