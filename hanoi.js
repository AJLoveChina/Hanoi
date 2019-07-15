/**
 * Created by ajax on 2015/12/4.
 */

(function () {
    /**
     * Rect 表示每个塔上面的碟子 或者叫做碗 or 方块 or 砖头, (⊙o⊙)… 随便你怎么叫吧, 你应该知道我说的是什么
     */
    function Rect(index, opt) {
        this.index = index;
        this.min = 20; // 20px
        this.step = 8;
        this.h = 10;
        this.w = this.min + this.step * this.index;
        this.div = null;
        this.from = null;
        this.tower = null;
        this.speed = opt.speed;
        this.draw();
    }
    Rect.prototype = {
        draw : function () {
            this.div = $(document.createElement("div"));
            //var opacity = (0.5 + (this.index % 10) / 10).toFixed(1);
            var opacity = 0.3 + Math.random() * 0.7;
            this.div.css({
                position : "absolute",
                backgroundColor : "#000",
                opacity : opacity,
                width : this.w + "px",
                height : this.h + 'px',
                left : "100px",
                top : 100 + this.index * 10 + "px",
                borderRadius : "2px",
                marginLeft : -(this.min + this.step * this.index) / 2 + "px",
                borderBottom : "1px solid #ccc"
            });
            $(document.body).append(this.div);
        },
        moveTo : function(fn) {
            var tower = this.tower;
            return tower.pushRect(this, fn);
        }
    };

    /**
     * Tower 是塔的抽象类
     */
    function Tower(index) {
        this.index = index;
        this.h = 100;
        this.w = 50;
        this.top = 200;
        this.left = 200;
        this.div = null;
        this.origin = {
            x : this.left + this.index * this.h + this.h,
            y : this.top + this.h
        };
        this.rects = [];    // 该塔拥有的矩形
        this.draw(); // draw self
    }
    Tower.prototype = {
        draw : function () {
            var div = document.createElement("div");
            var div2 = document.createElement("div");
            div = $(div);
            div2 = $(div2);
            div.css({
                borderLeft : "1px solid #aaa",
                height : this.h + "px",
                width : 0,
                position : "absolute",
                //left : this.left + this.index * this.h + this.h + "px",
                left : this.origin.x + "px",
                top : this.origin.y - this.h + "px"
            });
            div2.css({
                position : "absolute",
                width : this.w + "px",
                height : 0,
                borderBottom : "1px solid #aaa",
                bottom : 0,
                left : (- this.w / 2) + 'px'
            });
            div.append(div2);
            this.div = div;
            $(document.body).append(div);
        },
        pushRect : function (rect, fn) {    // bool
            var canPush = false;
            if (this.rects.length === 0) {
                canPush = true;
            } else {
                var top = this.rects[this.rects.length -1];
                if (top.index > rect.index) {
                    canPush = true;
                }
            }
            if (canPush) {
                if (rect.from) {
                    rect.from.rects = rect.from.rects.filter(function (item) {
                        return item.index !== rect.index;
                    });
                }
                this.rects.push(rect);
                rect.from = this;
                var index = this.rects.length;
                rect.div.animate({
                    top : this.origin.y - rect.h * index + "px",
                    left : this.origin.x + "px"
                }, rect.speed, fn);
            }
            return canPush;
        }
    };

    /**
     * 入口函数
     * n 表示有几层碟子
     */
    function main(n, opt) {
        var towerNum = 3,
            towers = [],
            rects = [],
            i = 0;
        for (i = 0; i < towerNum; i++) {
            towers.push(new Tower(i));
        }
        for (i = 0; i < n; i++) {
            rects.push(new Rect(i, {
                speed : parseInt(opt.speed)
            }));
        }

        // 每个碟子对应一个index值, index == 0 表示最大的那个碟子, index 越大表示越小的那个碟子
        var index = rects.length - 1;


        new Promise((resolve, reject) => {
            setAllRectsToTheFistTowerOneByOne(index, towers[0]);

            // 将所有的碟子都依次放在第一个塔上面
            function setAllRectsToTheFistTowerOneByOne(i, to) {
                if (i < 0) {
                    resolve();
                    return;
                }

                move(i, to, function () {
                    i = i - 1;
                    setAllRectsToTheFistTowerOneByOne(i, towers[0]);
                });
            }

        }).then(() => {
            start();
        });


        function move(i, to, fn) {
            rects[i].tower = to;
            rects[i].moveTo(fn)
        }

        // 将第1个柱子所有的碟子都移动到第3个柱子上面
        function start() {
            var steps = [];
            h(n - 1, towers[0], towers[1], towers[2], function (prop) {
                steps.push(prop);
            });
            var i = 0,
                len = steps.length;
            console.log(steps);
            loop(i);

            function loop(i){
                if (i >= len) return;
                move(steps[i].index, steps[i].to, function () {
                    i = i + 1;
                    loop(i);
                });
            }
        }

        /**
         * h 函数是汉诺塔递归的核心算法
         * 它表示将第一个柱子所有的碟子都移动到第三个柱子上面
         * @param n  n表示所有的碟子, n == 4 说明有4个碟子
         * @param a  第1根柱子
         * @param b  第2根柱子
         * @param c  第3根柱子
         * @param fn  回调函数
         */
        function h(n, a, b, c, fn){
            if (n === 0) {
                fn({
                    index : n,
                    to : c
                });
            } else {
                h(n -1, a, c, b, fn);
                fn({
                    index : n,
                    to : c
                });
                h(n-1, b, a, c, fn);
            }
        }

    }

    var isRunning = false;
    $("#btn").on("click", function () {
        if (isRunning) return;
        isRunning = true;
        var speed = $("#speed").val();
        var val = $("#input").val();
        main(val, {
            speed : speed
        });

    });
})();
