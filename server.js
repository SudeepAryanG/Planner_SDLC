const { json } = require('express');
const express=require('express')
let app=express();
let port = 7800;
const fs=require('fs');

const bodyParser = require('body-parser');
const { log } = require('console');
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));

app.use(express.json())
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname +"/views"));

app.get("/",function (req,res){
    res.render("login.ejs")
})

app.get("/login",function(req,res){
    res.render("login.ejs")
})

app.get("/home",function(req,res){
    res.render("home.ejs")
})

app.get("/register",function(req,res){
    res.render("register.ejs")
})

app.post("/search",function(req,res){
   var item = req.body.search
   var present = true
   fs.readFile("userdetails.json", (err,data) =>{
    if(!err)
    {
        var projects = JSON.parse(data)
        var userPrj = projects[req.body.mail]
        var userid = Object.keys(userPrj);
       
        var array=[]
        var arrays = []
        for (let i = 0; i < userid.length; i++) {
            array.push(userPrj[userid[i]])
        }
        for (let i = 0; i < array.length; i++) {
       if(array[i].taskheading === item)
       {
        arrays.push(array[i]);
        present = false
       }                   
        }
       if(present)
       res.json({error:"Task Not Found"})
       else
       res.json(arrays)
    }
   })
})

app.post("/register",function(req,res){
    let name=req.body.name;
    let email=req.body.email;
    let password=req.body.password;
    fs.readFile("database.json",function(err,data){
        if(err){
            console.log(err)
        }
        const existingData=JSON.parse(data);
        existingData[email]={name:name,password:password};
        fs.writeFile("database.json",
        JSON.stringify(existingData,null,2),
        function(err){
            if(err){
                console.log(err)
            }else{
                console.log("successfully written")
            }
        }
        )
    });
    res.redirect("/login");
})

app.post("/login",function(req,res){
    let email= req.body.email;
    let password=req.body.password;
    fs.readFile("database.json",function(err,data){
        if (err) {
            console.log(err);
        }
        const userData = JSON.parse(data);
        if(userData[email] && userData[email].password==password)res.render("home.ejs",{email,name:userData[email].name})
        else res.render("login.ejs",{valid:false , message:"Login with proper Credentials "})
    })
});

app.post("/taskdetails",function(req,res){
    let projects=req.body;
   if(!projects.taskheading || !projects.startDate || !projects.endDate)
   res.json({error:"Fill all Fields Properly"})
   else
   {
    fs.readFile("userdetails.json",function(err,data){
        if(err){
            console.log(err)
        }
        const existingData=JSON.parse(data);
        const email=Object.keys(existingData);
        if(email.includes(req.body.email)){
            existingData[req.body.email][req.body.taskid]=req.body
            existingData[req.body.email][req.body.taskid].status="not-started"
        }
        else{
            existingData[req.body.email]={}
            existingData[req.body.email][req.body.taskid]=req.body
            existingData[req.body.email][req.body.taskid].status="not-started"
        }
        fs.writeFile("userdetails.json",
        JSON.stringify(existingData,null,2),
        function(err){
            if(err){
                console.log(err)
            }else{
                res.json({message:"success"})
            }
        }
        )
    });
    res.json({message:"success"})
    res.redirect("/login");
   }
   
})

app.post("/showdetails",function(req,res){
    var sort= req.body.sortType
    var container = req.body.container
    fs.readFile("./userdetails.json",(err,data)=>{
        if(!err){
            let userproject=JSON.parse(data);
            
            var project = userproject[req.body.mailId]
            if(project!=undefined){
                let userid=Object.keys(project)
                var arrays = []
                var array=[]
                for (let i = 0; i < userid.length; i++) {
                    arrays.push(project[userid[i]])
                }
                if(container != "containers")
                {
                   for (let i = 0; i < arrays.length; i++) {
                    // console.log(arrays[i].status, container);
               if(arrays[i].status === container)
               {
                array.push(arrays[i]);
               }                   
                }
                }
                console.log("conwsdfgvr",array);
                if(sort!=undefined)
                {
                    
                    if(sort === "name")
                    {
                        array.sort((a,b)=>{
                            return a.taskheading.localeCompare(b.taskheading)
                        })
                        
                        res.json(array);
                    }
                    if(sort === "sDate")
                    {
                        array.sort((a,b)=>{
                            var sDate = new Date(a.startDate).getTime();
                            var eDate = new Date(b.startDate).getTime();
                            return sDate-eDate
                        })                       
                        res.json(array);
                    }
                    if(sort === "eDate")
                    {
                        array.sort((a,b)=>{
                            var sDate = new Date(a.endDate).getTime();
                            var eDate = new Date(b.endDate).getTime();
                            return sDate-eDate
                        })
                        res.json(array);
                    }        
                }
                else
                {
                    console.log("yes");
                        res.json(arrays)
                }
            }
        }
    })
})

//EDIT
app.post("/editTask",(req,res)=>{
var updated = req.body
console.log("update",req.body);
updated.updatetask.email = req.body.mail
fs.readFile("./userdetails.json",(err,data)=>{
    var userProject=JSON.parse(data);
    var projects=userProject[req.body.mail];
   
    var keys=Object.keys(projects);
    for(let key of keys){
        if(parseInt(projects[key].taskid)===parseInt(updated.updatetask.taskid)){
            updated.updatetask.status = projects[key].status
            delete projects[key];
            key=updated.taskid;
            projects[key]=updated.updatetask;
        }
    }
    
    fs.writeFile("./userdetails.json",
    JSON.stringify(userProject,null,2),
    (err)=>{
        if(!err)res.json({message:"Task Updated Sucessfull"});
    })
})
});


//DELETE
app.post("/deleteTask",(req,res)=>{
    fs.readFile("./userdetails.json",(err,data)=>{
        var userProject=JSON.parse(data);
        // console.log(userProject[req.body.mail][req.body.taskid])
        delete userProject[req.body.mail][req.body.taskid];
        fs.writeFile("./userdetails.json",
        JSON.stringify(userProject,null,2),
        (err)=>{
            if(!err)res.json({message:"Task Deleted Sucessfull"});
        })
    })
});

//Current Task
app.post("/updateStatus",(req,res)=>{
    var id = req.body.taskid;
    var mail=req.body.mail;
    var progress = req.body.div;
    fs.readFile("./userdetails.json",(err, data)=>{
        var user = JSON.parse(data);
        var projects = user[mail]
        var keys=Object.keys(projects);
        for(let key of keys){
            // console.log(projects[key].taskid ,id);
            if(projects[key].taskid===parseInt(id)){    
                var div = progress === "ns"?"not-started":progress === "ip"? "in-progress":progress === "cc"?"completed":""
                projects[key].status = div
            }
        }
        // console.log(user);
        fs.writeFile("./userdetails.json",
        JSON.stringify(user,null,2),
        (err)=>{
            if(!err)res.json({message:"Progress Updated"});
        })
       
    })
})
    

app.listen(port, () => {
    console.log(`App islistening on port ${port}`);
});


