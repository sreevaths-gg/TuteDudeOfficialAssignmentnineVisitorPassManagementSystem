const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generatePDF = async (pass) => {
  try {
    const uploadDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(
      uploadDir,
      `${pass._id}.pdf`
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 40
    });

    doc.pipe(
      fs.createWriteStream(filePath)
    );

    // ==========================
    // Header
    // ==========================

    doc
      .rect(0, 0, 595, 90)
      .fill("#1565C0");

    doc
      .fillColor("white")
      .fontSize(26)
      .text("VISITOR PASS", 190, 30);

    doc
      .fontSize(10)
      .text(
        "Visitor Management System",
        210,
        60
      );

    // ==========================
    // Main Pass Card
    // ==========================

    doc
      .roundedRect(
        30,
        120,
        530,
        300,
        10
      )
      .stroke();

    // Left side details

    doc.fillColor("black");

    doc.fontSize(14);

    doc.text(
      `Pass ID: ${pass._id}`,
      50,
      150
    );

    doc.text(
      `Visitor Name: ${pass.visitorName}`,
      50,
      180
    );

    doc.text(
      `Email: ${pass.email}`,
      50,
      210
    );

    doc.text(
      `Phone: ${pass.phone}`,
      50,
      240
    );

    doc.text(
      `Company: ${pass.company}`,
      50,
      270
    );

    doc.text(
      `Pass Number: ${pass.passNumber}`,
      50,
      300
    );

    doc
      .fillColor("green")
      .text(
        `Status: ${pass.status}`,
        50,
        330
      );

    // ==========================
    // QR Section
    // ==========================

    if (pass.qrCode) {

      const base64Image =
        pass.qrCode.replace(
          /^data:image\/png;base64,/,
          ""
        );

      const qrPath = path.join(
        uploadDir,
        `${pass._id}-qr.png`
      );

      fs.writeFileSync(
        qrPath,
        base64Image,
        "base64"
      );

      doc
        .roundedRect(
          340,
          140,
          180,
          190,
          8
        )
        .stroke();

      doc.image(
        qrPath,
        355,
        155,
        {
          fit: [150, 150],
          align: "center",
          valign: "center"
        }
      );

      doc
        .fillColor("blue")
        .fontSize(11)
        .text(
          "Scan To Verify",
          390,
          315
        );
    }

    // ==========================
    // Footer
    // ==========================

    doc
      .moveTo(40, 450)
      .lineTo(550, 450)
      .stroke();

    doc
      .fillColor("black")
      .fontSize(11)
      .text(
        `Generated On: ${new Date().toLocaleString()}`,
        50,
        470
      );

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Please present this pass at the security desk during entry and exit.",
        50,
        495
      );

    doc.end();

    return filePath;

  } catch (error) {
    throw error;
  }
};

module.exports = generatePDF;