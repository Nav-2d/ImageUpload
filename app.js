const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("myImage");

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|mp4/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

const app = express();

const imageData = JSON.parse(
  fs.readFileSync("./dev-data/data/image-data.json")
);

app.set("view engine", "ejs");

app.use(express.static("public"));

// app.use(express.static(__dirname + "/views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/sent", (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected!"
        });
      } else {
        console.log("Entered");
        const newId = imageData[imageData.length - 1].id + 1;
        const newImage = Object.assign({ id: newId }, req.body);
        if (req.file.mimetype.startsWith("image")) {
          console.log("Entered img");
          newImage.img = req.file.filename;
        }
        if (req.file.mimetype.startsWith("video")) {
          console.log("Entered video");
          newImage.vid = req.file.filename;
        }
        console.log(req.file);
        imageData.push(newImage);
        fs.writeFileSync(
          `./dev-data/data/image-data.json`,
          JSON.stringify(imageData)
        );
        res.render("index", {
          msg: "File Uploaded!",
          file: `public/uploads/${req.file.filename}`
        });
        console.log("End");
      }
    }
  });
});

app.listen(8000, () => console.log("Server started"));
