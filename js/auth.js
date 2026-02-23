let registerSms = document.getElementById("registerSms");
let savedPassword = "";

function register(e) {
  e.preventDefault();

  let formInfo = new FormData(e.target);
  let finalForm = Object.fromEntries(formInfo);

  if (!finalForm.email || !finalForm.password || !finalForm.firstName || !finalForm.lastName) {
    showMessage(" გთხოვთ შეავსოთ ყველა ველი!", "red");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(finalForm.email)) {
    showMessage(" გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა!", "red");
    return;
  }

  if (finalForm.password.length < 8) {
    showMessage(" პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს!", "red");
    return;
  }


  const hasUpperCase = /[A-Z]/.test(finalForm.password);
  const hasLowerCase = /[a-z]/.test(finalForm.password);
  const hasNumber = /[0-9]/.test(finalForm.password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    showMessage(" პაროლი უნდა შეიცავდეს: დიდ ასოს, პატარა ასოს და ციფრს!", "red");
    return;
  }

  if (/\d/.test(finalForm.firstName) || /\d/.test(finalForm.lastName)) {
    showMessage(" სახელი და გვარი არ უნდა შეიცავდეს ციფრებს!", "red");
    return;
  }

  savedPassword = finalForm.password;

  showMessage(" ანგარიშის შექმნა...", "blue");

  fetch("https://api.everrest.educata.dev/auth/sign_up", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalForm),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(" Register response:", data);

      if (data.error) {
        showMessage(` ${data.error}`, "red");
        throw new Error(data.error);
      }

      showMessage(" ვერიფიკაციის ელ-ფოსტის გაგზავნა...", "blue");

      return fetch("https://api.everrest.educata.dev/auth/verify_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: finalForm.email }),
      });
    })
    .then((res) => {
      console.log(" Verify email HTTP status:", res.status);
      if (!res || !res.ok) {
        throw new Error("ვერიფიკაციის ელ-ფოსტის გაგზავნა ვერ მოხერხდა");
      }
      return res.json();
    })
    .then((verifyData) => {
      console.log(" Verify email response:", verifyData);

      if (verifyData.error) {
        throw new Error(verifyData.error);
      }

      showMessage(`
        <strong> ვერიფიკაციის ელ-ფოსტა გაიგზავნა!</strong><br>
        <small style="display: block; margin-top: 12px; line-height: 1.6; background: #f0f8ff; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
           შეამოწმეთ თქვენი ელ-ფოსტა: <strong>${finalForm.email}</strong><br>
           დააჭირეთ ვერიფიკაციის ბმულს<br>
           ველოდებით ვერიფიკაციას...<br><br>
        </small>
      `, "orange");

      console.log("⏱ Waiting 10 seconds before checking...");

      setTimeout(() => {
        console.log(" Starting verification check...");
        checkVerificationStatus(finalForm.email, savedPassword);
      }, 10000);
    })
    .catch((err) => {
      console.error(" Registration error:", err);
      showMessage(` ${err.message || "სერვერის შეცდომა. სცადეთ თავიდან."}`, "red");
    });
}

function checkVerificationStatus(email, password) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Starting verification check");
  console.log(" Email:", email);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  let attemptCount = 0;
  let pollingStopped = false;

  function checkNow() {
    if (pollingStopped) {
      console.log(" Polling stopped");
      return;
    }

    attemptCount++;

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Attempt #${attemptCount} - ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    fetch("https://api.everrest.educata.dev/auth/sign_in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((res) => {
        console.log(` Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(" Response:", data);

        if (data.access_token) {
          console.log(" Verified! Redirecting...");

          pollingStopped = true;

          showMessage(`
            <strong style="font-size: 18px;"> ელ-ფოსტა წარმატებით დადასტურდა!</strong><br>
            <small style="display: block; margin-top: 12px; background: #d4edda; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
               თქვენი ანგარიში აქტივირებულია<br>
               გადამისამართება ავტორიზაციის გვერდზე...
            </small>
          `, "green");

          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          console.log(`⏳ Not verified yet: ${data.error || data.message}`);

          showMessage(`
            <strong> ველოდებით ვერიფიკაციას...</strong><br>
            <small style="display: block; margin-top: 12px; line-height: 1.6; background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
               ელ-ფოსტა გაიგზავნა: <strong>${email}</strong><br>
               გთხოვთ დააჭიროთ ვერიფიკაციის ბმულს<br>
               შემოწმება... (მცდელობა #${attemptCount})<br><br>
              <em style="color: #856404;"> შეამოწმეთ spam ფოლდერი</em>
            </small>
          `, "orange");

          if (!pollingStopped && attemptCount < 100) {
            console.log(" Will check again in 5 seconds...");
            setTimeout(checkNow, 5000);
          }
        }
      })
      .catch((err) => {
        console.error(" Error:", err);

        showMessage(`
          <strong> ველოდებით ვერიფიკაციას...</strong><br>
          <small style="display: block; margin-top: 12px; line-height: 1.6; background: #fff3cd; padding: 12px; border-radius: 8px;">
             ელ-ფოსტა: <strong>${email}</strong><br>
             დააჭირეთ ვერიფიკაციის ბმულს<br>
             მცდელობა #${attemptCount}...
          </small>
        `, "orange");

        if (!pollingStopped && attemptCount < 100) {
          console.log("⏭ Retrying in 5 seconds...");
          setTimeout(checkNow, 5000);
        }
      });
  }

  console.log(" Starting first check...");
  checkNow();

  setTimeout(() => {
    console.log(" 5 minute timeout");
    pollingStopped = true;

    if (registerSms.innerHTML.includes("ველოდებით")) {
      showMessage(`
        <strong>⏱ ვერიფიკაციის დრო ამოიწურა</strong><br>
        <small style="display: block; margin-top: 12px; background: #f8d7da; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
           ავტომატური შემოწმება შეწყდა<br>
           გთხოვთ შეხვიდეთ ხელით<br>
           ელ-ფოსტა: <strong>${email}</strong><br><br>
          <a href="login.html" style="color: #007bff; text-decoration: underline;"> შესვლა</a>
        </small>
      `, "red");
    }
  }, 300000);
}

function showMessage(message, color) {
  if (!registerSms) return;
  
  registerSms.style.color = color;
  registerSms.innerHTML = message;
 
  registerSms.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}