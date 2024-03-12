"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const simple_git_1 = __importDefault(require("simple-git"));
const utils_1 = require("./utils");
const file_1 = require("./file");
const aws_1 = require("./aws");
const path_1 = __importDefault(require("path"));
require('dotenv').config();
const redis_1 = require("redis");
const publisher = (0, redis_1.createClient)();
publisher.connect();
const subsciber = (0, redis_1.createClient)();
subsciber.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// dotenv.config();
// dotenv.config({ path: '/.env' });
const port = process.env.PORT || 6000;
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    // console.log(__dirname);
    const id = (0, utils_1.generate)();
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `output/${id}`));
    const files = (0, file_1.getAllFiles)(path_1.default.join(__dirname, `output/${id}`));
    // const uploadPromises = files.map(async file => {
    //     await uploadFile(file.slice(__dirname.length+1), file);
    // })
    // await Promise.all(uploadPromises);
    files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, aws_1.uploadFile)(file.slice(__dirname.length + 1), file);
    }));
    new Promise(resolve => setTimeout(resolve, 10000));
    publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded");
    res.json({
        id: id
    });
}));
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    console.log("id ", id);
    const response = yield subsciber.hGet("status", id);
    console.log("response ", response);
    res.send(response);
}));
app.listen(port, () => {
    console.log(`App listening on ${port}`);
});
