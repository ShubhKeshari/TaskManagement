const express = require("express");
const app = express();
const cors = require("cors");
const { connection } = require("./config/db.config");
require("dotenv").config();
const { userRouter } = require("./routes/users.routes");
const { tasksRouter } = require("./routes/tasks.routes");
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());


app.use("/users",userRouter);
app.use("/tasks",tasksRouter);
app.get("/",(req,res)=>{
    try{
        res.status(200).json({message:"Server Home Page"});
    }catch(error){
        res.status(400).json({message:error})
    }
})

app.listen(port,async()=>{
    try{
        await connection;
        console.log("server connected to database");
        console.log(`Server is running at http://localhost:${port}`);
    }catch(error){
        console.log("Error in connecting the server",error);
    }
})