// Start
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

var daysAdvancedDict = {
	"/booking/EART": 8,
	"/booking/envi": 22,
	"/booking/recordingroom": 22,
	"/booking/gardner": 8,
	"/booking/igs": 113,
	"/booking/engi": 8,
	"/booking/moffitt-4": 1,
	"/booking/moffitt-5": 8,
	"/booking/moffitt-pcs": 8
}

var daysAdvanced = daysAdvancedDict[document.location.pathname];

function displayGrid(date){
	var calendarButtons = document.getElementById("s-lc-rm-cal").getElementsByTagName("td");
	for(var i in calendarButtons){
		if(!isNaN(i)){
			if(calendarButtons[i].hasAttribute("data-handler")){
				calendarButtons[i].setAttribute("data-month", date.getMonth());
				calendarButtons[i].setAttribute("data-year", date.getFullYear());
				calendarButtons[i].getElementsByTagName('a')[0].innerHTML = date.getDate();
				calendarButtons[i].click();
				break;
			}
		}
	}
}

var selected = [];

function displayDummyGrid(date){
	var table = document.getElementById("s-lc-rm-tg-scroll");
	var body = table.getElementsByTagName("tbody")[0];
	var rows = body.getElementsByTagName("tr");
	var rowLength = rows.length - 1;

	while(rows.length > 1){
		rows[1].parentNode.removeChild(rows[1]);
	}

	for(var rowNum = 0; rowNum < rowLength; rowNum ++){
		var newRow = document.createElement("tr");
		newRow.className = "s-lc-rm-cap-l-5";

		var newCellContainer = document.createElement("td");
		newRow.append(newCellContainer);

		for(var i = 0; i < 24; i ++){
			var newCell = document.createElement("div");
			newCell.className = "lc_rm_b";
			newCell.style = "width: 60px; float: left;";
			newCell.row = rowNum;
			newCell.col = i;
			newCell.selected = false;
			newCell.onclick = function(cell){
				return function(){
					if(cell.selected){
						cell.style.backgroundColor = '';
						cell.selected = false;
						selected.splice(selected.indexOf(cell), 1 );
					}else{
						cell.style.backgroundColor = '#14B6E6';
						cell.selected = true;
						selected.push(cell);
					}
				}
			}(newCell);

			newCellContainer.append(newCell);
		}

		body.append(newRow);
	}

	document.getElementById("s-lc-rm-tg-h").innerHTML = 
	days[date.getDay()] + ", " 
	+ months[date.getMonth()] + " " 
	+ date.getDate() + ", " 
	+ date.getFullYear();

	var message = document.getElementsByClassName("label label-rm-avail")[0];
	message.innerHTML = "Prebooked - To prebook, click on any available slot. Times not guaranteed bookable.";
	message.style.backgroundColor = "#12A2CC";
}

function waitForGrid(ms, func){
	if(ms < 0){
		return;
	}
	if(document.getElementById("s-lc-rm-tg-cont") != null){
		func();
	}else{
		setTimeout(function(){
		    waitForGrid(ms - 5, func);
		}, 5);
	}
}

function book(rooms){
	var rows = document.getElementById("s-lc-rm-scrolltb").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	var rowNum = 0;

	for(var rowIndex in rows){
		if(!isNaN(rowIndex)){
			var row = rows[rowIndex];
			if(!row.hasAttribute("class")){
				continue;
			}
			var columns = row.getElementsByTagName("td")[0].getElementsByTagName("*");
			var colNum = 0;
			for(var colIndex in columns){
				if(!isNaN(colIndex)){
					if(columns[colIndex].style != null && "width" in columns[colIndex].style && (columns[colIndex].style["width"] != "50px" && columns[colIndex].style["width"] != "60px" && columns[colIndex].style["width"] != "59px")){
						continue;
					}

					for(var i in rooms){
						if(rooms[i].row == rowNum && rooms[i].col == colNum){
							columns[colIndex].click();
						}
					}

					colNum += 1;
				}
			}
			rowNum += 1;
		}
	}

	while(rooms.length > 0){
		rooms.pop();
	}

}

function clearBookings(){
	var buttons = document.getElementById("s-lc-rm-datetime").getElementsByTagName("a");
	var limit = 0;
	while(buttons.length > 0 && limit < 100){
		buttons[0].click();
		limit += 1;
	}
}

document.getElementById('s-lc-rm-left').innerHTML += `
	<div id="calendarContainer">
		<div id="calendarNavigation"></div>
		<div id="dateContainer">
			<table id="calendar">
				<tr id="dayLabel">
					<th>Su</th>
					<th>Mo</th>
					<th>Tu</th>
					<th>We</th>
					<th>Th</th>
					<th>Fr</th>
					<th>Sa</th>
				</tr>
			</table>
		</div>
	</div>
`;

var now = new Date();

var activeYear = now.getFullYear();
var activeMonth = now.getMonth();

var prevMonth = document.createElement("button");
prevMonth.innerHTML = "<";
prevMonth.className = "navigationButton";
prevMonth.id = "previousMonth";
prevMonth.onclick = function(){
	activeMonth--;
	if(activeMonth < 0){
		activeYear --;
		activeMonth = 11;
	}
	updateCalendar(activeYear, activeMonth);
}

var nextMonth = document.createElement("button");
nextMonth.innerHTML = ">";
nextMonth.className = "navigationButton";
nextMonth.id = "nextMonth";
nextMonth.onclick = function(){
	activeMonth++;
	updateCalendar(activeYear, activeMonth);
}

var title = document.createElement("div");
title.id = "calendarTitle";

document.getElementById("calendarNavigation").append(prevMonth);
document.getElementById("calendarNavigation").append(title);
document.getElementById("calendarNavigation").append(nextMonth);

var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
var prebookDay = new Date(today.getTime());
prebookDay.setDate(prebookDay.getDate() + daysAdvanced);

var calendar = document.getElementById('calendar');

function updateCalendar(year, month){
	var existingRows = calendar.getElementsByClassName("calendarRow");
	while(existingRows.length > 0){
		calendar.removeChild(existingRows[0]);
	}

	var start = new Date(year, month, 1);
	var end = new Date(year, month + 1, 0);

	var current = new Date(start.getTime());

	var rowToAdd = document.createElement("tr");
	rowToAdd.className = "calendarRow";

	for(var i = 0; i < start.getDay(); i++){
		rowToAdd.append(document.createElement("td"));
	}

	while(current <= end){
		var cell = document.createElement("td");
		cell.innerHTML = current.getDate();

		if(current >= today && current <= prebookDay){
			cell.className = "clickable";
			if (current.getTime() == prebookDay.getTime()){
				cell.id = "prebookDate";
				cell.onclick = function(){
					clearBookings();
					var bookingDate = new Date();
					bookingDate.setDate(bookingDate.getDate() + daysAdvanced);
					displayDummyGrid(bookingDate);
				}
			}else{
				cell.onclick = function(year, month, date){
					var d = new Date(year, month, date);
					return function(){
						displayGrid(d);
					}
				}(current.getFullYear(), current.getMonth(), current.getDate());
			}
		}else{
			cell.className = 'unclickable';
		}
		rowToAdd.append(cell);	

		if((current.getDate() + start.getDay()) % 7 == 0 ){
			calendar.append(rowToAdd);
			rowToAdd = document.createElement("tr");
			rowToAdd.className = "calendarRow";
		}

		current.setDate(current.getDate() + 1);	
	}

	for(var i = 0; i < 6 - end.getDay() ; i++){
		rowToAdd.append(document.createElement("td"));
	}

	calendar.append(rowToAdd);
	document.getElementById("calendarTitle").innerHTML = months[month % 12] + " " + year;
}

//document.getElementById('s-lc-rm-cal-cont').style = 'display:none;';
updateCalendar(now.getFullYear(), now.getMonth());

var prebook = document.createElement("button");
prebook.innerHTML = "Prebook";
prebook.id = "prebookButton";
prebook.onclick = function(){
	console.log("Set");
	setTimeout(function(){
		console.log("Run");
		displayGrid(prebookDay);
		waitForGrid(1000, function(){
			book(selected);
			document.getElementById("rm_tc_cont").click();
			document.getElementById("s-lc-rm-sub").click();
		});		
	}, 10 + prebookDay.getTime() - (daysAdvanced - 1) * 86400000 - new Date().getTime());		

};
document.getElementById('s-lc-rm-left').append(prebook);