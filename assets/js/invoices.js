function loadInvoices() {
    const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    const invoiceList = document.getElementById("invoiceList");
    if (invoices.length === 0) {
      invoiceList.innerHTML = "<p>No invoices available.</p>";
      return;
    }
    invoices.forEach((inv, idx) => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>Invoice ${inv.invoiceId}</h3>
        <p>Generated At: ${inv.generatedAt}</p>
        <p>Total: $${inv.transaction.total.toFixed(2)}</p>
        <p>Cars: ${inv.transaction.order.map(car => car.group).join(", ")}</p>
        <hr>`;
      invoiceList.appendChild(div);
    });
  }
  loadInvoices();
  