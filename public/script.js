document.addEventListener("DOMContentLoaded", function () {
  const taxForm = document.getElementById("taxForm");
  const sendButton = document.getElementById("sendButton");
  const closeModal = document.getElementById("closeModal");
  let formDataCache = null;

  taxForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const salary = parseFloat(document.getElementById("salary").value) || 0;
    const houseProperty = parseFloat(document.getElementById("houseProperty").value) || 0;
    const otherSources = parseFloat(document.getElementById("otherSources").value) || 0;

    const data = { name, phone, email, salary, houseProperty, otherSources };
    formDataCache = data; // 🔒 Store for use in send-email

    document.getElementById("resultModal").style.display = "flex";
    document.getElementById("modalName").innerText = name;
    document.getElementById("modalPhone").innerText = phone;
    document.getElementById("modalEmail").innerText = email;
    document.getElementById("modalSalary").innerText = salary.toFixed(2);
    document.getElementById("modalHouseProperty").innerText = houseProperty.toFixed(2);
    document.getElementById("modalOtherSources").innerText = otherSources.toFixed(2);
    document.getElementById("modalTaxAmount").innerText = calculateTax(salary + houseProperty + otherSources).toFixed(2);
  });

  // ✅ Add only once
  sendButton.addEventListener("click", function () {
    if (!formDataCache) return alert("No form data to send.");

    fetch("/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataCache),
    })
      .then((response) => response.json())
      .then((result) => {
        alert(result.message || result.error);
        document.getElementById("resultModal").style.display = "none";
        formDataCache = null; // 🧹 Reset after sending
      })
      .catch((error) => console.error("Error:", error));
  });

  closeModal.addEventListener("click", function () {
    document.getElementById("resultModal").style.display = "none";
  });

  document.getElementById("downloadPdf").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = document.getElementById("modalName").innerText;
    const phone = document.getElementById("modalPhone").innerText;
    const email = document.getElementById("modalEmail").innerText;
    const salary = parseFloat(document.getElementById("modalSalary").innerText).toFixed(2);
    const houseProperty = parseFloat(document.getElementById("modalHouseProperty").innerText).toFixed(2);
    const otherSources = parseFloat(document.getElementById("modalOtherSources").innerText).toFixed(2);
    const taxAmount = parseFloat(document.getElementById("modalTaxAmount").innerText).toFixed(2);
    const totalIncome = (parseFloat(salary) + parseFloat(houseProperty) + parseFloat(otherSources)).toFixed(2);

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const timeStr = now.toLocaleTimeString();

    const logo = new Image();
    logo.src = "logo.png";

    logo.onload = function () {
      doc.addImage(logo, "PNG", 95, 10, 30, 35);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 102, 204);
      doc.text("Income Tax Summary Report", 105, 40, { align: "center" });
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2]);
      doc.line(30, 43, 180, 43);
      doc.setLineDashPattern([]);

      let y = 60;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const entries = [
        ["Name", name],
        ["Email", email],
        ["Phone", phone],
        ["Salary", `Rs. ${salary}`],
        ["House Property", `Rs. ${houseProperty}`],
        ["Other Sources", `Rs. ${otherSources}`],
        ["Total Income", `Rs. ${totalIncome}`],
        ["Tax Payable", `Rs. ${taxAmount}`],
      ];

      entries.forEach(([label, value]) => {
        doc.text(label + " :", 30, y);
        doc.text(value, 180, y, { align: "right" });
        y += 10;
      });

      y += 15;
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      const taxMessage = `Dear ${name}, based on your total income, you are required to pay Rs. ${taxAmount} as income tax.`;
      doc.text(taxMessage, 105, y, { align: "center" });

      const qr = new QRious({
        value: `Name: ${name}, Tax: Rs. ${taxAmount}`,
        size: 60,
      });
      const qrData = qr.toDataURL();
      doc.addImage(qrData, "PNG", 20, 230, 30, 30);
      doc.setFontSize(10);
      doc.text(`Date: ${dateStr}`, 22, 265);
      doc.text(`Time: ${timeStr}`, 22, 270);
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.line(20, 277, 190, 277);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("Generated by Tax Filter Income Tax Calculator  • www.Tax Filter.com", 105, 282, { align: "center" });
      doc.text("Email: taxfilter@gmail.com • Phone: +91-98765-43210", 105, 287, { align: "center" });

      doc.save(`${name}_Tax_Summary.pdf`);

      const pdfBlob = doc.output("blob");
      const formData = new FormData();
      formData.append("pdf", pdfBlob, `${name}_Tax_Summary.pdf`);
      formData.append("email", email);
      formData.append("name", name);

      fetch("/upload-pdf", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          alert(result.message || "PDF sent via email.");
        })
        .catch((error) => {
          console.error("Error sending PDF to server:", error);
        });
    };
  });

  function calculateTax(income) {
    let tax = 0;
    if (income > 1500000)
      tax = (income - 1500000) * 0.3 + 100000 * 0.2 + 300000 * 0.15 + 300000 * 0.1 + 300000 * 0.05;
    else if (income > 1200000)
      tax = (income - 1200000) * 0.2 + 300000 * 0.15 + 300000 * 0.1 + 300000 * 0.05;
    else if (income > 900000)
      tax = (income - 900000) * 0.15 + 300000 * 0.1 + 300000 * 0.05;
    else if (income > 600000)
      tax = (income - 600000) * 0.1 + 300000 * 0.05;
    else if (income > 300000)
      tax = (income - 300000) * 0.05;
    return tax;
  }
});
