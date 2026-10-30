"use strict";

/*
 * AM Activation Client
 * By:
 * kenzy project
 *
 * Endpoint yang digunakan:
 * /api/am?action=send
 * /api/am?action=verif
 */

var API_BASE = "https://restapidhan.vercel.app";
var API_KEY = "freeapikeydhan26";

/*
 * ==============================
 * LINK YANG BISA LO GANTI
 * ==============================
 *
 * Ganti URL di bawah sesuai link milik lo.
 */

var LINKS = {
    contact: "https://wa.me/6287782127619",
    channel: "https://whatsapp.com/channel/0029Vb87bvXDOQIbSsMrNi3n",
    feedback: "https://docs.google.com/forms/d/e/1FAIpQLSeHVooiu8AuIotS7sdNRFkG22AizMLPKAdJmtTdboDSV7kX0Q/viewform?usp=publish-editor"
};


/* ==============================
 * ELEMENT
 * ============================== */

var emailInput = document.getElementById("email");
var magicInput = document.getElementById("magicLink");

var sendBtn = document.getElementById("sendBtn");
var verifyBtn = document.getElementById("verifyBtn");

var verifyText = document.getElementById("verifyText");
var verifyLoading = document.getElementById("verifyLoading");

var statusBox = document.getElementById("status");

var resultBox = document.getElementById("result");
var resultText = document.getElementById("resultText");


/* ==============================
 * STATUS
 * ============================== */

function showStatus(message, type) {

    type = type || "info";

    if (!statusBox) return;

    statusBox.textContent = message || "";
    statusBox.className = "status show " + type;
}


function clearStatus() {

    if (!statusBox) return;

    statusBox.textContent = "";
    statusBox.className = "status";
}


/* ==============================
 * RESULT
 * ============================== */

function showResult(data) {

    if (!resultBox || !resultText) return;

    if (typeof data === "string") {

        resultText.textContent = data;

    } else {

        try {

            resultText.textContent =
                JSON.stringify(data, null, 2);

        } catch {

            resultText.textContent =
                String(data);

        }

    }

    resultBox.classList.add("show");
}


function hideResult() {

    if (!resultBox || !resultText) return;

    resultBox.classList.remove("show");
    resultText.textContent = "";
}


/* ==============================
 * API REQUEST
 * ============================== */

async function requestAPI(action, params) {

    params = params || {};

    var url = new URL(
        API_BASE + "/api/am"
    );

    url.searchParams.set(
        "action",
        action
    );

    url.searchParams.set(
        "apikey",
        API_KEY
    );

    Object.keys(params).forEach(function (key) {

        var value = params[key];

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            url.searchParams.set(
                key,
                String(value)
            );

        }

    });


    var response;

    try {

        response = await fetch(
            url.toString(),
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );

    } catch (error) {

        throw new Error(
            "Tidak dapat terhubung ke server API."
        );

    }


    var raw = await response.text();

    var data;

    try {

        data = JSON.parse(raw);

    } catch {

        data = {
            raw: raw
        };

    }


    if (!response.ok) {

        var serverMessage =
            data &&
            (
                data.message ||
                data.error ||
                data.msg
            );

        throw new Error(
            serverMessage ||
            "HTTP " +
            response.status
        );

    }


    return data;
}


/* ==============================
 * VALIDATION
 * ============================== */

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


function validURL(value) {

    try {

        var url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;

    }

}


/* ==============================
 * CEK RESPONSE BERHASIL
 * ============================== */

function apiSuccess(data) {

    if (!data) return false;

    /*
     * Backend bisa menggunakan:
     * status: true
     * success: true
     */

    if (
        data.status === true ||
        data.success === true
    ) {

        return true;

    }

    /*
     * Beberapa backend memakai:
     * status: "success"
     */

    if (
        typeof data.status === "string" &&
        data.status.toLowerCase() === "success"
    ) {

        return true;

    }

    return false;
}


/* ==============================
 * SEND MAGIC LINK
 * ============================== */

async function sendMagicLink() {

    clearStatus();
    hideResult();

    if (!emailInput) return;

    var email =
        emailInput.value.trim();


    if (!email) {

        showStatus(
            "Masukkan email terlebih dahulu.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (!validEmail(email)) {

        showStatus(
            "Format email tidak valid.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (sendBtn) {

        sendBtn.disabled = true;
        sendBtn.textContent = "Mengirim...";

    }


    try {

        var data =
            await requestAPI(
                "send",
                {
                    email: email
                }
            );


        showResult(data);


        if (apiSuccess(data)) {

            showStatus(
                "Magic Link berhasil dikirim. Periksa email kamu di bagian spam, lalu tekan link nya lalu salin, tempel di magic link.",
                "success"
            );

        } else {

            showStatus(
                (
                    data.message ||
                    data.error ||
                    "Permintaan diproses oleh API."
                ),
                "info"
            );

        }


    } catch (error) {

        showStatus(
            "Gagal mengirim Magic Link: " +
            error.message,
            "error"
        );

    } finally {

        if (sendBtn) {

            sendBtn.disabled = false;
            sendBtn.textContent =
                "Kirim Magic Link";

        }

    }

}


/* ==============================
 * VERIFY MAGIC LINK
 * ============================== */

async function verifyMagicLink() {

    clearStatus();
    hideResult();

    if (!emailInput || !magicInput) return;


    var email =
        emailInput.value.trim();

    var magicLink =
        magicInput.value.trim();


    if (!email) {

        showStatus(
            "Email belum diisi.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (!validEmail(email)) {

        showStatus(
            "Format email tidak valid.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (!magicLink) {

        showStatus(
            "Masukkan Magic Link.",
            "error"
        );

        magicInput.focus();

        return;
    }


    if (!validURL(magicLink)) {

        showStatus(
            "Magic Link harus berupa URL http/https yang valid.",
            "error"
        );

        magicInput.focus();

        return;
    }


    if (verifyBtn) {

        verifyBtn.disabled = true;

    }

    if (verifyText) {

        verifyText.style.display = "none";

    }

    if (verifyLoading) {

        verifyLoading.classList.add("show");

    }


    try {

        var data =
            await requestAPI(
                "verif",
                {
                    email: email,
                    url: magicLink
                }
            );


        showResult(data);


        if (apiSuccess(data)) {

            showStatus(
                "Verifikasi API berhasil.",
                "success"
            );

        } else {

            showStatus(
                (
                    data.message ||
                    data.error ||
                    "Verifikasi belum dinyatakan berhasil oleh API."
                ),
                "error"
            );

        }


    } catch (error) {

        showStatus(
            "Verifikasi gagal: " +
            error.message,
            "error"
        );

    } finally {

        if (verifyBtn) {

            /*
             * Jangan langsung menghapus disabled kalau
             * limit system sedang mengunci tombol.
             */
            if (
                typeof limitStateReady === "undefined" ||
                !limitStateReady
            ) {

                verifyBtn.disabled = false;

            }

        }


        if (verifyText) {

            verifyText.style.display = "inline";

        }

        if (verifyLoading) {

            verifyLoading.classList.remove("show");

        }

    }

}


/* ==============================
 * OPEN LINK
 * ============================== */

function openLink(url) {

    if (!url) {

        showStatus(
            "Link belum dikonfigurasi.",
            "error"
        );

        return;

    }


    try {

        var parsed =
            new URL(url);


        if (
            parsed.protocol !== "http:" &&
            parsed.protocol !== "https:"
        ) {

            throw new Error(
                "Protocol tidak diizinkan"
            );

        }


        window.open(
            parsed.href,
            "_blank",
            "noopener,noreferrer"
        );

    } catch {

        showStatus(
            "Link tidak valid.",
            "error"
        );

    }

}


/* ==============================
 * EVENT SEND
 * ============================== */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        function () {

            /*
             * Dipakai oleh sistem limit di index.html.
             */
            if (
                typeof lastAction !== "undefined"
            ) {

                lastAction = "send";

            }

            sendMagicLink();

        }
    );

}


/* ==============================
 * EVENT VERIFY
 * ============================== */

if (verifyBtn) {

    verifyBtn.addEventListener(
        "click",
        function () {

            /*
             * Dipakai oleh sistem limit di index.html.
             */
            if (
                typeof lastAction !== "undefined"
            ) {

                lastAction = "verify";

            }

            verifyMagicLink();

        }
    );

}


/* ==============================
 * ENTER EMAIL
 * ============================== */

if (emailInput) {

    emailInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMagicLink();

            }

        }
    );

}


/* ==============================
 * ENTER MAGIC LINK
 * ============================== */

if (magicInput) {

    magicInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                verifyMagicLink();

            }

        }
    );

}


/* ==============================
 * CONTACT
 * ============================== */

var contactBtn =
    document.getElementById("contactBtn");

if (contactBtn) {

    contactBtn.addEventListener(
        "click",
        function () {

            openLink(
                LINKS.contact
            );

        }
    );

}


/* ==============================
 * CHANNEL
 * ============================== */

var channelBtn =
    document.getElementById("channelBtn");

if (channelBtn) {

    channelBtn.addEventListener(
        "click",
        function () {

            openLink(
                LINKS.channel
            );

        }
    );

}


/* ==============================
 * FEEDBACK
 * ============================== */

var feedbackBtn =
    document.getElementById("feedbackBtn");

if (feedbackBtn) {

    feedbackBtn.addEventListener(
        "click",
        function () {

            openLink(
                LINKS.feedback
            );

        }
    );

}


/* ==============================
 * DEBUG
 * ============================== */

console.log(
    "AM Activation loaded."
);

console.log(
    "API:",
    API_BASE + "/api/am"
);