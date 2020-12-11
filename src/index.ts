import jsPDF from 'jspdf';

import { AddEducation, AddExperience, AddHeader, AddSummary, AddTopSkills, ContentConfig } from './utils';

export default (content: ContentConfig) => {
  const config = SetDocConfig(content);
  const {
    content: {
      header: headerConfig,
      summary: summaryConfig,
      top_skills: topSkillsConfig,
      experience: experienceConfig,
      education: educationConfig,
    },
  } = config;
  const resume = new jsPDF({ unit: 'in' });
  resume.setLineWidth(0.005);

  AddHeader(resume, config, headerConfig);

  AddSummary(resume, config, summaryConfig);

  AddTopSkills(resume, config, topSkillsConfig);

  AddExperience(resume, config, experienceConfig);

  AddEducation(resume, config, educationConfig);

  resume.save();
};

function SetDocConfig(content: ContentConfig): DocumentConfig {
  const result: DocumentConfig = {
    margins: {
      top: 1,
      left: 1,
      right: 1,
      bottom: 1,
    },
    pageSize: {
      width: 8.25,
      height: 11.75,
    },
    fontConfig: {
      titleSize: 16,
      textSize: 11,
    },
    sectionTitleSpacing: 0.4,
    sectionTextSpacing: 0.3,
    sectionEndSpacing: 0.2,
    currentY: 0,
    content,
  };
  return result;
}

export interface DocumentConfig {
  margins: Margins;
  pageSize: PageSize;
  fontConfig: FontConfig;
  currentY: number;
  sectionTitleSpacing: number;
  sectionTextSpacing: number;
  sectionEndSpacing: number;
  content: ContentConfig;
}

interface Margins {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface PageSize {
  height: number;
  width: number;
}

export interface FontConfig {
  titleSize: number;
  textSize: number;
}
