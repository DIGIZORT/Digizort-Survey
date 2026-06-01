import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route first: Receive and send email notifications
app.post("/api/notify", async (req, res) => {
  try {
    const { fullName, answer, opinion, createdAt } = req.body;

    // Server-side validation
    if (!fullName || !answer || !opinion) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return res.status(400).json({ error: "Invalid name length" });
    }

    if (answer !== "Yes" && answer !== "No") {
      return res.status(400).json({ error: "Answer must be Yes or No" });
    }

    if (opinion.trim().length < 10 || opinion.trim().length > 2000) {
      return res.status(400).json({ error: "Opinion must be between 10 and 2000 characters" });
    }

    // Prepare email notification to digizort@gmail.com
    const recipient = "digizort@gmail.com";
    const mailSubject = `🚀 New Digizort Poll Response: ${fullName}`;
    const mailBodyHTML = `
      <div style="font-family: sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #ff0000; max-width: 600px; margin: 0 auto; box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);">
        <h2 style="color: #ff3333; margin-top: 0; font-size: 24px; border-bottom: 2px solid #500; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">DIGIZORT</h2>
        <p style="font-size: 16px; color: #cccccc; margin-bottom: 20px;">A new feedback response has been recorded on the DIGIZORT futuristic platform.</p>
        
        <div style="background-color: #171717; padding: 20px; border-radius: 8px; border-left: 4px solid #ff3333; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888888; font-weight: bold; width: 33%;">Full Name:</td>
              <td style="padding: 6px 0; color: #ffffff; font-size: 16px;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888888; font-weight: bold;">Vision Belief:</td>
              <td style="padding: 6px 0; color: ${answer === 'Yes' ? '#4ade80' : '#f87171'}; font-weight: bold; font-size: 16px;">${answer} (Believes in Digizort's Vision)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888888; font-weight: bold;">Timestamp:</td>
              <td style="padding: 6px 0; color: #aaaaaa; font-family: monospace; font-size: 14px;">${createdAt}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333333;">
          <h4 style="margin: 0 0 10px 0; color: #ff3333; font-size: 14px; text-transform: uppercase;">Opinion / Response:</h4>
          <p style="margin: 0; color: #e5e5e5; font-size: 15px; line-height: 1.6; white-space: pre-wrap; font-style: italic;">"${opinion}"</p>
        </div>

        <p style="font-size: 12px; color: #555555; text-align: center; margin-top: 300px; border-top: 1px solid #222; padding-top: 15px;">
          This is an automated notification from the DIGIZORT Web Platform.
        </p>
      </div>
    `;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      // Configuration is available, make a real transport and send!
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: `"DIGIZORT Platform" <${emailUser}>`,
        to: recipient,
        subject: mailSubject,
        html: mailBodyHTML,
      });

      console.log(`[Email] Mail sent successfully to ${recipient} via SMTP.`);
      return res.json({ success: true, method: "smtp" });
    } else {
      // Graceful fallback to rich console logging
      console.log("\n" + "=".repeat(60));
      console.log("             🚀 DIGIZORT FORM SUBMISSION RECEIVED 🚀");
      console.log("=".repeat(60));
      console.log(`Recipient:   ${recipient}`);
      console.log(`Subject:     ${mailSubject}`);
      console.log(`Full Name:   ${fullName}`);
      console.log(`Yes/No Check: ${answer}`);
      console.log(`Timestamp:   ${createdAt}`);
      console.log("-".repeat(60));
      console.log(`Opinion:\n"${opinion}"`);
      console.log("=".repeat(60));
      console.log("[Email Simulation Mode] SMTP details not configured in env. Logged to container console.\n");
      
      return res.json({ success: true, method: "simulated" });
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
});

// Setup Vite Development Middleware or Production Static Serve
const startViteAndConnect = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production state
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] DIGIZORT Server running on code http://localhost:${PORT}`);
  });
};

startViteAndConnect().catch((err) => {
  console.error("Failed to start server:", err);
});
