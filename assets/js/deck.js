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
    var qKicker = front.querySelector('.study-q .study-kicker');
    var aKicker = front.querySelector('.study-a .study-kicker');
    var hint = front.querySelector('.study-hint');
    qKicker.textContent = data.q;
    aKicker.textContent = data.a;
    hint.textContent = data.hint;

    var rates = root.querySelectorAll('.study-rates button');
    var labels = [data.again, data.hard, data.good, data.easy];
    var times = [data.t1, data.t2, data.t3, data.t4];
    rates.forEach(function (btn, i) {
        btn.querySelector('b').textContent = labels[i];
        btn.querySelector('small').textContent = times[i];
    });

    var index = 0;
    var flipped = false;
    var timer = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show() {
        var card = cards[index % cards.length];
        qText.textContent = card[0];
        aText.textContent = card[1];
        front.classList.remove('is-flipped', 'is-leave');
        flipped = false;
        rates.forEach(function (btn) { btn.classList.remove('is-on'); });
    }

    function flip() {
        flipped = true;
        front.classList.add('is-flipped');
    }

    function next(rate) {
        if (rate) {
            rates.forEach(function (btn) {
                btn.classList.toggle('is-on', btn.getAttribute('data-rate') === rate);
            });
        }
        front.classList.add('is-leave');
        window.setTimeout(function () {
            index += 1;
            show();
            arm();
        }, reduced ? 0 : 420);
    }

    function arm() {
        window.clearTimeout(timer);
        if (reduced) return;
        timer = window.setTimeout(function () {
            if (!flipped) {
                flip();
                timer = window.setTimeout(function () { next('good'); }, 1400);
            } else {
                next('good');
            }
        }, flipped ? 1400 : 1800);
    }

    front.addEventListener('click', function () {
        window.clearTimeout(timer);
        if (!flipped) flip();
        else next('good');
        arm();
    });

    rates.forEach(function (btn) {
        btn.addEventListener('click', function () {
            window.clearTimeout(timer);
            if (!flipped) flip();
            window.setTimeout(function () { next(btn.getAttribute('data-rate')); }, reduced ? 0 : 220);
        });
    });

    show();
    arm();
})();
