/*!
 * jQuery sagwan plugin
 * by Sukmin Kwon
 * https://github.com/sukmin/sagwan
 * version : 0.2
 * since : 2016.10.12
 * updated : 2016.10.27
 * licensed under the MIT License
 */
(function ($) {

    var defaultOption = {
        "version": 1,
        "saveItemCount": 10,
        "onEquals": function (obj1, obj2) {
            for (prop in obj1) {
                if (prop !== "sagwanDate" && obj1[prop] !== obj2[prop]) {
                    return false;
                }
            }
            for (prop in obj2) {
                if (prop !== "sagwanDate" && obj2[prop] !== obj1[prop]) {
                    return false;
                }
            }
            return true;
        },
        "onDateToString": function (d) {

            if (typeof d === "string") {
                d = new Date(d);
            }

            var year = d.getFullYear().toString();
            var month = (d.getMonth() + 1).toString();
            var date = d.getDate().toString();
            var hour = d.getHours().toString();
            if (hour.length == 1) {
                hour = "0" + hour;
            }
            var minute = d.getMinutes().toString();
            if (minute.length == 1) {
                minute = "0" + minute;
            }
            var second = d.getSeconds().toString();
            if (second.length == 1) {
                second = "0" + second;
            }
            return year + "." + month + "." + date + ". " + hour + ":" + minute + ":" + second;
        },
        "onDrawItemText": function (obj) {
            var text = "";
            for (prop in obj) {
                if (prop !== "sagwanDate") {
                    text = text + prop + ":" + obj[prop] + " ";
                }
            }
            return text;
        }
    };

    function Sagwan(el, option) {

        this.CONSTANT = {
            KEY_PREFIX: "sagwan.histories.",
            AREA_PREFIX: "sagwan_area_",
            LIST_PREFIX: "sagwan_list_",
            HISTORIESE_PREFIX: "sagwan_histories_",
            CLICK_CLASS_PREFIX: "sagwan_click_",
            ITEM_NAME: "sagwan_item"
        };

        this.histories = null;
        this.inputTag = $(el);
        this.id = (window.location.hostname + window.location.port + window.location.pathname).replace(/\/|\.|\:/gi, "") + this.inputTag.attr("id");
        this.storageKey = this.CONSTANT.KEY_PREFIX + this.id;
        this.listId = this.CONSTANT.LIST_PREFIX + this.id;
        this.historieseId = this.CONSTANT.HISTORIESE_PREFIX + this.id;
        this.areaId = this.CONSTANT.AREA_PREFIX + this.id;
        this.clickClassName = this.CONSTANT.CLICK_CLASS_PREFIX + this.id;
        this.option = option;

        this.createArea();
        this.area = $("#" + this.areaId);

        this.load();
        this.draw();
        this.bindEvents();

    }

    Sagwan.prototype.load = function () {
        var loadedData = localStorage.getItem(this.storageKey);
        var loadedObj = JSON.parse(loadedData);
        if (loadedObj == null) {
            this.histories = [];
            return;
        }
        if (!loadedObj.histories) {
            localStorage.removeItem(this.storageKey);
            this.histories = [];
            return;
        }
        if (this.option.version > loadedObj.version) {
            localStorage.removeItem(this.storageKey);
            this.histories = [];
            return;
        }
        this.histories = loadedObj.histories;
    };

    Sagwan.prototype.equals = function (obj1, obj2) {

        // null이나 undefined일 경우
        if (!obj1 || !obj2) {
            return obj1 === obj2;
        }

        return this.option.onEquals(obj1, obj2);
    };

    Sagwan.prototype.save = function (obj) {
        obj.sagwanDate = new Date();

        var duplicatedIndex = -1;
        $.each(this.histories, $.proxy(function (idx, history) {
            if (this.equals(obj, history)) {
                duplicatedIndex = idx;
                return false;
            }
        }, this));

        if (duplicatedIndex !== -1) {
            // 어레이에서 해당 index만 제거하기
            this.histories.splice(duplicatedIndex, 1);
        }

        this.histories.unshift(obj);
        if (this.histories.length > this.option.saveItemCount) {
            this.histories = this.histories.slice(0, this.option.saveItemCount);
        }
        var savingObj = {
            version: this.option.version,
            histories: this.histories
        };
        var savingData = JSON.stringify(savingObj);
        localStorage.setItem(this.storageKey, savingData);
        this.draw();
    };

    Sagwan.prototype.dateToString = function (d) {
        return this.option.onDateToString(d);
    };

    Sagwan.prototype.drawItemText = function (obj) {
        return this.option.onDrawItemText(obj);
    };

    Sagwan.prototype.show = function () {
        if (this.histories.length === 0) {
            return false;
        }
        this.area.show();
    };

    Sagwan.prototype.hide = function () {
        this.area.hide();
    };

    Sagwan.prototype.draw = function () {
        var sagwanList = $("#" + this.listId);
        sagwanList.empty();
        $.each(this.histories, $.proxy(function (idx, obj) {

            var elList = $('<li>');
            elList.addClass(this.clickClassName);
            elList.css('cursor', 'pointer');
            elList.html(this.drawItemText(obj));

            elList.data(this.CONSTANT.ITEM_NAME, obj);

            var elEm = $('<em style="position: absolute;right: 10px;">');
            elEm.text(this.dateToString(obj.sagwanDate));
            elList.append(elEm);

            sagwanList.append(elList);
        }, this));
    };

    Sagwan.prototype.isVisible = function () {
        return this.area.is(":visible");
    };

    Sagwan.prototype.onShow = function (e) {
        this.show();
    };

    Sagwan.prototype.onHide = function (e) {
        if (this.isVisible() === false) {
            return;
        }

        var parentArea = this.inputTag;
        var sagwanArea = this.area;
        if (!parentArea.is(e.target) && !sagwanArea.is(e.target) && sagwanArea.has(e.target).length === 0) {
            this.hide();
        }

    };

    Sagwan.prototype.onClickItem = function (e) {
        e.preventDefault();

        var target = $(e.currentTarget);
        var obj = target.data(this.CONSTANT.ITEM_NAME);

        this.inputTag.trigger("sagwan:clickItem", [obj]);

        this.save(obj);
        this.hide();

        this.inputTag.trigger("sagwan:clickItemAfter", [obj]);

    };

    Sagwan.prototype.onResize = function (e) {
        $("#" + this.areaId).css({
            "width": this.inputTag.outerWidth() + "px"
        });
    };

    Sagwan.prototype.bindEvents = function () {
        this.inputTag.click($.proxy(this.onShow, this));

        $(document).on("click", $.proxy(this.onHide, this));

        this.area.on("click", "." + this.clickClassName, $.proxy(this.onClickItem, this));

        $(window).resize($.proxy(this.onResize, this));

        var sagwanList = $('#' + this.listId);
        sagwanList.on('mouseover', 'li', $.proxy(this.onListItemMouseOver, this));
        sagwanList.on('mouseleave', 'li', $.proxy(this.onListItemMouseLeave, this));
    };

    Sagwan.prototype.onListItemMouseOver = function (event) {
        $(event.currentTarget).css('background-color', '#DBDBDB');
    };

    Sagwan.prototype.onListItemMouseLeave = function (event) {
        $(event.currentTarget).css('background-color', '');
    };

    Sagwan.prototype.createArea = function () {

        //최초 그리기
        var sagwanList = $('<ul id="' + this.listId + '">');
        sagwanList.css({
            "list-style": "none",
            "padding-left": "10px"
        });

        var sagwanHistories = $('<div id="' + this.historieseId + '">');

        var sagwanArea = $('<div id="' + this.areaId + '">');
        var inputTagPosition = this.inputTag.position();
        sagwanArea.css({
            "position": "absolute",
            "background-color": "#FBFBFB",
            "border": "1px solid #cccccc",
            "display": "none",
            "z-index": 9999,
            "width": this.inputTag.outerWidth() + "px",
            "left": inputTagPosition.left + "px"
        });

        sagwanHistories.append(sagwanList);
        sagwanArea.append(sagwanHistories);
        sagwanArea.insertAfter(this.inputTag);

    };

    $.fn.sagwan = function (useOption) {

        // localStorage를 지원 안할 경우
        if (("localStorage" in window) === false || window['localStorage'] === null) {
            return false;
        }

        option = $.extend({}, defaultOption, useOption);
        this.each(function (index) {
            var sagwan = new Sagwan(this, option);
            $(this).data("sagwan", sagwan);
        });
        return this;
    };

    $.fn.sagwanSave = function (obj) {
        this.each(function (index) {
            var sagwan = $(this).data("sagwan");
            if (sagwan) {
                sagwan.save(obj);
            }
        });
        return this;
    };


})(jQuery);