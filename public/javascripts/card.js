$(function() {

  var today = new Date();
  var birthDay = new Date(birthday);

  if(sex == '女性') $('.headline').css({color: 'rgba(243, 12, 5, 0.6)'});

  //来店リストとカルテ画像リストのリアルタイム更新
  window.addEventListener('load',initial, false)

  function initial() {
    log_shop(no);
    log_karte(no);
    log_memo(no);
  }

  //年齢計算
  function getAge (birthday, now) {

    var b = new Date(birthday.getTime());
    var n = new Date(now.getTime());
    return (n-b)/ (365 * 24 * 60 * 60 *1000) - (n >= b ? 0: 1);

  }

  //来店履歴表示
  function log_shop(no) {

    var logs = $.ajax({
      url: '/list/log',
      type: 'GET',
      data: {no: no}
    });

    //過去ログ取得
    logs.done(function(data) {

      var list_length = $(data).length;
      var last_visit = $(data).eq(list_length - 1).children().eq(1).text();
      var age = getAge(birthDay,today);
          age = parseInt(age);

      //基本情報更新
      $('#log').html(data);
      $('#age').html(age);
      $('#visitCount').html(list_length);
      $('#lastVisit').html(last_visit);

      //来店履歴訂正 -> modifyKarete
      $('.logList').on('mouseenter', log_list);
      $('.logList').on('mouseleave', log_list);
      $('.logList').on('click', log_list);

      function log_list(e) {

        if(e.type === 'mouseenter') {

          $(this).css({ background: 'rgba(0,0,0,.16)'});

        } else if(e.type === 'mouseleave') {

          $(this).css({ background: 'rgba(0,0,0,.04)'});

        } else if(e.type === 'click') {

          modfy_log(this);
          //console.log($(this).find('.logId').text());
        }

      }

    });

    logs.fail(function(err) { console.log(err); });
  }

  //カルテ画像表示
  function log_karte(no) {

    var kartes = $.ajax({
      url: '/list/kartes',
      type: 'GET',
      data: {no: no}
    });

    kartes.done(function(data) {

      var imgCounts = $(data).filter('img').length;

      $('#kartes').html(data);

      //カルテ画像削除
      $('#kartes > img').on('click', function() {
        console.log($(this).attr('alt'),no);
        remove_karte($(this).attr('alt'),no);
      });

    });

    kartes.fail(function(err) { console.log(err); });

  }

  //メモの格納
  function log_memo(no) {
    console.log('memoを読み込む');

    var memos = $.ajax({
      url: '/list/memos',
      type: 'GET',
      data: {
        no: no
      }
    });

    memos.done(function(data) { $('#memos').html(data[0]['メモ']); });

    memos.fail(function (err) { console.log(err);});

  }

  //カルテ削除
  function remove_karte(id,no) {

    var remove = $.ajax({
      url: '/list/removeKarteForm',
      type: 'GET',
      data: {
        id: id,
        no: no
      }
    });

    remove.done(function(data) {
      console.log(data);
      $('#modal').fadeIn();
      $('#modalInner').append(data);

      //キャンセル
      $('#cancel').on('click', function(e) {
        e.preventDefault();
        $('#modal').fadeOut();
        $('#modalInner').children().remove();
      });

      //追記情報格納
      $('#remove').on('click', function(e) {
        $('#modal').fadeOut();
        $('#modalInner').children().remove();
      });
    });

    remove.fail(function(err) { console.log(err); });

  }

  //来店履歴修正
  function modfy_log(selector) {

    var modify = $.ajax({
      url: '/list/modifyLogForm',
      get: 'GET',
      data: {
        no: no,
        count: $(selector).find('span').eq(0).text()
      }
    });

    modify.done(function(data) {
      console.log(data);
      $('#modal').fadeIn();
      $('#modalInner').append(data);

      //キャンセル
      $('#cancel').on('click', function(e) {
        e.preventDefault();
        $('#modal').fadeOut();
        $('#modalInner').children().remove();
      });

      //追記情報格納
      $('#save').on('click', function(e) {
        $('#modal').fadeOut();
        $('#modalInner').children().remove();
      });

      //削除
      $('#removeLog').on('click', function() {
        var id = $('input[name="id"]').val();
        var no = $('input[name="no"]').val();
        logRemove(id,no);
        $('#modal').fadeOut();
        $('#modalInner').children().remove();
      });
    });

    modify.fail(function(err) { console.log(err); });
  //end
  }

  //メモデータの追記
  $('#add_memo').on('click', add_memo);

  function add_memo() {

    var oldMemo = $('#memos').html() + '<br>';
    var newMemo = window.prompt('コメントしてね', oldMemo);

    var memo = $.ajax({
      url: '/list/appendMemo',
      type: 'GET',
      data: {
        no : no,
        memo: newMemo
      }
    });

    memo.done(function(data) { $('#memos').html(data.memo); });

    memo.fail(function(err) { console.log(err); });

  }

  //ヘルプ
  var help_module = function help_module() {

    var contents = [];
        contents[0] = '<ul>来店履歴の使い方<li>『＋』で新規追加</li><li>リストを直接クリックで訂正</li></ul>';
        contents[1] = '<ul>カルテ画像の使い方<li>『＋』で新規追加</li><li>リストを直接クリックで削除</li></ul>';
        contents[2] = '<ul>メモ帳の使い方<li>『＋』で新規追加</li><li>ポップアップウィンドウの&lt;br&gt;の後に追記、上書きすれば訂正</li></ul>';

    help_tooltip('.question',contents);

    function help_tooltip(selector,help_contents) {

      $(selector).on('click', toggle);

      function toggle() {

        var self = this;
        !$('#help')[0] ? on(self) : off();
      //end
      }

      function on(dom) {

        $(dom).parent().append('<div id="help">');

        $('#help').html(help_contents[$(selector).index(dom)]).css({
            overflow: 'scroll',
            position: 'absolute',
            top: $(dom).offset().top - 90,
            left: $(dom).offset().left - 300,
            padding: '.2rem',
            width: '300px',
            height: '100px',
            background: 'rgba(255,255,250,.32)',
            'box-shadow': '0 0 1px rgba(0,0,0,1)',
            opacity: 0
        }).animate({
            top: $(dom).offset().top - 110,
            left: $(dom).offset().left -300,
            opacity: 1
        });
      //end
      }

      function off() {

        $('#help').animate({
          opacity:0
        },300,function() {
          $('#help').remove();
        });
      //end
      }
    //end
    }

  //end
  }();

  var file_api_module = function file_api_module() {
    //console.log('引き渡しデータ', no);
    var reader = new FileReader();

    //来店履歴追記
    document.getElementById('add_log').addEventListener('click', add_log, false);

    //画像取り込み
    document.getElementById('file').addEventListener('change', fileChange, false);
    reader.addEventListener('load', fileLoad, false);

    function add_log() {
    	//javascripts/list.js => routes/list.js /newKarte => javascripts/modal.js form呼び出し => routes/list.js /appendKarte
    	var appendKarte = $.ajax({
    		url: '/list/appendKarte',
    		type: 'GET',
    		data: { no : no }
    	});

    	//更新情報フォーム生成
    	appendKarte.done(function(data) {
    		console.log('レスポンスデータ', data);

    		$('#modal').fadeIn();
    		$('#modalInner').append(data);

    		//キャンセル
    		document.getElementById('cancel').addEventListener('click', function(e) {
    			e.preventDefault();
    			$('#modal').fadeOut();
    			$('#modalInner').children().remove();
    		},false);

    		//追記情報格納
    		document.getElementById('save').addEventListener('click', function(e) {
    			console.log('click');
    			//e.preventDefault();
    			$('#modal').fadeOut();
    			$('#modalInner').children().remove();
    		},false);

    	});
    //end
    }

    function fileChange(ev) {

    	var target = ev.target;
    	var file = target.files[0];
    	var type = file.type;
    	var size = file.size / 1024;

    	console.log('ファイル容量',parseInt(size) + 'KB');

    	if ( type == 'image/*' && size < 100) {
    	  alert('選択できるファイルはJPEG画像だけです。');
    	  document.getElementById('file').value = '';
    	  return;
    	}

    	reader.readAsDataURL(file);
    //end
    }

    function fileLoad() {
    	//console.log(reader);

    	var appendIMG = $.ajax({
    		url: '/list/appendIMG',
    		type: 'post',
    		data: {
    			img: reader.result,
    			no: no}
    	});

    	appendIMG.done(function(data) {
    		//console.log('画像データ',data);
    		$('#kartes').html(data);
    	});
    //end
    }
  //end
  }();

});
