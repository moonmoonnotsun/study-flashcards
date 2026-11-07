(function () {
    var root = document.getElementById('study-deck');
    var dataEl = document.getElementById('deck-copy');
    if (!root || !dataEl) return;

    var data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    var cards = data.cards || [];
    if (!cards.length) return;

    var front = root.querySelector('.study-card.is-front');
    var qText = front.querySelector('.study-q .study-text');
    var aText = front.querySelector('.study-a .study-text');
    var photos = front.querySelectorAll('.study-photo');
    front.querySelector('.study-q .study-kicker').textContent = data.q;
    front.querySelector('.study-a .study-kicker').textContent = data.a;
    front.querySelector('.study-hint').textContent = data.hint;

    var rates = Array.prototype.slice.call(root.querySelectorAll('.study-rates button'));
    var labels = [data.again, data.hard, data.good, data.easy];
    var times = [data.t1, data.t2, data.t3, data.t4];
    rates.forEach(function (btn, i) {
        btn.querySelector('b').textContent = labels[i];
        btn.querySelector('small').textContent = times[i];
    });

    var index = 0;
    var phase = 'question';
    var timer = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wait = function (ms, fn) {
        window.clearTimeout(timer);
        timer = window.setTimeout(fn, reduced ? 0 : ms);
    };

    function paint(card) {
        var q = card.q || card[0];
        var a = card.a || card[1];
        qText.textContent = q;
        aText.textContent = a;
        var image = card.img ? 'url("' + card.img + '")' : 'none';
        photos.forEach(function (photo) { photo.style.backgroundImage = image; });
    }

    function show() {
        paint(cards[index % cards.length]);
        phase = 'question';
        root.classList.remove('is-rated', 'is-picked');
        front.classList.remove('is-flipped', 'is-leave', 'is-press');
        rates.forEach(function (btn) { btn.classList.remove('is-on'); });
        wait(2200, tap);
    }

    function tap() {
        if (phase !== 'question') return;
        phase = 'flipped';
        front.classList.add('is-flipped');
        wait(1100, revealRates);
    }

    function revealRates() {
        if (phase !== 'flipped') return;
        phase = 'rated';
        root.classList.add('is-rated');
        wait(1500, function () { advance('good'); });
    }

    function advance(rate) {
        if (phase === 'leaving') return;
        phase = 'leaving';
        window.clearTimeout(timer);
        root.classList.add('is-picked');
        rates.forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-rate') === rate);
        });
        wait(900, function () {
            root.classList.remove('is-rated');
            wait(420, function () {
                front.classList.add('is-leave');
                wait(700, function () {
                    index += 1;
                    front.classList.add('is-instant');
                    front.classList.remove('is-flipped', 'is-press');
                    root.classList.remove('is-picked');
                    rates.forEach(function (btn) { btn.classList.remove('is-on'); });
                    paint(cards[index % cards.length]);
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            front.classList.remove('is-instant', 'is-leave');
                            phase = 'question';
                            wait(2200, tap);
                        });
                    });
                });
            });
        });
    }

    front.addEventListener('click', function () {
        if (phase === 'question') tap();
    });

    rates.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (phase !== 'rated' && phase !== 'flipped') return;
            if (phase === 'flipped') root.classList.add('is-rated');
            advance(btn.getAttribute('data-rate'));
        });
    });

    show();
})();
