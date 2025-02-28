function addComputerMsg(msg) {
    let txt = "<div class=\"emsg cmsg\">" + msg + "</div>";
    console.log(txt);
    let e = document.getElementById("explainc");
    e.insertAdjacentHTML('beforeend', txt);
    e.lastElementChild.scrollIntoView();
}

function addPlayerMsg(msg) {
    let txt = "<div class=\"emsg ymsg\">" + msg + "</div>";
    console.log(txt);
    let e = document.getElementById("explainc");
    e.insertAdjacentHTML('beforeend', txt);
    e.lastElementChild.scrollIntoView();
}

function addInfoMsg(msg) {
    let txt = "<div class=\"einfo\">" + msg + "</div>";
    let e = document.getElementById("explainc");
    e.insertAdjacentHTML('beforeend', txt);
    e.lastElementChild.scrollIntoView();
}

function toggleExplanation() {
    let x = document.getElementById("explain");
    let y = document.getElementById("eshowbtn");
    if (x.style.display === "none" || x.style.display === "") {
        x.style.display = "flex";
    } else {
        x.style.display = "none";
    }
    if (y.style.display === "none") {
        y.style.display = "block";
    } else {
        y.style.display = "none";
    }
}