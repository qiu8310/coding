var G = {};

(function () {
    var a = 'aa';
    var b = 'bb';
    G.a = a + b;
}());

G.b = 'x';

(function () {
    console.log(G.a + G.b);
}());
