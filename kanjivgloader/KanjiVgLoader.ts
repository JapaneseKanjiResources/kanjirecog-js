import sax from "sax";
import fs from "fs";

const strict = true;
const parser = sax.parser(strict, {});

const saxStream = sax.createStream(strict, {});
fs.createReadStream("../data/kanjivg-20160426.xml")
    .pipe(saxStream)
    .pipe(fs.createWriteStream("../data/strokes.xml"));
