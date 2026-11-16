import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { ResearchResult, ResearchParams } from "../types";

function parseInlineRuns(
  text: string,
  font: string,
  size: number,
  rightToLeft: boolean
): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  if (parts.length === 0) {
    return [new TextRun({ text: "", size, font, rightToLeft })];
  }
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        size,
        font,
        rightToLeft,
      });
    }
    return new TextRun({ text: part, size, font, rightToLeft });
  });
}

export async function exportToWord(result: ResearchResult, params: ResearchParams) {
  const isRtl = params.language === "ar";
  const fontSizeHalfPt = Math.max(16, Math.round((params.fontSize || 14) * 2));
  const refFontSizeHalfPt = Math.max(14, fontSizeHalfPt - 4);
  const lineSpacingTwips = Math.max(240, Math.round((params.lineSpacing || 1.5) * 240));
  const font = params.fontType || "Amiri";

  const contentParagraphs = (result.content || "")
    .split("\n")
    .map((rawLine) => rawLine.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (line.startsWith("### ")) {
        return new Paragraph({
          children: [
            new TextRun({
              text: line.slice(4),
              bold: true,
              size: fontSizeHalfPt + 4,
              font,
              rightToLeft: isRtl,
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          bidirectional: isRtl,
          spacing: { before: 280, after: 120, line: lineSpacingTwips },
        });
      }
      if (line.startsWith("## ")) {
        return new Paragraph({
          children: [
            new TextRun({
              text: line.slice(3),
              bold: true,
              size: fontSizeHalfPt + 8,
              font,
              rightToLeft: isRtl,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          bidirectional: isRtl,
          spacing: { before: 360, after: 160, line: lineSpacingTwips },
        });
      }
      if (line.startsWith("# ")) {
        return new Paragraph({
          children: [
            new TextRun({
              text: line.slice(2),
              bold: true,
              size: fontSizeHalfPt + 12,
              font,
              rightToLeft: isRtl,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          bidirectional: isRtl,
          spacing: { before: 400, after: 200, line: lineSpacingTwips },
        });
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return new Paragraph({
          children: parseInlineRuns(line.slice(2), font, fontSizeHalfPt, isRtl),
          bullet: { level: 0 },
          bidirectional: isRtl,
          spacing: { before: 80, after: 80, line: lineSpacingTwips },
        });
      }

      return new Paragraph({
        children: parseInlineRuns(line, font, fontSizeHalfPt, isRtl),
        bidirectional: isRtl,
        spacing: { before: 120, after: 120, line: lineSpacingTwips },
        alignment: AlignmentType.JUSTIFIED,
      });
    });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: params.title,
                bold: true,
                size: fontSizeHalfPt + 16,
                font,
                rightToLeft: isRtl,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            bidirectional: isRtl,
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: isRtl ? `الباحث: ${params.researcherName}` : `Researcher: ${params.researcherName}`,
                size: fontSizeHalfPt,
                font,
                rightToLeft: isRtl,
              }),
            ],
            alignment: AlignmentType.CENTER,
            bidirectional: isRtl,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: isRtl ? `الجهة: ${params.recipient}` : `Submitted to: ${params.recipient}`,
                size: fontSizeHalfPt,
                font,
                rightToLeft: isRtl,
              }),
            ],
            alignment: AlignmentType.CENTER,
            bidirectional: isRtl,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: isRtl ? "الملخص (Abstract)" : "Abstract",
                bold: true,
                size: fontSizeHalfPt + 6,
                font,
                rightToLeft: isRtl,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            bidirectional: isRtl,
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: result.abstract || "",
                size: fontSizeHalfPt,
                font,
                rightToLeft: isRtl,
              }),
            ],
            bidirectional: isRtl,
            spacing: { line: lineSpacingTwips, after: 240 },
            alignment: AlignmentType.JUSTIFIED,
          }),
          ...contentParagraphs,
          new Paragraph({
            children: [
              new TextRun({
                text: isRtl ? "الكلمات المفتاحية" : "Keywords",
                bold: true,
                size: fontSizeHalfPt + 6,
                font,
                rightToLeft: isRtl,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            bidirectional: isRtl,
            spacing: { before: 400, after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: (result.keywords || []).join(isRtl ? "، " : ", "),
                size: fontSizeHalfPt,
                font,
                rightToLeft: isRtl,
              }),
            ],
            bidirectional: isRtl,
            spacing: { after: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: isRtl ? "المراجع" : "References",
                bold: true,
                size: fontSizeHalfPt + 6,
                font,
                rightToLeft: isRtl,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            bidirectional: isRtl,
            spacing: { before: 400, after: 160 },
          }),
          ...(result.references || []).map((ref) => {
            return new Paragraph({
              children: [
                new TextRun({
                  text: ref,
                  size: refFontSizeHalfPt,
                  font,
                  rightToLeft: isRtl,
                }),
              ],
              bidirectional: isRtl,
              bullet: { level: 0 },
              spacing: { after: 100 },
            });
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = (params.title || "research").trim().replace(/[\\/:*?"<>|]+/g, "_");
  saveAs(blob, `${safeFilename}.docx`);
}
