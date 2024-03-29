import { S3 } from "aws-sdk";
import fs from "fs";
import path, { dirname } from "path";
require('dotenv').config();
const s3 = new S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey:  process.env.SECRETACCESSKEY,
})

// output/asdasd
export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel.rajtilak",
        Prefix: prefix
    }).promise();
    
    // 
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath).replace(/\\/g, '/');
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            console.log("dirname from allPromises", dirName);
            s3.getObject({
                Bucket: "vercel.rajtilak",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const updatedFolderPath = folderPath.replace(/\\/g, '/');
    const allFiles = getAllFiles(updatedFolderPath);
    console.log("folder path from copyFinalDist", updatedFolderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(updatedFolderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file).replace(/\\/g, '/');;
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    console.log("response from getAllFiles function ", response);
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const formattedfileName = fileName.replace(/\\/g, "/");
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel.rajtilak",
        Key: formattedfileName,
    }).promise();
    console.log(response);
}