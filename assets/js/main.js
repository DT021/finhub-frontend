//Simple Template Engine
var TemplateEngine = function(html, options) {
    var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
    var add = function(line, js) {
        js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    };
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};

// php's mt_rand analog
function mt_rand(min, max) {
    var argc = arguments.length;
    if (argc === 0) {
        min = 0;
        max = 2147483647;
    } else if (argc === 1) {
        throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given');
    } else {
        min = parseInt(min, 10);
        max = parseInt(max, 10);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Устанавливаем блоки, видимые при прокрутке
$(function(){
    var viewport = $(window),
        setVisible = function (e) {
            var viewportTop = viewport.scrollTop(),
                viewportBottom = viewport.scrollTop() + viewport.height();
            $('.need_visible').each(function () {
                var self = $(this),
                    top = self.offset().top,
                    bottom = top + self.height(),
                    topOnScreen = top >= viewportTop && top <= viewportBottom,
                    bottomOnScreen = bottom >= viewportTop && bottom <= viewportBottom,
                    elemVisible = topOnScreen || bottomOnScreen;
                self.toggleClass('visible', elemVisible);
            });
        };
    viewport.scroll(setVisible);
    setVisible();
});

//Slick & newCarousel
//TODO: возможен баг, при котором некорректно инициализируются слайды (в одной точке) для скрытых изначально каруселей, так как ширина скрытого блока равна нулю
$(function(){

    var initNewCarouselSlick = function(el) {
        if ($(el).hasClass('slick-initialized')) return;
        $(el).slick({
            prevArrow: '<span class="slickBtn slickBtn--prev"><i class="fa fa-chevron-circle-left"></i></span>',
            nextArrow: '<span class="slickBtn slickBtn--next"><i class="fa fa-chevron-circle-right"></i></span>',
            slidesToShow: 6,
            slidesToScroll: 1,
            swipeToSlide: true,
            infinite: true
        });
    };

    initNewCarouselSlick('.newCarousel.active');

    $('.new__changeLink').click(function(e){
        e.preventDefault();
        var id = $(this).attr('href');
        if ($(id).hasClass('active')) return false;
        $('.new__changeLink').removeClass('active');
        $(this).addClass('active');
        $('.newCarousel.active').removeClass('active').hide();
        $(id).addClass('active').show();
        initNewCarouselSlick(id);
        return false;
    });
});

//Tabs (\w table)
$(function(){
   $('.tabLink').click(function(e){
       e.preventDefault();
       var id = $(this).attr('href');
       if ($(id).hasClass('active')) return false;
       $('.tabLink').removeClass('active');
       $(this).addClass('active');
       $('.tabBody.active').removeClass('active').hide();
       $(id).addClass('active').show();
       return false;
   });
});

//User Link card
$(function(){

    var cacheData = {};
    var activeElement;

    var cardW = 326;

    var showCard = function(uid, a){
        var template = $('#userCard-template').html().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        var card = TemplateEngine(template, cacheData[uid]);
        activeElement = $(card).appendTo('body');

        var pos = $(a).offset();

        var pl = parseInt($(a).css('padding-left'));
        var ah = parseInt($(a).height());

        //var left = pos.left - 104 + pl;
        var left = pos.left - ((cardW - $(a).width()) / 2) + (pl / 2);
        var top = pos.top - 22;

        if (left < 0) left = 0;
        if (left > $(window).width() - cardW) left = $(window).width() - cardW;

        activeElement.css({
            top: top + 'px',
            left: left + 'px'
        });
    };

    $(document).on({
        mouseenter: function(){
            var a = $(this);
            var uid = $(this).data('uid');
            if (!cacheData[uid]) {
                //TODO: Сделать реальный аякс запрос данных
                cacheData[uid] = {
                    fio: 'Александр Сергеевич П.',
                    type: 'физическое лицо',
                    age: '54 года',
                    city: 'Хабаровск',
                    register: '2 года назад',
                    deals: '103',
                    rating: '415 баллов',
                    opacity: '75%',
                    reviews: '115',
                    voteup: '45',
                    votedown: '15',
                    img: '<img class="userCard__img" src="http://lorempixel.com/100/100/cats" width="69" height="69" />'
                };
                showCard(uid, a);
            } else {
                showCard(uid, a);
            }
        }
    }, '.userLink');

    $(document).on({
        mouseleave: function(){
            activeElement.remove();
        }
    }, '.userCard');
});

// Modals
$(function(){
   $('a[href^=#]').click(function(e){
       e.preventDefault();
       $('.target').removeClass('target');
       $($(this).attr('href')).addClass('target');
   });
});

// Forms Validators
$(function(){
    var check = function(selector, check_rules) {
        check_rules = check_rules || false;
        var disabled = false;

        $(selector).find('input[required],textarea[required],select[required]').each(function(){
            if (!$(this).val()) {
                disabled = true;
            }
        });

        if (check_rules) {
            if ($(selector).find('.rules .form__input--checkbox').size() != $(selector).find('.rules .form__input--checkbox:checked').size()) {
                disabled = true;
            }
        }

        return disabled;
    };

    // Register Form
    $('form.register .choose-type').change(function(){
        var type = $(this).val();
        $('form.register .acctype').removeClass('active');
        $('form.register .acctype input[required]').addClass('required').attr('required', false);
        $('form.register #acctype'+type+'section').addClass('active');
        $('form.register #acctype'+type+'section input.required').attr('required', true);
    });

    $('form.register .choose-type:checked').change();

    // All forms
    $('form.validate').each(function(){
        var form = $(this);

        var rules = $(this).hasClass('validate-rules');
        form.find('input').change(function(){
            var disabled = check(form, rules);
            form.find('.submit').prop('disabled', disabled);
        });

        form.submit(function(){
            e.preventDefault();
            var ok = ! check(form, rules);
            return ok;
        });
    });

});

//Edit info checkbox-slide
$(function(){
   $('.docsSection .form__input--checkbox').change(function(){
       var body = $(this).parents('.docsSection__col').find('.docsSection__body');
       if ($(this).is(':checked')) {
           body.slideDown();
       } else {
           body.slideUp();
       }
   });
});

// Slide .form__sectionHeader hidden blocks
$(function(){
    $('.form__sectionHeader').click(function(){
        $(this).parent().find('.hidden').slideToggle();
    });
    $('.form__section').each(function(){
        $('input', this).last().focus(function(){
            $(this).parents('.form__section').next('.form__section').find('.hidden').slideDown();
        });
    });
});

//Userlist changes
$(function(){
    $(".userList__item").on('click',function(){
        var activeUser = $('.userList__item--activeuser');

        if(!($(this).hasClass("userList__item--activeuser"))) {
            $(this).insertBefore($('.userList__item--activeuser'));
            activeUser.removeClass('userList__item--activeuser');
            $(this).addClass('userList__item--activeuser');
        }
    });
});

//Seclects
$(function(){
    $('select').selectric();
});