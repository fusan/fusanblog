/* --------------------- manage page --------------------------- */

console.log(window.screen.width);

/* help window */
window.addEventListener('mousemove',open_modal, false);
function open_modal(e) {
  var flag = false;
  var modal_width = this.screen.width,
      modal_height = this.screen.height;;

  if(e.pageX > modal_width - 10 ) {
    console.log('sidebar');
    flag = true;
    modal_style(flag,document.getElementById('modal'),modal_width,modal_height);
  } else if(e.pageX < modal_width * 0.79 ){
    flag = false;
    modal_style(flag,document.getElementById('modal'),modal_width,modal_height);
  }
}

function modal_style(flag, dom,mw, mh) {
  //defalut
  dom.style.width = 0;
  dom.style.height = `${mh}px`;

  if(flag) {
    dom.style.height = `${mh}px`;
    dom.style.width = `${mw * 0.2}px`;
    dom.style.right = 0;
    dom.style.top = `${mh * 0.5}px;`
    dom.style.transition = '0.5s ease 0';
    dom.style.boxShadow = '1px 0 2px black';
  } else {
    dom.style.width = 0;
    dom.style.height = `${mh}px`;
  }

}

var reserved_check = document.getElementById('reserved_check'), //予約確認
    registration = document.getElementById('registration'); //在庫登録

    //default opening page
    window.addEventListener('load', registration_block, false);

    reserved_check.addEventListener('click', check_reserve, false);
    registration.addEventListener('click', registration_block, false);

//予約確認
function check_reserve() {

  document.getElementById('viewArea').innerHTML = '';
  calendar_module(document.getElementById('viewArea'),'予約確認',this);

}

//在庫登録
function registration_block() {
  //socketで顧客画面とリアルタイムで同期する broadcast
  document.getElementById('viewArea').innerHTML = '';
  calendar_module(document.getElementById('viewArea'),'在庫管理',this);

}

var calendar_module = function calendar_module(stage, title, page) {
  var this_month = [], next_month = [], prev_month = [], months = [];
  var days = ['日','月','火','水','木','金','土'],
      today = new Date(),
      day;
  var ids = [];

  console.log(`読み込みページ${page}`);

  //タイトル
  var main_title = document.createElement('h2');
      main_title.textContent = title;

      stage.appendChild(main_title);

  //adjust first day in this Month 月初の日付からカレンダーを生成。
  if(today.getDate() !== 0) {
    day = today.getTime() - today.getDate() * 1000 * 60 * 60 * 24;
    day = new Date(day);
  }  else {
    day = today.getTime();
    day = new Date(day);
  }

  //データ加工とカレンダー生成　controller
  (function set_caladar_data() {

    day = day.getTime();
    day += 1000 * 60 * 60 *24;
    day = new Date(day);

    new Promise(function(resolve,reject) {
      //to Array カレンダーデータ整形
      if(day.getMonth() === today.getMonth()) {

        this_month.push(day);
        set_caladar_data();

      } else if(day.getMonth() === 0 || today.getMonth() + 1 === day.getMonth()){

        next_month.push(day);
        set_caladar_data();

      } else {

        resolve('ok');
      }

    }).then(function(v) {
      //to view function　ビジュアライズ
      months.push(days.concat(this_month),days.concat(next_month));
      if(page.id !== 'reserved_check') create_calendar(40,1);

      console.log(months);

    }).catch(function(reject) {
      console.log(reject);
    });

  }());

  //カレンダービジュアル化　---------   visualize calendar
  function create_calendar(blockSize, blockMargin) {

    for(var j=0,m=months.length;j<m;j++) {

      var calendar = document.createElement('section');
      var calendar_title = document.createElement('div');

          calendar.style.width = `${(blockSize + blockMargin) * 8}px`;//border 1px body 30px
          calendar.style.height = `${(blockSize + blockMargin) * 6}px`;
          calendar.style.padding = 0;
          calendar.style.margin = `20px 0 0 0`;
          calendar.style.float = 'left';

          stage.appendChild(calendar);
          calendar.appendChild(calendar_title);

          //check exist calendar dom カレンダーオブジェクトの存在判定
          calendar.setAttribute('class','calendar');

      for(var i=0,n=months[j].length;i<n;i++) {

        var block = document.createElement('div'),
            block_head = document.createElement('div');

            block.appendChild(block_head);

            block.style.width = block.style.height = `${blockSize}px`;
            block.style.margin = `${blockMargin}px`;
            block.style.padding = 0;
            block.style.float = 'left';

            block_head.style.width = `${blockSize}px`;
            block_head.style.height = block_head.style.lineHeight = `${blockSize * 0.4}px`;
            block_head.style.textAlign = 'center';

        //ヘッダー行　月、火、水....
        if(typeof months[j][i] === 'string') {

          block.textContent = months[j][i];
          block.classList.add('calendar_header');

        //日付行
        } else {

          /* -------- style -------------- */
          //月タイトル
          if(i === n - 1) calendar_title.textContent = `${months[j][i].getMonth() + 1}月`;

          //月初の左マージン
          if(i === 7) block.style.marginLeft = `${(blockSize + blockMargin * 2) * months[j][i].getDay()}px`;

          block.textContent = months[j][i].getDate(); //曜日　days[months[j][i].getDay()] +
          block.setAttribute('id', `${months[j][i].getFullYear()}_${months[j][i].getMonth() + 1}_${months[j][i].getDate()}`);

          //日曜日のスタイル //他の曜日のスタイル
          months[j][i].getDay() === 0 ? block.classList.add('sun') : block.classList.add('other');

          //本日のスタイル
          var today_check = new Date(months[j][i]).getMonth().toString() + new Date(months[j][i]).getDate().toString() === today.getMonth().toString() + today.getDate().toString();
          if(today_check) block.style.background = 'rgba(11, 175, 245, 0.71)'

          //空き枠表示を追加
          var stock = document.createElement('span');
              stock.classList.add('stock_c');

              stock.style.width = `${blockSize}px`;
              stock.style.height = stock.style.lineHeight = `${blockSize * 0.6 }px`;

              block.appendChild(stock);

          /* --------- data ---------------- */

          //for server push data
          var id = `${months[j][i].getFullYear()}_${months[j][i].getMonth() + 1}_${months[j][i].getDate()}`;
          ids.push(id);

          //idsをサーバーに一括送信してデータベースに格納する。
          if(j === m -1 && i === n - 1) { get_reserve_data(ids); }

          //get info 日付と予約のIDを紐付けるツール。
          get_info(block);

        }

        calendar.appendChild(block);

      }
    }
  }

  //初期データを取得　-------- get server data
  function get_reserve_data(id_array) {
    //console.log(id_array);
    var get_reserve_data = $.ajax({
      url:'/reserveSystem2/admin/get_reserve',
      type: 'GET',
      data: { reserve_id: id_array }
    });

    get_reserve_data.done(function(data) {
      //枠数反映
      realtime_block_count(data);
    });
  }

  //予約枠数　表示
  function realtime_block_count(d) {
    console.log(d);
    for(var i=0,n=d.length;i<n;i++) {
      var bn = document.getElementById(d[i].reserve_id).children[0];
      d[i].reserve_nums === undefined ? bn.innerHTML = '' : bn.innerHTML = d[i].reserve_nums;
    }
  }

  //日付ブロックからデータを取得　----- get day clock infomation
  function get_info(dom) {
    dom.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();

      tooltip(this);

    }, false);
  }

  //予約枠登録画面　------ open change window
  function tooltip(dom) {
    console.log(dom.id);

    //空き枠表示立ち上げない
    if(page.id === 'empty_check') return;

    if(!document.getElementById('info_window')) {
      var html = `<div style="text-align:center;background:rgb(110, 158, 21);color:white;">${dom.innerText}日の登録</div>
                  <div>予約ID：<input id="reserve_id" type="text" value="${dom.id}" size="10" disabled></div>
                  <div>枠数：<input id="reserve_nums" type="text" value="1" size="10"></div>
                  <div><input type="button" value="登録" id="insert_DB"></div>
                  <div>開発メモ：idと予約情報を紐つけ</div>`;

      var info_window = document.createElement('div');
          info_window.setAttribute('id', 'info_window');

          dom.parentNode.appendChild(info_window);

          //style
          dom.style.position = 'relative';
          info_window.style.position = 'absolute';
          info_window.style.zInedx = '100';
          info_window.style.top =` ${dom.parentNode.offsetHeight}px`;
          info_window.style.left = `${dom.parentNode.offsetWidth}px`;
          info_window.style.width = info_window.style.height = '200px';
          info_window.style.background = 'white';
          info_window.style.color = 'gray';
          info_window.style.boxShadow = '0 0 1px black';

          info_window.innerHTML = html;

          //stopPropagation　バブリングブロック
          info_window.addEventListener('mousedown', function(e) {　e.stopPropagation();　}, false);

          //insert db データベースに送信
          update_DB(document.getElementById('insert_DB'), document.getElementById('reserve_nums'), document.getElementById('reserve_id'));

    } else {

      document.getElementById('info_window').parentNode.removeChild(document.getElementById('info_window'));

    }

  }

  //予約枠数データ更新　------- push server
  function update_DB(button,nums,id) {

    nums.addEventListener('keyup', function() {
      console.log(this.value);
    }, false);

    button.addEventListener('mousedown', push_reserve, false);

    function push_reserve() {

      console.log(nums.value,id.value);

      var push_reserve_data = $.ajax({
        url: '/reserveSystem2/admin/push_reserve',
        type: 'GET',
        data: {
          reserve_nums: nums.value,
          reserve_id: id.value
        }
      });

      push_reserve_data.done(function(data) {
        console.log(data);
        //枠数反映
        realtime_block_count(data);

      });

      document.getElementById('info_window').parentNode.removeChild(document.getElementById('info_window'));

    }

  }

  //calendar UI
  function calendar_ui() {

  }
//end
};
