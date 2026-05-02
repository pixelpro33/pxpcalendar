export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09090d",
        color: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section style={{ maxWidth: 760, margin: "0 auto", lineHeight: 1.7 }}>
        <h1>Privacy Policy</h1>

        <p>Last updated: May 2026</p>

        <p>
          PXP Calendar is a personal calendar and finance tracking application
          used to manage events, tasks, payments, expenses, income and WhatsApp
          reminders.
        </p>

        <h2>Data we collect</h2>
        <p>
          The application may store calendar events, tasks, payment reminders,
          expense records, income records, categories, notes, dates, amounts and
          WhatsApp reminder settings.
        </p>

        <h2>How we use the data</h2>
        <p>
          The data is used only to display the calendar, calculate financial
          summaries, generate dashboard statistics and send personal WhatsApp
          reminders configured by the user.
        </p>

        <h2>WhatsApp messages</h2>
        <p>
          If WhatsApp reminders are enabled, the application sends reminder
          messages to the phone number configured by the user. These messages
          may include upcoming events, pending payments, recent expenses,
          monthly income and estimated cashflow.
        </p>

        <h2>Data sharing</h2>
        <p>
          We do not sell personal data. Data may be processed by the hosting,
          database and messaging providers required for the application to
          function, such as Vercel, Supabase and Meta WhatsApp Cloud API.
        </p>

        <h2>Data retention</h2>
        <p>
          Data is kept as long as the application is used. The user may delete
          events, expenses, income records and settings from the application.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, contact the application owner at:
          contact@pixelpro.ro
        </p>
      </section>
    </main>
  );
}
