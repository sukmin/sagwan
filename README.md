# sagwan
sagwan(사관)은 jQuery 플러그인입니다.

## 기능
브라우저 localStorage를 이용하여 저장하고 검색 히스토리를 구성해줍니다.

## 지원브라우저
| IE | 크롬 | 사파리 |
| -- | -- | -- |
| IE9이상 | 지원 | 지원 |

## 예제
https://sukmin.github.io/sagwan/

##초기화
```javascript
$("#input_sample_05_keyword").sagwan({
		"onEquals": function (obj1, obj2) {
            if (obj1.select !== obj2.select) {
                return false;
            }
            if (obj1.value !== obj2.value) {
                return false;
            }
            return true;
        },
        "onDrawItemText": function (obj) {
            return "<strong>" + obj.select + "</strong> ::" + obj.value;
        }
});
```

### 옵션
| 이름 | 타입 | 설명 | 기본값 |
| -- | -- | -- |
| version | 정수 | 히스토리 버전. sagwan은 오브젝트로 저장하는데, 저장하는 오브젝트의 구조가 변경되면 불러오기나 그리기시 오류가 발생할 수 있습니다. 오브젝트 구조가 변한다면 버전을 높혀주어야 합니다. | 1 |
| saveItemCount | 정수 | 히스토리를 구성할 갯수 | 10 |
| onEquals | 함수 | 오브젝트가 일치하는지 판단하는 함수. 파라미터로 오브젝트2개를 받고 true, false를 리턴해야 합니다. | function (obj1, obj2) {
            for (prop in obj1) {
                if (prop !== "sagwanDate" && obj1[prop] !== obj2[prop]) {
                    return false;
                }
            }
            for (prop in obj2) {
                if (prop !== "sagwanDate" && obj2[prop] !== obj1[prop]) {
                    return false;
                }
            }
            return true;
        } |
| onDateToString | 함수 | 검색히스토리에 시간을 보여줄때 시간 포맷. 파라미터로 date객체를 받고 문자열을 리턴합니다. | function (d) {

            if (typeof d === "string") {
                d = new Date(d);
            }

            var year = d.getFullYear().toString();
            var month = (d.getMonth() + 1).toString();
            var date = d.getDate().toString();
            var hour = d.getHours().toString();
            if (hour.length == 1) {
                hour = "0" + hour;
            }
            var minute = d.getMinutes().toString();
            if (minute.length == 1) {
                minute = "0" + minute;
            }
            var second = d.getSeconds().toString();
            if (second.length == 1) {
                second = "0" + second;
            }
            return year + "." + month + "." + date + ". " + hour + ":" + minute + ":" + second;
        } |
| onDrawItemText | 함수 | 검색히스토리를 사용자에게 보여줄때 아이템 하나하나를 어떻게 보여줄지 구성합니다. 파라미터로 오브젝트를 받고 문자열을 리턴합니다. | function (obj) {
            var text = "";
            for (prop in obj) {
                if (prop !== "sagwanDate") {
                    text = text + prop + ":" + obj[prop] + " ";
                }
            }
            return text;
        } |

## 메소드
### sagwanSave 메소드
오브젝트를 저장할때 외부에서 실행시켜주어야 하는 메소드입니다.
```javascript
$("#input_sample_05_keyword").sagwanSave({
		select : select,
		value : value
	});
```

## 이벤트
### sagwan:clickItem 이벤트
검색 히스토리 아이템 하나 클릭시 동작하는 이벤트.

두번째 파라미터로 오브젝트가 넘어온다.
```javascript
$("#input_sample_05_keyword").on("sagwan:clickItem",function (e,obj){

	$('#select_sample_05').val(obj.select).prop("selected", true);
	$("#input_sample_05_keyword").val(obj.value);

});
```

### sagwan:clickItemAfter 이벤트
검색 히스토리 아이템 하나 클릭 후 동작하는 이벤트.

두번째 파라미터로 오브젝트가 넘어온다.

sagwan:clickItem와의 차이점은 클릭이 발생하면 sagwan:clickItem 이벤트를 실행하고 해당 오브젝트를 다시 save합니다. 그리고 검색 히스토리 영역을 hide합니다. hide 이후 발생하는 이벤트입니다.
```javascript
$("#input_sample_05_keyword").on("sagwan:clickItemAfter",function (e,obj){

	alert("clickItemAfter Event select : " + obj.select + ", value : " + obj.value);

});
```