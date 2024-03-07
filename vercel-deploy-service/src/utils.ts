import { exec, spawn } from "child_process";
import path from "path";

export function buildProject(id: string){
    return new Promise((resolve) => {
        const chlid = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`)

        chlid.stdout?.on('data', function(data){
            console.log("stdout: " + data);
        });

        chlid.stderr?.on('data', function(data){
            console.log("stderr: " + data);
        });

        chlid.on('close', function(data){
            resolve('');
        });
    })
}