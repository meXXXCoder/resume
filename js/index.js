/*
 * 项目中的LOADING区域是在页面页面内容展示之前，给用户一个等待加载的时间，主要是处理图片(音视频)的加载
 */
var loadingRender = (function () {
    //->ARY中记录了我们当前项目需要的图片
    var ary = ["icon.png", "zf_concatAddress.png", "zf_concatInfo.png", "zf_concatPhone.png", "zf_course.png", "zf_course1.png", "zf_course2.png", "zf_course3.png", "zf_course4.png", "zf_course5.png", "zf_course6.png", "zf_cube1.png", "zf_cube2.png", "zf_cube3.png", "zf_cube4.png", "zf_cube5.png", "zf_cube6.png", "zf_cubeBg.jpg", "zf_cubeTip.png", "zf_emploment.png", "zf_messageArrow1.png", "zf_messageArrow2.png", "zf_messageChat.png", "zf_messageKeyboard.png", "zf_messageLogo.png", "zf_messageStudent.png", "zf_outline.png", "zf_phoneBg.jpg", "zf_phoneDetail.png", "zf_phoneListen.png", "zf_phoneLogo.png", "zf_return.png", "zf_style1.jpg", "zf_style2.jpg", "zf_style3.jpg", "zf_styleTip1.png", "zf_styleTip2.png", "zf_teacher1.png", "zf_teacher2.png", "zf_teacher3.jpg", "zf_teacher4.png", "zf_teacher5.png", "zf_teacher6.png", "zf_teacherTip.png"];

    var curNum = 0,
        total = ary.length;

    var $loading = $('.loading'),
        $progress = $loading.children('.progress'),
        $progressSpan = $progress.children('span');

    return {
        init: function () {
            //->JQ中的EACH和原生中的forEach参数是相反的
            $.each(ary, function (index, item) {
                var oImg = new Image;
                oImg.src = 'img/' + item;
                oImg.onload = function () {
                    oImg = null;
                    var n = (++curNum) / total;
                    $progressSpan.css('width', n * 100 + '%');
                    //->当所有的图片都加载完成后,我们让LOADING层消失(设置一个1S的延迟,防止网速过快,LOADING层看不见或者层闪烁问题)
                    if (curNum === total) {
                        window.setTimeout(function () {
                            phoneRender.init();//->LOADING结束,PHONE开始
                            $loading.css('opacity', 0).on('webkitTransitionEnd', function () {
                                $(this).remove();
                            });
                        }, 1500);
                    }
                }
            });
        }
    }
})();

/*--PHONE--*/
var phoneRender = (function () {
    var $phone = $('.phone'),
        $time = $phone.find('.time'),
        $listen = $phone.find('.listen'),
        $listenTouch = $listen.find('.touch'),
        $detail = $phone.find('.detail'),
        $detailTouch = $detail.find('span');

    var phoneBell = $('#phoneBell')[0],
        phoneSay = $('#phoneSay')[0];//->把JQ对象转换为原生JS对象,因为AUDIO中的很多属性和方法都是原生的,我们需要使用原生对象调取

    //->LISTEN区域绑定点击事件
    function listenTouchFn() {
        $listen.remove();
        $detail.css('transform', 'translateY(0)');//->换成原生JS的写法：$detail[0].style.webkitTransform='translateY(0)'

        phoneBell.pause();
        $(phoneBell).remove();

        phoneSay.play();
        phoneSay.oncanplay = bindTime;//->canplay:当前音频可以播放了的事件
    }

    //->计时
    function bindTime() {
        $time.css('display', 'block');
        var duration = phoneSay.duration;

        var timer = window.setInterval(function () {
            var curTime = phoneSay.currentTime,
                minute = Math.floor(curTime / 60),
                second = Math.floor(curTime - minute * 60);
            minute = minute < 10 ? '0' + minute : minute;
            second = second < 10 ? '0' + second : second;
            $time.html(minute + ':' + second);

            //->结束
            if (curTime >= duration) {
                //->关闭PHONE,展开MESSAGE
                closePhone();
                window.clearInterval(timer);
            }
        }, 1000);
    }

    //->关闭PHONE,展开MESSAGE
    function closePhone() {
        phoneSay.pause();
        $(phoneSay).remove();

        $phone.css('transform', 'translateY(' + document.documentElement.clientHeight + 'px)').on('webkitTransitionEnd', function () {
            //->PHONE消失
            $(this).remove();

            //->MESSAGE展示
            messageRender.init();
        });
    }

    return {
        init: function () {
            $phone.css('display', 'block');

            //->BELL音频播放
            phoneBell.play();

            //->LISTEN区域绑定点击事件:移动端不使用CLICK事件,因为CLICK事件有300MS延迟(点击到触发有300MS的间隔)，我们使用ZP中提供的专用方法TAP(JQ中没有)
            $listenTouch.tap(listenTouchFn);

            //->DETAIL TOUCH点击事件
            $detailTouch.tap(closePhone);
        }
    }
})();

/*--MESSAGE--*/
var messageRender = (function () {
    var $message = $('.message'),
        $messageItem = $message.find('.list'),
        $messageList = $messageItem.find('li'),
        $messageKeyBoard = $message.find('.keyBoard'),
        $messageText = $messageKeyBoard.find('.text'),
        $messageSubmit = $messageKeyBoard.find('.submit'),
        messageMusic = $('#messageMusic')[0];

    var step = -1,
        autoTimer = null,
        isTrigger = false,
        historyH = 0;

    //->消息列表的运动
    function autoMessage() {
        tempFn();
        autoTimer = window.setInterval(tempFn, 1500);
    }

    function tempFn() {
        //->$messageList[step]:JS对象
        //->$messageList.get(step):JS对象
        //->$messageList.eq(step):JQ对象
        var $cur = $messageList.eq(++step);
        $cur.css({
            opacity: 1,
            transform: 'translateY(0)'
        });

        //->move three
        if (step === 2) {
            $cur.on('webkitTransitionEnd', function () {
                /*我们当前的样式属性两个:opacity、transform发生了改变,所以webkitTransitionEnd事件触发两次，会把某一些逻辑触发两次，所以我们需要加次数的判断：记录触发标识即可*/
                if (isTrigger) return;
                isTrigger = true;

                //->显示键盘:完成后执行文字打印机
                $messageKeyBoard
                    .css('transform', 'translateY(0)')
                    .on('webkitTransitionEnd', textPrint);
            });
            window.clearInterval(autoTimer);
            return;
        }

        //->move four
        if (step >= 3) {
            historyH += -$cur.height();
            $messageItem.css('transform', 'translateY(' + historyH + 'px)');
        }

        //->move end
        if (step === $messageList.length - 1) {
            messageMusic.pause();
            $(messageMusic).remove();
            window.clearInterval(autoTimer);

            //->展示魔方区域了(延迟)
            window.setTimeout(function () {
                $message.remove();


            }, 1500);
        }
    }


    //->文字打印机
    function textPrint() {
        var text = '感觉自己啥也不会啊?',
            n = -1,
            textTimer = null;
        textTimer = window.setInterval(function () {
            $messageText.html($messageText.html() + text[++n]);
            if (n >= text.length - 1) {
                window.clearInterval(textTimer);
                $messageText.html(text);

                //->开启提交按钮的操作
                $messageSubmit
                    .css('display', 'block')
                    .tap(bindSubmit);
            }
        }, 100);
    }

    //->按钮的点击事件
    function bindSubmit() {
        $messageText.html('');
        $messageKeyBoard
            .off('webkitTransitionEnd', textPrint)
            .css('transform', 'translateY(3.7rem)');
        autoMessage();
    }

    return {
        init: function () {
            $message.css('display', 'block');

            //->音乐
            messageMusic.play();

            //->消息列表的运动
            autoMessage(true);
        }
    }
})();


loadingRender.init();

