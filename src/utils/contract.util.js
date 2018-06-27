module.exports = {
    toFixed: function (x) {
        if (Math.abs(x) < 1.0) {
            var e1 = parseInt(x.toString().split('e-')[1]);
            if (e1) {
                x *= Math.pow(10,e1-1);
                x = '0.' + (new Array(e1)).join('0') + x.toString().substring(2);
            }
        } else {
            var e2 = parseInt(x.toString().split('+')[1]);
            if (e2 > 20) {
                e2 -= 20;
                x /= Math.pow(10,e2);
                x += (new Array(e2+1)).join('0');
            }
        }
        return x;
    }
};