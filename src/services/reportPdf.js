/**
 * reportPdf — client-side HTML -> PDF generation for the case final report.
 *
 * Requires:  npm install html2pdf.js
 */
import html2pdf from "html2pdf.js";

/**
 * Render `html` (a full HTML document string from buildFullReportHtml) and
 * download it as an A4 PDF named `fileName`.
 *
 * IMPORTANT — why the source element must stay IN-FLOW:
 * html2pdf.js does not capture our element directly; it CLONES the source
 * into its own `position:absolute; height:auto` capture container and runs
 * html2canvas on that container. If the source carries `position: fixed`
 * (or a fixed height), the clone is taken out of flow, the capture container
 * collapses to 0px (or the report gets clipped) and the saved PDF comes out
 * as a BLANK white page. So the source is a plain, static block with
 * `height:auto` and auto width (it fills html2pdf's 190mm A4 capture width).
 * It is never attached to the document — html2pdf only clones from it — so
 * nothing flashes on screen while the PDF is generated.
 */
export async function generateReportPdf(html, fileName) {
  // Pull <style> + body out of the full document so the CSS is embedded
  // alongside the markup inside the element we hand to html2pdf. The cloned
  // <style> becomes active once html2pdf attaches the clone to the page.
  const parsed = new DOMParser().parseFromString(
    String(html || ""),
    "text/html",
  );
  const styles = Array.from(parsed.querySelectorAll("style"))
    .map((s) => s.textContent)
    .join("\n");
  const bodyHtml = parsed.body ? parsed.body.innerHTML : "";

  if (!String(bodyHtml).replace(/\s+/g, "")) {
    throw new Error("Report content is empty — nothing to export.");
  }

  const source = document.createElement("div");
  source.style.cssText = "background:#ffffff;";
  source.innerHTML = `<style>${styles}</style>${bodyHtml}`;

  try {
    await html2pdf()
      .set({
        filename: fileName || "Final_Report.pdf",
        margin: [10, 10, 10, 10],
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: ["tr", "h2", "h3", ".ai", ".case"],
        },
      })
      .from(source) // `.from()` = source element (html2pdf clones it into its capture overlay)
      .save();
  } catch (err) {
    console.error("PDF GENERATION ERROR =>", err);
    throw new Error("PDF generation failed. Please try again.");
  } finally {
    // The source was only a clone template — release it.
    source.remove();
  }
}

/**
 * Build a mailto: link.
 *  - uses encodeURIComponent (URLSearchParams turns spaces into "+")
 *  - trims the body so the URL stays within mail-client limits
 */
export function buildMailtoUrl({ to = [], subject = "", body = "" }) {
  const recipients = (Array.isArray(to) ? to : [])
    .map((e) => String(e).trim())
    .filter(Boolean)
    .join(",");

  const MAX_URL_LENGTH = 1900;
  const note =
    "\n\n[Report shortened for email — the full report PDF has been downloaded, please attach it.]";
  const head = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=`;

  let text = String(body || "");
  if (head.length + encodeURIComponent(text).length > MAX_URL_LENGTH) {
    while (
      text.length > 0 &&
      head.length + encodeURIComponent(text + note).length > MAX_URL_LENGTH
    ) {
      text = text.slice(0, Math.floor(text.length * 0.9));
    }
    text += note;
  }

  return head + encodeURIComponent(text);
}

export default generateReportPdf;
