var gid = document.getElementById("gid").value;
var nocache = new Date().getTime();

var year = 2018;
var month = 4;
var date = 6;

var response;
$.ajax({ type: "POST",   
         url: "https://berkeley.libcal.com/process_roombookings.php?m=calscroll&gid="+gid+"&date="+year + "-" + month + "-" + date, 
data:{
},
         success : function(text)
         {
             response = text
         }
});

// -------------------------------------------------------------------------------------------------------------------------------------------
function isBookingButton(dom){
	return dom.title != null;
}

function getData(dom){
	if(dom.title != null){
		var cleanedTitle = dom.title;
		var data = cleanedTitle.split(" ");
		var returnedData = {};
		returnedData.id = dom.id;

		for(var i = 0; i < data.length; i++){
			if(data[i] == "to"){
				returnedData.start = data[i - 1];
				returnedData.room = "";
				for(var j = 0; j < i - 1; j++){
					returnedData.room += data[j] + " ";
				}
				returnedData.room = returnedData.room.substring(0, returnedData.room.length - 2);
				break;
			}
		}
		return returnedData;
	}
}

function submit(id1, id2){
	if(id2 != null){
		document.getElementById("sid").value = id1 + "|" + id2;
	}else{
		document.getElementById("sid").value = id1;
	}
	document.getElementById("roombookingform").submit();
}

var responseDOM = document.createElement('div');
responseDOM.innerHTML = response;

var availableRooms = {};

var buttons = responseDOM.getElementsByTagName('a');
for(var i = 0; i < buttons.length; i++){
	if(isBookingButton(buttons[i])){
		var data = getData(buttons[i]);
		var room = data.room;
		var start = data.start;
		var id = data.id;

		if(availableRooms[room] == null){
			availableRooms[room] = {};
		}
		availableRooms[room][start] = id;
   	}
}

function convert12To24(t){
	var time = Number(t.split(":")[0]);
	if(t.includes("pm") && time != 12){
		time += 12;
	}
	return time;
}

function convert24To12(t){
	t = t%24;
	if(t > 12){
		return t%12 + ":00pm";
	}

	if(t == 12){
		return t + ":00pm";
	}

	if(t == 0){
		t = 12;
	}
	return t + ":00am";
}


var wantedRooms = [];

wantedRooms.push({room:"Hemlock, Room 503", start:"11:00am", extra:1})

for(var i = 0; i < wantedRooms.length; i++){
	if(wantedRooms[i].room != null){
		var room = wantedRooms[i].room;
		var start = wantedRooms[i].start;
		var extra = wantedRooms[i].extra;

		if(availableRooms[room] != null){
			if(availableRooms[room][start] != null){
				var startId = availableRooms[room][start];
				if(extra > 0){
					if(availableRooms[room][convert24To12(convert12To24(start) + 1)] != null){
						submit(startId, availableRooms[room][convert24To12(convert12To24(start) + 1)]);
						break;
					}
				}else{
					submit(startId, null);
					break;
				}
			}
		}
	}
}

