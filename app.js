const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs')

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const emptyFile = {
    "api": "",
    "description": "",
    "note": {},
    "example": []
}

const jsonfile = require('jsonfile')

app.post('/api/document', (req, res) => {
    let project = req.body.project;
    if (!project) project = ""
    let projectDir = './documents/' + project;
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir);
    }

    let file = req.body.file + '.json';

    let data = req.body.data || emptyFile;

    let fileDir = projectDir + '/' + file;

    if (!fs.existsSync(fileDir)) {
        try {
            fs.writeFileSync(fileDir, JSON.stringify(data))
        } catch (err) {
            res.status(500).send(err)
        }
        console.log("Create file completed");
        res.status(200).send({
            "project": project,
            "file": file,
            "pathToFile": fileDir,
            "data": data,
        })
    } else {
        res.status(400).send("File has already exist")
    }
})

app.get('/api/project', (req, res) => {
    let list = [];
    fs.readdirSync('./documents/').forEach(file => {
        list.push(file)
    });
    res.status(200).send({
        "count": list.length,
        "data": list
    })
})

app.get('/api/document/:project', (req, res) => {
    let project = req.params.project;
    let projectDir = './documents/' + project;

    if (!fs.existsSync(projectDir)) {
        let list = [];
        fs.readdirSync('./documents/').forEach(file => {
            list.push(file.replace('.json', ''))
        });
        return res.status(400).send({
            "message": project + " is invalid",
            "List of projects": list
        });
    }

    let list = [];
    fs.readdirSync(projectDir).forEach(file => {
        let filename = file.replace('.json', '');
        let searchName = req.query.name || "";
        if (filename.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()))
        {
            let data = jsonfile.readFileSync(projectDir+'/'+file)
            if (req.query.nameOnly === "true")
            {
                data = data.description;
            }
            let element = {
                name: filename,
                data: data
            }
            list.push(element)
        }
    });
    res.status(200).send({
        "count": list.length,
        "data": list
    })
})

app.get('/api/document', (req, res) => {
    let project = req.query.project;
    let projectDir = './documents/' + project;

    if (!fs.existsSync(projectDir)) {
        let list = [];
        fs.readdirSync('./documents/').forEach(file => {
            list.push(file)
        });
        return res.status(400).send({
            "message": project + " is invalid",
            "List of projects": list
        });
    }

    let file = req.query.file + '.json';
    let fileDir = projectDir + '/' + file;

    if (!fs.existsSync(fileDir)) {
        let list = [];
        fs.readdirSync(projectDir).forEach(file => {
            list.push(file.replace('.json',''))
        });
        return res.status(400).send({
            "message": req.query.file + " is invalid",
            "List of available files": list
        });
    }

    res.status(200).send(jsonfile.readFileSync(fileDir));
})

app.put('/api/document', (req, res) => {
    let project = req.body.project;
    let projectDir = './documents/' + project;

    if (!fs.existsSync(projectDir)) {
        let list = [];
        fs.readdirSync('./documents/').forEach(file => {
            list.push(file)
        });
        return res.status(400).send({
            "message": project + " is invalid",
            "List of projects": list
        });
    }

    let file = req.body.file + '.json';
    let fileDir = projectDir + '/' + file;

    if (!fs.existsSync(fileDir)) {
        let list = [];
        fs.readdirSync(projectDir).forEach(file => {
            list.push(file)
        });
        return res.status(400).send({
            "message": file + " is invalid",
            "List of available files": list
        });
    }

    let data = req.body.data
    try {
        jsonfile.writeFileSync(fileDir, data)
        res.status(200).send(data)
    } catch (err) {
        res.status(500).send({
            err
        })
    }
})

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('*', (req, res) => res.status(200).send({
    message: 'Welcome to the beginning of nothingness.',
}));

app.set('port', 8888)

app.listen(8888, () => {
    console.log("Server run on localhost:8888");
});

module.exports = app;