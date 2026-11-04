const htmlValidator = document.getElementById("html-validator");
const htmlValidatorForm = document.getElementById("html-validator-form");
const cssValidator = document.getElementById("css-validator");
const cssValidatorForm = document.getElementById("css-validator-form");
const validatorNote = document.getElementById("validator-note");

if (htmlValidator && htmlValidatorForm && cssValidator && cssValidatorForm && validatorNote) {
  const htmlSourceField = htmlValidatorForm.elements.namedItem("content");
  const cssSourceField = cssValidatorForm.elements.namedItem("text");
  const isLocalAddress = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const isLocalFile = window.location.protocol === "file:";
  const isLocalDocument = isLocalAddress || isLocalFile;

  if ((window.location.protocol === "http:" || window.location.protocol === "https:") && !isLocalAddress) {
    htmlValidator.href = `https://validator.w3.org/nu/?doc=${encodeURIComponent(window.location.href)}`;
  }

  htmlValidator.addEventListener("click", (event) => {
    if (!isLocalDocument) {
      return;
    }

    event.preventDefault();
    htmlSourceField.value = `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
    htmlValidatorForm.submit();
  });

  const stylesheetUrl = new URL("style.css", window.location.href);
  const stylesheetSource = isLocalFile
    ? Promise.resolve().then(() => {
        const stylesheet = [...document.styleSheets].find((sheet) => sheet.href === stylesheetUrl.href);
        if (!stylesheet) {
          throw new Error("Nepodařilo se najít style.css.");
        }
        return [...stylesheet.cssRules].map((rule) => rule.cssText).join("\n");
      })
    : fetch(stylesheetUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`Nepodařilo se načíst style.css (HTTP ${response.status}).`);
        }
        return response.text();
      });

  stylesheetSource
    .then((cssSource) => {
      cssSourceField.value = cssSource;
      cssValidator.disabled = false;
    })
    .catch((error) => {
      validatorNote.textContent = `${error.message} Spusť web přes Live Server a zkus to znovu.`;
    });

  cssValidator.addEventListener("click", () => {
    cssValidatorForm.submit();
  });
}
