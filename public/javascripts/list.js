$(function() {
  //参考:重複チェック http://lealog.hateblo.jp/entry/2012/07/07/155004

  /* --------------- 検索系 ------------------ */
  var search_module = function search_module() {
    //No.検索
    document.getElementById('searchNo').addEventListener('mousedown', search_no, false);

    //名前検索
    document.getElementById('nameText').addEventListener('keyup', search_name, false);

    function search_no() {

      var no = toInt(document.getElementById('NoNum').value);

      isNaN(no) ? alert('未登録です。') : window.open(`/list/card${no}`);

    }

    function search_name() {

      var search = $.ajax({
          url: '/list/search',
          type: 'GET',
          data: {
          ruby: document.getElementById('nameText').value
        }
      });

      search.done(function(data) { member_list(data,'.list'); });

      search.fail(function(err) { console.log(err); });

    }
  //end
  }();

  /* -------------- 分析系 ------------------- */
  var analytics_module = function analytics_module() {

    var chart = document.getElementById('analytics');
        chart.setAttribute('src', '/images/chart.svg');

        chart.style.float = 'right';
        chart.style.margin = '0 .5rem 0 0';

    //分析モーダル
    chart.addEventListener('mousedown', modalSlideUp, false);

    function modalSlideUp() {

      $('#registerWindow').animate({
              position: 'absolute',
              top: 0,
              height: window.innerHeight
          },500,'easeOutQuart');

      var analytics = $.ajax({
          url: '/list/analytics',
          type: 'GET'
        });

      analytics.done(function(data) {

        //d3.jsでデータをオブジェクトを取得
        document.getElementById('registerWindowInner').innerHTML = data;

        document.getElementById('visitLanking').addEventListener('mousedown', visitRnaking ,false);
        document.getElementById('nomineeCount').addEventListener('mousedown', nomineeCount ,false);
        document.getElementById('generation').addEventListener('mousedown', generation ,false);

        document.getElementById('magnification').addEventListener('change', visitRnaking ,false);//magnification display none -> block
        document.getElementById('magnificationGeneration').addEventListener('change', generation ,false);//magnification display none -> block

        document.getElementById('cancel').addEventListener('click', cancel, false);

      });
    }

    //来店ランキング
    function visitRnaking() {

      var ranking = $.ajax({
        url: '/list/visitLanking',
        type: 'GET'
      });

      ranking.done(function(data) {
        var ranks = [];

        for(var i=0,n=data.length;i<n;i++) {

          var rank = {};

          rank.no = data[i]['会員番号'];
          rank.name = data[i]['氏名'];
          rank.count = data[i]['来店回数'];
          ranks.push(rank);

        }

        $('#magnification').css({display: 'block'});
        $('#magnification').siblings().on('click', function() {
          $('#magnification').css({display: 'none'});
        });

        document.getElementById('analyticsExplain').innerHTML = '来店の説明文';

        barChart('#visual',ranks);

      });

    }

    //指名ランキング
    function nomineeCount() {

      var nominee = $.ajax({
        url: '/list/nomineeCount',
        type: 'GET'
      });

      nominee.done(function(data) {
        //console.log(data);
        var nomineeAll = []; //指名リスト
        var nominator = []; //指名者リストnominator
        var nomineeRanking = [];　//指名者と指名数のオブジェクト配列

        for(var i=0,n=data.length;i<n;i++) { nomineeAll.push(data[i]['担当']); }

        var staffs = unique(nomineeAll);
        //console.log(staffs);

        for(var i=0,n=staffs.length;i<n;i++) {

          var staff = {};
              staff.name = staffs[i];
              staff.count = 0;

          for(var j=0,n2=nomineeAll.length;j<n2;j++) { if(staffs[i] == nomineeAll[j]) staff.count += 1; }

          nomineeRanking.push(staff);

        }

        document.getElementById('analyticsExplain').innerHTML = '来店の説明文';

        pieChart('#visual',nomineeRanking);
        //barChart('#visual',nomineeRanking);
      });
    }

    //世代別分布
    function generation() {

      var generate = $.ajax({
        url: '/list/generation',
        type: 'GET'
      });

      generate.done(function(data) {
        //console.log(data);
        console.log(new Date(0));

        var generations = [];

        for(var i=0,n= data.length;i<n;i++) {
          var generationObj = {};
          var age = getAge(new Date(data[i]['生年月日'] || new Date()), new Date(data[i]['来店日']));
            age = Math.floor(age);
            if( age < 0 ) { age = 0; } else { age = age; }

          //generationObj.firstVisit = data[i]['来店日'];
          //generationObj.birthday =  data[i]['生年月日'];
          //generationObj.name = data[i]['氏名'];
          generationObj.ageAtFirstVisit = age;

          generations.push(generationObj);

        }


        $('#magnificationGeneration').css({display: 'block'});
        $('#magnificationGeneration').siblings().on('click', function() {
          $('#magnificationGeneration').css({display: 'none'});
        });

        histogramChart('#visual',generations);

        document.getElementById('analyticsExplain').innerHTML =
        '<年齢層の分布><br>来店人のデータです。現在年齢と来店履歴からの来店構成を見ていく予定。';

      });
    }

    //histogram chrat
    function histogramChart(DOM, obj) {
      console.log(obj);
      var graphArea = $(DOM);
      var dataSet = [];
      var barWidth = 20;
      var svgHieght =  $(DOM).height();
      var ageArray = [10,20,30,40,50,60,70,80,90];
      var magnification =  document.getElementById('magnificationGeneration').value;

      for(var i=0,n=obj.length;i<n;i++) { dataSet.push(obj[i].ageAtFirstVisit); }

      console.log(dataSet);

      graphArea.children().remove();

      var histogram = d3.layout.histogram()
        .range([10, 90])
        .bins(ageArray);

      var maxValue = d3.max(histogram(dataSet), function(d, i) {
        //console.log(d);
        return d.y;
      });

      //console.log(maxValue,svgHieght);

      var Yscale = d3.scale.linear()
        .domain([0, maxValue])
        .range([maxValue, 0]);

      var Histogram = d3.select(DOM)
        .append('svg')
        .attr({
          id: 'histogramchart',
          height: graphArea.height(),
          width: graphArea.width()
        });

      var color = d3.scale.category20();

      Histogram.selectAll('rect')
            .data(histogram(dataSet))
            .enter()
            .append('rect')
            .attr({
              class: 'bar',
              x: function(d ,i) {
                return i * barWidth *1.5;
              },
              y: svgHieght,
              width: barWidth,
              height: 0,
              fill: function(d,i) {
                return color(i);
              },
              transform: `translate(${barWidth}, ${(-svgHieght * 0.1 )})`
            })
            .transition()
            .duration(400)
            .ease('bounce')
            .attr({
              y: function(d, i) {
                //console.log(d.y);
                return svgHieght - d.y * magnification;
              },
              width: barWidth,
              height: function(d, i) {
                return d.y * magnification;
              }
            });

        Histogram.selectAll('text')
        .data(histogram(dataSet))
        .enter()
        .append('text')
        .attr({
          x:function(d, i) {
            return i * barWidth *1.5;
          },
          y: svgHieght,
          width: barWidth,
          'text-anchor': 'middle',
          transform: `translate(${barWidth * 1.5}, ${(-svgHieght * 0.1 )})`
        })
        .text(function(d) {
          console.log(d);
          return d.y;
        })
        .attr({
          fill: 'white'
        });

        Histogram.selectAll('text2')
        .data(histogram(dataSet))
        .enter()
        .append('text')
        .attr({
          x:function(d, i) {
            return i * barWidth *1.5;
          },
          y: svgHieght,
          width: barWidth,
          'font-size': '.5rem',
          'text-anchor': 'middle',
          transform: `translate(${barWidth * 1.5},${(-20)})`
        })
        .text(function(d, i) {
          console.log(ageArray[i]);
          return ageArray[i] + '代';
        })
        .attr({
          fill: 'gray'
        });
      }

    //pie chart
    function pieChart(DOM, obj) {
      var graphArea = $(DOM);
      var textPositions = [];
      var nums = [];
      var names = [];
      var magnification = 0.7;
      var fontSize = '.72rem';

      obj = obj.sort(function(a,b) {
        return d3.descending(a.count, b.count);
      });

      console.log(obj);

      graphArea.children().remove();

      for(var key in obj) {
            var num = obj[key].count;
            var name = obj[key].name;
            nums.push(parseInt(num));
            names.push(name);
          }

      console.log(nums,names);

      var Pie = d3.select(DOM)
        .append('svg')
        .attr({
          id: 'piechart',
          height: graphArea.height(),
          width: graphArea.width(),
        })
        .append('g')
        .attr({
          transform: `translate(${graphArea.width() * 0.5},${graphArea.height() * 0.5})`
        });

      var pie = d3.layout.pie()
        .value(function(d) {
          return d;
        });

      var arc = d3.svg.arc().innerRadius(50).outerRadius(100);
      var color = d3.scale.category10();

      //console.log(pie(nums));

      Pie.selectAll('path')
        .data(pie(nums))
        .enter()
        .append('path')
        .attr({
          //d:arc,
          stroke: 'white',
          fill: function(d,i) {
            //console.log(color(i));
            return color(i);
          }
        })
        .transition()
        .duration(300)
        .ease('ease')
        .delay(function(d,i) {
          return 300 * i;
        })
        .attrTween('d', function(d,i) {
          var interpolate = d3.interpolate(
            {startAngle: d.startAngle, endAngle: d.startAngle},
            {startAngle: d.startAngle, endAngle: d.endAngle}
            );

          return function(t) {
              return arc(interpolate(t));
            };
          });

      Pie.selectAll('text')
        .data(pie(nums))
        .enter()
        .append('text')
        .attr({
          transform: function(d) {
            //console.log(arc.centroid(d));
            textPositions.push(arc.centroid(d));
            return  `translate(${arc.centroid(d)})`;
          },
          'font-size': fontSize,
          'text-anchor': 'middle',
          fill: 'black'
        })
        .text(function(d) {
          return d.value;
        });


        Pie.selectAll('text2')
        .data(names)
        .enter()
        .append('text')
        .attr({
          transform: function(d,i) {
            //console.log(textPositions[i][0] + 20 );
            return  `translate(${textPositions[i][0] + 20},${textPositions[i][1]})`;
          },
          'font-size': fontSize,
          'text-anchor': 'middle',
          fill: 'black'
        })
        .text(function(d) {
          return d;
        });

        Pie.append('text')
          .attr({
            fill: 'black',
            'text-anchor': 'middle'
          })
          .text(`total${d3.sum(nums)}`);
    }

    //バーチャート　D3
    function barChart(DOM,obj) {//DOM : jQueryObj
      $(DOM).children().remove();
      var positionArr = [];
      var nums = [];
      var names = [];
      var magnification = document.getElementById('magnification').value; //$('#magnification').val();

      for(var key in obj) {
            var num = obj[key].count;
            var name = obj[key].name;
            nums.push(parseInt(num));
            names.push(name);
          }
          console.log(nums,names);

      var barHieght = $(DOM).height();
      var barWidth = 20;
      var color = d3.scale.category10();

      //d3
      var Bar = d3.select(DOM)
                  .append('svg')
                  .attr({
                    id: 'barChart',
                    height: $(DOM).height(),
                    width: $(DOM).width()
                  });
      //グラフ
      Bar.selectAll('rect')
        .data(nums)
        .enter()
        .append('rect')
        .attr({
          x:function(d, i) {

            return i * barWidth *1.2;
          },
          y:barHieght,
          width: barWidth,
          height: 0,
          transform: `translate(${barWidth},-20)`
        })
        .transition()
        .duration(400)
        .ease('bounce')
        .attr({
          x:function(d, i) {

            return i * barWidth *1.2;
          },
          y: function(d,i) {
            positionArr.push(barHieght - d * magnification);
            return barHieght - d * magnification;
          },
          width: barWidth,
          height: function(d,i) {
            return d * magnification;
          },
          fill: function(d,i) {
            return color(i);
          }
        });

      //名前
      Bar.selectAll('text')
        .data(names)
        .enter()
        .append('text')
        .attr({
          x: function(d,i) {
            return (i + 1 ) * barWidth *1.2;
          },
          y:function(d, i) {
            console.log(positionArr[i]);
            return positionArr[i] - barWidth * 1.2;　　//ここがポイント
          },
          fill: 'black',
          'font-size': 9,
          'writing-mode': "tb-rl",
          'glyph-orientation-vertical': 'auto',
          //'glyph-orientation-vertical': '90',
          'text-anchor': 'end',
          //transform: 'translate(20,0)',
          transform: 'rotate(90deg)',
          transform: `translate(${barWidth * 0.3},0)`
        })
        .text(function(d){
          return d;
        });
        //来店数
        Bar.selectAll('text2')
        .data(nums)
        .enter()
        .append('text')
        .attr({
          x:function(d, i) {
            return i * barWidth *1.2;
          },
          y: barHieght,
          width: barWidth,
          'text-anchor': 'middle',
          transform: `translate( ${(barWidth*1.5)},-21)`
        })
        .text(function(d) {
          return d;
        })
        .attr({
          fill: 'white'
        });
    }
  //end
  }();

  /* -------------- 登録系 ------------------- */
  var register_module = function register_module() {
    //新規登録
    document.getElementById('register').addEventListener('click', register, false);

    function register() {
      //console.log('登録');
      $('#registerWindow').animate({
            position: 'absolute',
            top: 0,
            height: $(window).height()
        },500,'easeOutQuart');

      var Register = $.ajax({
          url: '/list/register',
          type: 'GET'
      });

      //新規登録モーダルウィンドウ
      Register.done(function(data) {

          //validation regexp
          var regTel = /\d{2,4}-\d{2,4}-\d{4}/;
          var regName = /[^\x01-\x7E\xA1-\xDF]/;
          var regMail = /^[a-zA-Z0-9][a-zA-Z0-9_¥.¥-]+?@[A-Za-z0-9_¥.¥-]+$/;

          $('#registerWindowInner').html(data.html);

          //バリデーション
          validation(regName,$('input[name="name"]'),'全角でね');
          validation(regName,$('input[name="ruby"]'),'全角でね');
          validation(regTel,$('input[name="tel"]'),'半角で-をいれてね');
          validation(regMail,$('input[name="eMail"]'),'正しくありません');

          document.getElementById('signUpCheck').addEventListener('click', signUpCheck, false);
          document.getElementById('cancel').addEventListener('click', cancel, false);

          //郵便番号入力アシスト
          $('input[name="postcode"]').on('keyup', function() { AjaxZip3.zip2addr(this,'','address','address'); });

      });
    		//window.open('/register');
    }

    //登録確認画面
    function signUpCheck() {

      var SignUpCheck = $.ajax({
          url: '/list/signUpCheck',
          type: 'POST',
          data: {
            no: $('input[name="no"]').val(),
            name: $('input[name="name"]').val(),
            ruby: $('input[name="ruby"]').val(),
            tel: $('input[name="tel"]').val(),
            sex: $('input[name="sex"]').prop('checked') ? '女性': '男性',
            postcode: $('input[name="postcode"]').val(),
            address: $('input[name="address"]').val(),
            birthday: $('input[name="birthday"]').val(),
            eMail: $('input[name="eMail"]').val()
          }
      });

      SignUpCheck.done(function(data) {

          var no = data.no,
              html =  data.html;

          //console.log(html);
          document.getElementById('registerWindowInner').innerHTML = html;
          //$('#registerWindowInner').html(html);
          DBinsert(no); // < - リファクタリング要
          //document.getElementById('create').addEventListener('click', ,false); 引数を与えることができるかがp

          document.getElementById('cancel').addEventListener('click', cancel, false);
          //cancel();
        });
      }

      //本登録処理 -> DBへ
      function DBinsert(no) {
        $('#create').on('click', function() {
          var create = $.ajax({
           url: '/list/' + no,
           type: 'GET',
           data: {
             no: $('input[name="no"]').val(),
             name: $('input[name="name"]').val(),
             ruby: $('input[name="ruby"]').val(),
             tel: $('input[name="tel"]').val(),
             sex: $('input[name="sex"]').val(),
             postcode: $('input[name="postcode"]').val(),
             address: $('input[name="address"]').val(),
             birthday: $('input[name="birthday"]').val(),
             eMail: $('input[name="eMail"]').val()
           }
         });

         create.done(function(data) {
           console.log(data);
         });

         $('#registerWindow').animate({
             top: '100%',
             height: 0
         },250,'easeOutQuart');

         $('#registerWindowInner').empty();

         window.open(`/list/card${no}`, 'dependent=yes');
      });
    }

  //end
  }();

  /* -------------- 外部アダプター ------------ */
  var api = function api() {

    $('#slider').on('change', function() {
        console.log($(this).val());
      });

    //設定画面
    var control = $('#control').attr('src','/images/control.svg');
    var panel = $('#controlPanel');

      control.css({
          float: 'right'
      });

      panel.css({
          display: 'block',
          position: 'absolute',
          top: -98,
          right:20
      });

      control.on({
          'click': function() {
            //console.log($('#controlPanel').css('height'));
            //console.log($('#controlPanel').offset().top);

              if(parseInt(panel.css('top')) == -98) {
                  $(this).css({
                    opacity: 0,
                    '-webkit-transform': 'rotate(90deg)',
                    '-webkit-transition': 'all .5s cubic-bezier(0.215, -0.400, 0.685, 1.530) 0 '
                  });
                  panel.animate({
                    top: 0
                  },400,'easeOutQuart');
              } else {
                  $(this).css({
                      '-webkit-transform': 'rotate(0deg)',
                      '-webkit-transition': 'all .5s cubic-bezier(0.215, -0.400, 0.685, 1.530) 0 '
                    });
                  panel.animate({
                    top: -98
                  },400,'easeOutQuart');
              }
          },
          'mouseenter': function() {
              control.animate({
                  opacity: 0.8
              },200);
          },
          'mouseleave': function() {
              control.animate({
                  opacity: 1
              },200);
          }
      });

      /*外部データ読み込み
        $('#inport').on('click', function() {
          console.log('click');

          var list = $.ajax({
            url: '/list/inport',
            type: 'GET'
          });

          list.done(function(data) {
            //var name = data['氏名'];
            alert('データベスに挿入完了');
            //console.log(data);
          });

        });*/

  //end
  }();

  /* ----------- アプリロード時 ------------ */
  //全会員情報取得
  var initial = function initial() {

    var allList = $.ajax({
          url: '/list/allList',
          type: 'GET'
        });

    allList.done(function(data) { member_list(data,'.list'); });

    //天気予報
    var weather = $.ajax({
            url: 'http://api.openweathermap.org/data/2.5/weather?q=Tokyo,jp',
            type: 'get'
          });

    weather.done(function(data) {

      var img = document.createElement('img');
          img.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;

      document.getElementById('weather').appendChild(img);

    });

    //誕生日リスト
    var birthday = $.ajax({
          url: '/list/birthday',
          typ: 'GET'
        });

    birthday.done(function(data) {
        //console.log(new Date(data[0].birthday).getMonth());
        var lucker = $('<ul>').attr('class', 'lucker');

        var list = [];
            for(var i=0,n=data.length;i<n;i++) {
                var li = $('<li>').append(`${data[i].name} ${data[i].birthday}`);
                lucker.append(li);
            }

        $('#birthday').append(lucker);

    });

    //インプットルールチップ
    tooltip('#NoNum', '半角');
    tooltip('#nameText', '全角ひらがな');
    tooltip('input[name="ruby"]', '全角');

  //end
  }();

  //モーダルクローズ
  function cancel() {

    $('#registerWindow').animate({
        top: '100%',
        height: 0
      });

    $('#registerWindowInner').empty();

  }

  //会員リスト
  function member_list(data,target) {

    var list = '';

    for(var i=0,n=data.length; i<n; i++) {

      var name = data[i]['氏名'],
          ruby = data[i]['ふりがな'],
          tel = data[i]['電話番号'],
          no = data[i]['会員番号'],
          sex = data[i]['性別'];

      list +=
        `<div class="list">
        <span>${no}</span><span>${sex}</span>
        <span style="width:6rem;display:inline-block;">${name}</span>
        <span style="width:8rem;display:inline-block;">${ruby}</span>
        <span>TEL:${tel}</span>
        </div>`;
      }

      document.getElementById('searchResult').innerHTML = list;

      //検索結果にマウスエフェクト
      $(target).on('mouseenter', hover);
      $(target).on('mouseenter', hover);
      $(target).on('click', hover);

      function hover(e) {

        if(e.type === 'mouseenter') {

          $(this).css({
            background: 'rgba(215, 223, 203, 0.24)',
            'box-shadow': 'black'
          });

        } else if(e.type === 'mouseleave') {

          $(this).css({ background: 'rgba(215, 223, 203, 0.17)' });

        } else if(e.type === 'click') {

          var no = $(this).find('span').eq(0).text();
          var reg = /\d+/;

              no = parseInt(no.match(reg)[0]);

          window.open(`/list/card${no}`);

        }

      }

    }

  function tooltip(selecter, text) {

      $(selecter).on('change', hover);
      $(selecter).on('focus', hover);
      $(selecter).on('blur', hover);

      function hover(e) {

        if(e.type === 'change') {
          var str = $(this).val();
          console.log(toInt(str));
        } else if(e.type === 'focus') {

          this.top = $(this).offset().top;
          this.left = $(this).offset().left + $(this).width();
          $(this).parent().append('<p id="caution">' + text + '</p>');

          $('#caution').css({
              position: 'absolute',
              top: this.top - $(this).parent().height(),
              left: this.left - $(this).width(),
              padding: '0 .4rem',
              'font-size': '12px',
              'color': 'red',
              background: 'white',
              'box-shadow': '0 0 1px gray',
              opacity: 0
          }).animate({
              top: this.top - $(this).parent().height() * 2,
              opacity: 1
          },300);

        } else if(e.type === 'blur') {

          $('#caution').fadeOut(900);
          setTimeout(function() {
             $('#caution').remove();
          },930);

        }

      }

    }

  //ヴァリデーション
  function validation(reg,input,cautionText) {

      input.on('keyup', caution);

      function caution() {
        reg.test(input.val()) ? $(this).next().text('OK!') : $(this).next().text(cautionText);
      }

    }

  //オブジェクトのソート
  function sort(arr,key) {

      arr.sort(function(a, b) { return (a[key] > b[key]) ? 1 : -1; });

      return arr;

    }

  //年齢計算
  function getAge (birthday, now) {

      var b = new Date(birthday.getTime());
      var n = new Date(now.getTime());

      return (n-b) / (365 * 24 * 60 * 60 *1000) - (n >= b ? 0: 1);

    }

  //重複削除
  function unique(array) {

    var storage = {};
    var uniqueArray = [];
    var i,value;

    for( i=0; i<array.length; i++) {

      value = array[i];

      if (!(value in storage)) {
        storage[value] = true;
        uniqueArray.push(value);
      }
    }

    return uniqueArray;

  }

  //全角数字を半角文字に変換
  function toInt(str) {

      str = str.replace(/[０-９．]/g, function (s) {
              return String.fromCharCode(s.charCodeAt(0) - 65248);
          })
          .replace(/[‐－―ー]/g, '-')
          .replace(/[^\-\d\.]/g, '')
          .replace(/(?!^\-)[^\d\.]/g, '');

    return parseInt(str, 10);

  }
//end
});
