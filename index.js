const express =require('express');
const mysql=require('mysql');
const cors = require("cors");
const bcrypt = require('bcrypt');
const bodyParser=require("body-parser");
const cookieparser=require("cookie-parser")
const session=require("express-session");
const saltRounds = 10;






const PORT=process.env.PORT || 8000;

const app=express();


app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}));
app.use(express.json());
app.use(cookieparser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    key:"userId",
    secret:"prajwal",
    resave:false,
    saveUninitialized:false,
    // cookie:{
    //     expires:60*60*60*24,
    // }
}))

const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Networld@123',
    database:'login_react'
})



db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }

    console.log('Connected to MySQL');

    // Create database if it does not exist
    db.query('CREATE DATABASE IF NOT EXISTS login_react', (err) => {
        if (err) {
            console.error('Error creating database:', err);
            throw err;
        }

        console.log('Database created or already exists');

        // Switch to the 'login_react' database
        db.query('USE login_react', (err) => {
            if (err) {
                console.error('Error switching to database:', err);
                throw err;
            }

            console.log('Using database: login_react');

            // Create 'users' table if it does not exist
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id int(3) NOT NULL AUTO_INCREMENT,
                userName varchar(50) NOT NULL,
                email varchar(500) NOT NULL,
                password varchar(60) NOT NULL,
                date datetime NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `;
            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    throw err;
                }

                console.log('Table created or already exists');
            });
        });
    });
});


app.get("/",(req,res)=>{
    res.send("hi");
})

app.post("/register",(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    bcrypt.hash(password,saltRounds,(errr,hash)=>{
        const data={
       userName:req.body.userName,
            email:req.body.email,
            password:hash,        
       
       };
       if(errr)
       {
        console.log(err);
       }
       else{
        let sqll=`select * from users where email='${email}'`;
        db.query(sqll,(er,ress)=>{
            if(ress?.length > 0)
            {
                res.send({msg:"User Email Already Present"})

            }
            else{
                let sql="INSERT INTO `users` SET ?";
                db.query(sql,data,(err,result)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                    else{
                        //  console.log(result);
                         res.send(result);
                        // res.send()
            
                    }
                })
            }
        })

       

       }
      

    })
   
    
     
})

app.post("/login",(req,res)=>{
   const email=req.body.email;
    const password=req.body.password;

    // console.log(email);
        
      
        let sql=`select * from users where email='${email}'`;
        // console.log(sql);
        db.query(sql,(err,result)=>{
            if(err)
            {
                // res.send({err:err})
                console.log(err);
            }
            else{
              
               if(result.length > 0)
               {
                bcrypt.compare(password,result[0].password,(errr,response)=>{
                    if(response)
                    {
                        req.session.user=result;
                        // console.log(req.session.user);
                     
                     res.send({login:true,useremail:email});
                    }
                    else{
                     res.send({login:false,msg:"Wrong Password"});
                    
                    }
                })

                

               }
               else{
                    res.send({login:false,msg:"User Email Not Exits"});
                // console.log("noo email ")
               }
                
    
            }
        })

      
    
     
})
app.get("/login",(req,res)=>{
    
    if(req.session.user)
    {
        res.send({login:true,user:req.session.user});
    }
    else{
        res.send({login:false});
    }
})

app.get("/logout", (req, res) => {
    if (req.session.user) {

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.send({ success: false, msg: 'Error destroying session' });
            } else {
                res.clearCookie("userId");
                res.send("logOut");
            }
        });
    } else {
        res.send("loggedIn");
    }
});



app.listen(PORT,()=>{
    console.log(`app running in ${PORT}` )
})