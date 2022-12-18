const form = document.getElementById("control-row");
const find = document.getElementById("find");
const input = document.getElementById("input");
const message = document.getElementById("message");
const exitButton = document.getElementById("close");

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      input.value = url.hostname;
    } catch {}
  }

  input.focus();
})();

exitButton.addEventListener("click", closeWindow);

function closeWindow() {
  window.close();
}

find.addEventListener("click", handleFindClick);

async function handleFindClick(event) {
  event.preventDefault();
  // console.log(arr)

  let url = stringToUrl(input.value);
  if (!url) {
    setMessage("Invalid URL");
    return;
  }
  let arr = await getCookies(url.hostname);

  let myTable= document.getElementById('cookieTable'); 
  let numberOfCookies = 0;
  let numberOfSamesiteCookies = 0;
  let numberOfSecureCookies = 0;

  if(myTable.hidden){
    myTable.hidden = false;

    for (let i=0; i<arr.length; i++) {
      let row = document.createElement("tr");
      let cell1 = document.createElement("td");
      let cell2 = document.createElement("td");
      let cell3 = document.createElement("td");
      let cell4 = document.createElement("td");

      cell1.innerHTML = arr[i].name;
      cell2.innerHTML = (convertTimestamp(arr[i].expirationDate) || "Session Cookie");
      cell3.innerHTML = arr[i].sameSite;
      cell4.innerHTML = arr[i].secure;
      row.appendChild(cell1);
      row.appendChild(cell2);
      row.appendChild(cell3);
      row.appendChild(cell4);
      myTable.appendChild(row);

      numberOfCookies++;
      if (arr[i].sameSite != "unspecified"){
        numberOfSamesiteCookies += 1;
      }
      if (arr[i].secure == true){
        numberOfSecureCookies += 1;
      }
    }
    let summaryText= document.getElementById('summaryText'); 
    summaryText.hidden = false;

    let summaryTable= "<table border=3; style='border-color:#009578; border-collapse:collapse;' ><tr><th style='width: 150px;  text-align: left;'>Number of Cookies </td>";
    summaryTable += "<th style='width: 150px; text-align: left;'>Number of Cookies with Samesite attribute set </td>";
    summaryTable += "<th style='width: 150px; text-align: left;'>Number of Cookies with Secure attribute set </td></tr>";
  
    summaryTable+="<td     style='width: 150px; text-align: left;'>" + numberOfCookies + "</td>";
    summaryTable+="<td     style='width: 150px; text-align: left;'>" + numberOfSamesiteCookies + "</td>";
    summaryTable+="<td     style='width: 150px; text-align: left;'>" + numberOfSecureCookies + "</td></tr>";
    
    document.getElementById('summary').innerHTML = summaryTable;;  
  }
}

function convertTimestamp(timestamp) {
  if (timestamp == undefined)
    return false
    
  console.log(timestamp)
  const d = new Date(timestamp * 1000); // Convert the passed timestamp to milliseconds
      let yyyy = d.getFullYear();
      let mm = ('0' + (d.getMonth() + 1)).slice(-2);  // Months are zero based. Add leading 0.
      let dd = ('0' + d.getDate()).slice(-2);     // Add leading 0.
      let hh = d.getHours();
      let h = hh;
      let min = ('0' + d.getMinutes()).slice(-2);     // Add leading 0.
      let ampm = 'AM';
      let time;

  if (hh > 12) {
      h = hh - 12;
      ampm = 'PM';
  } else if (hh === 12) {
      h = 12;
      ampm = 'PM';
  } else if (hh == 0) {
      h = 12;
  }

  // ie: 2014-03-24, 3:00 PM
  time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
  return time;
}

function stringToUrl(input) {
  // Start with treating the provided value as a URL
  try {
    return new URL(input);
  } catch {}
  // If that fails, try assuming the provided input is an HTTP host
  try {
    return new URL("http://" + input);
  } catch {}
  // If that fails ¯\_(ツ)_/¯
  return null;
}


async function getCookies(domain) {
  let arr = []
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      return "No cookies found";
    }

    arr = cookies;

  } catch (error) {
    return `Unexpected error: ${error.message}`;
  }
  return arr//, `${arr.reduce((accum, current) => accum+=(current.name + "\n"), "")}`;
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}