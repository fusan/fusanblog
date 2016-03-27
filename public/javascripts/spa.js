//Router class
var Router = function Router(buttons,stage) {
  this.stage = stage; //document.body
  this.buttons = buttons; //array
};

Router.prototype.con = function con() {
  console.log(this);
};

Router.prototype.routing = function routing() {

  var pages = [];
  var self = this.stage;
  var page = document.createElement('div');
      page.id = 'result';

  for(var i=0,n=this.buttons.length;i<n;i++) { linked(this.buttons[i]); }

  if(i === n) self.appendChild(page); //leake outside block scope

  function linked(_id) {

      var button = document.createElement('button');
          button.textContent = _id;
          button.id = _id;

      self.appendChild(button);

      button.addEventListener('click', function() { send(_id); }, false);

  }

  function send(_id) {

    var spa = $.get(`/spa/${_id}`);

    spa.done(function(data) { page.innerHTML = data; });

  }
//end
};

//instance
var test = new Router(['first','second','third','forth'],document.body);
    test.con();
    test.routing();

document.getElementById('login').addEventListener('click', login, false);

function login() {

  var login = $.get(`/spa/${document.getElementById('no').value}`);

  login.done(function(data) { document.getElementById('result').innerHTML = data; });

}
