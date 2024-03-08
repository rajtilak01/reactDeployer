import express from "express";

const app = express();

const port = 3001;

app.get("/*", (req,res)=> {
    const host = req.hostname;
    const id = host.split(".")[0];
    console.log(id);
})
app.listen(port,()=> {
    console.log(`App is listening on ${port}`);
})