import { PAYMENT_CATEGORIES } from "./mockData";

export default function SettingsPanel() {
  return (
    <section className="pxp-settings">
      <div className="pxp-settings-head">
        <div>
          <div className="pxp-dashboard-kicker">Settings</div>
          <h2 className="pxp-dashboard-title">Setari aplicatie</h2>
        </div>
      </div>

      <div className="pxp-settings-grid">
        <div className="pxp-settings-card">
          <div className="pxp-settings-card-head">
            <div>
              <h3>Categorii plati</h3>
              <p>
                Momentan categoriile sunt definite in cod. Urmatorul pas este sa
                le mutam in DB ca sa le poti edita direct de aici.
              </p>
            </div>
          </div>

          <div className="pxp-settings-category-list">
            {PAYMENT_CATEGORIES.map((category) => (
              <div key={category} className="pxp-settings-category-row">
                <span>{category}</span>
                <small>activ</small>
              </div>
            ))}
          </div>
        </div>

        <div className="pxp-settings-card">
          <div className="pxp-settings-card-head">
            <div>
              <h3>WhatsApp reminders</h3>
              <p>
                Aici vom adauga setarile pentru ora reminderului, ce tipuri de
                evenimente intra in mesaj si reminders pentru birthdays.
              </p>
            </div>
          </div>

          <div className="pxp-settings-placeholder">
            Urmatorul modul dupa categorii.
          </div>
        </div>
      </div>
    </section>
  );
}
