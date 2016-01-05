//会員登録画面
exports.register = (title,customer,nextNo) => {

	var html = `<h3>${title}</h3>
	    <div id="registerWindowInnerForm">
	    <span class="label">会員番号</span><span><input type="number" value="${nextNo}" name="no" placeholder="101" required></span><br>
	    <span class="label">氏名</span><input type="text" name="name" value="" placeholder="山田　隆之" required><span class="caution"></span><br>
	    <span class="label">よみがな</span><input type="text" name="ruby" value="" placeholder="やまだ　たかゆき" required><span class="caution"></span><br>
	    <span class="label">性別</span><input type="radio" name="sex" value="女性">女性<input type="radio" name="sex" value="男性">男性<br>
	    <span class="label">郵便番号</span><input type="text" name="postcode" value="" placeholder="100-0000" size="10" maxlength="8" ><br>
	  	<span class="label">住所</span><input type="text" name="address" value="" placeholder="東京都" size="60"><br>
	    <span class="label">生年月日</span><input type="text" name="birthday" value="" placeholder="2015.1.1"　value="2012.02.16"><button id="AD">元号変換</button><br>
	    <span class="label">メール</span><input type="mail" name="eMail" value="" placeholder="test@gmail.com"><br>
	    <span class="label">電話</span><input type="tel" name="tel" value="" placeholder="090-3456-1234"><span class="caution"></span><br>
	    <span id="signUpCheck">&not;</span><span id="cancel">&times;</span>
	    </div>`;

    return html;
};

//会員情報確認フォーム
exports.signUpCheck = (customer) => {

	var html = `<h3>${customer.title}</h3>
			<div id="registerWindowInnerForm">
			<span class="label">会員番号</span><span><input type="number" value="${parseInt(customer.no)}" name="no" placeholder="101" required></span><br>
			<span class="label">氏名</span><span><input type="text" name="name" value="${customer.name}" placeholder="山田　隆之" required></span><span class="caution"></span><br>
			<span class="label">よみがな</span><input type="text" name="ruby" value="${customer.ruby}" placeholder="やまだ　たかゆき" required><span class="caution"></span><br>
			<span class="label">性別</span><input type="radio" name="sex" value="${customer.sex}" checked="checked">${customer.sex}<br>
			<span class="label">郵便番号</span><input type="text" name="postcode" value="${customer.postcode}" placeholder="100-0000" size="10" maxlength="8"><br>
			<span class="label">住所</span><input type="text" name="address" value="${customer.address}" placeholder="東京都" size="60"><br>
			<span class="label">生年月日</span><input type="text" name="birthday" value="${customer.birthday}" placeholder="2015.1.1"　value="2012.02.16"><br>
			<span class="label">メール</span><input type="mail" name="eMail" value="${customer.eMail}" placeholder="test@gmail.com"><br>
			<span class="label">電話</span><input type="tel" name="tel" value="${customer.tel}" placeholder="090-3456-1234"><span class="caution"></span><br>
			<span id="create">></span><span id="cancel">&times;</span></div>`;

    return html;

};

//来店履歴入力フォーム
exports.customer_log = (req) => {
	//console.log(req.query);
	var today = new Date(),
			month = today.getMonth() + 1,
			date = today.getDate(),
			day = parseInt(today.getDay());

	var dayArray = ['日','月','火','水','木','金','土'];

	var html = `<h3>来店履歴入力</h3>
		<form action="/list/updateLog" method="get" name="karte">
		<span><input type="hidden" name="no" value="${req.query.no}"></span><br>
		<span>コース:</span><input type="text" name="menu" placeholder="B"><br>
		<span>時間:</span><input type="number" name="time" placeholder="60"><br>
		<span>担当:</span><input type="text" name="staff" placeholder="藤井"><br>
		<span>指名:</span><input type="radio" name="nominee"><br>
		<span>日付:</span><span>${month}月${date}日(${dayArray[day]})</span><br>
		<input type="submit" name="save" id="save" value="&not;">
		<input type="reset" name="cancel" id="cancel" value="&times;">
		</form>`;

		//<input type="submit" name="update" id="update" value="更新"> ２行目追記

	return html;

};

//来店履歴修正フォーム
exports.lastmodify = (req) => {
	//console.log(req.query);
	var today = new Date(),
			month = today.getMonth() + 1,
			date = today.getDate(),
			day = parseInt(today.getDay());

	var dayArray = ['日','月','火','水','木','金','土'];

	var html = `<h3>履歴訂正</h3>
		<form action="/list/modifyLog" method="get" name="karte">
		<span><input type="hidden" name="no" value="${req.query.no}"></span><br>
		<span>コース:</span><input type="text" name="menu" placeholder="B"><br>
		<span>時間:</span><input type="number" name="time" placeholder="60"><br>
		<span>担当:</span><input type="text" name="staff" placeholder="≧(・─・)≦"><br>
		<span>指名:</span><input type="radio" name="nominee" value="on"><br>
		<span><input type="hidden" name="id" value="${req.query.count}"></span><br>
		<input type="submit" name="update" id="update" value="&not;">
		<input type="reset" name="cancel" id="cancel" value="&times;">
		</form>
		<form action="/list/removeLog" method="get" name="removeLog">
		<span><input type="hidden" name="no" value="${req.query.no}"></span><br>
		<span><input type="hidden" name="id" value="${req.query.count}"></span><br>
		<input type="submit" name="removeLog" id="removeLog" value="remove">
		</form>`;
		//フォームをポストする ー＞ moongooseで訂正 ー＞ card.ejsにdataを渡す

	return html;

};

exports.removeImg = (req) => {
	//console.log(req.query);
	var html = `<h3>カルテ削除確認</h3>
		<form action="/list/removeImg" method="get" name="karte">
		<span><input type="hidden" name="no" value="${req.query.no}"></span><br>
		<span><input type="text" name="id" value="${req.query.id}"></span><br>
		<input type="submit" name="remove" id="remove" value="&not;">
		<input type="reset" name="cancel" id="cancel" value="&times;">
		</form>`;

	return html;

};

//データ解析フォーム　
exports.analytics = function (req) {
	var html = `
		<span id="rankingIcon"></span>
		<ul id="analyticsTab">
		<li id="visitLanking">来店数</li>
		<li id="nomineeCount">指名数</li>
		<li id="local">地域別</li>
		<li id="generation">年齢層</li>
		<li id="relation">関係性</li></ul>
		<input type="range" id="magnification" name="magnification" step="1" min="1" max="30" value="15">
		<input type="range" id="magnificationGeneration" name="magnificationGeneration" step="1" min="1" max="30" value="15">
		<div id="visual"></div>
		<span id="cancel">&times;</span>
		<div id="analyticsExplain"></div>`;

	return html;

};
