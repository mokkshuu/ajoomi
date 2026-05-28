import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDAllZ1MOq0WTz10K7lnuZhsGFHb3Fmu8",
  authDomain: "ajoomi-website.firebaseapp.com",
  projectId: "ajoomi-website",
  storageBucket: "ajoomi-website.firebasestorage.app",
  messagingSenderId: "629260146414",
  appId: "1:629260146414:web:a18e7a6f4cef49483845ff"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

console.log("✅ Firebase connected — ajoomi-website");

// =============================================
//  FUNCTION 1: App launch notify
//  — "Download App" popup ka Notify Me button
// =============================================
async function submitNotify(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  if (event && typeof event.stopPropagation === "function") event.stopPropagation();

  const emailInput = document.getElementById("notifyEmail");
  const email      = emailInput ? emailInput.value.trim() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    alert("❌ Please enter a valid email address.");
    return;
  }

  const btn = document.querySelector("#appPopup .notify-box button");
  if (btn) { btn.textContent = "Saving..."; btn.disabled = true; }

  try {
    const docRef = await addDoc(collection(db, "launch_subscribers"), {
      email:        email,
      subscribedAt: serverTimestamp(),
      source:       "app_popup"
    });
    console.log("✅ launch_subscribers — saved ID:", docRef.id);
    alert("🚀 Done! We will notify you at " + email + " when the app launches.");
    if (emailInput) emailInput.value = "";

  } catch (error) {
    console.error("🔥 Firebase write error:", error.code, error.message);
    alert("⚠️ Error saving: " + error.message);

  } finally {
    if (btn) { btn.textContent = "Notify Me"; btn.disabled = false; }
  }
}

// =============================================
//  FUNCTION 2: City launch notify
//  — Non-live city select hone par popup ka button
// =============================================
async function submitCityNotify(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  if (event && typeof event.stopPropagation === "function") event.stopPropagation();

  const emailInput = document.getElementById("cityNotifyEmail");
  const email      = emailInput ? emailInput.value.trim() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    alert("❌ Please enter a valid email address.");
    return;
  }

  const stateEl = document.getElementById("stateSelect");
  const cityEl  = document.getElementById("citySelect");
  const areaEl  = document.getElementById("areaSelect");

  const stateName = stateEl?.options[stateEl.selectedIndex]?.text?.replace(" ✅", "").trim() || "";
  const cityName  = cityEl?.options[cityEl.selectedIndex]?.text?.replace(" ✅", "").trim()  || "";
  const areaName  = areaEl?.value || "";

  const btn = document.getElementById("cityNotifyBtn");
  if (btn) { btn.textContent = "Saving..."; btn.disabled = true; }

  try {
    // Duplicate check — same email + same city already saved nahi hona chahiye
    const q    = query(
      collection(db, "city_notifications"),
      where("email", "==", email),
      where("city",  "==", cityName)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("✅ You're already on our list for " + cityName + "! We'll notify you when we launch.");
      if (typeof window.closePopup === "function") window.closePopup("cityNotifyPopup");
      return;
    }

    const docRef = await addDoc(collection(db, "city_notifications"), {
      email:     email,
      state:     stateName,
      city:      cityName,
      area:      areaName,
      timestamp: serverTimestamp(),
      source:    "city_selector"
    });
    console.log("✅ city_notifications — saved ID:", docRef.id);
    alert("🎉 Done! We'll notify you at " + email + " when Ajoomi launches in " + cityName + ".");
    if (emailInput) emailInput.value = "";
    if (typeof window.closePopup === "function") window.closePopup("cityNotifyPopup");

  } catch (error) {
    console.error("🔥 City notify error:", error.code, error.message);
    // Still give positive UX even if error
    alert("🎉 Thanks! We'll notify you when we launch in " + cityName + ".");
    if (typeof window.closePopup === "function") window.closePopup("cityNotifyPopup");

  } finally {
    if (btn) { btn.textContent = "Notify Me"; btn.disabled = false; }
  }
}

// =============================================
//  WINDOW PE REGISTER KARO — FORCE OVERRIDE
//  script.js ke baad firebase.js load hota hai
//  isliye window.load pe set karna zaroori hai
// =============================================
window.submitNotify     = submitNotify;
window.submitCityNotify = submitCityNotify;

window.addEventListener("load", function () {
  window.submitNotify     = submitNotify;
  window.submitCityNotify = submitCityNotify;
  console.log("✅ submitNotify & submitCityNotify — firebase.js se registered");
});