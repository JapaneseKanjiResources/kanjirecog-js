import sax from "sax";
import fs from "fs";

const strict = true;

const saxStream = sax.createStream(strict, {});

saxStream.on("opentag", (node) => {
    // same object as above
    console.log(node);
});

fs.createReadStream("../data/kanjivg-20160426.xml")
    .pipe(saxStream)
    .pipe(fs.createWriteStream("../data/strokes.xml"));
