/* --------- modal contoroller class ----------------------------*/
//style json { width: '' , height: '', screen: '', background: '' }
var Modal = function Modal(style, button, contents) {

  //prop
  this.button = button;
  this.win = document.createElement('div');

  this.flag = true;

  this.screen = style.screen;
  this.width = style.width || window.innerWidth;
  this.height = style.height || window.innerHeight;
  this.background = style.background || `rgba(${0},${0},${0},${0.32})`;
  this.contents = contents;
  //style.screen === 'fullscreen' ? this.screen = 'fullscreen' : this.screen = '';

  //style
  this.win.style.top = 0;
  this.win.style.left = 0;
  this.win.style.width = 0;
  this.win.style.height = 0;
  this.win.style.background = this.background;
  this.win.style.color = 'gray';
  this.win.style.transition = '0.3s ease 0';

  this.button.parentNode.appendChild(this.win);

}

Modal.prototype.con = function con() {
  console.log(this);
  };

Modal.prototype.toggle = function toggle() {
  var self = this;

  this.button.addEventListener('mousedown', function(e) {self.flag ? self.open(e) : self.close(e);});
};

Modal.prototype.open = function open(e) {

  this.flag = false;

  //fullscreen or tooltip
  this.screen === 'fullscreen' ? this.top = `0px` : this.top = `${this.button.offsetTop + this.button.offsetHeight}px`;
  this.screen === 'fullscreen'  ? this.left = `0px` : this.left = `${this.button.offsetLeft}px`;

  this.win.style.top = this.top;
  this.win.style.left = this.left;
  this.win.style.width = `${this.width}px`;
  this.win.style.height = `${this.height}px`;
  this.win.style.overflow = 'scroll';

  this.win.innerHTML = this.contents;
  //this.win.innerHTML = `<h3>${this.button.innerText}</h3><input type="text" placeholder="data name">`;

  };

Modal.prototype.close = function close(e) {

  this.flag = true;
  this.win.innerHTML = '';

  this.win.style.height = this.win.style.width = 0;

  //this.button.parentNode.removeChild(this.win);

  };

var address_objects = [];

//create keypair
document.getElementById('keyPair_create').addEventListener('click', get_keypair, false);

//check info
document.getElementById('check_transaction').addEventListener('click', check_transaction, false);

function get_keypair() {

  var get_coin_address = $.ajax({
    url: '/wallet/create',
    type: 'GET'
  });

  get_coin_address.done(function(data) {

    //console.log('privateKeys: ' + data);
    QR_genarate(data);

    local_storage_address(data);

    push_address(data);

  });

}

//QRコード生成とアドレスのテキスト
function QR_genarate(data) {

  var result = document.getElementById('result');

  result.innerHTML = '';

  for(var i=0,n = data.length; i < n; i++) {

    var options = {};
        options.width = '60';
        options.height = '60';
        options.margin = `${options.width * 1}`;
        options.text = data[i].address;

    var QR = document.createElement('div');
        QR.id = options.text;
        QR.style.width = `${options.width}px`;
        QR.style.height = `${options.height}px`;
        //QR.style.float = 'left';
        QR.style.margin = `${options.margin}px`;

    var address = document.createElement('div');
        address.textContent = options.text;

    result.appendChild(QR);

    $(`#${options.text}`).qrcode(options);

    QR.appendChild(address);

    tx(data);

  }

}

function local_storage_address(json) {

  var jsons = [];

  for(var i = 0,n = json.length; i < n; i++) { jsons.push(json[i]); }

  if(i = n) jsons = JSON.stringify(jsons);

  localStorage.getItem('privateKey') === null ?
    initialize(jsons) :
    console.log(JSON.parse(localStorage.getItem('privateKey')));

}

function push_address(array) {
  for(var i=0,n=array.length;i<n;i++) {
    address_objects.push(array[i]);
  }
  if(i = n) console.log(address_objects);
}

function initialize(array) {

  //attention that comfirmation and write down key words
  var comfirmation = new Promise(function(resolve, reject) {

    prompt('必ず書き留めてください。無くなるとあなたのコインは失われます。',
    `${JSON.parse(array)[0].privateKey}\n${JSON.parse(array)[0].address}\n`);

    resolve('good');

  });

  comfirmation.then(function(value) {

    localStorage.setItem('privateKey', array);

  });

}

function tx(json) {
  for(var i = 0, n = json.length;i < n; i++) {

    var tx_window = new Modal({width: 300, height: 300}, document.getElementById(json[i].address),`Receive Address: ${json[i].address}`);
        tx_window.con();
        tx_window.toggle();

  }
}



function check_transaction() {
  console.log('check transaction!');
  var data = base58EncodedStringFromPhotoId(20000);
  console.log(data);

}


function base58EncodedStringFromPhotoId(photo_id) {
  console.log('start');
    var num = photo_id;
    var base58Characters = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    var baseCount = base58Characters.length;
    var encodedStr = "";

    console.log(`乗余：${num % baseCount}　除算:${num / baseCount}`);

    while(num>0)
    {
        var mod  = num % baseCount;
        console.log(mod);
        encodedStr  = base58Characters.charAt(mod) + encodedStr;
        console.log(encodedStr);
        var div     = num / baseCount;
        num         = Math.floor(div);
    }

    return encodedStr;

}





//console.log(JSON.parse(document.getElementById('test').value));
