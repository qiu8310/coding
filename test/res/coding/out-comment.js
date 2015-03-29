var G = {};

// file: a.js
(function () {
    var a = 'aa';
    var b = 'bb';
    G.a = a + b;
}());

// file: b.js
G.b = 'x';

// file: main.js
(function () {
    console.log(G.a + G.b);
}());
