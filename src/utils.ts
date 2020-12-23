import { jsPDF, TextOptionsLight } from 'jspdf';
import {
  DocumentConfig,
  FontConfig,
  HeaderConfig,
  SummaryConfig,
  TopSkillsConfig,
  ExperienceConfig,
  EducationConfig,
  JobPosition,
} from './types';

// ResumePDF Helper Functions
export function AddHeader(file: jsPDF, docConfig: DocumentConfig, config: HeaderConfig) {
  const { name, phone, email } = config;
  SetSectionCurrentY(file, docConfig, name);
  const {
    margins: { top, right },
    pageSize: { width },
  } = docConfig;
  const lineHeight = file.getLineHeight() / 72;
  const yDelta = lineHeight; // use 1 lineHeight because it's only added once in text adds below
  ParseForBold(file, `Phone: **${phone}**`, width - right, top, { align: 'right' });
  ParseForBold(file, `Email: **${email}**`, width - right, top + lineHeight, { align: 'right' });

  EndSectionWithLine(file, docConfig, yDelta);
}

export function AddSummary(file: jsPDF, docConfig: DocumentConfig, config: SummaryConfig) {
  SetSectionCurrentY(file, docConfig, 'Summary');
  const {
    margins: { left, right },
    pageSize: { width },
    currentY,
  } = docConfig;
  const { description } = config;
  const summary = file.splitTextToSize(description, width - left - right + 0.5);
  const lineHeight = file.getLineHeight() / 72;
  const yLocal = currentY;
  let yDelta = 0;

  summary.map((x: string, i: number) => {
    yDelta = lineHeight * i;
    ParseForBold(file, x, left, yLocal + yDelta);
  });

  EndSectionWithLine(file, docConfig, yDelta);
}

export function AddTopSkills(file: jsPDF, docConfig: DocumentConfig, config: TopSkillsConfig) {
  SetSectionCurrentY(file, docConfig, 'Top Skills');
  const {
    margins: { left },
    pageSize: { width },
    currentY,
    fontConfig,
  } = docConfig;
  const { skills } = config;
  const yLocal = currentY;
  const lineHeight = file.getLineHeight() / 72;
  const yDelta = lineHeight * 2; // Multiply by 2 because table rows are 2

  // Add 6 Skills
  const cellWidth = width / 3 - 0.3;
  const leftTableStart = left + 0.1;
  const textConfig: TextOptionsLight = {
    align: 'left',
    lineHeightFactor: 1.9,
  };
  SetFont(file, fontConfig, 'top_skills_table');
  file.text([skills[0], skills[3]], leftTableStart, yLocal, textConfig);
  file.text([skills[1], skills[4]], leftTableStart + cellWidth, yLocal, textConfig);
  file.text([skills[2], skills[5]], leftTableStart + cellWidth * 2, yLocal, textConfig);
  SetFont(file, fontConfig);
  EndSectionWithLine(file, docConfig, yDelta);
}

export function AddExperience(file: jsPDF, docConfig: DocumentConfig, config: ExperienceConfig) {
  SetSectionCurrentY(file, docConfig, 'Experience');
  const {
    margins: { left, right },
    pageSize: { width },
    currentY,
  } = docConfig;
  const lineHeight = file.getLineHeight() / 72;
  let yLocal = currentY;
  config.exp.forEach(AddJob);

  function AddJob(data: JobPosition) {
    const y = yLocal;
    const { company, position, year_start, year_end, bullets } = data;
    const lineOne = ` : \u0009 **${position}**`;
    const timeThere = `[ ${year_start} - ${year_end} ]`;
    file.setFont('helvetica', 'italic');
    file.text(company, left, y);
    const companyInchWidth = (file.getStringUnitWidth(company) * file.getFontSize()) / 72;
    ParseForBold(file, lineOne, left + companyInchWidth, y);
    file.text(timeThere, width - right, y, { align: 'right' });
    const bulletsWithPoints = bullets.map((x) => {
      return '    \u0090  ' + x;
    });
    let bulletsToSize = [''];
    bulletsWithPoints.forEach((x) => {
      const split = file.splitTextToSize(x, width - left - right).map((line: string, i: number) => {
        if (i > 0) {
          return '       ' + line;
        } else {
          return line;
        }
      });
      bulletsToSize = bulletsToSize.concat(split);
    });
    file.text(bulletsToSize, left, y + 0.05);
    const numOfLines = 1 + bulletsToSize.length; // Need to add 1 so there is a space between each job
    yLocal = yLocal + numOfLines * lineHeight;
  }
  const yDelta = yLocal - currentY - lineHeight; // Subtract 1 lineHeight for the end of the section
  EndSectionWithLine(file, docConfig, yDelta);
}

export function AddEducation(file: jsPDF, docConfig: DocumentConfig, config: EducationConfig) {
  SetSectionCurrentY(file, docConfig, 'Education');
  const {
    margins: { left, right },
    pageSize: { width },
    currentY,
  } = docConfig;
  const { school, degree, gpa, grad_year } = config;
  const yLocal = currentY;
  const lineHeight = file.getLineHeight() / 72;
  const yDelta = lineHeight * 3; // Multiply by 3 because 3 lines are taken with school, degree and gpa

  file.text([school, degree, gpa], left, yLocal);
  file.text(`[ ${grad_year} ]`, width - right, yLocal, { align: 'right' });

  EndSectionWithLine(file, docConfig, yDelta);
}

// Internal Helper Functions
function ParseForBold(file: jsPDF, text: string, x: number, y: number, options?: any) {
  let startX = x;
  const fontSize = file.getFontSize();
  let parseForBold = text.split('**');
  if (options && options.align === 'right') {
    parseForBold = parseForBold.reverse();
  }
  parseForBold.map((content, i) => {
    file.setFont('helvetica', 'bold');
    // every even item is a normal font weight item
    if (i % 2 === 0) {
      file.setFont('helvetica', 'normal');
    }
    file.text(content, startX, y, options);
    if (options && options.align === 'right') {
      startX = startX - (file.getStringUnitWidth(content) * fontSize) / 72;
    } else {
      startX = startX + (file.getStringUnitWidth(content) * fontSize) / 72;
    }
  });
}

export function TwoDigits(value: number) {
  return Math.round(value * 100) / 100;
}

function AddSectionTitle(file: jsPDF, title: string, x: number, y: number, fontConfig: FontConfig) {
  SetFont(file, fontConfig, 'section_title');
  file.text(title.toUpperCase(), x, y);
  SetFont(file, fontConfig);
}

function EndSectionWithLine(file: jsPDF, docConfig: DocumentConfig, y: number) {
  const {
    margins: { left, right, top },
    pageSize: { width },
    currentY,
    sectionTextSpacing,
    sectionEndSpacing,
  } = docConfig;
  const yLocal = currentY === top + sectionTextSpacing ? currentY + y : currentY + y + sectionEndSpacing;
  file.lines([[width - left - right, 0]], left, yLocal, [1, 1]);

  // Update the currentY in config after adding line
  docConfig.currentY = yLocal;
}

function SetSectionCurrentY(file: jsPDF, config: DocumentConfig, sectionTitle: string) {
  const {
    currentY,
    sectionTitleSpacing,
    sectionTextSpacing,
    margins: { top, left },
    fontConfig,
  } = config;

  let yLocal = currentY ? currentY : top;
  yLocal = TwoDigits(yLocal);

  if (currentY) yLocal = yLocal + sectionTitleSpacing;
  AddSectionTitle(file, sectionTitle, left, yLocal, fontConfig);

  yLocal = yLocal + sectionTextSpacing;

  config.currentY = TwoDigits(yLocal);
}

function SetFont(file: jsPDF, fontConfig: FontConfig, type?: string) {
  const { titleSize, textSize } = fontConfig;
  switch (type) {
    case 'section_title': {
      file.setFont('helvetica', 'bold');
      file.setFontSize(titleSize);
      break;
    }
    case 'top_skills_table': {
      file.setFont('helvetica', 'bold');
      file.setFontSize(textSize);
      break;
    }
    default: {
      file.setFont('helvetica', 'normal');
      file.setFontSize(textSize);
    }
  }
}
