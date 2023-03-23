console.log(email)

function taskdetails(){
    let taskid=Date.now();
    let task={taskid,email};
    ["taskheading","startDate","endDate"].forEach(id => {
        
        task[id]=document.querySelector("#"+id).value;
        
    });
    fetch("/taskdetails",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(task)
    })
    .then((data)=>data.json())
    .then((res)=>
    {
    console.log(res);
    if(res.error)
        alert(res.error)
    if(res.message)
        window.location.reload()
    })
    .catch(function(res){ console.log(res) })
}

function sortFun(type,container){
    fetch("/showdetails",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"mailId":email,sortType:type,container:container})
    })
  .then((res)=>res.json())
  .then((data)=>{
    display(data,container)
    drag();
    // closeForm();
  })
    .catch(function(res){ console.log(res) })
    
}

document.querySelector("#startDate").addEventListener("input",function(){
    document.querySelector("#endDate").min=document.querySelector("#startDate").value
})
 

document.querySelector("#taskdetails").addEventListener("click",function(){
    taskdetails()
})

document.querySelector("#taskText").addEventListener("input",()=>{
    document.querySelector("#taskText").minHeight=document.querySelector("#taskText").scrollHeight+"px";
})

function display(array,container) {
    var div;
    if(container === "")
    div = "containers"
    else
    div = container === "not-started"?"ns":container === "in-progress"?"ip":container === "completed"?"cc":""
    let display=``;
    // console.log( document.querySelector(`.${div}`));
    document.querySelectorAll(`.${div}`).forEach(e => {
        e.innerHTML="";
    });
    for(let i=0; i<array.length; i++){
        display=`
        <div id="${array[i].status}" class="draggable ${array[i].taskid}" draggable="true">
            <div class="left-button">
            ${array[i].taskheading}
            <button id="edit" onclick="edit(${array[i].taskid})" class="btn btn-success"><i class="fa fa-solid fa-pen"></i></button>&nbsp;
            <button id="delete" onclick="deleteTask(${array[i].taskid})" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="dates">
            Start Date ${array[i].startDate}
            </div>
            <div class="dates">
            End Date ${array[i].endDate}
            </div>
        </div>  

        <div id="popup" class="c${array[i].taskid}" >
        <button class="btn btn-danger" onclick="closeForm()" id="closeBtn"><i class="fa-sharp fa-solid fa-xmark" style="color: white;"></i></button>
            <div id="editpop"><u>Edit Task </u></div>
            <label>Project Name</label>
            <div>    
            <input type="text" name="" id="popUpheading${array[i].taskid}" value="${array[i].taskheading}">
            <div class="form-group">
            <label for="date">Start Date</label>
            <input class="form-control" placeholder="date" value="${array[i].startDate}"
            name="date" id="popstartDate${array[i].taskid}" type="date"/>
            </div>
            <div class="form-group">
            <label for="date">End Date</label>
            <input class="form-control" placeholder="date" value="${array[i].endDate}"
            name="date" id="popendDate${array[i].taskid}" type="date"/>
            </div>
            <button class="btn btn-success" onclick="update(${array[i].taskid})" >Update</button>
        </div>
        </div>
        `
        // console.log(display);
        if( array[i].status === "not-started")
        {
            document.querySelector(".ns").innerHTML+=display
        }      
        else if( array[i].status === "in-progress"){
            document.querySelector(".ip").innerHTML+=display
        }       
        else if(  array[i].status === "completed")
        {
            document.querySelector(".cc").innerHTML+=display
        }
    }
}

fetch("/showdetails",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({mailId:email,sortType:undefined,container:"containers"})
    })
   .then((res)=>res.json())
   .then((data)=>{

    display(data,"")
    drag()
   })

   function closeForm() {
    
    document.querySelector("#popup").style.display = "none";
    console.log("close")
   }

function update(e){
    let popUpheading=document.getElementById("popUpheading"+e).value;
    let popstartDate=document.getElementById("popstartDate"+e).value
    let popendDate=document.getElementById("popendDate"+e).value;
    let updatetask={};
    updatetask.taskid=e;
    updatetask.taskheading=popUpheading;
    updatetask.startDate=popstartDate;
    updatetask.endDate=popendDate;
    updatetask.status = "";
        fetch("/editTask",
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({updatetask,taskid:e,mail:email})
        })
    .then((res)=>res.json())
    location.reload();
}

function edit(e){
    document.querySelectorAll("#popup").forEach(element=>{
        element.style.display="none"
    })
    document.querySelector(".c"+e).style.display="block";
    let popUpheading=document.getElementById("popUpheading"+e).value;
    let popstartDate=document.getElementById("popstartDate"+e).value
    let popendDate=document.getElementById("popendDate"+e).value;
    let updatetask={};
    updatetask.taskid=e;
    updatetask.taskheading=popUpheading;
    updatetask.startDate=popstartDate;
    updatetask.endDate=popendDate;
        fetch("/editTask",
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({taskid:e,mail:email})
        })
    .then((res)=>res.json())
}

function deleteTask(e){
   if(confirm("Do you want to delete this task"))
   {
    fetch("/deleteTask",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({taskid:e,mail:email})
    })
    .then((res)=>res.json())
    location.reload();
   }
}

document.querySelectorAll(".btn-warning").forEach((button)=>{
 button.addEventListener("click",()=>{
        button.classList.toggle("filter-selected");
    })
})

//Drag and Drop

let droppedDiv;
function drag() {
    const draggables = document.querySelectorAll(".draggable");
    const containers = document.querySelectorAll(".containers");
    draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
    });
    draggable.addEventListener("dragend", (e) => {
        draggable.classList.remove("dragging");
        var dd =droppedDiv.split(" ")[1]
        var id = e.target.className.split(" ")[1]
        fetch("/updateStatus",
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({taskid:id,div:dd,mail:email})
        })
        .then((res)=>res.json())
        .then((res)=>{
            console.log(res);
        })
    });
    })
    containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const draggable = document.querySelector(".dragging");
        container.appendChild(draggable);
        droppedDiv=container.className
    });
    });
}

//Search Task Items
function searchTask()
{
    var search = document.querySelector("#searchItem").value;
    fetch("/search",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({search:search,mail:email})
    })
    .then((res)=>res.json())
    .then((res)=>{
        if(!res.error)
        display(res,"")
        else {
        alert(res.error)
        document.querySelector("#searchItem").value = "";
        }
    })
}