/* =============================================
   AJOOMI – script.js  (all devices fixed)
   ============================================= */

"use strict";

/* =============================================
   LOADER
   ============================================= */
window.addEventListener("load", function () {
  var loader = document.getElementById("loader");
  if (loader) loader.classList.add("hide"); // FIX 4: removed arbitrary 1600ms timeout — hides on actual load
});

/* =============================================
   MOBILE MENU
   ============================================= */
var hamburger = document.getElementById("hamburger");
var navMenu   = document.getElementById("nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", function () {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("open");
    var isOpen = navMenu.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navMenu.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("active");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("click", function (e) {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navMenu.classList.remove("active");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

/* =============================================
   SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    var targetId = this.getAttribute("href");
    if (!targetId || targetId === "#") return;
    var section = document.querySelector(targetId);
    if (!section) return;
    e.preventDefault();
    var navbarHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-height").trim()
    ) || 72;
    var offset = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 8;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

/* =============================================
   FIX 5: MERGED SCROLL LISTENERS — was two separate listeners, now one
   (progress bar + back-to-top + navbar scrolled + active nav link)
   ============================================= */
var scrollBar = document.getElementById("scrollBar");
var backToTop = document.getElementById("backToTop");
var navbar    = document.getElementById("navbar");
var sections  = document.querySelectorAll("section[id]");
var navLinks  = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", function () {
  // Progress bar
  if (scrollBar) {
    var scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    scrollBar.style.width = Math.min(scrolled, 100) + "%";
  }

  // Back to top button
  if (backToTop) {
    if (window.scrollY > 400) backToTop.classList.add("show");
    else backToTop.classList.remove("show");
  }

  // Navbar scrolled state
  if (navbar) {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }

  // Active nav link
  var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 72;
  var current = "";
  sections.forEach(function (section) {
    if (window.scrollY >= section.offsetTop - navH - 60) {
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach(function (link) {
    link.classList.remove("active-link");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active-link");
    }
  });
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
var faders = document.querySelectorAll(".fade-in");
var appearOnScroll = new IntersectionObserver(
  function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.10 }
);
faders.forEach(function (fader, index) {
  fader.style.transitionDelay = (index * 70) + "ms";
  appearOnScroll.observe(fader);
});

/* =============================================
   COUNTER ANIMATION
   ============================================= */
var countersStarted = false;

function animateCounter(el, target, suffix) {
  var duration = 1800, startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

var statsSection = document.getElementById("statsSection");
if (statsSection) {
  var statsObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      document.querySelectorAll("[data-count]").forEach(function (el) {
        animateCounter(el, parseInt(el.dataset.count), el.dataset.suffix || "");
      });
    }
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}

/* =============================================
   FAQ ACCORDION
   ============================================= */
function toggleFaq(questionEl) {
  var item = questionEl.parentElement;
  var isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
    openItem.classList.remove("open");
  });
  if (!isOpen) item.classList.add("open");
}
window.toggleFaq = toggleFaq;

// FIX 4: FAQ keyboard accessibility — Enter/Space now toggles FAQ
document.querySelectorAll(".faq-question").forEach(function (el) {
  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFaq(el);
    }
  });
});

/* =============================================
   SERVICE CARD FLIP
   FIX 4: touchend bug — use changedTouches[0] (not touches[0], which is empty on touchend)
   ============================================= */
document.querySelectorAll(".service-card").forEach(function (card) {
  var touchStartY = 0;

  card.addEventListener("touchstart", function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  card.addEventListener("touchend", function (e) {
    if (e.target.classList.contains("book-now-btn")) return;
    // FIX: always use changedTouches[0] on touchend — touches[0] is always empty here
    var touchEndY = e.changedTouches[0].clientY;
    var yDiff = Math.abs(touchStartY - touchEndY);
    if (yDiff < 10) {
      e.preventDefault();
      card.classList.toggle("flipped");
    }
  });

  card.addEventListener("click", function (e) {
    if (e.target.classList.contains("book-now-btn")) return;
    var hasHover = window.matchMedia("(hover: hover)").matches;
    if (hasHover) {
      card.classList.toggle("flipped");
    }
  });
});

// Book Now → Coming Soon popup
document.querySelectorAll(".book-now-btn").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    openAppPopup();
  });
});

/* =============================================
   DARK MODE
   ============================================= */
var themeToggle = document.getElementById("themeToggle");

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  if (!themeToggle) return;
  var icon = themeToggle.querySelector("i");
  if (!icon) return;
  icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

var savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  applyTheme(true);
} else {
  applyTheme(false);
}

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    var isDark = !document.body.classList.contains("dark-mode");
    applyTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

/* =============================================
   POPUP SYSTEM
   ============================================= */
function openPopup(id) {
  var popup = document.getElementById(id);
  if (!popup) return;
  popup.style.display = "flex";
  requestAnimationFrame(function () {
    popup.style.opacity = "1";
  });
  document.body.style.overflow = "hidden";
}

function closePopup(id) {
  var popup = document.getElementById(id);
  if (!popup) return;
  popup.style.display = "none";
  popup.style.opacity = "";
  var anyOpen = Array.from(
    document.querySelectorAll(".popup, .app-popup-overlay")
  ).some(function (p) { return p.style.display === "flex"; });
  if (!anyOpen) document.body.style.overflow = "";
}

document.querySelectorAll(".popup, .app-popup-overlay").forEach(function (popup) {
  popup.addEventListener("click", function (e) {
    if (e.target === popup) closePopup(popup.id);
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".popup, .app-popup-overlay").forEach(function (p) {
      if (p.style.display === "flex") closePopup(p.id);
    });
  }
});

window.openPopup         = openPopup;
window.closePopup        = closePopup;
window.openAbout         = function () { openPopup("aboutPopup"); };
window.openBlog          = function () { openPopup("blogPopup"); };
window.openCareers       = function () { openPopup("careersPopup"); };
window.openHelp          = function () { openPopup("helpPopup"); };
window.openTerms         = function () { openPopup("termsPopup"); };
window.openPrivacy       = function () { openPopup("privacyPopup"); };
window.openLogin         = function () { openPopup("loginPopup"); };
window.openAppPopup      = function () { openPopup("appPopup"); };
window.openPartnerChoice = function () { openPopup("partnerChoicePopup"); };
window.openBooking       = function () { openPopup("appPopup"); };

/* =============================================
   FORM SUBMISSIONS
   ============================================= */
window.submitBooking = function () {
  var name    = (document.getElementById("bookingName")    || {}).value || "";
  var phone   = (document.getElementById("bookingPhone")   || {}).value || "";
  var service = (document.getElementById("bookingService") || {}).value || "";
  if (!name.trim() || !phone.trim() || !service) {
    alert("Please fill in your name, phone number, and select a service.");
    return;
  }
  alert("✅ Booking confirmed! We will contact you at " + phone.trim() + " shortly.");
  closePopup("bookingPopup");
  ["bookingName","bookingPhone","bookingService","bookingAddress"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
};

window.submitPartner = function () {
  var name  = (document.getElementById("partnerName")  || {}).value || "";
  var phone = (document.getElementById("partnerPhone") || {}).value || "";
  if (!name.trim() || !phone.trim()) {
    alert("Please enter your name and phone number.");
    return;
  }
  alert("🎉 Thank you, " + name.trim() + "! We will get in touch with you soon.");
  closePopup("loginPopup");
  ["partnerName","partnerPhone","partnerService"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
};



/* =============================================
   RIPPLE EFFECT ON BUTTONS
   ============================================= */
document.querySelectorAll(".btn").forEach(function (button) {
  button.addEventListener("click", function (e) {
    var ripple = document.createElement("span");
    ripple.classList.add("ripple");
    var rect = button.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + "px";
    ripple.style.top  = (e.clientY - rect.top)  + "px";
    button.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 650);
  });

  /* =============================================
   HOW IT WORKS
============================================= */

(function () {
  var hiwSection = document.getElementById("how-it-works");
  if (!hiwSection) return;

  var fills   = [0, 33, 66, 100];
  var started = false;

  function activateStep(i) {
    for (var j = 0; j < 4; j++) {
      var bubble = document.getElementById("bubble" + j);
      var card   = document.getElementById("card" + j);
      var tag    = document.getElementById("tag" + j);
      if (!bubble || !card || !tag) continue;
      if (j <= i) {
        bubble.classList.add("active");
        card.classList.add("active");
        tag.classList.add("active-tag");
      } else {
        bubble.classList.remove("active");
        card.classList.remove("active");
        tag.classList.remove("active-tag");
      }
    }
    var fill = document.getElementById("hiwFill");
    if (fill) fill.style.width = fills[i] + "%";
  }

  function runSequence() {
    var delay = 300;
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        setTimeout(function () { activateStep(idx); }, delay);
      })(i);
      delay += 480;
    }
  }

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !started) {
      started = true;
      runSequence();
    }
  }, { threshold: 0.25 });

  observer.observe(hiwSection);
})();
});

var cityData = {
  chhattisgarh: { label: "Chhattisgarh", cities: {
    raipur: { label: "Raipur", live: true, areas: ["Amanaka","Avanti Vihar","Bhatagaon","Byron Bazar","Civil Lines","Daulatpur","Devendra Nagar","Fafadih","GE Road","Gudhiyari","Hirapur","Kankali Para","Katora Talab","Khamhardih","Kumhari","Labhandi","Lalpur","Mana","Mana Camp","Mandir Hasaud","Mowa","New Rajendra Nagar","Pachpedi Naka","Pandri","Purani Basti","Rajendra Nagar","Ram Nagar","Samta Colony","Sanjay Nagar","Shankar Nagar","Smriti Nagar","Station Road","Tatibandh","Telibandha","Tikrapara","Urla","VIP Road","Vrindavan Nagar"] },
    bilaspur: { label: "Bilaspur", areas: ["Sarkanda","Vyapar Vihar","Torwa","Mangla","Link Road","Gole Bazar","Sadar Bazar","Tifra","Nehru Nagar","Rajkishore Nagar","Talapara","Mohan Nagar"] },
    korba: { label: "Korba", areas: ["Darri","Balco","Kusmunda","Transport Nagar","Urga","Power House Road","Nehru Nagar","Indira Nagar","Sector 4","Sector 6"] },
    durg: { label: "Durg", areas: ["Supela","Risali","Civic Centre","Camp 2","Smriti Nagar","Jamul","Kumhari","Ganesh Nagar"] },
    bhilai: { label: "Bhilai", areas: ["Sector 1","Sector 2","Sector 4","Sector 6","Sector 7","Sector 9","Sector 10","Akashganga","Nehru Nagar","Hudco","Ruabandha","Vaishali Nagar"] },
    rajnandgaon: { label: "Rajnandgaon", areas: ["Gandhi Chowk","Rajiv Nagar","Station Road","Chhuriya","Dongargaon"] },
    raigarh: { label: "Raigarh", areas: ["Sadar Bazar","Station Road","Chakradharnagar","Lailunga"] },
    jagdalpur: { label: "Jagdalpur", areas: ["Dharampura","Tikrapara","Sadar Bazar","Indravati Nagar","Lalbag"] },
    ambikapur: { label: "Ambikapur", areas: ["Gandhi Nagar","Station Road","New Colony","Medical College Road"] }
  }},
  mp: { label: "Madhya Pradesh", cities: {
    bhopal: { label: "Bhopal", areas: ["Arera Colony","Bairagarh","Govindpura","Habibganj","Kolar Road","Kohefiza","Lalghati","MP Nagar","Malviya Nagar","New Market","Piplani","Shivaji Nagar","Shyamla Hills","TT Nagar","Tulsi Nagar","Vaishali Nagar"] },
    indore: { label: "Indore", areas: ["AB Road","Annapurna","Bhanwarkuan","Chandan Nagar","Geeta Bhawan","Kanadia Road","Khajrana","LIG","MG Road","Palasia","Pardesipura","Rajendra Nagar","Rau","Sapna Sangeeta","Scheme 78","Silicon City","Sukhliya","Vijay Nagar"] },
    jabalpur: { label: "Jabalpur", areas: ["Adhartal","Civil Lines","Gorakhpur","Katni Road","Madan Mahal","Napier Town","Ranjhi","Vijay Nagar","Wright Town"] },
    gwalior: { label: "Gwalior", areas: ["Lashkar","Morar","Thatipur","City Centre","Kamla Nagar","Padav"] },
    ujjain: { label: "Ujjain", areas: ["Freeganj","Mahakal Area","Nanakheda","Dewas Road","Vikramaditya"] },
    sagar: { label: "Sagar", areas: ["Civil Lines","Makronia","Tili","Subhash Ward"] }
  }},
  maharashtra: { label: "Maharashtra", cities: {
    mumbai: { label: "Mumbai", areas: ["Andheri East","Andheri West","Bandra East","Bandra West","Borivali","Chembur","Colaba","Dadar","Ghatkopar","Goregaon","Juhu","Kandivali","Kurla","Lower Parel","Malad","Mulund","Powai","Santacruz","Thane","Vikhroli","Worli"] },
    pune: { label: "Pune", areas: ["Aundh","Baner","Bavdhan","Deccan","Hadapsar","Hinjewadi","Kharadi","Koregaon Park","Kothrud","Magarpatta","Pimpri","Shivajinagar","Viman Nagar","Wakad","Warje"] },
    nagpur: { label: "Nagpur", areas: ["Ambazari","Bajaj Nagar","Dharampeth","Gandhibagh","Hanuman Nagar","Itwari","Laxmi Nagar","Manewada","Nandanvan","Pratap Nagar","Sadar","Sitabuldi"] },
    nashik: { label: "Nashik", areas: ["Ambad","Canada Corner","Gangapur Road","Indira Nagar","Satpur","Trimbak Road"] },
    thane: { label: "Thane", areas: ["Balkum","Ghodbunder Road","Hiranandani","Kopri","Manpada","Wagle Estate"] },
    aurangabad: { label: "Aurangabad", areas: ["Cidco","Garkheda","Osmanpura","Padegaon","Waluj"] }
  }},
  delhi: { label: "Delhi NCR", cities: {
    delhi: { label: "New Delhi", areas: ["Connaught Place","Daryaganj","Dwarka","Hauz Khas","Janakpuri","Karol Bagh","Lajpat Nagar","Laxmi Nagar","Mayur Vihar","Nehru Place","Paharganj","Pitampura","Rohini","Saket","Shahdara","South Extension","Vasant Kunj","Vikaspuri"] },
    noida: { label: "Noida", areas: ["Sector 15","Sector 18","Sector 22","Sector 27","Sector 44","Sector 50","Sector 62","Sector 63","Sector 76","Sector 100","Sector 120","Sector 137","Expressway"] },
    gurgaon: { label: "Gurgaon", areas: ["Cyber City","DLF Phase 1","DLF Phase 2","DLF Phase 3","Golf Course Road","Huda City Centre","MG Road","Palam Vihar","Sector 14","Sector 29","Sector 45","Sohna Road","Udyog Vihar"] },
    faridabad: { label: "Faridabad", areas: ["Sector 11","Sector 14","Sector 16","NIT","Old Faridabad","Neharpar"] },
    ghaziabad: { label: "Ghaziabad", areas: ["Indirapuram","Vaishali","Kaushambi","Raj Nagar","Mohan Nagar","Sahibabad"] }
  }},
  up: { label: "Uttar Pradesh", cities: {
    lucknow: { label: "Lucknow", areas: ["Aliganj","Alambagh","Aminabad","Ashiyana","Charbagh","Gomti Nagar","Hazratganj","Indira Nagar","Jankipuram","Mahanagar","Rajajipuram","Vikas Nagar"] },
    kanpur: { label: "Kanpur", areas: ["Arya Nagar","Civil Lines","Dabauli","Govind Nagar","Kakadeo","Kidwai Nagar","Naveen Market"] },
    agra: { label: "Agra", areas: ["Tajganj","Sikandra","Kamla Nagar","Bodla","Khandari","Shahganj"] },
    varanasi: { label: "Varanasi", areas: ["Assi","Godaulia","Lanka","Mahmoorganj","Nadesar","Sigra"] },
    prayagraj: { label: "Prayagraj", areas: ["Civil Lines","George Town","Kareli","Naini","Tagore Town"] },
    meerut: { label: "Meerut", areas: ["Abhay Khand","Brahmpuri","Cantonment","Gandhi Nagar","Pallavpuram","Shastri Nagar"] }
  }},
  rajasthan: { label: "Rajasthan", cities: {
    jaipur: { label: "Jaipur", areas: ["Ajmer Road","Bapu Nagar","C Scheme","Civil Lines","Jagatpura","Malviya Nagar","Mansarovar","Raja Park","Sanganer","Tonk Road","Vaishali Nagar"] },
    jodhpur: { label: "Jodhpur", areas: ["Bhagat Ki Kothi","Chopasni Housing Board","Paota","Ratanada","Shastri Nagar","Sardarpura"] },
    udaipur: { label: "Udaipur", areas: ["Fatehpura","Hiran Magri","Madhuban","Pratap Nagar","Shobhagpura","Sukhadia Circle"] },
    kota: { label: "Kota", areas: ["Dadabari","Gumanpura","Jawahar Nagar","Rangpur","Talwandi","Vigyan Nagar"] },
    ajmer: { label: "Ajmer", areas: ["Adarsh Nagar","Anasagar","Kishangarh","Madar","Vaishali Nagar"] }
  }},
  gujarat: { label: "Gujarat", cities: {
    ahmedabad: { label: "Ahmedabad", areas: ["Ambawadi","Bopal","CG Road","Gota","Jodhpur","Maninagar","Naranpura","Navrangpura","Paldi","Prahlad Nagar","Satellite","Thaltej","Vastrapur"] },
    surat: { label: "Surat", areas: ["Adajan","Althan","Dumas","Katargam","Nanpura","Rander","Varachha","Vesu"] },
    vadodara: { label: "Vadodara", areas: ["Alkapuri","Fatehgunj","Gotri","Manjalpur","Sama","Vasna"] },
    rajkot: { label: "Rajkot", areas: ["150 Feet Ring Road","Aji Dam","Kalawad Road","Kotecha Nagar","Mavdi","Raiya Road"] }
  }},
  karnataka: { label: "Karnataka", cities: {
    bangalore: { label: "Bangalore", areas: ["BTM Layout","Basavanagudi","Bellandur","Domlur","Electronic City","Hebbal","HSR Layout","Indiranagar","Jayanagar","JP Nagar","Koramangala","Marathahalli","Rajajinagar","Sarjapur","Whitefield","Yelahanka"] },
    mysore: { label: "Mysore", areas: ["Hebbal","Jayalakshmipuram","Kuvempunagar","Nazarbad","Saraswathipuram","Vijayanagar"] },
    hubli: { label: "Hubli", areas: ["Deshpande Nagar","Gokul Road","Keshwapur","Navanagar","Vidyanagar"] },
    mangalore: { label: "Mangalore", areas: ["Attavar","Bejai","Bunder","Kadri","Kankanady","Pandeshwar"] }
  }},
  tamilnadu: { label: "Tamil Nadu", cities: {
    chennai: { label: "Chennai", areas: ["Adyar","Anna Nagar","Besant Nagar","Chromepet","Egmore","Guindy","Kilpauk","Kodambakkam","Mylapore","Nungambakkam","Perambur","Porur","T Nagar","Tambaram","Velachery"] },
    coimbatore: { label: "Coimbatore", areas: ["Gandhipuram","Kavundampalayam","Peelamedu","Podanur","RS Puram","Saibaba Colony","Singanallur"] },
    madurai: { label: "Madurai", areas: ["Anna Nagar","KK Nagar","Mattuthavani","Palanganatham","Tallakulam","Vishalnagar"] },
    trichy: { label: "Trichy", areas: ["Ariyamangalam","Cantonment","Golden Rock","KK Nagar","Srirangam","Thillai Nagar"] }
  }},
  telangana: { label: "Telangana", cities: {
    hyderabad: { label: "Hyderabad", areas: ["Ameerpet","Banjara Hills","Gachibowli","Hitech City","Jubilee Hills","Kondapur","Kukatpally","LB Nagar","Madhapur","Mehdipatnam","Miyapur","Secunderabad","SR Nagar","Uppal"] },
    warangal: { label: "Warangal", areas: ["Hanamkonda","Kazipet","Khammam Road","Lashkar Bazar","Subedari"] },
    nizamabad: { label: "Nizamabad", areas: ["Bodhan","Dichpally","Jakranpally","Varni"] }
  }},
  ap: { label: "Andhra Pradesh", cities: {
    visakhapatnam: { label: "Visakhapatnam", areas: ["Dwaraka Nagar","Gajuwaka","MVP Colony","Madhurawada","Rushikonda","Seethammadhara","Steel Plant"] },
    vijayawada: { label: "Vijayawada", areas: ["Auto Nagar","Benz Circle","Gandhi Nagar","Governorpet","MG Road","Patamata"] },
    guntur: { label: "Guntur", areas: ["Arundelpet","Brodipet","Nagarampalem","Pattabhipuram","Syamalanagar"] },
    tirupati: { label: "Tirupati", areas: ["Balaji Nagar","Gandhi Road","KT Road","Mangalam","RC Road"] }
  }},
  kerala: { label: "Kerala", cities: {
    kochi: { label: "Kochi", areas: ["Aluva","Edappally","Ernakulam","Fort Kochi","Kakkanad","Kalamassery","Palarivattom","Thrippunithura","Vyttila"] },
    thiruvananthapuram: { label: "Thiruvananthapuram", areas: ["Kazhakkoottam","Kesavadasapuram","Pattom","Sasthamangalam","Technopark","Kowdiar"] },
    kozhikode: { label: "Kozhikode", areas: ["Arayidathupalam","Calicut Beach","Chevayur","Nadakkavu","Palayam","Vellimadukunnu"] },
    thrissur: { label: "Thrissur", areas: ["Ayyanthole","Kuriachira","Ollur","Poothole","Punkunnam","Swaraj Round"] }
  }},
  wb: { label: "West Bengal", cities: {
    kolkata: { label: "Kolkata", areas: ["Ballygunge","Behala","Dum Dum","Gariahat","Jadavpur","Jodhpur Park","Lake Town","New Alipore","Park Circus","Park Street","Salt Lake","Shyambazar","Tollygunge"] },
    howrah: { label: "Howrah", areas: ["Andul","Bally","Domjur","Liluah","Shibpur","Sankrail"] },
    durgapur: { label: "Durgapur", areas: ["Benachity","Bidhannagar","City Centre","Nachan Road","Sector 2","Steel Township"] },
    siliguri: { label: "Siliguri", areas: ["Bagdogra","Dabgram","Hakimpara","Matigara","Pradhan Nagar","Sevoke Road"] }
  }},
  bihar: { label: "Bihar", cities: {
    patna: { label: "Patna", areas: ["Boring Road","Dakbungalow","Exhibition Road","Kankarbagh","Patliputra","Rajendra Nagar","Sheikhpura"] },
    gaya: { label: "Gaya", areas: ["Bodh Gaya","Civil Lines","Delha","Kotwali","Rampur"] },
    muzaffarpur: { label: "Muzaffarpur", areas: ["Aghoria Bazar","Brahmpura","Juran Chapra","Mithanpura","Saraiyaganj"] }
  }},
  jharkhand: { label: "Jharkhand", cities: {
    ranchi: { label: "Ranchi", areas: ["Bariatu","Booty More","Doranda","HEC","Lalpur","Morabadi","Ratu Road"] },
    jamshedpur: { label: "Jamshedpur", areas: ["Adityapur","Bistupur","Jugsalai","Kadma","Mango","Sakchi","Telco"] },
    dhanbad: { label: "Dhanbad", areas: ["Bartand","Hirapur","Jharia","Katras","Loyabad","Sindri"] }
  }},
  odisha: { label: "Odisha", cities: {
    bhubaneswar: { label: "Bhubaneswar", areas: ["Acharya Vihar","Ashok Nagar","BJB Nagar","Chandrasekharpur","IRC Village","Nayapalli","Saheed Nagar","Unit 4","Vani Vihar"] },
    cuttack: { label: "Cuttack", areas: ["Badambadi","Bijipur","Cantonment","Link Road","Mangalabag","Telenga Bazar"] },
    rourkela: { label: "Rourkela", areas: ["Birsa Nagar","Civil Township","Chhend Colony","Fertilizer Township","Koel Nagar","Panposh"] }
  }},
  punjab: { label: "Punjab", cities: {
    chandigarh: { label: "Chandigarh", areas: ["Sector 7","Sector 8","Sector 9","Sector 10","Sector 15","Sector 17","Sector 22","Sector 34","Sector 35","Sector 43","Mohali","Panchkula"] },
    ludhiana: { label: "Ludhiana", areas: ["BRS Nagar","Civil Lines","Dugri","Gurdev Nagar","Model Town","Sarabha Nagar"] },
    amritsar: { label: "Amritsar", areas: ["Batala Road","Green Avenue","Lawrence Road","Majitha Road","Ranjit Avenue","Sultanwind"] },
    jalandhar: { label: "Jalandhar", areas: ["Basti Bawa Khel","Civil Lines","Model Town","Nakodar Road","Rama Mandi","Urban Estate"] }
  }},
  haryana: { label: "Haryana", cities: {
    ambala: { label: "Ambala", areas: ["Ambala Cantonment","Ambala City","Baldev Nagar","Model Town","Nicholson Road"] },
    hisar: { label: "Hisar", areas: ["Aggarsain Chowk","Civil Lines","Model Town","Red Square Market","Urban Estate"] },
    rohtak: { label: "Rohtak", areas: ["Civil Lines","Delhi Road","Model Town","Subhash Nagar","Sunaria Road"] },
    panipat: { label: "Panipat", areas: ["Devi Nagar","GT Road","Model Town","Partap Nagar","Sanjay Colony"] }
  }},
  uttarakhand: { label: "Uttarakhand", cities: {
    dehradun: { label: "Dehradun", areas: ["Ballupur","Clement Town","ISBT","Jakhan","Patel Nagar","Race Course","Rajpur Road","Sahastradhara Road"] },
    haridwar: { label: "Haridwar", areas: ["Bhimgoda","BHEL Ranipur","Jwalapur","Kankhal","Raiwala","Roorkee"] },
    rishikesh: { label: "Rishikesh", areas: ["Badrinath Road","Haridwar Road","Laxman Jhula","Muni Ki Reti","Ram Jhula","Swarg Ashram"] }
  }},
  assam: { label: "Assam", cities: {
    guwahati: { label: "Guwahati", areas: ["Ambari","Bhangagarh","Dispur","Ganeshguri","Geetanagar","Jalukbari","Pan Bazar","Sixmile","Zoo Road"] },
    dibrugarh: { label: "Dibrugarh", areas: ["AT Road","Barbari","Chowkidingee","Graham Bazar","Lahoal"] },
    silchar: { label: "Silchar", areas: ["Ambikapur","Club Road","Link Road","Meherpur","Premtala","Rangirkhari"] }
  }},
  hp: { label: "Himachal Pradesh", cities: {
    shimla: { label: "Shimla", areas: ["Cart Road","Chhota Shimla","Kasumpti","Lakkar Bazar","Mall Road","Sanjauli"] },
    dharamshala: { label: "Dharamshala", areas: ["Forsyth Ganj","Kotwali Bazar","McLeod Ganj","Ramnagar","Sidhpur"] },
    manali: { label: "Manali", areas: ["Club House Road","Hadimba Temple Area","Log Huts","Mall Road","Model Town","Old Manali"] }
  }},
  goa: { label: "Goa", cities: {
    panaji: { label: "Panaji", areas: ["Altinho","Campal","Caranzalem","Dona Paula","Miramar","Porvorim"] },
    margao: { label: "Margao", areas: ["Fatorda","Gogol","Grace Church","Navelim","Nuvem"] }
  }},
  jk: { label: "Jammu & Kashmir", cities: {
    srinagar: { label: "Srinagar", areas: ["Batmaloo","Dal Lake","Hazratbal","Lal Chowk","Rajbagh","Residency Road"] },
    jammu: { label: "Jammu", areas: ["Bakshi Nagar","Gandhi Nagar","Jammu Tawi","Rehari","Sarwal","Talab Tillo"] }
  }}
};

function setStepActive(n) {
  for (var i = 1; i <= 3; i++) {
    var dot  = document.getElementById("stepDot"  + i);
    var span = document.getElementById("stepSpan" + i);
    var lbl  = document.getElementById("label"    + i);
    if (i <= n) {
      if (dot)  dot.classList.add("active");
      if (span) span.classList.add("active");
      if (lbl)  lbl.classList.add("active");
    } else {
      if (dot)  dot.classList.remove("active");
      if (span) span.classList.remove("active");
      if (lbl)  lbl.classList.remove("active");
    }
  }
}

window.handleStateSelect = function(sel) {
  var val = sel.value;
  var cityEl = document.getElementById("citySelect");
  var areaEl = document.getElementById("areaSelect");
  var msg    = document.getElementById("cityMsg");
  msg.className = "city-msg";
  cityEl.innerHTML = "<option value=''>Select city</option>";
  areaEl.innerHTML = "<option value=''>Select city first</option>";
  cityEl.disabled  = true;
  areaEl.disabled  = true;
  setStepActive(1);
  if (!val) return;
  var state = cityData[val];
  if (!state) return;
  Object.keys(state.cities).forEach(function(k) {
    var c   = state.cities[k];
    var opt = document.createElement("option");
    opt.value       = k;
    opt.textContent = c.label + (c.live ? " ✅" : "");
    cityEl.appendChild(opt);
  });
  cityEl.disabled = false;
  setStepActive(2);
};

window.handleCitySelect = function(sel) {
  var stateVal = document.getElementById("stateSelect").value;
  var val      = sel.value;
  var areaEl   = document.getElementById("areaSelect");
  var msg      = document.getElementById("cityMsg");
  areaEl.innerHTML = "<option value=''>Select area</option>";
  areaEl.disabled  = true;
  msg.className    = "city-msg";
  if (!val) return;
  var city = cityData[stateVal].cities[val];
  city.areas.forEach(function(a) {
    var opt = document.createElement("option");
    opt.value = a; opt.textContent = a;
    areaEl.appendChild(opt);
  });
  areaEl.disabled = false;
  setStepActive(3);
  if (city.live) {
    msg.className   = "city-msg active-city";
    msg.textContent = "✅ We are live in " + city.label + "! Now select your area.";
  } else {
    msg.className   = "city-msg coming-soon";
    msg.textContent = "🚀 Coming soon to " + city.label + "! We are expanding fast.";
  }
};

window.handleAreaSelect = function (sel) {
  var stateVal = document.getElementById("stateSelect").value;
  var cityVal  = document.getElementById("citySelect").value;
  var msg      = document.getElementById("cityMsg");
  var btns     = document.getElementById("cityActionBtns");

  if (!sel.value) return;

  var city = cityData[stateVal].cities[cityVal];

  if (city.live) {
    msg.className   = "city-msg active-city";
    msg.textContent = "✅ We serve " + sel.value + ", " + city.label + ". Book your service now!";
    if (btns) btns.style.display = "flex";

  } else {
    msg.className   = "city-msg coming-soon";
    msg.textContent = "🚀 Coming soon to " + sel.value + ", " + city.label + "!";
    if (btns) btns.style.display = "none";

    // Popup mein city/area details fill karo
    var notifyName     = document.getElementById("cityNotifyName");
    var notifyLocation = document.getElementById("cityNotifyLocation");
    var notifyMsg      = document.getElementById("cityNotifyMsg");

    if (notifyName)     notifyName.textContent    = city.label;
    if (notifyLocation) notifyLocation.textContent = sel.value + ", " + city.label;
    if (notifyMsg)      notifyMsg.textContent      =
      "We're expanding fast! Enter your email and we'll notify you the moment Ajoomi goes live in " + city.label + ".";

    // 600ms baad popup open karo taaki user area selection dekh sake pehle
    setTimeout(function () {
      if (typeof openPopup === "function") openPopup("cityNotifyPopup");
    }, 600);
  }
};

"use strict";

/* =============================================
   LOADER
   ============================================= */
window.addEventListener("load", function () {
  var loader = document.getElementById("loader");
  if (loader) loader.classList.add("hide");
});

/* =============================================
   MOBILE MENU
   ============================================= */
var hamburger = document.getElementById("hamburger");
var navMenu   = document.getElementById("nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", function () {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("open");
    var isOpen = navMenu.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navMenu.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("active");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("click", function (e) {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navMenu.classList.remove("active");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

/* =============================================
   SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    var targetId = this.getAttribute("href");
    if (!targetId || targetId === "#") return;
    var section = document.querySelector(targetId);
    if (!section) return;
    e.preventDefault();
    var navbarHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-height").trim()
    ) || 72;
    var offset = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 8;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

/* =============================================
   SCROLL LISTENERS
   ============================================= */
var scrollBar = document.getElementById("scrollBar");
var backToTop = document.getElementById("backToTop");
var navbar    = document.getElementById("navbar");
var sections  = document.querySelectorAll("section[id]");
var navLinks  = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", function () {
  if (scrollBar) {
    var scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    scrollBar.style.width = Math.min(scrolled, 100) + "%";
  }
  if (backToTop) {
    if (window.scrollY > 400) backToTop.classList.add("show");
    else backToTop.classList.remove("show");
  }
  if (navbar) {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
  var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 72;
  var current = "";
  sections.forEach(function (section) {
    if (window.scrollY >= section.offsetTop - navH - 60) {
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach(function (link) {
    link.classList.remove("active-link");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active-link");
    }
  });
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
var faders = document.querySelectorAll(".fade-in");
var appearOnScroll = new IntersectionObserver(
  function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.10 }
);
faders.forEach(function (fader, index) {
  fader.style.transitionDelay = (index * 70) + "ms";
  appearOnScroll.observe(fader);
});

/* =============================================
   COUNTER ANIMATION
   ============================================= */
var countersStarted = false;

function animateCounter(el, target, suffix) {
  var duration = 1800, startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

var statsSection = document.getElementById("statsSection");
if (statsSection) {
  var statsObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      document.querySelectorAll("[data-count]").forEach(function (el) {
        animateCounter(el, parseInt(el.dataset.count), el.dataset.suffix || "");
      });
    }
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}

/* =============================================
   FAQ ACCORDION
   ============================================= */
function toggleFaq(questionEl) {
  var item = questionEl.parentElement;
  var isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
    openItem.classList.remove("open");
  });
  if (!isOpen) item.classList.add("open");
}
window.toggleFaq = toggleFaq;

document.querySelectorAll(".faq-question").forEach(function (el) {
  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFaq(el);
    }
  });
});

/* =============================================
   SERVICE CARD FLIP
   ============================================= */
document.querySelectorAll(".service-card").forEach(function (card) {
  var touchStartY = 0;

  card.addEventListener("touchstart", function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  card.addEventListener("touchend", function (e) {
    if (e.target.classList.contains("book-now-btn")) return;
    var touchEndY = e.changedTouches[0].clientY;
    var yDiff = Math.abs(touchStartY - touchEndY);
    if (yDiff < 10) {
      e.preventDefault();
      card.classList.toggle("flipped");
    }
  });

  card.addEventListener("click", function (e) {
    if (e.target.classList.contains("book-now-btn")) return;
    var hasHover = window.matchMedia("(hover: hover)").matches;
    if (hasHover) {
      card.classList.toggle("flipped");
    }
  });
});

document.querySelectorAll(".book-now-btn").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    openAppPopup();
  });
});

/* =============================================
   DARK MODE
   ============================================= */
var themeToggle = document.getElementById("themeToggle");

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  if (!themeToggle) return;
  var icon = themeToggle.querySelector("i");
  if (!icon) return;
  icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

/* FIXED: first visit always light mode */
var savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  applyTheme(true);
} else {
  applyTheme(false);
}

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    var isDark = !document.body.classList.contains("dark-mode");
    applyTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

/* =============================================
   POPUP SYSTEM
   ============================================= */
function openPopup(id) {
  var popup = document.getElementById(id);
  if (!popup) return;
  popup.style.display = "flex";
  requestAnimationFrame(function () {
    popup.style.opacity = "1";
  });
  document.body.style.overflow = "hidden";
}

function closePopup(id) {
  var popup = document.getElementById(id);
  if (!popup) return;
  popup.style.display = "none";
  popup.style.opacity = "";
  var anyOpen = Array.from(
    document.querySelectorAll(".popup, .app-popup-overlay")
  ).some(function (p) { return p.style.display === "flex"; });
  if (!anyOpen) document.body.style.overflow = "";
}

document.querySelectorAll(".popup, .app-popup-overlay").forEach(function (popup) {
  popup.addEventListener("click", function (e) {
    if (e.target === popup) closePopup(popup.id);
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".popup, .app-popup-overlay").forEach(function (p) {
      if (p.style.display === "flex") closePopup(p.id);
    });
  }
});

window.openPopup         = openPopup;
window.closePopup        = closePopup;
window.openAbout         = function () { openPopup("aboutPopup"); };
window.openBlog          = function () { openPopup("blogPopup"); };
window.openCareers       = function () { openPopup("careersPopup"); };
window.openHelp          = function () { openPopup("helpPopup"); };
window.openTerms         = function () { openPopup("termsPopup"); };
window.openPrivacy       = function () { openPopup("privacyPopup"); };
window.openLogin         = function () { openPopup("loginPopup"); };
window.openAppPopup      = function () { openPopup("appPopup"); };
window.openPartnerChoice = function () { openPopup("partnerChoicePopup"); };
window.openBooking       = function () { openPopup("appPopup"); };

/* =============================================
   FORM SUBMISSIONS
   ============================================= */
window.submitBooking = function () {
  var name    = (document.getElementById("bookingName")    || {}).value || "";
  var phone   = (document.getElementById("bookingPhone")   || {}).value || "";
  var service = (document.getElementById("bookingService") || {}).value || "";
  if (!name.trim() || !phone.trim() || !service) {
    alert("Please fill in your name, phone number, and select a service.");
    return;
  }
  alert("✅ Booking confirmed! We will contact you at " + phone.trim() + " shortly.");
  closePopup("bookingPopup");
  ["bookingName","bookingPhone","bookingService","bookingAddress"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
};

window.submitPartner = function () {
  var name  = (document.getElementById("partnerName")  || {}).value || "";
  var phone = (document.getElementById("partnerPhone") || {}).value || "";
  if (!name.trim() || !phone.trim()) {
    alert("Please enter your name and phone number.");
    return;
  }
  alert("🎉 Thank you, " + name.trim() + "! We will get in touch with you soon.");
  closePopup("loginPopup");
  ["partnerName","partnerPhone","partnerService"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
};

/* =============================================
   RIPPLE EFFECT
   ============================================= */
document.querySelectorAll(".btn").forEach(function (button) {
  button.addEventListener("click", function (e) {
    var ripple = document.createElement("span");
    ripple.classList.add("ripple");
    var rect = button.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + "px";
    ripple.style.top  = (e.clientY - rect.top)  + "px";
    button.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 650);
  });
});

/* =============================================
   HOW IT WORKS
   ============================================= */
(function () {
  var hiwSection = document.getElementById("how-it-works");
  if (!hiwSection) return;

  var fills   = [0, 33, 66, 100];
  var started = false;

  function activateStep(i) {
    for (var j = 0; j < 4; j++) {
      var bubble = document.getElementById("bubble" + j);
      var card   = document.getElementById("card" + j);
      var tag    = document.getElementById("tag" + j);
      if (!bubble || !card || !tag) continue;
      if (j <= i) {
        bubble.classList.add("active");
        card.classList.add("active");
        tag.classList.add("active-tag");
      } else {
        bubble.classList.remove("active");
        card.classList.remove("active");
        tag.classList.remove("active-tag");
      }
    }
    var fill = document.getElementById("hiwFill");
    if (fill) fill.style.width = fills[i] + "%";
  }

  function runSequence() {
    var delay = 300;
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        setTimeout(function () { activateStep(idx); }, delay);
      })(i);
      delay += 480;
    }
  }

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !started) {
      started = true;
      runSequence();
    }
  }, { threshold: 0.25 });

  observer.observe(hiwSection);
})();

/* =============================================
   CITY / STATE / AREA SELECTOR
   ============================================= */
var cityData = {
  chhattisgarh: { label: "Chhattisgarh", cities: {
    raipur:      { label: "Raipur",      live: true, areas: ["Amanaka","Avanti Vihar","Bhatagaon","Byron Bazar","Civil Lines","Daulatpur","Devendra Nagar","Fafadih","GE Road","Gudhiyari","Hirapur","Kankali Para","Katora Talab","Khamhardih","Kumhari","Labhandi","Lalpur","Mana","Mana Camp","Mandir Hasaud","Mowa","New Rajendra Nagar","Pachpedi Naka","Pandri","Purani Basti","Rajendra Nagar","Ram Nagar","Samta Colony","Sanjay Nagar","Shankar Nagar","Smriti Nagar","Station Road","Tatibandh","Telibandha","Tikrapara","Urla","VIP Road","Vrindavan Nagar"] },
    bilaspur:    { label: "Bilaspur",    areas: ["Sarkanda","Vyapar Vihar","Torwa","Mangla","Link Road","Gole Bazar","Sadar Bazar","Tifra","Nehru Nagar","Rajkishore Nagar","Talapara","Mohan Nagar"] },
    korba:       { label: "Korba",       areas: ["Darri","Balco","Kusmunda","Transport Nagar","Urga","Power House Road","Nehru Nagar","Indira Nagar","Sector 4","Sector 6"] },
    durg:        { label: "Durg",        areas: ["Supela","Risali","Civic Centre","Camp 2","Smriti Nagar","Jamul","Kumhari","Ganesh Nagar"] },
    bhilai:      { label: "Bhilai",      areas: ["Sector 1","Sector 2","Sector 4","Sector 6","Sector 7","Sector 9","Sector 10","Akashganga","Nehru Nagar","Hudco","Ruabandha","Vaishali Nagar"] },
    rajnandgaon: { label: "Rajnandgaon", areas: ["Gandhi Chowk","Rajiv Nagar","Station Road","Chhuriya","Dongargaon"] },
    raigarh:     { label: "Raigarh",     areas: ["Sadar Bazar","Station Road","Chakradharnagar","Lailunga"] },
    jagdalpur:   { label: "Jagdalpur",   areas: ["Dharampura","Tikrapara","Sadar Bazar","Indravati Nagar","Lalbag"] },
    ambikapur:   { label: "Ambikapur",   areas: ["Gandhi Nagar","Station Road","New Colony","Medical College Road"] }
  }},
  mp: { label: "Madhya Pradesh", cities: {
    bhopal:   { label: "Bhopal",   areas: ["Arera Colony","Bairagarh","Govindpura","Habibganj","Kolar Road","Kohefiza","Lalghati","MP Nagar","Malviya Nagar","New Market","Piplani","Shivaji Nagar","Shyamla Hills","TT Nagar","Tulsi Nagar","Vaishali Nagar"] },
    indore:   { label: "Indore",   areas: ["AB Road","Annapurna","Bhanwarkuan","Chandan Nagar","Geeta Bhawan","Kanadia Road","Khajrana","LIG","MG Road","Palasia","Pardesipura","Rajendra Nagar","Rau","Sapna Sangeeta","Silicon City","Sukhliya","Vijay Nagar"] },
    jabalpur: { label: "Jabalpur", areas: ["Adhartal","Civil Lines","Gorakhpur","Katni Road","Madan Mahal","Napier Town","Ranjhi","Vijay Nagar","Wright Town"] },
    gwalior:  { label: "Gwalior",  areas: ["Lashkar","Morar","Thatipur","City Centre","Kamla Nagar","Padav"] },
    ujjain:   { label: "Ujjain",   areas: ["Freeganj","Mahakal Area","Nanakheda","Dewas Road","Vikramaditya"] },
    sagar:    { label: "Sagar",    areas: ["Civil Lines","Makronia","Tili","Subhash Ward"] }
  }},
  maharashtra: { label: "Maharashtra", cities: {
    mumbai:     { label: "Mumbai",     areas: ["Andheri East","Andheri West","Bandra East","Bandra West","Borivali","Chembur","Colaba","Dadar","Ghatkopar","Goregaon","Juhu","Kandivali","Kurla","Lower Parel","Malad","Mulund","Powai","Santacruz","Thane","Vikhroli","Worli"] },
    pune:       { label: "Pune",       areas: ["Aundh","Baner","Bavdhan","Deccan","Hadapsar","Hinjewadi","Kharadi","Koregaon Park","Kothrud","Magarpatta","Pimpri","Shivajinagar","Viman Nagar","Wakad","Warje"] },
    nagpur:     { label: "Nagpur",     areas: ["Ambazari","Bajaj Nagar","Dharampeth","Gandhibagh","Hanuman Nagar","Itwari","Laxmi Nagar","Manewada","Nandanvan","Pratap Nagar","Sadar","Sitabuldi"] },
    nashik:     { label: "Nashik",     areas: ["Ambad","Canada Corner","Gangapur Road","Indira Nagar","Satpur","Trimbak Road"] },
    thane:      { label: "Thane",      areas: ["Balkum","Ghodbunder Road","Hiranandani","Kopri","Manpada","Wagle Estate"] },
    aurangabad: { label: "Aurangabad", areas: ["Cidco","Garkheda","Osmanpura","Padegaon","Waluj"] }
  }},
  delhi: { label: "Delhi NCR", cities: {
    delhi:      { label: "New Delhi", areas: ["Connaught Place","Daryaganj","Dwarka","Hauz Khas","Janakpuri","Karol Bagh","Lajpat Nagar","Laxmi Nagar","Mayur Vihar","Nehru Place","Paharganj","Pitampura","Rohini","Saket","Shahdara","South Extension","Vasant Kunj","Vikaspuri"] },
    noida:      { label: "Noida",     areas: ["Sector 15","Sector 18","Sector 22","Sector 27","Sector 44","Sector 50","Sector 62","Sector 63","Sector 76","Sector 100","Sector 120","Sector 137","Expressway"] },
    gurgaon:    { label: "Gurgaon",   areas: ["Cyber City","DLF Phase 1","DLF Phase 2","DLF Phase 3","Golf Course Road","Huda City Centre","MG Road","Palam Vihar","Sector 14","Sector 29","Sector 45","Sohna Road","Udyog Vihar"] },
    faridabad:  { label: "Faridabad", areas: ["Sector 11","Sector 14","Sector 16","NIT","Old Faridabad","Neharpar"] },
    ghaziabad:  { label: "Ghaziabad", areas: ["Indirapuram","Vaishali","Kaushambi","Raj Nagar","Mohan Nagar","Sahibabad"] }
  }},
  up: { label: "Uttar Pradesh", cities: {
    lucknow:    { label: "Lucknow",    areas: ["Aliganj","Alambagh","Aminabad","Ashiyana","Charbagh","Gomti Nagar","Hazratganj","Indira Nagar","Jankipuram","Mahanagar","Rajajipuram","Vikas Nagar"] },
    kanpur:     { label: "Kanpur",     areas: ["Arya Nagar","Civil Lines","Dabauli","Govind Nagar","Kakadeo","Kidwai Nagar","Naveen Market"] },
    agra:       { label: "Agra",       areas: ["Tajganj","Sikandra","Kamla Nagar","Bodla","Khandari","Shahganj"] },
    varanasi:   { label: "Varanasi",   areas: ["Assi","Godaulia","Lanka","Mahmoorganj","Nadesar","Sigra"] },
    prayagraj:  { label: "Prayagraj",  areas: ["Civil Lines","George Town","Kareli","Naini","Tagore Town"] },
    meerut:     { label: "Meerut",     areas: ["Abhay Khand","Brahmpuri","Cantonment","Gandhi Nagar","Pallavpuram","Shastri Nagar"] }
  }},
  rajasthan: { label: "Rajasthan", cities: {
    jaipur:  { label: "Jaipur",  areas: ["Ajmer Road","Bapu Nagar","C Scheme","Civil Lines","Jagatpura","Malviya Nagar","Mansarovar","Raja Park","Sanganer","Tonk Road","Vaishali Nagar"] },
    jodhpur: { label: "Jodhpur", areas: ["Bhagat Ki Kothi","Chopasni Housing Board","Paota","Ratanada","Shastri Nagar","Sardarpura"] },
    udaipur: { label: "Udaipur", areas: ["Fatehpura","Hiran Magri","Madhuban","Pratap Nagar","Shobhagpura","Sukhadia Circle"] },
    kota:    { label: "Kota",    areas: ["Dadabari","Gumanpura","Jawahar Nagar","Rangpur","Talwandi","Vigyan Nagar"] },
    ajmer:   { label: "Ajmer",   areas: ["Adarsh Nagar","Anasagar","Kishangarh","Madar","Vaishali Nagar"] }
  }},
  gujarat: { label: "Gujarat", cities: {
    ahmedabad: { label: "Ahmedabad", areas: ["Ambawadi","Bopal","CG Road","Gota","Jodhpur","Maninagar","Naranpura","Navrangpura","Paldi","Prahlad Nagar","Satellite","Thaltej","Vastrapur"] },
    surat:     { label: "Surat",     areas: ["Adajan","Althan","Dumas","Katargam","Nanpura","Rander","Varachha","Vesu"] },
    vadodara:  { label: "Vadodara",  areas: ["Alkapuri","Fatehgunj","Gotri","Manjalpur","Sama","Vasna"] },
    rajkot:    { label: "Rajkot",    areas: ["150 Feet Ring Road","Aji Dam","Kalawad Road","Kotecha Nagar","Mavdi","Raiya Road"] }
  }},
  karnataka: { label: "Karnataka", cities: {
    bangalore: { label: "Bangalore", areas: ["BTM Layout","Basavanagudi","Bellandur","Domlur","Electronic City","Hebbal","HSR Layout","Indiranagar","Jayanagar","JP Nagar","Koramangala","Marathahalli","Rajajinagar","Sarjapur","Whitefield","Yelahanka"] },
    mysore:    { label: "Mysore",    areas: ["Hebbal","Jayalakshmipuram","Kuvempunagar","Nazarbad","Saraswathipuram","Vijayanagar"] },
    hubli:     { label: "Hubli",     areas: ["Deshpande Nagar","Gokul Road","Keshwapur","Navanagar","Vidyanagar"] },
    mangalore: { label: "Mangalore", areas: ["Attavar","Bejai","Bunder","Kadri","Kankanady","Pandeshwar"] }
  }},
  tamilnadu: { label: "Tamil Nadu", cities: {
    chennai:    { label: "Chennai",    areas: ["Adyar","Anna Nagar","Besant Nagar","Chromepet","Egmore","Guindy","Kilpauk","Kodambakkam","Mylapore","Nungambakkam","Perambur","Porur","T Nagar","Tambaram","Velachery"] },
    coimbatore: { label: "Coimbatore", areas: ["Gandhipuram","Kavundampalayam","Peelamedu","Podanur","RS Puram","Saibaba Colony","Singanallur"] },
    madurai:    { label: "Madurai",    areas: ["Anna Nagar","KK Nagar","Mattuthavani","Palanganatham","Tallakulam","Vishalnagar"] },
    trichy:     { label: "Trichy",     areas: ["Ariyamangalam","Cantonment","Golden Rock","KK Nagar","Srirangam","Thillai Nagar"] }
  }},
  telangana: { label: "Telangana", cities: {
    hyderabad: { label: "Hyderabad", areas: ["Ameerpet","Banjara Hills","Gachibowli","Hitech City","Jubilee Hills","Kondapur","Kukatpally","LB Nagar","Madhapur","Mehdipatnam","Miyapur","Secunderabad","SR Nagar","Uppal"] },
    warangal:  { label: "Warangal",  areas: ["Hanamkonda","Kazipet","Khammam Road","Lashkar Bazar","Subedari"] },
    nizamabad: { label: "Nizamabad", areas: ["Bodhan","Dichpally","Jakranpally","Varni"] }
  }},
  ap: { label: "Andhra Pradesh", cities: {
    visakhapatnam: { label: "Visakhapatnam", areas: ["Dwaraka Nagar","Gajuwaka","MVP Colony","Madhurawada","Rushikonda","Seethammadhara","Steel Plant"] },
    vijayawada:    { label: "Vijayawada",    areas: ["Auto Nagar","Benz Circle","Gandhi Nagar","Governorpet","MG Road","Patamata"] },
    guntur:        { label: "Guntur",        areas: ["Arundelpet","Brodipet","Nagarampalem","Pattabhipuram","Syamalanagar"] },
    tirupati:      { label: "Tirupati",      areas: ["Balaji Nagar","Gandhi Road","KT Road","Mangalam","RC Road"] }
  }},
  kerala: { label: "Kerala", cities: {
    kochi:              { label: "Kochi",              areas: ["Aluva","Edappally","Ernakulam","Fort Kochi","Kakkanad","Kalamassery","Palarivattom","Thrippunithura","Vyttila"] },
    thiruvananthapuram: { label: "Thiruvananthapuram", areas: ["Kazhakkoottam","Kesavadasapuram","Pattom","Sasthamangalam","Technopark","Kowdiar"] },
    kozhikode:          { label: "Kozhikode",          areas: ["Arayidathupalam","Calicut Beach","Chevayur","Nadakkavu","Palayam","Vellimadukunnu"] },
    thrissur:           { label: "Thrissur",           areas: ["Ayyanthole","Kuriachira","Ollur","Poothole","Punkunnam","Swaraj Round"] }
  }},
  wb: { label: "West Bengal", cities: {
    kolkata:  { label: "Kolkata",  areas: ["Ballygunge","Behala","Dum Dum","Gariahat","Jadavpur","Jodhpur Park","Lake Town","New Alipore","Park Circus","Park Street","Salt Lake","Shyambazar","Tollygunge"] },
    howrah:   { label: "Howrah",   areas: ["Andul","Bally","Domjur","Liluah","Shibpur","Sankrail"] },
    durgapur: { label: "Durgapur", areas: ["Benachity","Bidhannagar","City Centre","Nachan Road","Sector 2","Steel Township"] },
    siliguri: { label: "Siliguri", areas: ["Bagdogra","Dabgram","Hakimpara","Matigara","Pradhan Nagar","Sevoke Road"] }
  }},
  bihar: { label: "Bihar", cities: {
    patna:       { label: "Patna",       areas: ["Boring Road","Dakbungalow","Exhibition Road","Kankarbagh","Patliputra","Rajendra Nagar","Sheikhpura"] },
    gaya:        { label: "Gaya",        areas: ["Bodh Gaya","Civil Lines","Delha","Kotwali","Rampur"] },
    muzaffarpur: { label: "Muzaffarpur", areas: ["Aghoria Bazar","Brahmpura","Juran Chapra","Mithanpura","Saraiyaganj"] }
  }},
  jharkhand: { label: "Jharkhand", cities: {
    ranchi:     { label: "Ranchi",     areas: ["Bariatu","Booty More","Doranda","HEC","Lalpur","Morabadi","Ratu Road"] },
    jamshedpur: { label: "Jamshedpur", areas: ["Adityapur","Bistupur","Jugsalai","Kadma","Mango","Sakchi","Telco"] },
    dhanbad:    { label: "Dhanbad",    areas: ["Bartand","Hirapur","Jharia","Katras","Loyabad","Sindri"] }
  }},
  odisha: { label: "Odisha", cities: {
    bhubaneswar: { label: "Bhubaneswar", areas: ["Acharya Vihar","Ashok Nagar","BJB Nagar","Chandrasekharpur","IRC Village","Nayapalli","Saheed Nagar","Unit 4","Vani Vihar"] },
    cuttack:     { label: "Cuttack",     areas: ["Badambadi","Bijipur","Cantonment","Link Road","Mangalabag","Telenga Bazar"] },
    rourkela:    { label: "Rourkela",    areas: ["Birsa Nagar","Civil Township","Chhend Colony","Fertilizer Township","Koel Nagar","Panposh"] }
  }},
  punjab: { label: "Punjab", cities: {
    chandigarh: { label: "Chandigarh", areas: ["Sector 7","Sector 8","Sector 9","Sector 10","Sector 15","Sector 17","Sector 22","Sector 34","Sector 35","Sector 43","Mohali","Panchkula"] },
    ludhiana:   { label: "Ludhiana",   areas: ["BRS Nagar","Civil Lines","Dugri","Gurdev Nagar","Model Town","Sarabha Nagar"] },
    amritsar:   { label: "Amritsar",   areas: ["Batala Road","Green Avenue","Lawrence Road","Majitha Road","Ranjit Avenue","Sultanwind"] },
    jalandhar:  { label: "Jalandhar",  areas: ["Basti Bawa Khel","Civil Lines","Model Town","Nakodar Road","Rama Mandi","Urban Estate"] }
  }},
  haryana: { label: "Haryana", cities: {
    ambala:  { label: "Ambala",  areas: ["Ambala Cantonment","Ambala City","Baldev Nagar","Model Town","Nicholson Road"] },
    hisar:   { label: "Hisar",   areas: ["Aggarsain Chowk","Civil Lines","Model Town","Red Square Market","Urban Estate"] },
    rohtak:  { label: "Rohtak",  areas: ["Civil Lines","Delhi Road","Model Town","Subhash Nagar","Sunaria Road"] },
    panipat: { label: "Panipat", areas: ["Devi Nagar","GT Road","Model Town","Partap Nagar","Sanjay Colony"] }
  }},
  uttarakhand: { label: "Uttarakhand", cities: {
    dehradun: { label: "Dehradun", areas: ["Ballupur","Clement Town","ISBT","Jakhan","Patel Nagar","Race Course","Rajpur Road","Sahastradhara Road"] },
    haridwar: { label: "Haridwar", areas: ["Bhimgoda","BHEL Ranipur","Jwalapur","Kankhal","Raiwala","Roorkee"] },
    rishikesh: { label: "Rishikesh", areas: ["Badrinath Road","Haridwar Road","Laxman Jhula","Muni Ki Reti","Ram Jhula","Swarg Ashram"] }
  }},
  assam: { label: "Assam", cities: {
    guwahati:  { label: "Guwahati",  areas: ["Ambari","Bhangagarh","Dispur","Ganeshguri","Geetanagar","Jalukbari","Pan Bazar","Sixmile","Zoo Road"] },
    dibrugarh: { label: "Dibrugarh", areas: ["AT Road","Barbari","Chowkidingee","Graham Bazar","Lahoal"] },
    silchar:   { label: "Silchar",   areas: ["Ambikapur","Club Road","Link Road","Meherpur","Premtala","Rangirkhari"] }
  }},
  hp: { label: "Himachal Pradesh", cities: {
    shimla:      { label: "Shimla",      areas: ["Cart Road","Chhota Shimla","Kasumpti","Lakkar Bazar","Mall Road","Sanjauli"] },
    dharamshala: { label: "Dharamshala", areas: ["Forsyth Ganj","Kotwali Bazar","McLeod Ganj","Ramnagar","Sidhpur"] },
    manali:      { label: "Manali",      areas: ["Club House Road","Hadimba Temple Area","Log Huts","Mall Road","Model Town","Old Manali"] }
  }},
  goa: { label: "Goa", cities: {
    panaji: { label: "Panaji", areas: ["Altinho","Campal","Caranzalem","Dona Paula","Miramar","Porvorim"] },
    margao: { label: "Margao", areas: ["Fatorda","Gogol","Grace Church","Navelim","Nuvem"] }
  }},
  jk: { label: "Jammu & Kashmir", cities: {
    srinagar: { label: "Srinagar", areas: ["Batmaloo","Dal Lake","Hazratbal","Lal Chowk","Rajbagh","Residency Road"] },
    jammu:    { label: "Jammu",    areas: ["Bakshi Nagar","Gandhi Nagar","Jammu Tawi","Rehari","Sarwal","Talab Tillo"] }
  }}
};

function setStepActive(n) {
  for (var i = 1; i <= 3; i++) {
    var dot  = document.getElementById("stepDot"  + i);
    var span = document.getElementById("stepSpan" + i);
    var lbl  = document.getElementById("label"    + i);
    if (i <= n) {
      if (dot)  dot.classList.add("active");
      if (span) span.classList.add("active");
      if (lbl)  lbl.classList.add("active");
    } else {
      if (dot)  dot.classList.remove("active");
      if (span) span.classList.remove("active");
      if (lbl)  lbl.classList.remove("active");
    }
  }
}

window.handleStateSelect = function(sel) {
  var val    = sel.value;
  var cityEl = document.getElementById("citySelect");
  var areaEl = document.getElementById("areaSelect");
  var msg    = document.getElementById("cityMsg");
  var btns   = document.getElementById("cityActionBtns");

  msg.className = "city-msg";
  if (btns) btns.style.display = "none";
  cityEl.innerHTML = "<option value=''>Select city</option>";
  areaEl.innerHTML = "<option value=''>Select city first</option>";
  cityEl.disabled  = true;
  areaEl.disabled  = true;
  setStepActive(1);
  if (!val) return;

  var state = cityData[val];
  if (!state) return;
  Object.keys(state.cities).forEach(function(k) {
    var c   = state.cities[k];
    var opt = document.createElement("option");
    opt.value       = k;
    opt.textContent = c.label + (c.live ? " ✅" : "");
    cityEl.appendChild(opt);
  });
  cityEl.disabled = false;
  setStepActive(2);
};

window.handleCitySelect = function(sel) {
  var stateVal = document.getElementById("stateSelect").value;
  var val      = sel.value;
  var areaEl   = document.getElementById("areaSelect");
  var msg      = document.getElementById("cityMsg");
  var btns     = document.getElementById("cityActionBtns");

  areaEl.innerHTML = "<option value=''>Select area</option>";
  areaEl.disabled  = true;
  msg.className    = "city-msg";
  if (btns) btns.style.display = "none";
  if (!val) return;

  var city = cityData[stateVal].cities[val];
  city.areas.forEach(function(a) {
    var opt = document.createElement("option");
    opt.value = a; opt.textContent = a;
    areaEl.appendChild(opt);
  });
  areaEl.disabled = false;
  setStepActive(3);

  if (city.live) {
    msg.className   = "city-msg active-city";
    msg.textContent = "✅ We are live in " + city.label + "! Now select your area.";
  } else {
    msg.className   = "city-msg coming-soon";
    msg.textContent = "🚀 Coming soon to " + city.label + "! We are expanding fast.";
  }
};

// script.js mein existing handleAreaSelect function ko
// is updated version se REPLACE karo

window.handleAreaSelect = function (sel) {
  var stateVal = document.getElementById("stateSelect").value;
  var cityVal  = document.getElementById("citySelect").value;
  var msg      = document.getElementById("cityMsg");
  var btns     = document.getElementById("cityActionBtns");

  if (!sel.value) return;

  var city = cityData[stateVal].cities[cityVal];

  if (city.live) {
    msg.className   = "city-msg active-city";
    msg.textContent = "✅ We serve " + sel.value + ", " + city.label + ". Book your service now!";
    if (btns) btns.style.display = "flex";

  } else {
    msg.className   = "city-msg coming-soon";
    msg.textContent = "🚀 Coming soon to " + sel.value + ", " + city.label + "!";
    if (btns) btns.style.display = "none";

    // Popup mein city/area details fill karo
    var notifyName     = document.getElementById("cityNotifyName");
    var notifyLocation = document.getElementById("cityNotifyLocation");
    var notifyMsg      = document.getElementById("cityNotifyMsg");

    if (notifyName)     notifyName.textContent    = city.label;
    if (notifyLocation) notifyLocation.textContent = sel.value + ", " + city.label;
    if (notifyMsg)      notifyMsg.textContent      =
      "We're expanding fast! Enter your email and we'll notify you the moment Ajoomi goes live in " + city.label + ".";

    // 600ms baad popup open karo taaki user area selection dekh sake pehle
    setTimeout(function () {
      if (typeof openPopup === "function") openPopup("cityNotifyPopup");
    }, 600);
  }
};

/* =============================================
   MOBILE THEME TOGGLE SYNC
   ============================================= */
(function() {
  var mobile = document.getElementById("themeToggleMobile");
  if (!mobile) return;
  mobile.addEventListener("click", function() {
    var isDark = !document.body.classList.contains("dark-mode");
    if (typeof applyTheme === "function") {
      applyTheme(isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
    var icon = mobile.querySelector("i");
    if (icon) icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    var label = mobile.querySelector(".theme-label");
    if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
    var desktopIcon = document.querySelector("#themeToggle i");
    if (desktopIcon) desktopIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  });
  var saved  = localStorage.getItem("theme");
  var isDark = saved === "dark";
  var icon   = mobile.querySelector("i");
  var label  = mobile.querySelector(".theme-label");
  if (icon)  icon.className   = isDark ? "fa-solid fa-sun"  : "fa-solid fa-moon";
  if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
})();