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

    function show() {
        var card = cards[index % cards.length];
        qText.textContent = card[0];
        aText.textContent = card[1];
        phase = 'question';
        root.classList.remove('is-rated');
        front.classList.remove('is-flipped', 'is-leave', 'is-press');
        rates.forEach(function (btn) { btn.classList.remove('is-on'); });
        wait(1500, tap);
    }

    function tap() {
        if (phase !== 'question') return;
        phase = 'tapping';
        front.classList.add('is-press');
        wait(180, function () {
            front.classList.remove('is-press');
            phase = 'flipped';
            front.classList.add('is-flipped');
            wait(760, revealRates);
        });
    }

    function revealRates() {
        if (phase !== 'flipped') return;
        phase = 'rated';
        root.classList.add('is-rated');
        wait(1100, function () { advance('good'); });
    }

    function advance(rate) {
        if (phase === 'leaving') return;
        phase = 'leaving';
        window.clearTimeout(timer);
        rates.forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-rate') === rate);
        });
        wait(420, function () {
            root.classList.remove('is-rated');
            front.classList.add('is-leave');
            wait(360, function () {
                index += 1;
                show();
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
