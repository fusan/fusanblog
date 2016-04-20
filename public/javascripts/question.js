'use strict';

//geth を　proceesで4日だし
//ethコマンドをprocessで返す
//標準出力と標準入力を使ってターミナルコンソールとやりとりする。l

//question constructor
function Question(questions) {

  this.q1 = questions[0]; //agree
  this.q2 = questions[1]; //disagree
  this.text = questions[2]; //text

  var page = document.createElement('div');
      page.classList.add('unit');

  var text = document.createElement('div');
      text.textContent = this.text;
      text.classList.add('text');

  var agree = document.createElement('div');
      agree.textContent = this.q1;
      agree.classList.add('agree');
  var disagree = document.createElement('div');
      disagree.textContent = this.q2;
      disagree.classList.add('disagree');

  var prev = document.createElement('div');
      prev.textContent = '';
      prev.classList.add('prev');
  var next = document.createElement('div');
      next.textContent = '';
      next.classList.add('next');

  page.appendChild(prev);
  page.appendChild(text);
  page.appendChild(agree);
  page.appendChild(disagree);
  page.appendChild(next);

  agree.addEventListener('click', server_push({data: 'test'}), false);
  agree.addEventListener('click', function () { style_action(this); } , false);

  return page;

}

Question.prototype.console = function () {
  console.log(this);
}

//question unit
function Question_unit(parent, qas) {

  for(var i = 0,n = qas.length; i < n; i++) {

    var page = new Question(qas[i]);

    parent.appendChild(page);

  }

}

new Question_unit(document.getElementById('questions'), [['yes', 'no','好きですか？'], ['good', 'bad','よかったですか？']]);

//action contollor
function style_action(self) {

  self.parentNode.style.marginTop = '-200px';
  self.parentNode.style.transition = '1s ease 0';

}


//stop double vote
function stop_double_vote(json) {

  if(loacalStorage.getItem('vote') !== null) alert('投稿済みです。Done vote!');

  server_push(json);

  localcache(json);

}

function server_push(json) {

  var result = $.ajax({
    url: '/question/vote',
    type: 'GET',
    data: json
  });

  result.done(function(data) {
    console.log(data);
  });

}

function localcache(json) {

  loacalStorage.setItem('vote', json);

}
