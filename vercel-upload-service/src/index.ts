import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import {generate} from './utils';
import {getAllFiles} from './file';
import { uploadFile } from "./aws";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

// dotenv.config();
// dotenv.config({ path: '/.env' });

const port = process.env.PORT || 3000;

app.post("/deploy", async (req,res) => {
    const repoUrl = req.body.repoUrl;
    // console.log(__dirname);
    const id = generate();
    // await simpleGit().clone(repoUrl, path.join(__dirname,`output/${id}`));
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    // const files = getAllFiles(path.join(__dirname, `output/${id}`));
    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    // files.forEach(async file => {
    //     await uploadFile(file.slice(__dirname.length+1), file);
    // })
    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
    })

    publisher.lPush("build-queue", id);
    
    res.json({
        id: id
    });
})

app.listen(port, () => {
    console.log(`App listening on ${port}`);
})
