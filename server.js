import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


const app = express();


const __filename =
    fileURLToPath(import.meta.url);


const __dirname =
    path.dirname(__filename);


app.use(cors());


app.use(express.json());


app.use(
    express.static(__dirname)
);


app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


const PORT =
    process.env.PORT || 3001;


app.listen(
    PORT,
    () => {

        console.log(
            `LUMOS running on port ${PORT}`
        );

    }
);