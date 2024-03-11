import express from "express";
import {S3} from "aws-sdk"

const s3 = new S3({
    // accessKeyId: process.env.ACCESSKEYID,
    // secretAccessKey:  process.env.SECRETACCESSKEY,
})

const app = express(); 

const port = 3001;

app.get("/*", async (req,res)=> {
    const host = req.hostname;
    console.log(host);
    const id = host.split(".")[0];
    console.log("hi");
    console.log("id ",id);
    const filePath = req.path;
    console.log("file path ",filePath);
    const contents = await  s3.getObject({
        Bucket: "vercel.rajtilak",
        Key: `dist/${id}${filePath.replace(/\\/g, '/')}`,
        // Key: `dist/${id}${filePath.replace(/\\/g, '/')}`,
    }).promise();
   
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript";
    res.set("Content-Type", type);
    res.send(contents.Body);
})
app.listen(port,()=> {
    console.log(`App is listening on ${port}`);
})