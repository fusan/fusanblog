/* --- ローカルスロレージにクーポンを保存する仕組み。----- */

//サーバーに発行履歴を保存　何かのIDになるものとe.timeStampで管理する。
//発行日から30日は再発行できない
//アクセスした日から3日を期限とする。
//ローカルストレージで期限の確認をする。
//保存はスクショするか、パソコンで表示してスマホでスキャンする。

//Coupon Class
var Coupon = function Coupon( stage, options) {

  this.stage = stage;
  this.result = document.createElement('div');
  this.button = document.createElement('button');
  this.button.textContent = '発行';
  this.qr = document.createElement('div');
  this.comment = document.createElement('div');
  this.explain = document.createElement('div');

  this.stage.appendChild(this.explain);
  this.stage.appendChild(this.result);
  this.result.appendChild(this.button);
  this.result.appendChild(this.qr);
  this.result.appendChild(this.comment);

  this.explain.innerHTML = options.html;

  this.padding = 50;
  this.width = options.width;
  this.height = options.height;
  this.background = options.background;

  this.result.style.width = `${this.width}px`;
  this.button.style.width = `${this.width}px`;
  this.qr.style.width = `${this.width - this.padding}px`;
  this.comment.style.width = `${this.width}px`;

  if(this.background === undefined ) {
    this.result.style.background = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
  } else {
    this.result.style.background = `url( ${this.background} )`;
  }
  this.result.style.boxShadow = '0 0 1px gray';
  this.result.style.padding = `0`;
  this.qr.style.margin = `${this.padding}px auto`;
  this.comment.style.margin = `0 auto`;

};

Coupon.prototype.register = function register() {
  console.log(this);

  var self = this;

  //クーポン発行
  self.button.addEventListener('click', connection, false);

  //リミットチェック
  function connection(e) {

    if(check()) {

      var coupon_no = create_no(e);

      /*//サーバー送信
      var send = $.get(`/coupon/register`,{ coupon: coupon_no } );
      send.done(function(data) { visualize(data); });
      */

      //localStorage保存
      visualize({ coupon: coupon_no });

      storage(coupon_no);

    } else {

      if(self.qr.children.length < 1 ) call();

    }

  };

  //No生成
  function create_no(e) { return `${e.timeStamp}`; }

  //発行チェック
  function check() {

    var now = new Date().getTime();

    //再発行期限　発行日からひと月は発行されない。
    var limit = new Date(localStorage.getItem('coupon') * 1 + 30 * 24 * 60 * 60 * 1000);

    return localStorage.getItem('coupon') === null || now > limit ? true : false;

  }

  //localStorage
  function storage(data) { localStorage.setItem('coupon',data); }

  //QRコード生成
  function visualize(data) {

      //使用期限　3日
      var limit = new Date(data.coupon * 1 + 3 * 24 * 60 * 60 * 1000);

      self.qr.innerHTML = '';
      self.comment.innerHTML = '';

      $(self.qr).qrcode({width: self.width - self.padding, height: self.height - self.padding,text: data.coupon});
      self.comment.innerHTML = `<div id="comment">${limit.getMonth() + 1}月${limit.getDate()}日まで有効
                                <span>来店の際に提示してください</span></div>`;

  }

  //クーポン呼び出し
  self.qr.addEventListener('mousedown', save, false);

  function save() {

    console.log(this.children[0].nodeType);
    //if(this.children[0]) {

      var img = this.children[0].toDataURL();

      localStorage.setItem('img',img);

      alert('クーポン保存しました。');

    //}

  }

  function call() {

    //再発行しない。
    var limit = new Date(localStorage.getItem('coupon') * 1 + 30 * 24 * 60 * 60 * 1000);
    var img = document.createElement('img');
        img.src = localStorage.getItem('img');

    self.qr.appendChild(img);
    self.button.innerHTML = '発行済みです';
    self.comment.innerHTML = `<div id="comment">${new Date(limit).getMonth() + 1}月 ${new Date(limit).getDate()}日までお待ち下さい。</div>`;

  }

};

//instance
//if you acecees by smart phone then you use document.body.offsetWidth
var options = {
  width: 256,
  height: 256,
  background:'../images/IMG_0449.jpg',
  html: `<div id="guide">
        <ul>
          <li>発行ボタンを押してください</li>
          <li>QRコードをクリックして保存する</li>
          <li>発行ボタンでクーポンコードを確認できます</li>
          <li>有効期限は3日、次の発行はひと月後</li>
        </ul>
      </div>`
}

var first = new Coupon( document.body, options);
      first.register();

//generate free QR code.
var input = document.createElement('input');
    input.setAttribute('type', 'text');

var qr = document.createElement('div');

document.body.appendChild(input);
document.body.appendChild(qr);

    input.addEventListener('keyup', function() {
      $(qr).qrcode({width: 200, height: 200,text: this.value});
    }, false);
