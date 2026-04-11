# 📅 pxpcalendar

Aplicatie web + mobile (responsive) pentru management de evenimente + taskuri + plati + reminder WhatsApp.

---

## 🚀 Scopul proiectului

pxpcalendar este o aplicatie personală de tip calendar avansat care:

- organizeaza evenimente zilnice
- separa clar tipurile de activitati
- trimite reminder automat pe WhatsApp
- gestioneaza platile si statusul lor
- permite tracking pentru lucruri nefinalizate (pending)

---

## 🧠 Concept general

Aplicatia este inspirata din:

- Google Calendar (UI/UX)
- iOS design (dark mode)
- To-do apps (task management)
- Payment tracking apps

👉 Diferenta majora:

- focus pe organizare reala zilnica + notificari WhatsApp automate

---

## 🎨 UI / UX

### Stil general:

- iOS Dark UI
- minimal
- clean
- mobile-first
- trebuie sa arate identic ca experienta pe:
  - desktop
  - mobile

---

## 📱 Layout principal

### Header:

- titlu: pxpcalendar
- selectare an
- toggle: Grid / List view

### Navigare luni:

- taburi scrollabile (Ian, Feb, Mar...)
- selectare luna activa

### Stats (sus, vizibil mereu):

- 💰 Plătit deja
- 💸 Mai ai de plătit

---

## 📆 Tipuri de view

### 1. Grid View

- calendar clasic (7 coloane)
- fiecare zi contine evenimente
- doar zilele din luna selectata

### 2. List View

- lista cu zilele din luna
- fiecare zi cu evenimentele ei

---

## 🧩 Tipuri de evenimente

Fiecare eveniment trebuie sa aiba:

### 1. Task

- lucruri de facut
- ex: cumparaturi, curatenie

### 2. Event

- evenimente unde trebuie sa mergi
- ex: dentist, tuns, shooting

### 3. Pay

- plati (facturi, rate)
- contine suma obligatoriu

### 4. Birthday

- zile de nastere
- notificari cu X zile inainte

---

## 🎯 Functionalitati per tip

### Task

- mark complete
- pending daca nu e completat

### Event

- ora specifica sau all-day
- optional locatie

### Pay

- suma de plata
- status:
  - paid
  - unpaid

- contribuie la:
  - total platit
  - total de platit

### Birthday

- notificari:
  - 7 zile inainte
  - 5 zile
  - 3 zile
  - 1 zi

---

## 🔁 Repeat system

Evenimentele pot avea:

- Does not repeat
- Every day
- Every week
- Every month
- Every year
- Custom:
  - ex: every 2 weeks
  - ex: on 30 every month

👉 Custom trebuie sa deschida modal separat

---

## ⏰ Reminder system

### WhatsApp automation:

Se trimite mesaj:

- o data pe zi
- doar daca exista evenimente

### Important:

- reminder principal: **cu o zi inainte la ora 22:00 (Romania)**

### Pending system:

- daca nu completezi un task:
  - continua sa apara in reminder

- configurabil:
  - zilnic
  - sau la urmatorul eveniment

---

## 📍 Locatie (optional)

Pentru evenimente:

- poti adauga locatie
- daca exista:
  - trimite link in WhatsApp

---

## 🎨 Culori

Fiecare tip are culoare default:

- Task → albastru
- Event → verde
- Pay → rosu
- Birthday → mov

* posibilitate:

- custom color (paleta + HSL picker)

---

## 📊 Payment tracking

Sus in UI:

- total platit
- total ramas

Se calculeaza din:

- toate evenimentele de tip Pay

---

## 🧪 MVP (status actual)

✅ Creat event
✅ Salvare in DB (Supabase)
✅ Cron job Vercel
✅ WhatsApp API functional
✅ Reminder zilnic
✅ UI basic

---

## 🛠️ Stack tehnic

- Next.js (App Router)
- TypeScript
- Supabase (DB)
- Vercel (deploy + cron)
- WhatsApp Cloud API

---

## 📂 Structura proiect

```
app/
  api/
    cron/
    events/
    whatsapp/
  components/
  lib/
  styles/

lib/
  db.ts

data/
```

---

## ⚠️ Probleme cunoscute

- UI nu este complet responsive
- Grid pe mobil trebuie optimizat
- modaluri nu sunt full-width
- custom repeat nu functioneaza complet
- layout uneori iese din bounds

---

## 🧭 Roadmap dezvoltare

### Faza 1 – UI core (ACUM)

- [ ] responsive fix (mobile-first)
- [ ] grid optimizat
- [ ] header compact
- [ ] modal full width (bottom sheet)
- [ ] list view finalizat

---

### Faza 2 – Event system

- [ ] create/edit/delete
- [ ] repeat system complet
- [ ] custom repeat UI
- [ ] pending logic

---

### Faza 3 – Payments

- [ ] suma obligatorie pentru pay
- [ ] tracking corect
- [ ] UI summary

---

### Faza 4 – WhatsApp advanced

- [ ] template custom
- [ ] pending reminders logic
- [ ] locatie + link

---

### Faza 5 – UX polish

- [ ] animatii
- [ ] swipe gestures (mobile)
- [ ] micro-interactions
- [ ] loading states

---

## 🔮 Functionalitati viitoare

- push notifications (optional)
- sync Google Calendar
- export PDF
- categorii custom
- multi-user / sharing
- dashboard analytics

---

## 🧑‍💻 Mod de lucru

Reguli:

- UI first
- mobile-first
- cod modular (NU fisiere de 1000+ linii)
- fiecare component separat
- rebuild o singura data la final

---

## 📌 Nota importanta

Acest proiect trebuie sa fie:

👉 simplu de folosit zilnic
👉 rapid
👉 fara clutter
👉 orientat pe utilitate reala

---

## 💡 Obiectiv final

Sa devina:

👉 tool principal de organizare zilnica
👉 reminder system real pe WhatsApp
👉 alternativa mai smart la Google Calendar

---
