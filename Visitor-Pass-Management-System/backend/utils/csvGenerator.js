const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

const generateCSV = async (
  data,
  fields,
  fileName
) => {

  const parser = new Parser({
    fields
  });

  const csv = parser.parse(data);

  const uploadDir = path.join(
    __dirname,
    "../uploads"
  );

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const filePath = path.join(
    uploadDir,
    fileName
  );

  fs.writeFileSync(
    filePath,
    csv,
    "utf8"
  );

  return filePath;
};

module.exports = generateCSV;