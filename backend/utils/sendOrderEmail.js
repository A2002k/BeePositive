import nodemailer from "nodemailer";

export async function sendOrderConfirmationEmail({
  customer,
  order,
}) {
  const emailUser =
    process.env.EMAIL_USER?.trim();

  const emailPassword =
    process.env.EMAIL_PASSWORD
      ?.replace(/\s/g, "")
      .trim();

  if (!emailUser) {
    throw new Error(
      "EMAIL_USER is missing from the backend .env file."
    );
  }

  if (!emailPassword) {
    throw new Error(
      "EMAIL_PASSWORD is missing from the backend .env file."
    );
  }

  if (!customer?.email) {
    throw new Error(
      "Customer email is missing."
    );
  }

  const transporter =
    nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

  const itemsHtml = order.items
    .map((item) => {
      const price =
        Number(item.price) || 0;

      const quantity =
        Number(item.quantity) || 1;

      const itemTotal =
        price * quantity;

      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #ddd;">
            ${item.name}
          </td>

          <td style="padding:12px;border-bottom:1px solid #ddd;text-align:center;">
            ${quantity}
          </td>

          <td style="padding:12px;border-bottom:1px solid #ddd;text-align:right;">
            $${itemTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const result =
    await transporter.sendMail({
      from: `"BeePositive" <${emailUser}>`,

      to: customer.email,

      subject:
        `BeePositive Order Confirmation - ${order.orderNumber}`,

      html: `
        <div style="
          max-width:620px;
          margin:0 auto;
          font-family:Arial,sans-serif;
          background:#100b06;
          color:#ffffff;
          border:1px solid #f59e0b;
          border-radius:16px;
          overflow:hidden;
        ">
          <div style="
            padding:28px;
            text-align:center;
            background:#17110c;
          ">
            <h1 style="
              margin:0;
              color:#f59e0b;
            ">
              BeePositive
            </h1>

            <p style="
              margin:8px 0 0;
              color:#dddddd;
            ">
              Your order was placed successfully
            </p>
          </div>

          <div style="padding:30px;">
            <h2>
              Thank you, ${customer.name}!
            </h2>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
            ">
              We received your order and will
              prepare it for delivery.
            </p>

            <p>
              <strong style="color:#f59e0b;">
                Order number:
              </strong>

              ${order.orderNumber}
            </p>

            <table style="
              width:100%;
              margin-top:22px;
              border-collapse:collapse;
              background:#ffffff;
              color:#1c1917;
            ">
              <thead>
                <tr style="background:#f59e0b;">
                  <th style="padding:12px;text-align:left;">
                    Product
                  </th>

                  <th style="padding:12px;text-align:center;">
                    Quantity
                  </th>

                  <th style="padding:12px;text-align:right;">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="
              margin-top:20px;
              padding:16px;
              background:#17110c;
              border-radius:10px;
            ">
              <p>
                Subtotal:
                $${Number(
                  order.subtotal
                ).toFixed(2)}
              </p>

              <p>
                Delivery:
                $${Number(
                  order.deliveryFee
                ).toFixed(2)}
              </p>

              <h3 style="color:#f59e0b;">
                Total:
                $${Number(
                  order.total
                ).toFixed(2)}
              </h3>
            </div>

            <p style="
              margin-top:22px;
              color:#d6d3d1;
              line-height:1.7;
            ">
              Payment:
              ${order.paymentMethod}
              <br>

              Phone:
              ${customer.phone}
              <br>

              Address:
              ${customer.address},
              ${customer.city}
            </p>
          </div>
        </div>
      `,
    });

  console.log(
    "Order email sent successfully:",
    result.messageId
  );

  return result;
}